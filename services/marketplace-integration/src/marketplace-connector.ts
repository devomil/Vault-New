export interface MarketplaceCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  sellerId?: string;
  marketplaceId?: string;
  region?: string;
}

export interface MarketplaceSettings {
  autoSync?: boolean;
  syncInterval?: number; // minutes
  priceUpdateThreshold?: number; // percentage
  inventoryUpdateThreshold?: number; // quantity
  errorRetryAttempts?: number;
  timeout?: number; // seconds
}

export interface ProductListing {
  id: string;
  sku: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  status: 'active' | 'inactive' | 'pending' | 'error';
  externalId?: string;
  attributes?: Record<string, any>;
  images?: string[];
  category?: string;
  brand?: string;
}

export interface MarketplaceOrder {
  id: string;
  externalId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  customerEmail?: string;
  customerName?: string;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  sku: string;
  title: string;
  quantity: number;
  price: number;
  externalId?: string;
}

export interface Address {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
  timestamp: Date;
}

export interface InventoryUpdate {
  sku: string;
  quantity: number;
  externalId?: string;
}

export interface PriceUpdate {
  sku: string;
  price: number;
  currency: string;
  externalId?: string;
}

export interface ListingUpdate {
  sku: string;
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
  status?: string;
  externalId?: string;
}

export abstract class MarketplaceConnector {
  protected credentials: MarketplaceCredentials;
  protected settings: MarketplaceSettings;
  protected logger: any;

  constructor(credentials: MarketplaceCredentials, settings: MarketplaceSettings, logger: any) {
    this.credentials = credentials;
    this.settings = settings;
    this.logger = logger;
  }

  // Abstract methods that must be implemented by each marketplace
  abstract authenticate(): Promise<boolean>;
  abstract getListings(): Promise<ProductListing[]>;
  abstract createListing(listing: ProductListing): Promise<SyncResult>;
  abstract updateListing(listing: ListingUpdate): Promise<SyncResult>;
  abstract deleteListing(externalId: string): Promise<SyncResult>;
  abstract getOrders(startDate?: Date, endDate?: Date): Promise<MarketplaceOrder[]>;
  abstract updateOrderStatus(externalId: string, status: string): Promise<SyncResult>;
  abstract updateInventory(updates: InventoryUpdate[]): Promise<SyncResult>;
  abstract updatePricing(updates: PriceUpdate[]): Promise<SyncResult>;
  abstract getMarketplaceInfo(): Promise<any>;

  // Common utility methods
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Operation failed (attempt ${attempt}/${maxAttempts})`, { error: lastError.message });
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError!;
  }

  protected validateCredentials(): boolean {
    const required = this.getRequiredCredentials();
    for (const field of required) {
      if (!this.credentials[field as keyof MarketplaceCredentials]) {
        this.logger.error(`Missing required credential: ${field}`);
        return false;
      }
    }
    return true;
  }

  protected abstract getRequiredCredentials(): string[];

  protected logOperation(operation: string, data?: any): void {
    this.logger.info(`Marketplace operation: ${operation}`, { 
      marketplace: this.constructor.name,
      data 
    });
  }

  protected logError(operation: string, error: any): void {
    this.logger.error(`Marketplace operation failed: ${operation}`, { 
      marketplace: this.constructor.name,
      error: error.message || error 
    });
  }
} 