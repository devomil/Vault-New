import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Client as SFTPClient } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import { 
  VendorConnector, 
  VendorConnectorConfig, 
  VendorProductData, 
  VendorOrderData, 
  SyncResult 
} from '../vendor-connector';
import { 
  VendorCredentials, 
  VendorConfig, 
  UniversalConnectorConfig,
  VendorApiResponse,
  VendorSyncResult,
  VendorConnectionTest,
  SFTPConfig,
  EDIConfig
} from '../vendor-types';

export class UniversalConnector extends VendorConnector {
  private axiosInstance: AxiosInstance | null = null;
  private sftpClient: SFTPClient | null = null;
  private universalConfig: UniversalConnectorConfig;
  private logger: any;

  constructor(vendor: any, config: UniversalConnectorConfig, logger: any) {
    const connectorConfig: VendorConnectorConfig = {
      credentials: config.credentials,
      settings: config.config,
      timeout: 30000,
      retryAttempts: 3
    };

    super(vendor, connectorConfig);
    this.universalConfig = config;
    this.logger = logger;
  }

  override async validateCredentials(): Promise<boolean> {
    try {
      switch (this.universalConfig.type) {
        case 'api':
          return await this.validateApiCredentials();
        case 'sftp':
          return await this.validateSFTPCredentials();
        case 'edi':
          return await this.validateEDICredentials();
        case 'webhook':
          return await this.validateWebhookCredentials();
        default:
          this.logger.error(`Unsupported connector type: ${this.universalConfig.type}`);
          return false;
      }
    } catch (error) {
      this.logger.error('Error validating credentials:', error);
      return false;
    }
  }

  async getProducts(skus?: string[]): Promise<VendorProductData[]> {
    try {
      switch (this.universalConfig.type) {
        case 'api':
          return await this.getProductsViaAPI(skus);
        case 'sftp':
          return await this.getProductsViaSFTP(skus);
        case 'edi':
          return await this.getProductsViaEDI(skus);
        default:
          throw new Error(`Products not supported for ${this.universalConfig.type} connector`);
      }
    } catch (error) {
      this.logger.error('Error getting products:', error);
      throw error;
    }
  }

  async getProduct(sku: string): Promise<VendorProductData | null> {
    try {
      const products = await this.getProducts([sku]);
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      this.logger.error(`Error getting product ${sku}:`, error);
      return null;
    }
  }

  async getInventory(skus?: string[]): Promise<Record<string, number>> {
    try {
      switch (this.universalConfig.type) {
        case 'api':
          return await this.getInventoryViaAPI(skus);
        case 'sftp':
          return await this.getInventoryViaSFTP(skus);
        case 'edi':
          return await this.getInventoryViaEDI(skus);
        default:
          throw new Error(`Inventory not supported for ${this.universalConfig.type} connector`);
      }
    } catch (error) {
      this.logger.error('Error getting inventory:', error);
      throw error;
    }
  }

  async getPricing(skus?: string[]): Promise<Record<string, number>> {
    try {
      switch (this.universalConfig.type) {
        case 'api':
          return await this.getPricingViaAPI(skus);
        case 'sftp':
          return await this.getPricingViaSFTP(skus);
        case 'edi':
          return await this.getPricingViaEDI(skus);
        default:
          throw new Error(`Pricing not supported for ${this.universalConfig.type} connector`);
      }
    } catch (error) {
      this.logger.error('Error getting pricing:', error);
      throw error;
    }
  }

