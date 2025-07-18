import request from 'supertest';
import { PricingEngineService } from '../src/pricing-engine-service';
import { setupTestData, cleanupTestData } from './setup';

// Mock environment variables
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3007';

// Create service with config
const serviceConfig = {
  name: 'pricing-engine-test',
  port: 3007,
  version: '1.0.0',
  environment: 'test'
};

const pricingService = new PricingEngineService(serviceConfig);
const app = pricingService['app']; // Access the Express app from the service

describe('Pricing Engine Service', () => {
  const testTenantId = 'test-tenant-123';

  beforeAll(async () => {
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Health and Info Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'pricing-engine-test'
      });
    });

    it('should return service info', async () => {
      const response = await request(app)
        .get('/info')
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'pricing-engine-test',
        version: '1.0.0',
        description: 'Handle pricing calculations and rules'
      });
    });
  });

  describe('Pricing Rules', () => {
    it('should create a new pricing rule', async () => {
      const ruleData = {
        name: 'Holiday Discount',
        type: 'percentage',
        conditions: {
          category: 'electronics',
          minQuantity: 2
        },
        actions: {
          discountPercentage: 15
        },
        priority: 1
      };

      const response = await request(app)
        .post('/api/v1/pricing-rules')
        .set('x-tenant-id', testTenantId)
        .send(ruleData)
        .expect(201);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          id: expect.any(String),
          name: 'Holiday Discount',
          type: 'percentage',
          status: 'active'
        }),
        tenantId: testTenantId
      });
    });

    it('should get all pricing rules', async () => {
      const response = await request(app)
        .get('/api/v1/pricing-rules')
        .set('x-tenant-id', testTenantId)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        tenantId: testTenantId
      });
    });

    it('should get a specific pricing rule', async () => {
      // First create a rule
      const ruleData = {
        name: 'Bulk Discount',
        type: 'fixed',
        conditions: { minQuantity: 10 },
        actions: { fixedAmount: 5.00 },
        priority: 2
      };

      const createResponse = await request(app)
        .post('/api/v1/pricing-rules')
        .set('x-tenant-id', testTenantId)
        .send(ruleData);

      const ruleId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v1/pricing-rules/${ruleId}`)
        .set('x-tenant-id', testTenantId)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          id: ruleId,
          name: 'Bulk Discount',
          type: 'fixed'
        }),
        tenantId: testTenantId
      });
    });

    it('should update a pricing rule', async () => {
      // First create a rule
      const ruleData = {
        name: 'Seasonal Sale',
        type: 'percentage',
        conditions: { category: 'clothing' },
        actions: { discountPercentage: 10 },
        priority: 3
      };

      const createResponse = await request(app)
        .post('/api/v1/pricing-rules')
        .set('x-tenant-id', testTenantId)
        .send(ruleData);

      const ruleId = createResponse.body.data.id;

      const updateData = {
        name: 'Extended Seasonal Sale',
        actions: { discountPercentage: 20 },
        status: 'inactive'
      };

      const response = await request(app)
        .put(`/api/v1/pricing-rules/${ruleId}`)
        .set('x-tenant-id', testTenantId)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.any(Object),
        tenantId: testTenantId
      });
    });

    it('should delete a pricing rule', async () => {
      // First create a rule
      const ruleData = {
        name: 'Temporary Rule',
        type: 'percentage',
        conditions: {},
        actions: { discountPercentage: 5 },
        priority: 4
      };

      const createResponse = await request(app)
        .post('/api/v1/pricing-rules')
        .set('x-tenant-id', testTenantId)
        .send(ruleData);

      const ruleId = createResponse.body.data.id;

      await request(app)
        .delete(`/api/v1/pricing-rules/${ruleId}`)
        .set('x-tenant-id', testTenantId)
        .expect(204);
    });
  });

  describe('Price Calculations', () => {
    it('should calculate price for a product', async () => {
      const calculationData = {
        productId: 'prod-123',
        basePrice: 100.00,
        quantity: 2,
        customerType: 'premium',
        marketplace: 'amazon'
      };

      const response = await request(app)
        .post('/api/v1/calculate-price')
        .set('x-tenant-id', testTenantId)
        .send(calculationData)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          productId: 'prod-123',
          basePrice: 100.00,
          finalPrice: expect.any(Number),
          appliedRules: expect.any(Array)
        }),
        tenantId: testTenantId
      });
    });

    it('should calculate bulk pricing', async () => {
      const bulkData = {
        items: [
          { productId: 'prod-1', basePrice: 50.00, quantity: 5 },
          { productId: 'prod-2', basePrice: 30.00, quantity: 3 }
        ],
        customerType: 'wholesale'
      };

      const response = await request(app)
        .post('/api/v1/calculate-bulk-price')
        .set('x-tenant-id', testTenantId)
        .send(bulkData)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          totalBasePrice: expect.any(Number),
          totalFinalPrice: expect.any(Number),
          totalDiscount: expect.any(Number),
          items: expect.arrayContaining([
            expect.objectContaining({
              productId: expect.any(String),
              finalPrice: expect.any(Number)
            })
          ])
        }),
        tenantId: testTenantId
      });
    });
  });

  describe('Price Optimization', () => {
    it('should optimize pricing', async () => {
      const optimizationData = {
        productId: 'prod-1',
        currentPrice: 100.00,
        targetMargin: 25,
        competitorPrices: [95, 105, 98]
      };

      const response = await request(app)
        .post('/api/v1/price-optimization')
        .set('x-tenant-id', testTenantId)
        .send(optimizationData)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          productId: 'prod-1',
          currentPrice: 100.00,
          optimizedPrice: expect.any(Number),
          recommendation: expect.any(String)
        }),
        tenantId: testTenantId
      });
    });

    it('should get optimization recommendations', async () => {
      const response = await request(app)
        .get('/api/v1/optimization-recommendations')
        .set('x-tenant-id', testTenantId)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          recommendations: expect.arrayContaining([
            expect.objectContaining({
              productId: expect.any(String),
              currentPrice: expect.any(Number),
              recommendedPrice: expect.any(Number),
              confidence: expect.any(Number),
              reasoning: expect.any(String)
            })
          ])
        }),
        tenantId: testTenantId
      });
    });
  });

  describe('Price History', () => {
    it('should get price history', async () => {
      const response = await request(app)
        .get('/api/v1/price-history')
        .set('x-tenant-id', testTenantId)
        .query({ productId: 'prod-123', days: 30 })
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        tenantId: testTenantId
      });
    });
  });

  describe('Competitive Analysis', () => {
    it('should analyze competitive pricing', async () => {
      const analysisData = {
        productId: 'prod-123',
        competitors: [
          { name: 'Competitor A', price: 95.00 },
          { name: 'Competitor B', price: 105.00 }
        ]
      };

      const response = await request(app)
        .post('/api/v1/competitive-analysis')
        .set('x-tenant-id', testTenantId)
        .send(analysisData)
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          productId: 'prod-123',
          marketPosition: expect.any(String),
          priceRecommendation: expect.any(Number),
          competitiveAdvantage: expect.any(Number),
          analysis: expect.objectContaining({
            averageCompetitorPrice: expect.any(Number),
            priceRange: expect.objectContaining({
              min: expect.any(Number),
              max: expect.any(Number)
            })
          })
        }),
        tenantId: testTenantId
      });
    });

    it('should get market insights', async () => {
      const response = await request(app)
        .get('/api/v1/market-insights')
        .set('x-tenant-id', testTenantId)
        .query({ category: 'electronics' })
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.objectContaining({
          category: 'electronics',
          insights: expect.arrayContaining([
            expect.objectContaining({
              insight: expect.any(String),
              confidence: expect.any(Number),
              impact: expect.any(String)
            })
          ]),
          trends: expect.objectContaining({
            priceTrend: expect.any(String),
            demandTrend: expect.any(String)
          })
        }),
        tenantId: testTenantId
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 401 without tenant context', async () => {
      await request(app)
        .get('/api/v1/pricing-rules')
        .expect(401);
    });

    it('should return 400 for invalid pricing rule data', async () => {
      const invalidData = {
        name: '', // Invalid empty name
        type: 'invalid-type'
      };

      await request(app)
        .post('/api/v1/pricing-rules')
        .set('x-tenant-id', testTenantId)
        .send(invalidData)
        .expect(400); // Service returns 400 for validation errors
    });

    it('should return 404 for non-existent pricing rule', async () => {
      await request(app)
        .get('/api/v1/pricing-rules/non-existent-id')
        .set('x-tenant-id', testTenantId)
        .expect(404);
    });
  });
}); 