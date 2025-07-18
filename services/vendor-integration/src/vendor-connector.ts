import { 
  Vendor, 
  VendorCredentials 
} from '../../../shared/types/src';

export interface VendorProductData {
  sku: string;
  name: string;
  price?: number;
  cost?: number;
  quantity: number;
  description?: string;
  attributes?: Record<string, any>;
}

export interface VendorOrderData {
  orderId: string;
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount?: number;
}

export interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsTotal: number;
  error?: string;
  data?: any;
}

export interface VendorConnectorConfig {
  credentials: VendorCredentials;
  settings?: Record<string, any>;
  timeout?: number;
  retryAttempts?: number;
}

export abstract class VendorConnector {
  protected config: VendorConnectorConfig;
  protected vendor: Vendor;

  constructor(vendor: Vendor, config: VendorConnectorConfig) {
    this.vendor = vendor;
    this.config = config;
  }

  // Abstract methods that must be implemented by concrete connectors
  abstract validateCredentials(): Promise<boolean>;
  abstract getProducts(skus?: string[]): Promise<VendorProductData[]>;
  abstract getProduct(sku: string): Promise<VendorProductData | null>;
  abstract getInventory(skus?: string[]): Promise<Record<string, number>>;
  abstract getPricing(skus?: string[]): Promise<Record<string, number>>;
  abstract createOrder(order: any): Promise<VendorOrderData>;
  abstract getOrder(orderId: string): Promise<VendorOrderData | null>;
  abstract getOrders(status?: string, limit?: number): Promise<VendorOrderData[]>;
  abstract syncProducts(): Promise<SyncResult>;
  abstract syncInventory(): Promise<SyncResult>;
  abstract syncPricing(): Promise<SyncResult>;
  abstract syncOrders(): Promise<SyncResult>;

  // Common utility methods
  protected async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = this.buildUrl(endpoint);
    const requestOptions: RequestInit = {
      headers: this.buildHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected buildUrl(endpoint: string): string {
    const baseUrl = this.config.credentials.endpoint || this.getDefaultEndpoint();
    return `${baseUrl}${endpoint}`;
  }

  protected buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.config.credentials.apiKey) {
      headers['X-API-Key'] = this.config.credentials.apiKey;
    }

    if (this.config.credentials.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.credentials.accessToken}`;
    }

    return headers;
  }

  protected abstract getDefaultEndpoint(): string;

  protected async retryOperation<T>(
    operation: () => Promise<T>, 
    maxAttempts: number = this.config.retryAttempts || 3
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxAttempts) {
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // Common validation methods
  protected validateSku(sku: string): boolean {
    return sku && sku.trim().length > 0 && sku.trim().length <= 50;
  }

  protected validateQuantity(quantity: number): boolean {
    return quantity > 0 && Number.isInteger(quantity);
  }

  protected validatePrice(price: number): boolean {
    return price > 0 && !isNaN(price);
  }

  // Get vendor info
  getVendorInfo(): Vendor {
    return this.vendor;
  }

  // Get connector capabilities
  getCapabilities(): Record<string, boolean> {
    return {
      products: true,
      inventory: true,
      pricing: true,
      orders: true,
      realTimeSync: false
    };
  }
} 