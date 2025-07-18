import { WalmartRealConnector } from '../src/connectors/walmart-real-connector';
import { MarketplaceCredentials, MarketplaceSettings } from '../src/marketplace-connector';

// Mock axios
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  post: jest.fn()
}));

describe('WalmartRealConnector', () => {
  let connector: WalmartRealConnector;
  let credentials: MarketplaceCredentials;
  let settings: MarketplaceSettings;
  let mockLogger: any;

  beforeEach(() => {
    credentials = {
      apiKey: 'test-client-id',
      apiSecret: 'test-client-secret',
      marketplaceId: 'US'
    };

    settings = {
      autoSync: true,
      syncInterval: 30,
      timeout: 30
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    connector = new WalmartRealConnector(credentials, settings, mockLogger);
  });

  describe('validateCredentials', () => {
    it('should return true for valid credentials', () => {
      const result = connector.validateCredentials();
      expect(result).toBe(true);
    });

    it('should return false for missing credentials', () => {
      const invalidCredentials = { ...credentials };
      delete invalidCredentials.apiKey;
      
      const invalidConnector = new WalmartRealConnector(invalidCredentials, settings, mockLogger);
      const result = invalidConnector.validateCredentials();
      
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Missing required credential: apiKey');
    });
  });

  describe('authenticate', () => {
    it('should authenticate successfully', async () => {
      const mockAxios = require('axios');
      mockAxios.post.mockResolvedValue({
        data: {
          access_token: 'test-access-token',
          expires_in: 3600
        }
      });

      const result = await connector.authenticate();
      
      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Successfully authenticated with Walmart Marketplace API');
    });

    it('should handle authentication failure', async () => {
      const mockAxios = require('axios');
      mockAxios.post.mockRejectedValue(new Error('Auth failed'));

      const result = await connector.authenticate();
      
      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to authenticate with Walmart Marketplace API:', expect.any(Error));
    });
  });

  describe('getListings', () => {
    it('should fetch listings successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          items: [
            {
              sku: 'TEST-SKU-1',
              productName: 'Test Product 1',
              shortDescription: 'Test Description 1',
              price: { amount: 29.99, currency: 'USD' },
              inventory: { quantity: 10, fulfillmentLagTime: 1 },
              status: 'ACTIVE',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          ]
        }
      });

      const listings = await connector.getListings();
      
      expect(listings).toHaveLength(1);
      expect(listings[0]).toEqual({
        id: 'TEST-SKU-1',
        sku: 'TEST-SKU-1',
        title: 'Test Product 1',
        description: 'Test Description 1',
        price: 29.99,
        currency: 'USD',
        quantity: 10,
        status: 'active',
        images: [],
        attributes: {
          fulfillmentLagTime: 1,
          currency: 'USD'
        }
      });
    });

    it('should handle API errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API Error'));

      await expect(connector.getListings()).rejects.toThrow('API Error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch Walmart listings:', expect.any(Error));
    });
  });

  describe('createListing', () => {
    it('should create listing successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          sku: 'NEW-SKU',
          productName: 'New Product',
          shortDescription: 'New Description',
          price: { amount: 39.99, currency: 'USD' },
          inventory: { quantity: 5, fulfillmentLagTime: 1 },
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      });

      const listing = {
        id: 'NEW-SKU',
        sku: 'NEW-SKU',
        title: 'New Product',
        description: 'New Description',
        price: 39.99,
        currency: 'USD',
        quantity: 5,
        status: 'active' as const,
        images: [],
        attributes: {}
      };

      const result = await connector.createListing(listing);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Listing created successfully');
      expect(result.data).toBeDefined();
    });

    it('should handle creation failure', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Creation failed'));

      const listing = {
        id: 'NEW-SKU',
        sku: 'NEW-SKU',
        title: 'New Product',
        description: 'New Description',
        price: 39.99,
        currency: 'USD',
        quantity: 5,
        status: 'active' as const,
        images: [],
        attributes: {}
      };

      const result = await connector.createListing(listing);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create listing');
      expect(result.errors).toContain('Creation failed');
    });
  });

  describe('updateInventory', () => {
    it('should update inventory successfully', async () => {
      mockAxiosInstance.put.mockResolvedValue({});

      const updates = [
        { sku: 'TEST-SKU-1', quantity: 15 },
        { sku: 'TEST-SKU-2', quantity: 20 }
      ];

      const result = await connector.updateInventory(updates);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Updated inventory for 2 items');
      expect(result.data).toHaveLength(2);
    });

    it('should handle inventory update failure', async () => {
      mockAxiosInstance.put.mockRejectedValue(new Error('Update failed'));

      const updates = [{ sku: 'TEST-SKU-1', quantity: 15 }];

      const result = await connector.updateInventory(updates);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update inventory');
      expect(result.errors).toContain('Update failed');
    });
  });

  describe('updatePricing', () => {
    it('should update pricing successfully', async () => {
      mockAxiosInstance.put.mockResolvedValue({});

      const updates = [
        { sku: 'TEST-SKU-1', price: 34.99, currency: 'USD' },
        { sku: 'TEST-SKU-2', price: 44.99, currency: 'USD' }
      ];

      const result = await connector.updatePricing(updates);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Updated pricing for 2 items');
      expect(result.data).toHaveLength(2);
    });

    it('should handle pricing update failure', async () => {
      mockAxiosInstance.put.mockRejectedValue(new Error('Update failed'));

      const updates = [{ sku: 'TEST-SKU-1', price: 34.99, currency: 'USD' }];

      const result = await connector.updatePricing(updates);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update pricing');
      expect(result.errors).toContain('Update failed');
    });
  });

  describe('getOrders', () => {
    it('should fetch orders successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          list: [
            {
              purchaseOrderId: 'PO-123',
              customerOrderId: 'CO-123',
              customerEmailId: 'customer@test.com',
              orderDate: '2024-01-01T00:00:00Z',
              orderStatus: 'Created',
              orderTotal: { totalAmount: 59.98, currency: 'USD' },
              shippingInfo: {
                postalAddress: {
                  name: 'John Doe',
                  address1: '123 Main St',
                  city: 'Test City',
                  state: 'TS',
                  postalCode: '12345',
                  country: 'US'
                }
              },
              orderLines: [
                {
                  item: { sku: 'TEST-SKU-1', productName: 'Test Product' },
                  orderLineQuantity: 2,
                  charges: [{ chargeType: 'PRODUCT', chargeAmount: 29.99 }]
                }
              ]
            }
          ]
        }
      });

      const orders = await connector.getOrders();
      
      expect(orders).toHaveLength(1);
      expect(orders[0]).toEqual({
        id: 'PO-123',
        externalId: 'CO-123',
        status: 'pending',
        customerEmail: 'customer@test.com',
        totalAmount: 59.98,
        currency: 'USD',
        shippingAddress: {
          name: 'John Doe',
          address1: '123 Main St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US'
        },
        items: [
          {
            sku: 'TEST-SKU-1',
            title: 'Test Product',
            quantity: 2,
            price: 29.99
          }
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should handle API errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API Error'));

      await expect(connector.getOrders()).rejects.toThrow('API Error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch Walmart orders:', expect.any(Error));
    });
  });

  describe('getMarketplaceInfo', () => {
    it('should return marketplace information', async () => {
      const info = await connector.getMarketplaceInfo();
      
      expect(info.name).toBe('Walmart Marketplace');
      expect(info.type).toBe('walmart-real');
      expect(info.description).toBe('Real Walmart Marketplace API integration');
      expect(info.features.productManagement).toBe(true);
      expect(info.features.orderManagement).toBe(true);
      expect(info.credentials).toEqual(['apiKey', 'apiSecret', 'marketplaceId']);
    });
  });
}); 