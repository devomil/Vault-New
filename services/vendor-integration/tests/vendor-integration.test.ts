import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { VendorIntegrationService } from '../src/vendor-integration-service';

const prisma = new PrismaClient();

describe('Vendor Integration Service', () => {
  let app: any;
  let testTenant: any;
  let testVendor: any;
  let testVendorProduct: any;
  let testPurchaseOrder: any;

  beforeAll(async () => {
    // Create test tenant
    testTenant = await prisma.tenant.create({
      data: {
        name: 'Test Vendor Tenant',
        slug: 'test-vendor-tenant',
        status: 'active',
        configuration: {}
      }
    });

    // Create test vendor
    testVendor = await prisma.vendor.create({
      data: {
        tenantId: testTenant.id,
        vendorId: 'test-vendor-001',
        name: 'Test Vendor',
        type: 'ingram_micro',
        status: 'active',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        settings: {}
      }
    });

    // Create test vendor product
    testVendorProduct = await prisma.vendorProduct.create({
      data: {
        vendorId: testVendor.id,
        sku: 'TEST-SKU-001',
        name: 'Test Product',
        price: 99.99,
        cost: 75.00,
        quantity: 10,
        status: 'active',
        description: 'Test product description'
      }
    });

    // Create test purchase order
    testPurchaseOrder = await prisma.vendorOrder.create({
      data: {
        vendorId: testVendor.id,
        orderId: 'TEST-ORDER-001',
        status: 'pending',
        totalAmount: 199.98,
        items: [
          {
            sku: 'TEST-SKU-001',
            name: 'Test Product',
            quantity: 2,
            price: 99.99,
            total: 199.98
          }
        ]
      }
    });

    // Initialize service
    const service = new VendorIntegrationService({
      name: 'Vendor Integration Service',
      port: 3003,
      version: '1.0.0',
      environment: 'test'
    });

    app = service['app']; // Access the protected app property for testing
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.vendorOrder.deleteMany({
      where: { vendorId: testVendor.id }
    });
    await prisma.vendorProduct.deleteMany({
      where: { vendorId: testVendor.id }
    });
    await prisma.vendor.deleteMany({
      where: { tenantId: testTenant.id }
    });
    await prisma.tenant.delete({
      where: { id: testTenant.id }
    });
    await prisma.$disconnect();
  });

  describe('Health and Info Endpoints', () => {
    test('GET /health should return service health', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'Vendor Integration Service');
    });

    test('GET /info should return service information', async () => {
      const response = await request(app)
        .get('/info')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Vendor Integration Service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('Vendor Management', () => {
    test('GET /api/v1/vendors should return vendors for tenant', async () => {
      const response = await request(app)
        .get('/api/v1/vendors')
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/v1/vendors should create new vendor', async () => {
      const newVendor = {
        name: 'New Test Vendor',
        type: 'td_synnex',
        credentials: {
          apiKey: 'new-api-key',
          apiSecret: 'new-api-secret'
        },
        settings: {
          autoSync: true,
          syncInterval: 3600
        }
      };

      const response = await request(app)
        .post('/api/v1/vendors')
        .set('x-tenant-id', testTenant.id)
        .send(newVendor)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', newVendor.name);
      expect(response.body.data).toHaveProperty('type', newVendor.type);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);

      // Cleanup
      await prisma.vendor.delete({
        where: { id: response.body.data.id }
      });
    });

    test('GET /api/v1/vendors/:id should return specific vendor', async () => {
      const response = await request(app)
        .get(`/api/v1/vendors/${testVendor.id}`)
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testVendor.id);
      expect(response.body.data).toHaveProperty('name', testVendor.name);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('PUT /api/v1/vendors/:id should update vendor', async () => {
      const updateData = {
        name: 'Updated Test Vendor',
        status: 'inactive'
      };

      const response = await request(app)
        .put(`/api/v1/vendors/${testVendor.id}`)
        .set('x-tenant-id', testTenant.id)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('DELETE /api/v1/vendors/:id should delete vendor', async () => {
      const vendorToDelete = await prisma.vendor.create({
        data: {
          tenantId: testTenant.id,
          vendorId: 'delete-test-vendor',
          name: 'Delete Test Vendor',
          type: 'ingram_micro',
          status: 'active'
        }
      });

      await request(app)
        .delete(`/api/v1/vendors/${vendorToDelete.id}`)
        .set('x-tenant-id', testTenant.id)
        .expect(204);
    });
  });

  describe('Vendor Products', () => {
    test('GET /api/v1/vendor-products should return vendor products', async () => {
      const response = await request(app)
        .get('/api/v1/vendor-products')
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/v1/vendor-products should create new vendor product', async () => {
      const newProduct = {
        vendorId: testVendor.id,
        sku: 'NEW-SKU-001',
        name: 'New Test Product',
        price: 149.99,
        cost: 120.00,
        quantity: 5,
        description: 'New test product description'
      };

      const response = await request(app)
        .post('/api/v1/vendor-products')
        .set('x-tenant-id', testTenant.id)
        .send(newProduct)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('sku', newProduct.sku);
      expect(response.body.data).toHaveProperty('name', newProduct.name);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);

      // Cleanup
      await prisma.vendorProduct.delete({
        where: { id: response.body.data.id }
      });
    });

    test('GET /api/v1/vendor-products/:id should return specific vendor product', async () => {
      const response = await request(app)
        .get(`/api/v1/vendor-products/${testVendorProduct.id}`)
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testVendorProduct.id);
      expect(response.body.data).toHaveProperty('sku', testVendorProduct.sku);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('PUT /api/v1/vendor-products/:id should update vendor product', async () => {
      const updateData = {
        name: 'Updated Test Product',
        price: 129.99,
        quantity: 15
      };

      const response = await request(app)
        .put(`/api/v1/vendor-products/${testVendorProduct.id}`)
        .set('x-tenant-id', testTenant.id)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('DELETE /api/v1/vendor-products/:id should delete vendor product', async () => {
      const productToDelete = await prisma.vendorProduct.create({
        data: {
          vendorId: testVendor.id,
          sku: 'DELETE-SKU-001',
          name: 'Delete Test Product',
          price: 99.99,
          cost: 75.00,
          quantity: 5,
          status: 'active'
        }
      });

      await request(app)
        .delete(`/api/v1/vendor-products/${productToDelete.id}`)
        .set('x-tenant-id', testTenant.id)
        .expect(204);
    });
  });

  describe('Purchase Orders', () => {
    test('GET /api/v1/purchase-orders should return purchase orders', async () => {
      const response = await request(app)
        .get('/api/v1/purchase-orders')
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/v1/purchase-orders should create new purchase order', async () => {
      const newOrder = {
        vendorId: testVendor.id,
        items: [
          {
            sku: 'TEST-SKU-001',
            name: 'Test Product',
            quantity: 3,
            price: 99.99,
            total: 299.97
          }
        ],
        totalAmount: 299.97
      };

      const response = await request(app)
        .post('/api/v1/purchase-orders')
        .set('x-tenant-id', testTenant.id)
        .send(newOrder)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('vendorId', testVendor.id);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);

      // Cleanup
      await prisma.vendorOrder.delete({
        where: { id: response.body.data.id }
      });
    });

    test('GET /api/v1/purchase-orders/:id should return specific purchase order', async () => {
      const response = await request(app)
        .get(`/api/v1/purchase-orders/${testPurchaseOrder.id}`)
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testPurchaseOrder.id);
      expect(response.body.data).toHaveProperty('orderId', testPurchaseOrder.orderId);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('PUT /api/v1/purchase-orders/:id should update purchase order', async () => {
      const updateData = {
        status: 'confirmed',
        totalAmount: 249.97
      };

      const response = await request(app)
        .put(`/api/v1/purchase-orders/${testPurchaseOrder.id}`)
        .set('x-tenant-id', testTenant.id)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('DELETE /api/v1/purchase-orders/:id should delete purchase order', async () => {
      const orderToDelete = await prisma.vendorOrder.create({
        data: {
          vendorId: testVendor.id,
          orderId: 'DELETE-ORDER-001',
          status: 'pending',
          totalAmount: 99.99,
          items: []
        }
      });

      await request(app)
        .delete(`/api/v1/purchase-orders/${orderToDelete.id}`)
        .set('x-tenant-id', testTenant.id)
        .expect(204);
    });
  });

  describe('Sync Operations', () => {
    test('GET /api/v1/vendors/supported should return supported vendor types', async () => {
      const response = await request(app)
        .get('/api/v1/vendors/supported')
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('type');
      expect(response.body.data[0]).toHaveProperty('displayName');
      expect(response.body.data[0]).toHaveProperty('description');
    });

    test('POST /api/v1/vendors/:id/sync/products should sync vendor products', async () => {
      const response = await request(app)
        .post(`/api/v1/vendors/${testVendor.id}/sync/products`)
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('vendorId', testVendor.id);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(response.body.data).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('itemsProcessed');
      expect(response.body.data).toHaveProperty('itemsTotal');
    });

    test('POST /api/v1/vendors/:id/sync/inventory should sync vendor inventory', async () => {
      const response = await request(app)
        .post(`/api/v1/vendors/${testVendor.id}/sync/inventory`)
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('vendorId', testVendor.id);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(response.body.data).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('itemsProcessed');
      expect(response.body.data).toHaveProperty('itemsTotal');
    });

    test('POST /api/v1/vendors/:id/sync/pricing should sync vendor pricing', async () => {
      const response = await request(app)
        .post(`/api/v1/vendors/${testVendor.id}/sync/pricing`)
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('vendorId', testVendor.id);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(response.body.data).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('itemsProcessed');
      expect(response.body.data).toHaveProperty('itemsTotal');
    });

    test('POST /api/v1/vendors/:id/sync/orders should sync vendor orders', async () => {
      const response = await request(app)
        .post(`/api/v1/vendors/${testVendor.id}/sync/orders`)
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('vendorId', testVendor.id);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(response.body.data).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('itemsProcessed');
      expect(response.body.data).toHaveProperty('itemsTotal');
    });
  });

  describe('Error Handling', () => {
    test('should return 401 when tenant context is missing', async () => {
      await request(app)
        .get('/api/v1/vendors')
        .expect(401);
    });

    test('should return 404 when vendor not found', async () => {
      await request(app)
        .get('/api/v1/vendors/non-existent-id')
        .set('x-tenant-id', testTenant.id)
        .expect(404);
    });

    test('should return 404 when vendor product not found', async () => {
      await request(app)
        .get('/api/v1/vendor-products/non-existent-id')
        .set('x-tenant-id', testTenant.id)
        .expect(404);
    });

    test('should return 404 when purchase order not found', async () => {
      await request(app)
        .get('/api/v1/purchase-orders/non-existent-id')
        .set('x-tenant-id', testTenant.id)
        .expect(404);
    });

    test('should return 404 when syncing non-existent vendor', async () => {
      await request(app)
        .post('/api/v1/vendors/non-existent-id/sync/products')
        .set('x-tenant-id', testTenant.id)
        .expect(404);
    });
  });
}); 
