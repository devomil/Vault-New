import request from 'supertest';
import { ApiGatewayService } from '../src/api-gateway-service';

describe('API Gateway', () => {
  let gateway: ApiGatewayService;
  let app: any;

  beforeAll(async () => {
    const config = {
      name: 'API Gateway Test',
      port: 3000,
      version: '1.0.0',
      environment: 'test'
    };

    gateway = new ApiGatewayService(config);
    await gateway.start();
    app = gateway['app']; // Access the Express app for testing
  });

  afterAll(async () => {
    await gateway.shutdown();
  });

  describe('Gateway Info Endpoints', () => {
    it('should return gateway info', async () => {
      const response = await request(app)
        .get('/gateway/info')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'API Gateway Test');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('environment', 'test');
      expect(response.body).toHaveProperty('services');
      expect(Array.isArray(response.body.services)).toBe(true);
    });

    it('should return available routes', async () => {
      const response = await request(app)
        .get('/gateway/routes')
        .expect(200);

      expect(response.body).toHaveProperty('routes');
      expect(Array.isArray(response.body.routes)).toBe(true);
      expect(response.body.routes.length).toBeGreaterThan(0);
    });

    it('should return gateway health status', async () => {
      const response = await request(app)
        .get('/gateway/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service', 'API Gateway Test');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('Authentication', () => {
    it('should require authentication for API routes', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
      expect(response.body).toHaveProperty('message', 'Bearer token is required');
    });

    it('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to API routes', async () => {
      // Make multiple requests to trigger rate limiting
      const requests = Array.from({ length: 1001 }, () =>
        request(app)
          .get('/api/v1/products')
          .set('Authorization', 'Bearer valid-token')
      );

      // The 1001st request should be rate limited
      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses.find(res => res.status === 429);
      
      expect(rateLimitedResponse).toBeDefined();
    });
  });
}); 