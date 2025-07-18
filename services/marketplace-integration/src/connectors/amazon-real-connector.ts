import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createHmac } from 'crypto';
import { 
  MarketplaceConnector, 
  MarketplaceCredentials, 
  MarketplaceSettings, 
  ProductListing, 
  MarketplaceOrder, 
  SyncResult, 
  InventoryUpdate, 
  PriceUpdate, 
  ListingUpdate 
} from '../marketplace-connector';
import {
  AmazonCredentials,
  AmazonListing,
  AmazonOrder,
  AmazonInventoryUpdate,
  AmazonPriceUpdate,
  AmazonApiResponse,
  AMAZON_API_ENDPOINTS,
  AMAZON_MARKETPLACE_IDS
} from '../amazon-types';

export class AmazonRealConnector extends MarketplaceConnector {
  private amazonCredentials: AmazonCredentials;
  private apiClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(credentials: MarketplaceCredentials, settings: MarketplaceSettings, logger: any) {
    super(credentials, settings, logger);
    this.amazonCredentials = this.mapToAmazonCredentials(credentials);
    this.apiClient = this.createApiClient();
  }

  protected getRequiredCredentials(): string[] {
    return ['apiKey', 'apiSecret', 'sellerId', 'marketplaceId'];
  }

  private mapToAmazonCredentials(credentials: MarketplaceCredentials): AmazonCredentials {
    return {
      clientId: credentials.apiKey,
      clientSecret: credentials.apiSecret,
      sellerId: credentials.sellerId || '',
      marketplaceId: credentials.marketplaceId || AMAZON_MARKETPLACE_IDS.US,
      region: (credentials.region as any) || 'us-east-1',
      apiVersion: 'v1'
    };
  }

