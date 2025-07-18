import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { OrderProcessingService } from '../src/order-processing-service';

const prisma = new PrismaClient();

describe('Order Processing Service', () => {
  let app: any;
  let testTenant: any;
  let testOrder: any;
  let testOrderItem: any;
  let testOrderForItem: any;

  beforeAll(async () => {
    // Create test tenant
    testTenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        slug: 'test-tenant',
        status: 'active'
      }
    });

    // Create test product
    const testProduct = await prisma.product.create({
      data: {
        tenantId: testTenant.id,
        sku: 'TEST-PROD-001',
        name: 'Test Product',
        description: 'A test product',
        status: 'active'
      }
    });

    // Create test order
    testOrder = await prisma.order.create({
      data: {
        tenantId: testTenant.id,
        orderNumber: 'ORD-TEST-001',
        customerEmail: 'test@example.com',
        customerName: 'Test Customer',
        totalAmount: 100.00,
        currency: 'USD',
        status: 'pending'
      }
    });

    // Create test order item
    testOrderItem = await prisma.orderItem.create({
      data: {
        orderId: testOrder.id,
        productId: testProduct.id,
        sku: 'TEST-PROD-001',
        name: 'Test Product',
        quantity: 2,
        price: 50.00
      }
    });

    // Create a separate order for add item test
    testOrderForItem = await prisma.order.create({
      data: {
        tenantId: testTenant.id,
        orderNumber: 'ORD-TEST-ITEM',
        customerEmail: 'item@example.com',
        customerName: 'Item Customer',
        totalAmount: 50.00,
        currency: 'USD',
        status: 'pending'
      }
    });

    // Initialize service
    const service = new OrderProcessingService({
      name: 'order-processing',
      port: 3004,
      version: '1.0.0',
      environment: 'test'
    });

    app = service['app'];
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.orderItem.deleteMany({
      where: { orderId: testOrder.id }
    });
    await prisma.order.deleteMany({
      where: { id: testOrder.id }
    });
    await prisma.order.deleteMany({
      where: { id: testOrderForItem.id }
    });
    await prisma.product.deleteMany({
      where: { tenantId: testTenant.id }
    });
    await prisma.tenant.deleteMany({
      where: { id: testTenant.id }
    });
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    test('GET /health should return service health', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'order-processing');
    });
  });

  describe('Service Info', () => {
    test('GET /info should return service information', async () => {
      const response = await request(app)
        .get('/info')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'order-processing');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('endpoints');
      expect(Array.isArray(response.body.endpoints)).toBe(true);
    });
  });

  describe('Order Management', () => {
    test('GET /api/v1/orders should return orders for tenant', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    test('POST /api/v1/orders should create a new order', async () => {
      const newOrder = {
        customerEmail: 'new@example.com',
        customerName: 'New Customer',
        totalAmount: 150.00,
        currency: 'USD',
        items: [
          {
            sku: 'PROD-002',
            name: 'New Product',
            quantity: 1,
            price: 150.00
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .set('x-tenant-id', testTenant.id)
        .send(newOrder)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('orderNumber');
      expect(response.body.data).toHaveProperty('customerEmail', newOrder.customerEmail);
      expect(response.body.data).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('GET /api/v1/orders/:id should return specific order', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${testOrder.id}`)
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testOrder.id);
      expect(response.body.data).toHaveProperty('orderNumber', testOrder.orderNumber);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('PUT /api/v1/orders/:id should update order', async () => {
      const updateData = {
        customerName: 'Updated Customer',
        totalAmount: 120.00
      };

      const response = await request(app)
        .put(`/api/v1/orders/${testOrder.id}`)
        .set('x-tenant-id', testTenant.id)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('DELETE /api/v1/orders/:id should delete order', async () => {
      await request(app)
        .delete(`/api/v1/orders/${testOrder.id}`)
        .set('x-tenant-id', testTenant.id)
        .expect(204);
    });
  });

  describe('Order Status Management', () => {
    test('PUT /api/v1/orders/:id/status should update order status', async () => {
      const response = await request(app)
        .put(`/api/v1/orders/${testOrder.id}/status`)
        .set('x-tenant-id', testTenant.id)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });
  });

  describe('Order Fulfillment', () => {
    test('POST /api/v1/orders/:id/fulfill should fulfill order', async () => {
      const fulfillmentData = {
        trackingNumber: 'TRACK123',
        carrier: 'FedEx',
        notes: 'Order fulfilled'
      };

      const response = await request(app)
        .post(`/api/v1/orders/${testOrder.id}/fulfill`)
        .set('x-tenant-id', testTenant.id)
        .send(fulfillmentData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('fulfillment');
      expect(response.body.data.fulfillment).toHaveProperty('trackingNumber', fulfillmentData.trackingNumber);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('POST /api/v1/orders/:id/ship should ship order', async () => {
      const shippingData = {
        trackingNumber: 'SHIP456',
        carrier: 'UPS',
        notes: 'Order shipped'
      };

      const response = await request(app)
        .post(`/api/v1/orders/${testOrder.id}/ship`)
        .set('x-tenant-id', testTenant.id)
        .send(shippingData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('shipping');
      expect(response.body.data.shipping).toHaveProperty('trackingNumber', shippingData.trackingNumber);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('POST /api/v1/orders/:id/cancel should cancel order', async () => {
      const cancelData = {
        reason: 'Customer request'
      };

      const response = await request(app)
        .post(`/api/v1/orders/${testOrder.id}/cancel`)
        .set('x-tenant-id', testTenant.id)
        .send(cancelData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('cancellation');
      expect(response.body.data.cancellation).toHaveProperty('reason', cancelData.reason);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('POST /api/v1/orders/:id/refund should refund order', async () => {
      const refundData = {
        amount: 100.00,
        reason: 'Customer return',
        refundType: 'full'
      };

      const response = await request(app)
        .post(`/api/v1/orders/${testOrder.id}/refund`)
        .set('x-tenant-id', testTenant.id)
        .send(refundData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('refund');
      expect(response.body.data.refund).toHaveProperty('amount', refundData.amount);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });
  });

  describe('Order Items', () => {
    test('GET /api/v1/order-items should return order items', async () => {
      const response = await request(app)
        .get('/api/v1/order-items')
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/v1/orders/:id/items should return items for specific order', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${testOrder.id}/items`)
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/v1/orders/:id/items should add item to order', async () => {
      const newItem = {
        sku: 'PROD-003',
        name: 'Additional Product',
        quantity: 1,
        price: 25.00
      };

      const response = await request(app)
        .post(`/api/v1/orders/${testOrderForItem.id}/items`)
        .set('x-tenant-id', testTenant.id)
        .send(newItem)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('sku', newItem.sku);
      expect(response.body.data).toHaveProperty('name', newItem.name);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('PUT /api/v1/order-items/:id should update order item', async () => {
      const updateData = {
        quantity: 3,
        price: 30.00
      };

      const response = await request(app)
        .put(`/api/v1/order-items/${testOrderItem.id}`)
        .set('x-tenant-id', testTenant.id)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('DELETE /api/v1/order-items/:id should delete order item', async () => {
      await request(app)
        .delete(`/api/v1/order-items/${testOrderItem.id}`)
        .set('x-tenant-id', testTenant.id)
        .expect(204);
    });
  });

  describe('Order Analytics', () => {
    test('GET /api/v1/orders/analytics/summary should return order analytics', async () => {
      const response = await request(app)
        .get('/api/v1/orders/analytics/summary')
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalOrders');
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('averageOrderValue');
      expect(response.body.data).toHaveProperty('ordersByStatus');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('GET /api/v1/orders/analytics/trends should return order trends', async () => {
      const response = await request(app)
        .get('/api/v1/orders/analytics/trends')
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('period');
      expect(response.body.data).toHaveProperty('revenueGrowth');
      expect(response.body.data).toHaveProperty('orderGrowth');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('GET /api/v1/orders/analytics/performance should return performance metrics', async () => {
      const response = await request(app)
        .get('/api/v1/orders/analytics/performance')
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('fulfillmentRate');
      expect(response.body.data).toHaveProperty('averageFulfillmentTime');
      expect(response.body.data).toHaveProperty('customerSatisfaction');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });
  });

  describe('Order Workflow', () => {
    test('GET /api/v1/orders/workflow/states should return workflow states', async () => {
      const response = await request(app)
        .get('/api/v1/orders/workflow/states')
        .set('x-tenant-id', testTenant.id)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('state');
      expect(response.body.data[0]).toHaveProperty('label');
      expect(response.body.data[0]).toHaveProperty('transitions');
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });

    test('POST /api/v1/orders/:id/workflow/transition should transition order workflow', async () => {
      const transitionData = {
        targetState: 'processing',
        notes: 'Moving to processing'
      };

      const response = await request(app)
        .post(`/api/v1/orders/${testOrder.id}/workflow/transition`)
        .set('x-tenant-id', testTenant.id)
        .send(transitionData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('transition');
      expect(response.body.data.transition).toHaveProperty('toState', transitionData.targetState);
      expect(response.body).toHaveProperty('tenantId', testTenant.id);
    });
  });

  describe('Error Handling', () => {
    test('should return 401 when tenant context is missing', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Tenant context required');
    });

    test('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/v1/orders/non-existent-id')
        .set('x-tenant-id', testTenant.id)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Order not found');
    });

    test('should return 400 for invalid order data', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('x-tenant-id', testTenant.id)
        .send({ invalid: 'data' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
}); 