  async createOrder(order: any): Promise<VendorOrderData> {
    try {
      switch (this.universalConfig.type) {
        case 'api':
          return await this.createOrderViaAPI(order);
        case 'edi':
          return await this.createOrderViaEDI(order);
        default:
          throw new Error(`Order creation not supported for ${this.universalConfig.type} connector`);
      }
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<VendorOrderData | null> {
    try {
      switch (this.universalConfig.type) {
        case 'api':
          return await this.getOrderViaAPI(orderId);
        case 'edi':
          return await this.getOrderViaEDI(orderId);
        default:
          throw new Error(`Order retrieval not supported for ${this.universalConfig.type} connector`);
      }
    } catch (error) {
      this.logger.error(`Error getting order ${orderId}:`, error);
      return null;
    }
  }

  async getOrders(status?: string, limit?: number): Promise<VendorOrderData[]> {
    try {
      switch (this.universalConfig.type) {
        case 'api':
          return await this.getOrdersViaAPI(status, limit);
        case 'edi':
          return await this.getOrdersViaEDI(status, limit);
        default:
          throw new Error(`Order retrieval not supported for ${this.universalConfig.type} connector`);
      }
    } catch (error) {
      this.logger.error('Error getting orders:', error);
      throw error;
    }
  }

  async syncProducts(): Promise<SyncResult> {
    try {
      const products = await this.getProducts();
      const result: SyncResult = {
        success: true,
        itemsProcessed: products.length,
        itemsTotal: products.length,
        data: products
      };
      return result;
    } catch (error) {
      this.logger.error('Error syncing products:', error);
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
      const result: SyncResult = {
        success: true,
        itemsProcessed: Object.keys(inventory).length,
        itemsTotal: Object.keys(inventory).length,
        data: inventory
      };
      return result;
    } catch (error) {
      this.logger.error('Error syncing inventory:', error);
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
      const result: SyncResult = {
        success: true,
        itemsProcessed: Object.keys(pricing).length,
        itemsTotal: Object.keys(pricing).length,
        data: pricing
      };
      return result;
    } catch (error) {
      this.logger.error('Error syncing pricing:', error);
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
      const result: SyncResult = {
        success: true,
        itemsProcessed: orders.length,
        itemsTotal: orders.length,
        data: orders
      };
      return result;
    } catch (error) {
      this.logger.error('Error syncing orders:', error);
      return {
        success: false,
        itemsProcessed: 0,
        itemsTotal: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testConnection(): Promise<VendorConnectionTest> {
    const test: VendorConnectionTest = {
      success: false,
      message: '',
      details: {
        authentication: false,
        products: false,
        inventory: false,
        pricing: false,
        orders: false
      },
      errors: []
    };

    try {
      // Test authentication
      test.details!.authentication = await this.validateCredentials();
      if (!test.details!.authentication) {
        test.errors!.push('Authentication failed');
        return test;
      }

      // Test products
      try {
        await this.getProducts(['test']);
        test.details!.products = true;
      } catch (error) {
        test.errors!.push(`Products test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test inventory
      try {
        await this.getInventory(['test']);
        test.details!.inventory = true;
      } catch (error) {
        test.errors!.push(`Inventory test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test pricing
      try {
        await this.getPricing(['test']);
        test.details!.pricing = true;
      } catch (error) {
        test.errors!.push(`Pricing test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test orders
      try {
        await this.getOrders(undefined, 1);
        test.details!.orders = true;
      } catch (error) {
        test.errors!.push(`Orders test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      test.success = test.details!.authentication && 
                    (test.details!.products || test.details!.inventory || test.details!.pricing || test.details!.orders);
      
      test.message = test.success ? 'Connection test successful' : 'Connection test failed';
      
      return test;
    } catch (error) {
      test.message = 'Connection test failed';
      test.errors!.push(error instanceof Error ? error.message : 'Unknown error');
      return test;
    }
  }

  // API Methods
  private async validateApiCredentials(): Promise<boolean> {
    if (!this.universalConfig.credentials.endpoint) {
      return false;
    }

    try {
      this.axiosInstance = axios.create({
        baseURL: this.universalConfig.credentials.endpoint,
        timeout: this.universalConfig.config.rateLimits.requestsPerMinute * 1000,
        headers: this.buildApiHeaders()
      });

      // Test authentication endpoint
      const authEndpoint = this.universalConfig.config.endpoints.auth || '/auth/test';
      await this.axiosInstance.get(authEndpoint);
      return true;
    } catch (error) {
      this.logger.error('API authentication failed:', error);
      return false;
    }
  }

  private async getProductsViaAPI(skus?: string[]): Promise<VendorProductData[]> {
    if (!this.axiosInstance) {
      throw new Error('API client not initialized');
    }

    const endpoint = this.universalConfig.config.endpoints.products || '/products';
    const params: any = {};
    
    if (skus && skus.length > 0) {
      params.skus = skus.join(',');
    }

    const response: AxiosResponse<VendorApiResponse<any[]>> = await this.axiosInstance.get(endpoint, { params });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch products');
    }

    return this.transformProducts(response.data.data || []);
  }

  private async getInventoryViaAPI(skus?: string[]): Promise<Record<string, number>> {
    if (!this.axiosInstance) {
      throw new Error('API client not initialized');
    }

    const endpoint = this.universalConfig.config.endpoints.inventory || '/inventory';
    const params: any = {};
    
    if (skus && skus.length > 0) {
      params.skus = skus.join(',');
    }

    const response: AxiosResponse<VendorApiResponse<Record<string, number>>> = await this.axiosInstance.get(endpoint, { params });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch inventory');
    }

    return response.data.data || {};
  }

  private async getPricingViaAPI(skus?: string[]): Promise<Record<string, number>> {
    if (!this.axiosInstance) {
      throw new Error('API client not initialized');
    }

    const endpoint = this.universalConfig.config.endpoints.pricing || '/pricing';
    const params: any = {};
    
    if (skus && skus.length > 0) {
      params.skus = skus.join(',');
    }

    const response: AxiosResponse<VendorApiResponse<Record<string, number>>> = await this.axiosInstance.get(endpoint, { params });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch pricing');
    }

    return response.data.data || {};
  }

  private async createOrderViaAPI(order: any): Promise<VendorOrderData> {
    if (!this.axiosInstance) {
      throw new Error('API client not initialized');
    }

    const endpoint = this.universalConfig.config.endpoints.orders || '/orders';
    const response: AxiosResponse<VendorApiResponse<any>> = await this.axiosInstance.post(endpoint, order);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create order');
    }

    return this.transformOrder(response.data.data);
  }

  private async getOrderViaAPI(orderId: string): Promise<VendorOrderData | null> {
    if (!this.axiosInstance) {
      throw new Error('API client not initialized');
    }

    const endpoint = `${this.universalConfig.config.endpoints.orders || '/orders'}/${orderId}`;
    const response: AxiosResponse<VendorApiResponse<any>> = await this.axiosInstance.get(endpoint);
    
    if (!response.data.success) {
      return null;
    }

    return this.transformOrder(response.data.data);
  }

  private async getOrdersViaAPI(status?: string, limit?: number): Promise<VendorOrderData[]> {
    if (!this.axiosInstance) {
      throw new Error('API client not initialized');
    }

    const endpoint = this.universalConfig.config.endpoints.orders || '/orders';
    const params: any = {};
    
    if (status) params.status = status;
    if (limit) params.limit = limit;

    const response: AxiosResponse<VendorApiResponse<any[]>> = await this.axiosInstance.get(endpoint, { params });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch orders');
    }

    return (response.data.data || []).map(order => this.transformOrder(order));
  }

  // SFTP Methods
  private async validateSFTPCredentials(): Promise<boolean> {
    if (!this.universalConfig.credentials.sftpHost || !this.universalConfig.credentials.sftpUsername) {
      return false;
    }

    try {
      this.sftpClient = new SFTPClient();
      
      return new Promise((resolve) => {
        this.sftpClient!.connect({
          host: this.universalConfig.credentials.sftpHost!,
          port: this.universalConfig.credentials.sftpPort || 22,
          username: this.universalConfig.credentials.sftpUsername!,
          password: this.universalConfig.credentials.sftpPassword,
          privateKey: this.universalConfig.credentials.sftpPrivateKey ? 
            fs.readFileSync(this.universalConfig.credentials.sftpPrivateKey) : undefined
        });

        this.sftpClient!.on('ready', () => {
          this.sftpClient!.end();
          resolve(true);
        });

        this.sftpClient!.on('error', (error) => {
          this.logger.error('SFTP connection failed:', error);
          resolve(false);
        });
      });
    } catch (error) {
      this.logger.error('SFTP validation failed:', error);
      return false;
    }
  }

  private async getProductsViaSFTP(skus?: string[]): Promise<VendorProductData[]> {
    // Implementation would download and parse product files from SFTP
    throw new Error('SFTP product retrieval not yet implemented');
  }

  private async getInventoryViaSFTP(skus?: string[]): Promise<Record<string, number>> {
    // Implementation would download and parse inventory files from SFTP
    throw new Error('SFTP inventory retrieval not yet implemented');
  }

  private async getPricingViaSFTP(skus?: string[]): Promise<Record<string, number>> {
    // Implementation would download and parse pricing files from SFTP
    throw new Error('SFTP pricing retrieval not yet implemented');
  }

  // EDI Methods
  private async validateEDICredentials(): Promise<boolean> {
    // EDI validation would check partner configuration
    return !!(this.universalConfig.credentials.ediPartnerId && 
             this.universalConfig.credentials.ediSenderId && 
             this.universalConfig.credentials.ediReceiverId);
  }

  private async getProductsViaEDI(skus?: string[]): Promise<VendorProductData[]> {
    // Implementation would parse EDI product files
    throw new Error('EDI product retrieval not yet implemented');
  }

  private async getInventoryViaEDI(skus?: string[]): Promise<Record<string, number>> {
    // Implementation would parse EDI inventory files
    throw new Error('EDI inventory retrieval not yet implemented');
  }

  private async getPricingViaEDI(skus?: string[]): Promise<Record<string, number>> {
    // Implementation would parse EDI pricing files
    throw new Error('EDI pricing retrieval not yet implemented');
  }

  private async createOrderViaEDI(order: any): Promise<VendorOrderData> {
    // Implementation would generate EDI order file
    throw new Error('EDI order creation not yet implemented');
  }

  private async getOrderViaEDI(orderId: string): Promise<VendorOrderData | null> {
    // Implementation would parse EDI order files
    throw new Error('EDI order retrieval not yet implemented');
  }

  private async getOrdersViaEDI(status?: string, limit?: number): Promise<VendorOrderData[]> {
    // Implementation would parse EDI order files
    throw new Error('EDI order retrieval not yet implemented');
  }

  // Webhook Methods
  private async validateWebhookCredentials(): Promise<boolean> {
    // Webhook validation would check webhook endpoint configuration
    return !!(this.config.credentials.endpoint);
  }

  // Utility Methods
  private buildApiHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.universalConfig.credentials.apiKey) {
      headers['X-API-Key'] = this.universalConfig.credentials.apiKey;
    }

    if (this.universalConfig.credentials.accessToken) {
      headers['Authorization'] = `Bearer ${this.universalConfig.credentials.accessToken}`;
    }

    if (this.universalConfig.credentials.username && this.universalConfig.credentials.password) {
      const auth = Buffer.from(`${this.universalConfig.credentials.username}:${this.universalConfig.credentials.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    // Add custom headers
    if (this.universalConfig.credentials.customHeaders) {
      Object.assign(headers, this.universalConfig.credentials.customHeaders);
    }

    return headers;
  }

  private transformProducts(data: any[]): VendorProductData[] {
    if (this.universalConfig.transformations?.products) {
      return data.map(item => this.universalConfig.transformations!.products!(item));
    }

    return data.map(item => ({
      sku: this.mapField(item, this.universalConfig.mappings.products['sku'] || 'sku'),
      name: this.mapField(item, this.universalConfig.mappings.products['name'] || 'name'),
      price: this.mapField(item, this.universalConfig.mappings.products['price'] || 'price'),
      cost: this.mapField(item, this.universalConfig.mappings.products['cost'] || 'cost'),
      quantity: this.mapField(item, this.universalConfig.mappings.products['quantity'] || 'quantity'),
      description: this.mapField(item, this.universalConfig.mappings.products['description'] || 'description'),
      attributes: item
    }));
  }

  private transformOrder(data: any): VendorOrderData {
    if (this.universalConfig.transformations?.orders) {
      return this.universalConfig.transformations.orders(data);
    }

    return {
      orderId: this.mapField(data, this.universalConfig.mappings.orders['orderId'] || 'orderId'),
      items: (data.items || []).map((item: any) => ({
        sku: this.mapField(item, this.universalConfig.mappings.orders['sku'] || 'sku'),
        name: this.mapField(item, this.universalConfig.mappings.orders['name'] || 'name'),
        quantity: this.mapField(item, this.universalConfig.mappings.orders['quantity'] || 'quantity'),
        price: this.mapField(item, this.universalConfig.mappings.orders['price'] || 'price'),
        total: this.mapField(item, this.universalConfig.mappings.orders['total'] || 'total')
      })),
      totalAmount: this.mapField(data, this.universalConfig.mappings.orders['totalAmount'] || 'totalAmount')
    };
  }

  private mapField(data: any, fieldPath: string): any {
    const fields = fieldPath.split('.');
    let value = data;
    
    for (const field of fields) {
      if (value && typeof value === 'object' && field in value) {
        value = value[field];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  protected getDefaultEndpoint(): string {
    return this.config.credentials.endpoint || '';
  }
} 