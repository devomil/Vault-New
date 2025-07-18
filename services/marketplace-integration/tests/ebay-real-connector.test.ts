import { EbayRealConnector } from '../src/connectors/ebay-real-connector';
import { MarketplaceCredentials, MarketplaceSettings } from '../src/marketplace-connector';

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

describe('EbayRealConnector', () => {
  let connector: EbayRealConnector;
  let credentials: MarketplaceCredentials;
  let settings: MarketplaceSettings;

  beforeEach(() => {
    credentials = {
      apiKey: 'test-app-id',
      apiSecret: 'test-cert-id',
      sellerId: 'test-dev-id',
      marketplaceId: 'test-auth-token'
    };

    settings = {
      autoSync: true,
      syncInterval: 30,
      errorRetryAttempts: 3,
      timeout: 30000
    };

    connector = new EbayRealConnector(credentials, settings, mockLogger);
  });

  describe('validateCredentials', () => {
    it('should validate required credentials', () => {
      const isValid = (connector as any).validateCredentials();
      expect(isValid).toBe(true);
    });

    it('should fail validation with missing credentials', () => {
      const invalidConnector = new EbayRealConnector(
        { apiKey: 'test' },
        settings,
        mockLogger
      );
      const isValid = (invalidConnector as any).validateCredentials();
      expect(isValid).toBe(false);
    });
  });

  describe('authenticate', () => {
    it('should authenticate successfully with valid credentials', async () => {
      // Mock the API client to return success
      jest.spyOn(connector as any, 'makeApiRequest').mockResolvedValue({
        success: true,
        data: { inventoryItems: [] }
      });

      const result = await connector.authenticate();
      expect(result).toBe(true);
    });

    it('should fail authentication with invalid credentials', async () => {
      // Mock the API client to return failure
      jest.spyOn(connector as any, 'makeApiRequest').mockResolvedValue({
        success: false,
        error: { message: 'Authentication failed' }
      });

      const result = await connector.authenticate();
      expect(result).toBe(false);
    });
  });

  describe('getListings', () => {
    it('should fetch listings successfully', async () => {
      const mockListings = [
        {
          itemId: '123456789',
          sku: 'TEST-SKU-1',
          title: 'Test Product 1',
          price: 29.99,
          currency: 'USD',
          quantity: 10,
          quantityAvailable: 10,
          status: 'active',
          listingType: 'FixedPrice',
          startTime: new Date(),
          endTime: new Date(),
          viewItemURL: 'https://www.ebay.com/itm/123456789',
          categoryId: 11450,
          conditionId: 1000,
          location: 'US',
          postalCode: '12345',
          country: 'US'
        }
      ];

      jest.spyOn(connector as any, 'makeApiRequest').mockResolvedValue({
        success: true,
        data: { inventoryItems: mockListings }
      });

      const result = await connector.getListings();
      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe('TEST-SKU-1');
      expect(result[0].title).toBe('Test Product 1');
      expect(result[0].price).toBe(29.99);
    });

    it('should handle API errors gracefully', async () => {
      jest.spyOn(connector as any, 'makeApiRequest').mockResolvedValue({
        success: false,
        error: { message: 'API Error' }
      });

      await expect(connector.getListings()).rejects.toThrow('API Error');
    });
  });

  describe('createListing', () => {
    it('should create listing successfully', async () => {
      const listing = {
        id: 'test-id',
        sku: 'TEST-SKU-1',
        title: 'Test Product',
        description: 'Test Description',
        price: 29.99,
        currency: 'USD',
        quantity: 10,
        status: 'active' as const
      };

      jest.spyOn(connector as any, 'makeApiRequest').mockResolvedValue({
        success: true,
        data: { listingId: '123456789' }
      });

      const result = await connector.createListing(listing);
      expect(result.success).toBe(true);
      expect(result.message).toContain('created successfully');
      expect(result.data?.externalId).toBe('123456789');
    });
  });

  describe('updateInventory', () => {
    it('should update inventory successfully', async () => {
      const updates = [
        { sku: 'TEST-SKU-1', quantity: 5 },
        { sku: 'TEST-SKU-2', quantity: 10 }
      ];

      jest.spyOn(connector as any, 'makeApiRequest').mockResolvedValue({
        success: true,
        data: {}
      });

      const result = await connector.updateInventory(updates);
      expect(result.success).toBe(true);
      expect(result.message).toContain('2 successful, 0 failed');
    });
  });

  describe('updatePricing', () => {
    it('should update pricing successfully', async () => {
      const updates = [
        { sku: 'TEST-SKU-1', price: 29.99, currency: 'USD' },
        { sku: 'TEST-SKU-2', price: 39.99, currency: 'USD' }
      ];

      jest.spyOn(connector as any, 'makeApiRequest').mockResolvedValue({
        success: true,
        data: {}
      });

      const result = await connector.updatePricing(updates);
      expect(result.success).toBe(true);
      expect(result.message).toContain('2 successful, 0 failed');
    });
  });

  describe('getOrders', () => {
    it('should fetch orders successfully', async () => {
      const mockOrders = [
        {
          orderId: '123456789',
          orderStatus: 'Complete',
          buyerUserID: 'testbuyer',
          sellerUserID: 'testseller',
          creationTime: new Date(),
          lastModifiedTime: new Date(),
          orderItems: [
            {
              itemId: '123456789',
              sku: 'TEST-SKU-1',
              title: 'Test Product',
              quantity: 1,
              transactionId: 'TXN123',
              transactionPrice: { value: '29.99', currency: 'USD' },
              listingType: 'FixedPrice'
            }
          ],
          shippingAddress: {
            name: 'Test Buyer',
            street1: '123 Test St',
            cityName: 'Test City',
            stateOrProvince: 'Test State',
            country: 'US',
            countryName: 'United States',
            postalCode: '12345'
          },
          total: { value: '29.99', currency: 'USD' }
        }
      ];

      jest.spyOn(connector as any, 'makeApiRequest').mockResolvedValue({
        success: true,
        data: { orders: mockOrders }
      });

      const result = await connector.getOrders();
      expect(result).toHaveLength(1);
      expect(result[0].externalId).toBe('123456789');
      expect(result[0].status).toBe('delivered');
      expect(result[0].totalAmount).toBe(29.99);
    });
  });

  describe('getMarketplaceInfo', () => {
    it('should return marketplace information', async () => {
      const info = await connector.getMarketplaceInfo();
      expect(info.name).toBe('eBay Trading API');
      expect(info.supportedFeatures).toContain('listings');
      expect(info.supportedFeatures).toContain('orders');
      expect(info.supportedFeatures).toContain('inventory');
      expect(info.supportedFeatures).toContain('pricing');
    });
  });
}); 