import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { SimpleApiGateway } from '../../src/simple-gateway';

// Mock downstream services
const createMockService = (port: number, serviceName: string) => {
  const app = express();
  
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: serviceName,
      port: port,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/v1/products', (req, res) => {
    res.json({
      message: `Response from ${serviceName}`,
      tenantId: req.headers['x-tenant-id'],
      userId: req.headers['x-user-id'],
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/v1/orders', (req, res) => {
    res.json({
      message: `Response from ${serviceName}`,
      tenantId: req.headers['x-tenant-id'],
      userId: req.headers['x-user-id'],
      timestamp: new Date().toISOString()
    });
  });

  return app.listen(port, () => {
    console.log(`Mock ${serviceName} running on port ${port}`);
  });
};

// JWT utilities for testing
const generateTestToken = (tenantId: string, userId: string, role: string = 'user') => {
  const payload = {
    tenantId,
    userId,
    role,
    permissions: ['read', 'write'],
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  };
  
  return jwt.sign(payload, process.env['JWT_SECRET'] || 'default-secret');
};

describe('API Gateway Integration Tests', () => {
  let gateway: SimpleApiGateway;
  let mockServices: any[] = [];
  const GATEWAY_PORT = 3009;

  beforeAll(async () => {
    // Set test environment
    process.env['JWT_SECRET'] = 'test-secret-key';
    
    // Start mock downstream services
    mockServices = [
      createMockService(3001, 'Product Intelligence'),
      createMockService(3002, 'Marketplace Integration'),
      createMockService(3003, 'Vendor Integration'),
      createMockService(3004, 'Order Processing'),
      createMockService(3005, 'Pricing Engine'),
      createMockService(3006, 'Inventory Management'),
      createMockService(3007, 'Accounting System'),
      createMockService(3008, 'Analytics Engine')
    ];

    // Wait for services to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start the API Gateway on a different port to avoid conflicts
    gateway = new SimpleApiGateway(GATEWAY_PORT);
    await gateway.start();
  });

  afterAll(async () => {
    // Cleanup
    await gateway.shutdown();
    mockServices.forEach(server => server.close());
  });

  describe('Gateway Info Endpoints', () => {
    it('should return gateway info', async () => {
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/gateway/info')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'API Gateway');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
      expect(response.body.services.length).toBe(10); // All 10 services (including new Security & Performance services)
    });

    it('should return available routes', async () => {
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/gateway/routes')
        .expect(200);

      expect(response.body).toHaveProperty('routes');
      expect(Array.isArray(response.body.routes)).toBe(true);
      expect(response.body.routes.length).toBe(10);
      
      // Check that all expected routes are present
      const routePaths = response.body.routes.map((r: any) => r.path);
      expect(routePaths).toContain('/api/v1/products');
      expect(routePaths).toContain('/api/v1/orders');
      expect(routePaths).toContain('/api/v1/marketplaces');
    });

    it('should return gateway health status', async () => {
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/gateway/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service', 'API Gateway');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
      
      // All services should be healthy since we have mocks running
      const allHealthy = response.body.services.every((s: any) => s.status === 'healthy');
      expect(allHealthy).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for API routes', async () => {
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/api/v1/products')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
      expect(response.body).toHaveProperty('message', 'Bearer token is required');
    });

    it('should reject requests without Bearer prefix', async () => {
      const token = generateTestToken('tenant-1', 'user-1');
      
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/api/v1/products')
        .set('Authorization', token)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    it('should reject invalid JWT tokens', async () => {
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/api/v1/products')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token');
      expect(response.body).toHaveProperty('message', 'JWT token is invalid or malformed');
    });

    it('should accept valid JWT tokens', async () => {
      const token = generateTestToken('tenant-1', 'user-1', 'admin');
      
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('tenantId', 'tenant-1');
      expect(response.body).toHaveProperty('userId', 'user-1');
    });
  });

  describe('Routing', () => {
    it('should route /api/v1/products to Product Intelligence service', async () => {
      const token = generateTestToken('tenant-1', 'user-1');
      
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toContain('Product Intelligence');
      expect(response.body.tenantId).toBe('tenant-1');
      expect(response.body.userId).toBe('user-1');
    });

    it('should route /api/v1/orders to Order Processing service', async () => {
      const token = generateTestToken('tenant-2', 'user-2');
      
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toContain('Order Processing');
      expect(response.body.tenantId).toBe('tenant-2');
      expect(response.body.userId).toBe('user-2');
    });

    it('should forward tenant context to downstream services', async () => {
      const token = generateTestToken('tenant-3', 'user-3', 'admin');
      
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.tenantId).toBe('tenant-3');
      expect(response.body.userId).toBe('user-3');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to API routes', async () => {
      const token = generateTestToken('tenant-1', 'user-1');
      
      // Make multiple requests to trigger rate limiting
      const requests = Array.from({ length: 1001 }, () =>
        request(`http://localhost:${GATEWAY_PORT}`)
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(requests);
      
      // Check if any request was rate limited (429 status)
      const rateLimitedResponse = responses.find(res => res.status === 429);
      expect(rateLimitedResponse).toBeDefined();
      
      if (rateLimitedResponse) {
        expect(rateLimitedResponse.body).toHaveProperty('error');
        expect(rateLimitedResponse.body.error).toContain('Too many requests');
      }
    });

    it('should apply per-tenant rate limiting', async () => {
      const token1 = generateTestToken('tenant-1', 'user-1');
      const token2 = generateTestToken('tenant-2', 'user-2');
      
      // Make requests from different tenants
      const requests1 = Array.from({ length: 1001 }, () =>
        request(`http://localhost:${GATEWAY_PORT}`)
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token1}`)
      );

      const requests2 = Array.from({ length: 1001 }, () =>
        request(`http://localhost:${GATEWAY_PORT}`)
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${token2}`)
      );

      const responses1 = await Promise.all(requests1);
      const responses2 = await Promise.all(requests2);
      
      // Both tenants should be rate limited independently
      const rateLimited1 = responses1.find(res => res.status === 429);
      const rateLimited2 = responses2.find(res => res.status === 429);
      
      expect(rateLimited1).toBeDefined();
      expect(rateLimited2).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle downstream service failures gracefully', async () => {
      // Close one of the mock services to simulate failure
      mockServices[0].close();
      
      const token = generateTestToken('tenant-1', 'user-1');
      
      const response = await request(`http://localhost:${GATEWAY_PORT}`)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${token}`)
        .expect(502);

      expect(response.body).toHaveProperty('error', 'Service unavailable');
      expect(response.body).toHaveProperty('service', '/api/v1/products');
      
      // Restart the mock service
      mockServices[0] = createMockService(3001, 'Product Intelligence');
    });
  });
}); 