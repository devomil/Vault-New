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
  EbayCredentials,
  EbayListing,
  EbayOrder,
  EbayInventoryUpdate,
  EbayPriceUpdate,
  EbayApiResponse,
  EBAY_API_ENDPOINTS,
  EBAY_SITE_IDS,
  EBAY_CONDITION_IDS,
  EBAY_LISTING_TYPES,
  EBAY_LISTING_DURATIONS
} from '../ebay-types';

export class EbayRealConnector extends MarketplaceConnector {
  private ebayCredentials: EbayCredentials;
  private apiClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(credentials: MarketplaceCredentials, settings: MarketplaceSettings, logger: any) {
    super(credentials, settings, logger);
    this.ebayCredentials = this.mapToEbayCredentials(credentials);
    this.apiClient = this.createApiClient();
  }

  protected getRequiredCredentials(): string[] {
    return ['apiKey', 'apiSecret', 'sellerId', 'marketplaceId'];
  }

  private mapToEbayCredentials(credentials: MarketplaceCredentials): EbayCredentials {
    return {
      appId: credentials.apiKey,
      certId: credentials.apiSecret,
      devId: credentials.sellerId || '',
      authToken: credentials.marketplaceId || '',
      clientId: credentials.apiKey,
      clientSecret: credentials.apiSecret,
      siteId: EBAY_SITE_IDS.US,
      sandbox: false
    };
  }

