import request from 'supertest';
import { Application } from 'express';
import { MarketplaceIntegrationService } from '../src/marketplace-integration-service';
import { ServiceConfig } from '@vault/shared-middleware';
import { PrismaClient } from '@prisma/client';

describe('Marketplace Integration Service', () => {
  let app: Application;
  let prisma: PrismaClient;
  let testTenantId: string;
  let testMarketplaceId: string;
  let testListingId: string;

  beforeAll(async () => {
    // Initialize Prisma
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://vault:vaultpass@localhost:5433/vault'
        }
      }
    });

    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        slug: 'test-tenant-marketplace',
        status: 'active'
      }
    });
    testTenantId = tenant.id;

    // Set up service
    const config: ServiceConfig = {
      name: 'marketplace-integration',
      port: 3002,
      version: '1.0.0',
      environment: 'test'
    };

    const service = new MarketplaceIntegrationService(config);
    app = service['app']; // Access the protected app property for testing
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.marketplaceListing.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.marketplaceOrder.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.marketplace.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.tenant.delete({
      where: { id: testTenantId }
    });
    await prisma.$disconnect();
  });

  describe('Health and Info Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    it('should return service info', async () => {
      const response = await request(app).get('/info');
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('marketplace-integration');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('Supported Marketplaces', () => {
    it('should return supported marketplaces', async () => {
      const response = await request(app)
        .get('/api/v1/marketplaces/supported')
        .set('x-tenant-id', testTenantId);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('type');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('requiredCredentials');
    });
  });

  describe('Marketplace CRUD', () => {
    it('should create a new marketplace', async () => {
      const marketplaceData = {
        name: 'Test Amazon Marketplace',
        type: 'amazon',
        credentials: {
          apiKey: 'test-api-key',
          apiSecret: 'test-api-secret',
          sellerId: 'test-seller-id'
        },
        settings: {
          autoSync: true,
          syncInterval: 30
        }
      };

      const response = await request(app)
        .post('/api/v1/marketplaces')
        .set('x-tenant-id', testTenantId)
        .send(marketplaceData);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Test Amazon Marketplace');
      expect(response.body.data.type).toBe('amazon');
      expect(response.body.data.status).toBe('active');
      testMarketplaceId = response.body.data.id;
    });

    it('should get all marketplaces', async () => {
      const response = await request(app)
        .get('/api/v1/marketplaces')
        .set('x-tenant-id', testTenantId);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get a specific marketplace', async () => {
      const response = await request(app)
        .get(`/api/v1/marketplaces/${testMarketplaceId}`)
        .set('x-tenant-id', testTenantId);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testMarketplaceId);
    });

    it('should update a marketplace', async () => {
      const updateData = {
        name: 'Updated Amazon Marketplace',
        settings: {
          autoSync: false,
          syncInterval: 60
        }
      };

      const response = await request(app)
        .put(`/api/v1/marketplaces/${testMarketplaceId}`)
        .set('x-tenant-id', testTenantId)
        .send(updateData);

      expect(response.status).toBe(200);
    });

    it('should test marketplace connection', async () => {
      const response = await request(app)
        .post(`/api/v1/marketplaces/${testMarketplaceId}/test`)
        .set('x-tenant-id', testTenantId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBeDefined();
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Listings CRUD', () => {
    it('should create a new listing', async () => {
      // Insert a test product for the listing
      const testProduct = await prisma.product.create({
        data: {
          tenantId: testTenantId,
          sku: 'test-product-id',
          name: 'Test Product',
          status: 'active'
        }
      });

      const listingData = {
        marketplaceId: testMarketplaceId,
        productId: testProduct.id, // Use the actual product ID, not SKU
        title: 'Test Product Listing',
        description: 'A test product listing',
        price: 29.99,
        currency: 'USD',
        quantity: 50,
        attributes: {
          color: 'red',
          size: 'M'
        }
      };

      const response = await request(app)
        .post('/api/v1/listings')
        .set('x-tenant-id', testTenantId)
        .send(listingData);

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Test Product Listing');
      expect(response.body.data.status).toBe('pending');
      testListingId = response.body.data.id;
    });

    it('should get all listings', async () => {
      const response = await request(app)
        .get('/api/v1/listings')
        .set('x-tenant-id', testTenantId);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get a specific listing', async () => {
      const response = await request(app)
        .get(`/api/v1/listings/${testListingId}`)
        .set('x-tenant-id', testTenantId);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testListingId);
    });

    it('should update a listing', async () => {
      const updateData = {
        title: 'Updated Product Listing',
        price: 39.99,
        quantity: 25
      };

      const response = await request(app)
        .put(`/api/v1/listings/${testListingId}`)
        .set('x-tenant-id', testTenantId)
        .send(updateData);

      expect(response.status).toBe(200);
    });

    it('should delete a listing', async () => {
      const response = await request(app)
        .delete(`/api/v1/listings/${testListingId}`)
        .set('x-tenant-id', testTenantId);

      expect(response.status).toBe(204);
    });
  });

  describe('Orders', () => {
    it('should get all orders', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('x-tenant-id', testTenantId);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Sync Operations', () => {
    it('should sync inventory', async () => {
      const syncData = {
        marketplaceId: testMarketplaceId,
        updates: [
          {
            sku: 'DEMO-001',
            quantity: 100
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/sync/inventory')
        .set('x-tenant-id', testTenantId)
        .send(syncData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should sync pricing', async () => {
      const syncData = {
        marketplaceId: testMarketplaceId,
        updates: [
          {
            sku: 'DEMO-001',
            price: 34.99,
            currency: 'USD'
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/sync/pricing')
        .set('x-tenant-id', testTenantId)
        .send(syncData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should sync listings', async () => {
      const syncData = {
        marketplaceId: testMarketplaceId
      };

      const response = await request(app)
        .post('/api/v1/sync/listings')
        .set('x-tenant-id', testTenantId)
        .send(syncData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should sync orders', async () => {
      const syncData = {
        marketplaceId: testMarketplaceId,
        startDate: '2025-07-01',
        endDate: '2025-07-10'
      };

      const response = await request(app)
        .post('/api/v1/sync/orders')
        .set('x-tenant-id', testTenantId)
        .send(syncData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 401 without tenant context', async () => {
      const response = await request(app).get('/api/v1/marketplaces');
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid marketplace data', async () => {
      const invalidData = {
        name: '',
        type: 'invalid-type'
      };

      const response = await request(app)
        .post('/api/v1/marketplaces')
        .set('x-tenant-id', testTenantId)
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent marketplace', async () => {
      const response = await request(app)
        .get('/api/v1/marketplaces/non-existent-id')
        .set('x-tenant-id', testTenantId);

      expect(response.status).toBe(404);
    });
  });
}); 