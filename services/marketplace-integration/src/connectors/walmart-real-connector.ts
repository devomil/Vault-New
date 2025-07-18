import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { MarketplaceConnector } from '../marketplace-connector';
import { 
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
  WalmartCredentials, 
  WalmartProduct, 
  WalmartOrder, 
  WalmartInventory, 
  WalmartPricing,
  WalmartListing,
  WALMART_API_ENDPOINTS,
  WALMART_MARKETPLACE_IDS,
  WALMART_RATE_LIMITS
} from '../walmart-types';

export class WalmartRealConnector extends MarketplaceConnector {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(credentials: MarketplaceCredentials, settings: MarketplaceSettings, logger: any) {
    super(credentials, settings, logger);
    
    const walmartCreds = this.mapToWalmartCredentials(credentials);
    const baseURL = walmartCreds.environment === 'PRODUCTION' 
      ? WALMART_API_ENDPOINTS.PRODUCTION.BASE_URL 
      : WALMART_API_ENDPOINTS.SANDBOX.BASE_URL;

    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'WM_SEC.ACCESS_TOKEN': '',
        'WM_QOS.CORRELATION_ID': walmartCreds.correlationId,
        'WM_SVC.NAME': 'Walmart Marketplace',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use(async (config) => {
      if (!this.accessToken || this.isTokenExpired()) {
        await this.authenticate();
      }
      config.headers['WM_SEC.ACCESS_TOKEN'] = this.accessToken;
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
          originalRequest.headers['WM_SEC.ACCESS_TOKEN'] = this.accessToken;
          return this.axiosInstance(originalRequest);
        }
        return Promise.reject(error);
      }
    );
  }

  protected getRequiredCredentials(): string[] {
    return ['apiKey', 'apiSecret', 'marketplaceId'];
  }

  async getMarketplaceInfo(): Promise<any> {
    return {
      name: 'Walmart Marketplace',
      type: 'walmart-real',
      description: 'Real Walmart Marketplace API integration',
      features: {
        productManagement: true,
        orderManagement: true,
        inventoryManagement: true,
        pricingManagement: true,
        realTimeSync: true,
        webhooks: true,
        bulkOperations: true
      },
      credentials: this.getRequiredCredentials(),
      rateLimits: WALMART_RATE_LIMITS
    };
  }

  private mapToWalmartCredentials(credentials: MarketplaceCredentials): WalmartCredentials {
    return {
      clientId: credentials.apiKey || '',
      clientSecret: credentials.apiSecret || '',
      correlationId: `vault-${Date.now()}`,
      channelType: 'MARKETPLACE',
      environment: 'SANDBOX'
    };
  }

  override validateCredentials(): boolean {
    return super.validateCredentials();
  }

  async authenticate(): Promise<boolean> {
    try {
      const walmartCreds = this.mapToWalmartCredentials(this.credentials);
      const authUrl = walmartCreds.environment === 'PRODUCTION' 
        ? WALMART_API_ENDPOINTS.PRODUCTION.AUTH_URL 
        : WALMART_API_ENDPOINTS.SANDBOX.AUTH_URL;

      const response = await axios.post(authUrl, {
        grant_type: 'client_credentials',
        client_id: walmartCreds.clientId,
        client_secret: walmartCreds.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      this.logger.info('Successfully authenticated with Walmart Marketplace API');
      return true;
    } catch (error) {
      this.logger.error('Failed to authenticate with Walmart Marketplace API:', error);
      return false;
    }
  }

  private isTokenExpired(): boolean {
    return !this.tokenExpiry || Date.now() >= this.tokenExpiry;
  }

  async getListings(): Promise<ProductListing[]> {
    try {
      const response: AxiosResponse<{ items: WalmartListing[] }> = await this.axiosInstance.get('/items');
      
      return response.data.items.map((listing) => this.mapWalmartListingToProductListing(listing));
    } catch (error) {
      this.logger.error('Failed to fetch Walmart listings:', error);
      throw new Error('API Error');
    }
  }

  async createListing(listing: ProductListing): Promise<SyncResult> {
    try {
      const walmartProduct: WalmartProduct = {
        sku: listing.sku,
        productName: listing.title,
        shortDescription: listing.description || '',
        price: {
          amount: listing.price,
          currency: listing.currency
        },
        shipping: {
          weight: {
            value: 1, // Default weight
            unit: 'LB'
          },
          dimension: {
            length: 1,
            width: 1,
            height: 1,
            unit: 'IN'
          }
        },
        inventory: {
          quantity: listing.quantity,
          fulfillmentLagTime: 1
        },
        images: listing.images || [],
        attributes: listing.attributes || {},
        status: 'ACTIVE'
      };

      const response: AxiosResponse<WalmartListing> = await this.axiosInstance.post('/items', walmartProduct);
      
      return {
        success: true,
        message: 'Listing created successfully',
        data: this.mapWalmartListingToProductListing(response.data),
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to create Walmart listing:', error);
      return {
        success: false,
        message: 'Failed to create listing',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async updateListing(listing: ListingUpdate): Promise<SyncResult> {
    try {
      const updateData: any = {};
      if (listing.title) updateData.productName = listing.title;
      if (listing.description) updateData.shortDescription = listing.description;
      if (listing.price) updateData.price = { amount: listing.price, currency: 'USD' };
      if (listing.quantity) updateData.inventory = { quantity: listing.quantity, fulfillmentLagTime: 1 };

      await this.axiosInstance.put(`/items/${listing.sku}`, updateData);
      
      return {
        success: true,
        message: 'Listing updated successfully',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to update Walmart listing:', error);
      return {
        success: false,
        message: 'Failed to update listing',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async deleteListing(externalId: string): Promise<SyncResult> {
    try {
      await this.axiosInstance.delete(`/items/${externalId}`);
      
      return {
        success: true,
        message: 'Listing deleted successfully',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to delete Walmart listing:', error);
      return {
        success: false,
        message: 'Failed to delete listing',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async updateInventory(updates: InventoryUpdate[]): Promise<SyncResult> {
    try {
      const results = await Promise.all(
        updates.map(async (update) => {
          const inventory: WalmartInventory = {
            sku: update.sku,
            quantity: update.quantity,
            fulfillmentLagTime: 1
          };

          await this.axiosInstance.put(`/inventory`, inventory);
          return { sku: update.sku, success: true };
        })
      );

      return {
        success: true,
        message: `Updated inventory for ${results.length} items`,
        data: results,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to update Walmart inventory:', error);
      return {
        success: false,
        message: 'Failed to update inventory',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async updatePricing(updates: PriceUpdate[]): Promise<SyncResult> {
    try {
      const results = await Promise.all(
        updates.map(async (update) => {
          const pricing: WalmartPricing = {
            sku: update.sku,
            price: {
              amount: update.price,
              currency: update.currency
            }
          };

          await this.axiosInstance.put(`/prices`, pricing);
          return { sku: update.sku, success: true };
        })
      );

      return {
        success: true,
        message: `Updated pricing for ${results.length} items`,
        data: results,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to update Walmart pricing:', error);
      return {
        success: false,
        message: 'Failed to update pricing',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async getOrders(startDate?: Date, endDate?: Date): Promise<MarketplaceOrder[]> {
    try {
      let url = '/orders';
      const params: any = {};
      
      if (startDate) params.createdStartDate = startDate.toISOString().split('T')[0];
      if (endDate) params.createdEndDate = endDate.toISOString().split('T')[0];

      const response: AxiosResponse<{ list: WalmartOrder[] }> = await this.axiosInstance.get(url, { params });
      
      return response.data.list.map((order) => this.mapWalmartOrderToMarketplaceOrder(order));
    } catch (error) {
      this.logger.error('Failed to fetch Walmart orders:', error);
      throw new Error('API Error');
    }
  }

  async updateOrderStatus(externalId: string, status: string): Promise<SyncResult> {
    try {
      await this.axiosInstance.put(`/orders/${externalId}/status`, { status });
      
      return {
        success: true,
        message: 'Order status updated successfully',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to update Walmart order status:', error);
      return {
        success: false,
        message: 'Failed to update order status',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  async acknowledgeOrder(orderId: string): Promise<boolean> {
    try {
      await this.axiosInstance.post(`/orders/${orderId}/acknowledge`);
      this.logger.info(`Successfully acknowledged order ${orderId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to acknowledge order ${orderId}:`, error);
      return false;
    }
  }

  async shipOrder(orderId: string, trackingNumber: string, carrier: string): Promise<boolean> {
    try {
      const shippingInfo = {
        orderLines: [{
          orderLineNumber: '1',
          orderLineStatuses: [{
            orderLineStatus: 'Shipped',
            statusQuantity: 1,
            trackingInfo: {
              eventDate: new Date().toISOString().split('T')[0],
              eventTime: new Date().toISOString().split('T')[1].split('.')[0],
              eventDescription: 'Order shipped',
              eventCity: '',
              eventState: '',
              eventZipCode: '',
              eventCountry: 'US'
            }
          }]
        }]
      };

      await this.axiosInstance.post(`/orders/${orderId}/shipping`, shippingInfo);
      this.logger.info(`Successfully shipped order ${orderId} with tracking ${trackingNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to ship order ${orderId}:`, error);
      return false;
    }
  }

  private mapWalmartListingToProductListing(listing: WalmartListing): ProductListing {
    return {
      id: listing.sku,
      sku: listing.sku,
      title: listing.productName,
      description: listing.shortDescription,
      price: listing.price.amount,
      currency: listing.price.currency,
      quantity: listing.inventory.quantity,
      status: this.mapWalmartStatus(listing.status),
      images: [], // Walmart doesn't return images in listing response
      attributes: {
        fulfillmentLagTime: listing.inventory.fulfillmentLagTime,
        currency: listing.price.currency
      }
    };
  }

  private mapWalmartOrderToMarketplaceOrder(order: WalmartOrder): MarketplaceOrder {
    return {
      id: order.purchaseOrderId,
      externalId: order.customerOrderId,
      status: this.mapWalmartOrderStatus(order.orderStatus),
      customerEmail: order.customerEmailId,
      totalAmount: order.orderTotal.totalAmount,
      currency: order.orderTotal.currency,
      shippingAddress: {
        name: order.shippingInfo.postalAddress.name,
        address1: order.shippingInfo.postalAddress.address1,
        address2: order.shippingInfo.postalAddress.address2,
        city: order.shippingInfo.postalAddress.city,
        state: order.shippingInfo.postalAddress.state,
        postalCode: order.shippingInfo.postalAddress.postalCode,
        country: order.shippingInfo.postalAddress.country
      },
      items: order.orderLines.map(line => ({
        sku: line.item.sku,
        title: line.item.productName,
        quantity: line.orderLineQuantity,
        price: line.charges.find(c => c.chargeType === 'PRODUCT')?.chargeAmount || 0
      })),
      createdAt: new Date(order.orderDate),
      updatedAt: new Date()
    };
  }

  private mapWalmartStatus(status: string): 'active' | 'inactive' | 'pending' | 'error' {
    switch (status) {
      case 'ACTIVE': return 'active';
      case 'INACTIVE': return 'inactive';
      case 'PENDING': return 'pending';
      case 'REJECTED': return 'error';
      default: return 'error';
    }
  }

  private mapWalmartOrderStatus(status: string): 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' {
    switch (status) {
      case 'Acknowledged': return 'confirmed';
      case 'Created': return 'pending';
      case 'Shipped': return 'shipped';
      case 'Delivered': return 'delivered';
      case 'Cancelled': return 'cancelled';
      default: return 'pending';
    }
  }
} 