  private createApiClient(): AxiosInstance {
    const endpoints = AMAZON_API_ENDPOINTS[this.amazonCredentials.region];
    
    return axios.create({
      baseURL: endpoints.spApi,
      timeout: this.settings.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vault-Modernization/1.0'
      }
    });
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://api.amazon.com/auth/o2/token', {
        grant_type: 'client_credentials',
        client_id: this.amazonCredentials.clientId,
        client_secret: this.amazonCredentials.clientSecret,
        scope: 'sellingpartnerapi::notifications sellingpartnerapi::migration'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      this.logger.info('Amazon access token refreshed', { 
        expiresIn: response.data.expires_in 
      });

      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get Amazon access token', { error });
      throw new Error('Authentication failed');
    }
  }

  private async makeApiRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<AmazonApiResponse<T>> {
    try {
      const token = await this.getAccessToken();
      
      const config = {
        method,
        url: endpoint,
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-amz-access-token': token,
          'x-amz-date': new Date().toISOString()
        },
        data,
        params: {
          ...params,
          marketplaceIds: this.amazonCredentials.marketplaceId
        }
      };

      const response: AxiosResponse<T> = await this.apiClient(config);

      return {
        success: true,
        data: response.data,
        rateLimit: {
          remaining: parseInt(response.headers['x-amzn-ratelimit-remaining'] || '0'),
          resetTime: new Date(parseInt(response.headers['x-amzn-ratelimit-reset'] || '0') * 1000)
        }
      };
    } catch (error: any) {
      this.logger.error('Amazon API request failed', { 
        endpoint, 
        error: error.response?.data || error.message 
      });

      return {
        success: false,
        error: {
          code: error.response?.status?.toString() || 'UNKNOWN',
          message: error.response?.data?.message || error.message,
          details: error.response?.data
        }
      };
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      if (!this.validateCredentials()) {
        return false;
      }

      this.logOperation('authenticate');
      
      // Test authentication by making a simple API call
      const response = await this.makeApiRequest('GET', '/catalog/v0/items');
      
      if (response.success) {
        this.logger.info('Amazon authentication successful', { 
          sellerId: this.amazonCredentials.sellerId, 
          region: this.amazonCredentials.region 
        });
        return true;
      } else {
        this.logger.error('Amazon authentication failed', { error: response.error });
        return false;
      }
    } catch (error) {
      this.logError('authenticate', error);
      return false;
    }
  }

  async getListings(): Promise<ProductListing[]> {
    try {
      this.logOperation('getListings');
      
      return await this.retryOperation(async () => {
        const response = await this.makeApiRequest<{ items: AmazonListing[] }>(
          'GET', 
          '/catalog/v0/items'
        );

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to fetch listings');
        }

        return response.data.items.map(this.mapAmazonListingToProductListing);
      });
    } catch (error) {
      this.logError('getListings', error);
      throw error;
    }
  }

  async createListing(listing: ProductListing): Promise<SyncResult> {
    try {
      this.logOperation('createListing', { sku: listing.sku });
      
      return await this.retryOperation(async () => {
        const amazonListing = this.mapProductListingToAmazonListing(listing);
        
        const response = await this.makeApiRequest<{ asin: string }>(
          'POST',
          '/catalog/v0/items',
          amazonListing
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to create listing');
        }

        return {
          success: true,
          message: `Listing created successfully for SKU: ${listing.sku}`,
          data: {
            externalId: response.data?.asin,
            status: 'pending'
          },
          timestamp: new Date()
        };
      });
    } catch (error) {
      this.logError('createListing', error);
      return {
        success: false,
        message: `Failed to create listing for SKU: ${listing.sku}`,
        errors: [error.message || 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async updateListing(listing: ListingUpdate): Promise<SyncResult> {
    try {
      this.logOperation('updateListing', { sku: listing.sku });
      
      return await this.retryOperation(async () => {
        const updateData = {
          sku: listing.sku,
          ...(listing.price && { price: listing.price }),
          ...(listing.quantity && { quantity: listing.quantity }),
          ...(listing.title && { title: listing.title }),
          ...(listing.status && { status: listing.status })
        };

        const response = await this.makeApiRequest(
          'PUT',
          `/catalog/v0/items/${listing.externalId}`,
          updateData
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to update listing');
        }

        return {
          success: true,
          message: `Listing updated successfully for SKU: ${listing.sku}`,
          data: {
            externalId: listing.externalId,
            status: 'updated'
          },
          timestamp: new Date()
        };
      });
    } catch (error) {
      this.logError('updateListing', error);
      return {
        success: false,
        message: `Failed to update listing for SKU: ${listing.sku}`,
        errors: [error.message || 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async deleteListing(externalId: string): Promise<SyncResult> {
    try {
      this.logOperation('deleteListing', { externalId });
      
      return await this.retryOperation(async () => {
        const response = await this.makeApiRequest(
          'DELETE',
          `/catalog/v0/items/${externalId}`
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to delete listing');
        }

        return {
          success: true,
          message: `Listing deleted successfully: ${externalId}`,
          timestamp: new Date()
        };
      });
    } catch (error) {
      this.logError('deleteListing', error);
      return {
        success: false,
        message: `Failed to delete listing: ${externalId}`,
        errors: [error.message || 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async getOrders(startDate?: Date, endDate?: Date): Promise<MarketplaceOrder[]> {
    try {
      this.logOperation('getOrders', { startDate, endDate });
      
      return await this.retryOperation(async () => {
        const params: any = {};
        if (startDate) params.dataStartTime = startDate.toISOString();
        if (endDate) params.dataEndTime = endDate.toISOString();

        const response = await this.makeApiRequest<{ orders: AmazonOrder[] }>(
          'GET',
          '/orders/v0/orders',
          undefined,
          params
        );

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to fetch orders');
        }

        return response.data.orders.map(this.mapAmazonOrderToMarketplaceOrder);
      });
    } catch (error) {
      this.logError('getOrders', error);
      throw error;
    }
  }

  async updateOrderStatus(externalId: string, status: string): Promise<SyncResult> {
    try {
      this.logOperation('updateOrderStatus', { externalId, status });
      
      return await this.retryOperation(async () => {
        const response = await this.makeApiRequest(
          'PUT',
          `/orders/v0/orders/${externalId}/status`,
          { status }
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to update order status');
        }

        return {
          success: true,
          message: `Order status updated to ${status} for order: ${externalId}`,
          timestamp: new Date()
        };
      });
    } catch (error) {
      this.logError('updateOrderStatus', error);
      return {
        success: false,
        message: `Failed to update order status for: ${externalId}`,
        errors: [error.message || 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async updateInventory(updates: InventoryUpdate[]): Promise<SyncResult> {
    try {
      this.logOperation('updateInventory', { count: updates.length });
      
      return await this.retryOperation(async () => {
        const amazonUpdates: AmazonInventoryUpdate[] = updates.map(update => ({
          sku: update.sku,
          quantity: update.quantity
        }));

        const response = await this.makeApiRequest(
          'POST',
          '/inventory/v0/inventory',
          { inventory: amazonUpdates }
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to update inventory');
        }

        return {
          success: true,
          message: `Inventory updated successfully for ${updates.length} items`,
          timestamp: new Date()
        };
      });
    } catch (error) {
      this.logError('updateInventory', error);
      return {
        success: false,
        message: 'Failed to update inventory',
        errors: [error.message || 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async updatePricing(updates: PriceUpdate[]): Promise<SyncResult> {
    try {
      this.logOperation('updatePricing', { count: updates.length });
      
      return await this.retryOperation(async () => {
        const amazonUpdates: AmazonPriceUpdate[] = updates.map(update => ({
          sku: update.sku,
          price: update.price,
          currency: update.currency,
          marketplaceId: this.amazonCredentials.marketplaceId
        }));

        const response = await this.makeApiRequest(
          'POST',
          '/pricing/v0/price',
          { pricing: amazonUpdates }
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to update pricing');
        }

        return {
          success: true,
          message: `Pricing updated successfully for ${updates.length} items`,
          timestamp: new Date()
        };
      });
    } catch (error) {
      this.logError('updatePricing', error);
      return {
        success: false,
        message: 'Failed to update pricing',
        errors: [error.message || 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async getMarketplaceInfo(): Promise<any> {
    try {
      this.logOperation('getMarketplaceInfo');
      
      const response = await this.makeApiRequest(
        'GET',
        '/sellers/v1/marketplaceParticipations'
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to get marketplace info');
      }

      return response.data;
    } catch (error) {
      this.logError('getMarketplaceInfo', error);
      throw error;
    }
  }

  // Mapping methods
  private mapAmazonListingToProductListing(amazonListing: AmazonListing): ProductListing {
    return {
      id: amazonListing.asin,
      sku: amazonListing.sku,
      title: amazonListing.title,
      price: amazonListing.price,
      currency: amazonListing.currency,
      quantity: amazonListing.quantity,
      status: amazonListing.status,
      externalId: amazonListing.asin,
      attributes: {
        fulfillmentChannel: amazonListing.fulfillmentChannel,
        condition: amazonListing.condition,
        marketplaceId: amazonListing.marketplaceId
      }
    };
  }

  private mapProductListingToAmazonListing(listing: ProductListing): Partial<AmazonListing> {
    return {
      sku: listing.sku,
      title: listing.title,
      price: listing.price,
      currency: listing.currency,
      quantity: listing.quantity,
      status: listing.status,
      fulfillmentChannel: 'MERCHANT',
      condition: 'New',
      marketplaceId: this.amazonCredentials.marketplaceId
    };
  }

  private mapAmazonOrderToMarketplaceOrder(amazonOrder: AmazonOrder): MarketplaceOrder {
    return {
      id: amazonOrder.amazonOrderId,
      externalId: amazonOrder.amazonOrderId,
      status: this.mapAmazonOrderStatus(amazonOrder.orderStatus),
      customerEmail: amazonOrder.buyerInfo?.buyerEmail,
      customerName: amazonOrder.buyerInfo?.buyerName,
      totalAmount: amazonOrder.orderTotal?.amount || 0,
      currency: amazonOrder.orderTotal?.currencyCode || 'USD',
      items: amazonOrder.orderItems.map(item => ({
        sku: item.sellerSku,
        title: item.title,
        quantity: item.quantityOrdered,
        price: item.itemPrice?.amount || 0,
        externalId: item.asin
      })),
      shippingAddress: amazonOrder.shippingAddress ? {
        name: amazonOrder.shippingAddress.name,
        address1: amazonOrder.shippingAddress.addressLine1,
        address2: amazonOrder.shippingAddress.addressLine2,
        city: amazonOrder.shippingAddress.city,
        state: amazonOrder.shippingAddress.stateOrRegion,
        postalCode: amazonOrder.shippingAddress.postalCode,
        country: amazonOrder.shippingAddress.countryCode,
        phone: amazonOrder.shippingAddress.phone
      } : undefined,
      createdAt: amazonOrder.purchaseDate,
      updatedAt: amazonOrder.lastUpdateDate
    };
  }

  private mapAmazonOrderStatus(amazonStatus: string): 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' {
    switch (amazonStatus) {
      case 'Pending': return 'pending';
      case 'Unshipped': return 'confirmed';
      case 'PartiallyShipped': return 'shipped';
      case 'Shipped': return 'shipped';
      case 'Canceled': return 'cancelled';
      default: return 'pending';
    }
  }
} 