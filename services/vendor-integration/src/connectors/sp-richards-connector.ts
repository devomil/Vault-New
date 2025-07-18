import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { VendorConnector } from '../vendor-connector';
import { 
  VendorConnectorConfig, 
  VendorProductData, 
  VendorOrderData, 
  SyncResult 
} from '../vendor-connector';
import { 
  SPRichardsProduct, 
  SPRichardsOrder,
  VendorApiResponse 
} from '../vendor-types';

export class SPRichardsConnector extends VendorConnector {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(vendor: any, config: VendorConnectorConfig) {
    super(vendor, config);
    
    this.axiosInstance = axios.create({
      baseURL: config.credentials.endpoint || 'https://api.sprichards.com/v1',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use(async (config) => {
      if (!this.accessToken || this.isTokenExpired()) {
        await this.authenticate();
      }
      config.headers['Authorization'] = `Bearer ${this.accessToken}`;
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to re-authenticate
          await this.authenticate();
          // Retry the original request
          const originalRequest = error.config;
          originalRequest.headers['Authorization'] = `Bearer ${this.accessToken}`;
          return this.axiosInstance(originalRequest);
        }
        return Promise.reject(error);
      }
    );
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const requiredFields = ['apiKey', 'apiSecret'];
      for (const field of requiredFields) {
        if (!this.config.credentials[field as keyof typeof this.config.credentials]) {
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await axios.post(`${this.config.credentials.endpoint || 'https://api.sprichards.com/v1'}/auth/token`, {
        client_id: this.config.credentials.apiKey,
        client_secret: this.config.credentials.apiSecret,
        grant_type: 'client_credentials'
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  private isTokenExpired(): boolean {
    return !this.tokenExpiry || Date.now() >= this.tokenExpiry;
  }

  async getProducts(skus?: string[]): Promise<VendorProductData[]> {
    try {
      const endpoint = '/products';
      const params: any = {};
      
      if (skus && skus.length > 0) {
        params.skus = skus.join(',');
      }

      const response: AxiosResponse<VendorApiResponse<SPRichardsProduct[]>> = await this.axiosInstance.get(endpoint, { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch products');
      }

      return (response.data.data || []).map(product => this.mapSPRichardsProduct(product));
    } catch (error) {
      throw new Error(`Failed to fetch SP Richards products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProduct(sku: string): Promise<VendorProductData | null> {
    try {
      const response: AxiosResponse<VendorApiResponse<SPRichardsProduct>> = await this.axiosInstance.get(`/products/${sku}`);
      
      if (!response.data.success) {
        return null;
      }

      return this.mapSPRichardsProduct(response.data.data!);
    } catch (error) {
      return null;
    }
  }

  async getInventory(skus?: string[]): Promise<Record<string, number>> {
    try {
      const endpoint = '/inventory';
      const params: any = {};
      
      if (skus && skus.length > 0) {
        params.skus = skus.join(',');
      }

      const response: AxiosResponse<VendorApiResponse<Record<string, number>>> = await this.axiosInstance.get(endpoint, { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch inventory');
      }

      return response.data.data || {};
    } catch (error) {
      throw new Error(`Failed to fetch SP Richards inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPricing(skus?: string[]): Promise<Record<string, number>> {
    try {
      const endpoint = '/pricing';
      const params: any = {};
      
      if (skus && skus.length > 0) {
        params.skus = skus.join(',');
      }

      const response: AxiosResponse<VendorApiResponse<Record<string, number>>> = await this.axiosInstance.get(endpoint, { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch pricing');
      }

      return response.data.data || {};
    } catch (error) {
      throw new Error(`Failed to fetch SP Richards pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createOrder(order: any): Promise<VendorOrderData> {
    try {
      const response: AxiosResponse<VendorApiResponse<SPRichardsOrder>> = await this.axiosInstance.post('/orders', order);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create order');
      }

      return this.mapSPRichardsOrder(response.data.data!);
    } catch (error) {
      throw new Error(`Failed to create SP Richards order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getOrder(orderId: string): Promise<VendorOrderData | null> {
    try {
      const response: AxiosResponse<VendorApiResponse<SPRichardsOrder>> = await this.axiosInstance.get(`/orders/${orderId}`);
      
      if (!response.data.success) {
        return null;
      }

      return this.mapSPRichardsOrder(response.data.data!);
    } catch (error) {
      return null;
    }
  }

  async getOrders(status?: string, limit?: number): Promise<VendorOrderData[]> {
    try {
      const endpoint = '/orders';
      const params: any = {};
      
      if (status) params.status = status;
      if (limit) params.limit = limit;

      const response: AxiosResponse<VendorApiResponse<SPRichardsOrder[]>> = await this.axiosInstance.get(endpoint, { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch orders');
      }

      return (response.data.data || []).map(order => this.mapSPRichardsOrder(order));
    } catch (error) {
      throw new Error(`Failed to fetch SP Richards orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async syncProducts(): Promise<SyncResult> {
    try {
      const products = await this.getProducts();
      return {
        success: true,
        itemsProcessed: products.length,
        itemsTotal: products.length,
        data: products
      };
    } catch (error) {
      return {
        success: false,
        itemsProcessed: 0,
        itemsTotal: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async syncInventory(): Promise<SyncResult> {
    try {
      const inventory = await this.getInventory();
      return {
        success: true,
        itemsProcessed: Object.keys(inventory).length,
        itemsTotal: Object.keys(inventory).length,
        data: inventory
      };
    } catch (error) {
      return {
        success: false,
        itemsProcessed: 0,
        itemsTotal: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async syncPricing(): Promise<SyncResult> {
    try {
      const pricing = await this.getPricing();
      return {
        success: true,
        itemsProcessed: Object.keys(pricing).length,
        itemsTotal: Object.keys(pricing).length,
        data: pricing
      };
    } catch (error) {
      return {
        success: false,
        itemsProcessed: 0,
        itemsTotal: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async syncOrders(): Promise<SyncResult> {
    try {
      const orders = await this.getOrders();
      return {
        success: true,
        itemsProcessed: orders.length,
        itemsTotal: orders.length,
        data: orders
      };
    } catch (error) {
      return {
        success: false,
        itemsProcessed: 0,
        itemsTotal: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private mapSPRichardsProduct(product: SPRichardsProduct): VendorProductData {
    return {
      sku: product.sku,
      name: product.name,
      price: product.price,
      cost: product.cost,
      quantity: product.quantity,
      description: product.description,
      attributes: {
        category: product.category,
        brand: product.brand,
        weight: product.weight,
        dimensions: product.dimensions,
        ...product.attributes
      }
    };
  }

  private mapSPRichardsOrder(order: SPRichardsOrder): VendorOrderData {
    return {
      orderId: order.orderId,
      items: order.items.map(item => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      totalAmount: order.totalAmount
    };
  }

  protected getDefaultEndpoint(): string {
    return 'https://api.sprichards.com/v1';
  }
} 