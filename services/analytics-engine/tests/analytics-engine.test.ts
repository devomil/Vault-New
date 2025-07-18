import request from 'supertest';
import { AnalyticsEngineService } from '../src/analytics-engine-service';

describe('Analytics Engine Service', () => {
  let service: AnalyticsEngineService;
  let app: any;

  beforeAll(async () => {
    service = new AnalyticsEngineService({
      name: 'Analytics Engine Service',
      port: 3005,
      version: '1.0.0',
      environment: 'test'
    });
    
    await service.start();
    app = (service as any).app;
  });

  afterAll(async () => {
    await service.shutdown();
  });

  beforeEach(() => {
    // Mock tenant context for all requests
    app.use((req: any, _res: any, next: any) => {
      req.tenantContext = { tenantId: 'test-tenant-1' };
      next();
    });
  });

  describe('Dashboard Analytics', () => {
    it('should get dashboard data', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .query({ period: '30d' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
      expect(response.body.data).toHaveProperty('period', '30d');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('trends');
    });

    it('should get revenue analytics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/revenue')
        .query({ period: '30d', breakdown: 'channel' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });

    it('should get product analytics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/products')
        .query({ period: '30d' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });

    it('should get marketplace analytics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/marketplaces')
        .query({ period: '30d' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });

    it('should get vendor analytics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/vendors')
        .query({ period: '30d' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });
  });

  describe('Advanced Analytics', () => {
    it('should get trend analysis', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/trends')
        .query({ metric: 'revenue', period: '90d', granularity: 'day' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });

    it('should get demand forecasts', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/forecasts')
        .query({ productId: 'test-product-1', horizon: '30d' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });

    it('should get anomaly detection', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/anomalies')
        .query({ metric: 'revenue', threshold: '2.0' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });

    it('should generate business insights', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/insights')
        .send({
          insightType: 'revenue_optimization',
          parameters: { period: '30d' }
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });

    it('should get performance benchmarks', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/benchmarks')
        .query({ metric: 'revenue', industry: 'ecommerce' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });
  });

  describe('Reporting', () => {
    it('should generate custom report', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/reports')
        .send({
          reportType: 'sales_analysis',
          reportName: 'Monthly Sales Report',
          parameters: { startDate: '2024-01-01', endDate: '2024-01-31' },
          format: 'pdf'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
      expect(response.body.data).toHaveProperty('reportId');
      expect(response.body.data).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('message', 'Report generation queued successfully');
    });

    it('should get report status', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/reports/test-report-id')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });

    it('should get scheduled reports', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/reports/scheduled')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });

    it('should schedule report', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/reports/schedule')
        .send({
          reportType: 'sales_analysis',
          reportName: 'Weekly Sales Report',
          parameters: { period: '7d' },
          schedule: '0 9 * * 1', // Every Monday at 9 AM
          format: 'pdf'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
      expect(response.body.data).toHaveProperty('scheduleId');
      expect(response.body.data).toHaveProperty('status', 'scheduled');
      expect(response.body).toHaveProperty('message', 'Report scheduled successfully');
    });
  });

  describe('Data Pipeline', () => {
    it('should trigger data pipeline', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/pipeline/trigger')
        .send({ dataType: 'all' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
      expect(response.body.data).toHaveProperty('status', 'triggered');
      expect(response.body).toHaveProperty('message', 'Data pipeline triggered successfully');
    });

    it('should get pipeline status', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/pipeline/status')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });
  });

  describe('Event Tracking', () => {
    it('should track event', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .send({
          eventType: 'order_created',
          eventData: { orderId: 'test-order-1', amount: 100.00 },
          userId: 'test-user-1'
        })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
      expect(response.body.data).toHaveProperty('eventId');
      expect(response.body.data).toHaveProperty('status', 'tracked');
      expect(response.body).toHaveProperty('message', 'Event tracked successfully');
    });

    it('should get metrics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/metrics')
        .query({ metricName: 'revenue', period: '24h' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('tenantId', 'test-tenant-1');
    });
  });

  describe('Error Handling', () => {
    it('should return 401 when tenant context is missing', async () => {
      // Remove tenant context for this test
      app.use((req: any, _res: any, next: any) => {
        req.tenantContext = undefined;
        next();
      });

      const response = await request(app)
        .get('/api/v1/analytics/dashboard')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Tenant context required');
    });

    it('should handle invalid report ID', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/reports/nonexistent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Report not found');
    });
  });

  describe('Service Health', () => {
    it('should return service description', () => {
      const description = (service as any).getServiceDescription();
      expect(description).toBe('Advanced analytics and reporting service with real-time data processing');
    });

    it('should return service endpoints', () => {
      const endpoints = (service as any).getServiceEndpoints();
      expect(endpoints).toContain('GET /api/v1/analytics/dashboard');
      expect(endpoints).toContain('GET /api/v1/analytics/revenue');
      expect(endpoints).toContain('GET /api/v1/analytics/products');
      expect(endpoints).toContain('GET /api/v1/analytics/marketplaces');
      expect(endpoints).toContain('GET /api/v1/analytics/vendors');
      expect(endpoints).toContain('GET /api/v1/analytics/trends');
      expect(endpoints).toContain('GET /api/v1/analytics/forecasts');
      expect(endpoints).toContain('GET /api/v1/analytics/anomalies');
      expect(endpoints).toContain('POST /api/v1/analytics/insights');
      expect(endpoints).toContain('GET /api/v1/analytics/benchmarks');
      expect(endpoints).toContain('POST /api/v1/analytics/reports');
      expect(endpoints).toContain('GET /api/v1/analytics/reports/:id');
      expect(endpoints).toContain('GET /api/v1/analytics/reports/:id/download');
      expect(endpoints).toContain('GET /api/v1/analytics/reports/scheduled');
      expect(endpoints).toContain('POST /api/v1/analytics/reports/schedule');
      expect(endpoints).toContain('POST /api/v1/analytics/pipeline/trigger');
      expect(endpoints).toContain('GET /api/v1/analytics/pipeline/status');
      expect(endpoints).toContain('POST /api/v1/analytics/events');
      expect(endpoints).toContain('GET /api/v1/analytics/metrics');
    });
  });
}); 