  private createApiClient(): AxiosInstance {
    const endpoints = this.ebayCredentials.sandbox ? EBAY_API_ENDPOINTS.sandbox : EBAY_API_ENDPOINTS.production;
    
    return axios.create({
      baseURL: endpoints.rest,
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
      const endpoints = this.ebayCredentials.sandbox ? EBAY_API_ENDPOINTS.sandbox : EBAY_API_ENDPOINTS.production;
      
      const response = await axios.post(endpoints.auth, {
        grant_type: 'client_credentials',
        scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.ebayCredentials.clientId}:${this.ebayCredentials.clientSecret}`).toString('base64')}`
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      this.logger.info('eBay access token refreshed', { 
        expiresIn: response.data.expires_in 
      });

      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get eBay access token', { error });
      throw new Error('Authentication failed');
    }
  }

  private async makeApiRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<EbayApiResponse<T>> {
    try {
      const token = await this.getAccessToken();
      
      const config = {
        method,
        url: endpoint,
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': this.ebayCredentials.siteId.toString(),
          'Content-Type': 'application/json'
        },
        data,
        params
      };

      const response: AxiosResponse<T> = await this.apiClient(config);

      return {
        success: true,
        data: response.data,
        rateLimit: {
          remaining: parseInt(response.headers['x-ratelimit-remaining'] || '0'),
          resetTime: new Date(parseInt(response.headers['x-ratelimit-reset'] || '0') * 1000)
        }
      };
    } catch (error: any) {
      this.logger.error('eBay API request failed', { 
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
      const response = await this.makeApiRequest('GET', '/sell/inventory/v1/inventory_item');
      
      if (response.success) {
        this.logger.info('eBay authentication successful', { 
          siteId: this.ebayCredentials.siteId, 
          sandbox: this.ebayCredentials.sandbox 
        });
        return true;
      } else {
        this.logger.error('eBay authentication failed', { error: response.error });
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
        const response = await this.makeApiRequest<{ inventoryItems: EbayListing[] }>(
          'GET', 
          '/sell/inventory/v1/inventory_item'
        );

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to fetch listings');
        }

        return response.data.inventoryItems.map((listing) => this.mapEbayListingToProductListing(listing));
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
        const ebayListing = this.mapProductListingToEbayListing(listing);
        
        const response = await this.makeApiRequest<{ listingId: string }>(
          'POST',
          '/sell/inventory/v1/inventory_item',
          ebayListing
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to create listing');
        }

        return {
          success: true,
          message: `Listing created successfully for SKU: ${listing.sku}`,
          data: {
            externalId: response.data?.listingId,
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
          `/sell/inventory/v1/inventory_item/${listing.sku}`,
          updateData
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to update listing');
        }

        return {
          success: true,
          message: `Listing updated successfully for SKU: ${listing.sku}`,
          data: {
            externalId: listing.sku,
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
          `/sell/inventory/v1/inventory_item/${externalId}`
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to delete listing');
        }

        return {
          success: true,
          message: `Listing deleted successfully: ${externalId}`,
          data: {
            externalId,
            status: 'deleted'
          },
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
        const params: any = {
          limit: 100
        };

        if (startDate) {
          params.creationdatefrom = startDate.toISOString();
        }
        if (endDate) {
          params.creationdateto = endDate.toISOString();
        }

        const response = await this.makeApiRequest<{ orders: EbayOrder[] }>(
          'GET',
          '/sell/fulfillment/v1/order',
          undefined,
          params
        );

        if (!response.success || !response.data) {
          throw new Error(response.error?.message || 'Failed to fetch orders');
        }

        return response.data.orders.map((order) => this.mapEbayOrderToMarketplaceOrder(order));
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
          'POST',
          `/sell/fulfillment/v1/order/${externalId}/shipping_fulfillment`,
          {
            trackingNumber: 'TRACKING123',
            shippingCarrierCode: 'USPS',
            shippedDate: new Date().toISOString()
          }
        );

        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to update order status');
        }

        return {
          success: true,
          message: `Order status updated successfully: ${externalId}`,
          data: {
            externalId,
            status: 'shipped'
          },
          timestamp: new Date()
        };
      });
    } catch (error) {
      this.logError('updateOrderStatus', error);
      return {
        success: false,
        message: `Failed to update order status: ${externalId}`,
        errors: [error.message || 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async updateInventory(updates: InventoryUpdate[]): Promise<SyncResult> {
    try {
      this.logOperation('updateInventory', { count: updates.length });
      
      const results = await Promise.all(
        updates.map(async (update) => {
          try {
            const response = await this.makeApiRequest(
              'PUT',
              `/sell/inventory/v1/inventory_item/${update.sku}`,
              {
                sku: update.sku,
                quantity: update.quantity
              }
            );

            return {
              sku: update.sku,
              success: response.success,
              error: response.error?.message
            };
          } catch (error) {
            return {
              sku: update.sku,
              success: false,
              error: error.message
            };
          }
        })
      );

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: failed.length === 0,
        message: `Inventory updated: ${successful.length} successful, ${failed.length} failed`,
        data: {
          successful: successful.length,
          failed: failed.length,
          details: results
        },
        errors: failed.map(f => f.error),
        timestamp: new Date()
      };
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
      
      const results = await Promise.all(
        updates.map(async (update) => {
          try {
            const response = await this.makeApiRequest(
              'PUT',
              `/sell/inventory/v1/inventory_item/${update.sku}`,
              {
                sku: update.sku,
                price: {
                  value: update.price.toString(),
                  currency: update.currency
                }
              }
            );

            return {
              sku: update.sku,
              success: response.success,
              error: response.error?.message
            };
          } catch (error) {
            return {
              sku: update.sku,
              success: false,
              error: error.message
            };
          }
        })
      );

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: failed.length === 0,
        message: `Pricing updated: ${successful.length} successful, ${failed.length} failed`,
        data: {
          successful: successful.length,
          failed: failed.length,
          details: results
        },
        errors: failed.map(f => f.error),
        timestamp: new Date()
      };
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
      
      return {
        name: 'eBay Trading API',
        siteId: this.ebayCredentials.siteId,
        sandbox: this.ebayCredentials.sandbox,
        supportedFeatures: ['listings', 'orders', 'inventory', 'pricing'],
        apiVersion: 'v1',
        rateLimits: {
          requestsPerSecond: 5,
          requestsPerHour: 5000
        }
      };
    } catch (error) {
      this.logError('getMarketplaceInfo', error);
      throw error;
    }
  }

  private mapEbayListingToProductListing(ebayListing: EbayListing): ProductListing {
    return {
      id: ebayListing.itemId,
      sku: ebayListing.sku,
      title: ebayListing.title,
      description: '',
      price: ebayListing.price,
      currency: ebayListing.currency,
      quantity: ebayListing.quantityAvailable,
      status: this.mapEbayStatus(ebayListing.status),
      externalId: ebayListing.itemId,
      attributes: {
        categoryId: ebayListing.categoryId,
        conditionId: ebayListing.conditionId,
        listingType: ebayListing.listingType,
        location: ebayListing.location,
        viewItemURL: ebayListing.viewItemURL
      }
    };
  }

  private mapProductListingToEbayListing(listing: ProductListing): Partial<EbayListing> {
    return {
      sku: listing.sku,
      title: listing.title,
      price: listing.price,
      currency: listing.currency,
      quantity: listing.quantity,
      quantityAvailable: listing.quantity,
      status: 'active',
      listingType: 'FixedPrice',
      categoryId: 11450, // Default category
      conditionId: EBAY_CONDITION_IDS.New,
      location: 'US',
      postalCode: '12345',
      country: 'US',
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      viewItemURL: `https://www.ebay.com/itm/${listing.externalId}`
    };
  }

  private mapEbayOrderToMarketplaceOrder(ebayOrder: EbayOrder): MarketplaceOrder {
    return {
      id: ebayOrder.orderId,
      externalId: ebayOrder.orderId,
      status: this.mapEbayOrderStatus(ebayOrder.orderStatus),
      totalAmount: parseFloat(ebayOrder.total?.value || '0'),
      currency: ebayOrder.total?.currency || 'USD',
      customerName: ebayOrder.buyerUserID,
      shippingAddress: {
        name: ebayOrder.shippingAddress.name,
        address1: ebayOrder.shippingAddress.street1,
        address2: ebayOrder.shippingAddress.street2,
        city: ebayOrder.shippingAddress.cityName,
        state: ebayOrder.shippingAddress.stateOrProvince,
        postalCode: ebayOrder.shippingAddress.postalCode,
        country: ebayOrder.shippingAddress.country
      },
      items: ebayOrder.orderItems.map(item => ({
        sku: item.sku,
        title: item.title,
        quantity: item.quantity,
        price: parseFloat(item.transactionPrice.value),
        currency: item.transactionPrice.currency
      })),
      createdAt: ebayOrder.creationTime,
      updatedAt: ebayOrder.lastModifiedTime
    };
  }

  private mapEbayStatus(ebayStatus: string): 'active' | 'inactive' | 'pending' | 'error' {
    switch (ebayStatus) {
      case 'active':
        return 'active';
      case 'ended':
      case 'suspended':
        return 'inactive';
      case 'pending':
        return 'pending';
      default:
        return 'error';
    }
  }

  private mapEbayOrderStatus(ebayStatus: string): 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' {
    switch (ebayStatus) {
      case 'Pending':
        return 'pending';
      case 'Incomplete':
        return 'confirmed';
      case 'Shipped':
        return 'shipped';
      case 'Complete':
        return 'delivered';
      case 'Cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
} 