require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
import request from 'supertest';
import { ProductIntelligenceService } from '../src/product-intelligence-service';
import { PrismaClient } from '@prisma/client';

describe('Product Intelligence Service', () => {
  let service: ProductIntelligenceService;
  let app: any;
  let prisma: PrismaClient;
  let testTenantId: string;
  let testProductId: string;

  beforeAll(async () => {
    service = new ProductIntelligenceService({
      name: 'product-intelligence-test',
      port: 3010,
      version: '1.0.0',
      environment: 'test'
    });
    app = service['app'];
    prisma = service['prisma'];

    // Clean up test data
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.tenant.deleteMany();

    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        slug: 'test-tenant',
        status: 'active'
      }
    });
    testTenantId = tenant.id;

    // Store test tenant ID for use in tests
    testTenantId = tenant.id;
  });

  afterAll(async () => {
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.$disconnect();
  });

  describe('Health and Info Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('product-intelligence-test');
    });

    it('should return service info', async () => {
      const response = await request(app).get('/info');
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('product-intelligence-test');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('Product CRUD', () => {
    it('should create a new product', async () => {
      const productData = {
        sku: 'SKU-001',
        name: 'Test Product',
        category: 'electronics',
        status: 'active',
        images: ['https://example.com/image1.jpg'],
        attributes: { color: 'red', size: 'M' },
        variants: [
          { sku: 'SKU-001-V1', name: 'Variant 1', attributes: { color: 'red' } }
        ]
      };
      const response = await request(app)
        .post('/api/v1/products')
        .set('x-tenant-id', testTenantId)
        .send(productData);
      expect(response.status).toBe(201);
      expect(response.body.sku).toBe('SKU-001');
      expect(response.body.variants.length).toBe(1);
      testProductId = response.body.id;
    });

    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('x-tenant-id', testTenantId);
      expect(response.status).toBe(200);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    it('should get a specific product', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${testProductId}`)
        .set('x-tenant-id', testTenantId);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testProductId);
    });

    it('should update a product', async () => {
      const updateData = { name: 'Updated Product', status: 'inactive' };
      const response = await request(app)
        .put(`/api/v1/products/${testProductId}`)
        .set('x-tenant-id', testTenantId)
        .send(updateData);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Product');
      expect(response.body.status).toBe('inactive');
    });

    it('should delete a product', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${testProductId}`)
        .set('x-tenant-id', testTenantId);
      expect(response.status).toBe(204);
    });
  });

  // Additional tests for analysis, recommendations, and variants can be added here
}); 