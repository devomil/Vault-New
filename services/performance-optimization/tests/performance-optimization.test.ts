import request from 'supertest';
import express from 'express';
import { performanceOptimizationService } from '../src/performance-optimization-service';
import { CacheManager } from '../src/cache/cache-manager';
import { PerformanceMonitor } from '../src/monitoring/performance-monitor';
import { DatabaseOptimizer } from '../src/optimization/database-optimizer';
import { ApiOptimizer } from '../src/optimization/api-optimizer';

const app = express();
app.use(express.json());
app.use('/api/v1', performanceOptimizationService);

describe('Performance Optimization Service', () => {
  // Cleanup after all tests
  afterAll(async () => {
    // Wait for any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  describe('Cache Management Endpoints', () => {
    describe('GET /api/v1/cache/status', () => {
      it('should return cache status', async () => {
        const response = await request(app)
          .get('/api/v1/cache/status')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('redis');
        expect(response.body.data).toHaveProperty('memory');
        expect(response.body.data).toHaveProperty('overall');
        expect(response.body).toHaveProperty('timestamp');
      });
    });

    describe('POST /api/v1/cache/clear', () => {
      it('should clear cache with pattern', async () => {
        const response = await request(app)
          .post('/api/v1/cache/clear')
          .send({
            pattern: 'test:*',
            cacheType: 'both'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Cache cleared successfully');
        expect(response.body).toHaveProperty('pattern', 'test:*');
        expect(response.body).toHaveProperty('cacheType', 'both');
      });

      it('should clear all cache when no pattern provided', async () => {
        const response = await request(app)
          .post('/api/v1/cache/clear')
          .send({})
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Cache cleared successfully');
      });
    });

    describe('GET /api/v1/cache/stats', () => {
      it('should return cache statistics', async () => {
        const response = await request(app)
          .get('/api/v1/cache/stats')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('hits');
        expect(response.body.data).toHaveProperty('misses');
        expect(response.body.data).toHaveProperty('hitRate');
        expect(response.body.data).toHaveProperty('size');
        expect(response.body.data).toHaveProperty('keys');
      });
    });
  });

  describe('Performance Monitoring Endpoints', () => {
    describe('GET /api/v1/monitoring/performance', () => {
      it('should return performance metrics', async () => {
        const response = await request(app)
          .get('/api/v1/monitoring/performance')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('cpu');
        expect(response.body.data).toHaveProperty('memory');
        expect(response.body.data).toHaveProperty('disk');
        expect(response.body.data).toHaveProperty('network');
        expect(response.body.data).toHaveProperty('application');
      });
    });

    describe('GET /api/v1/monitoring/alerts', () => {
      it('should return performance alerts', async () => {
        const response = await request(app)
          .get('/api/v1/monitoring/alerts')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('POST /api/v1/monitoring/alerts/configure', () => {
      it('should configure alert thresholds', async () => {
        const thresholds = [
          {
            metric: 'cpu.usage',
            warning: 70,
            critical: 90,
            enabled: true
          }
        ];

        const response = await request(app)
          .post('/api/v1/monitoring/alerts/configure')
          .send({
            thresholds,
            rules: {}
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Alerts configured successfully');
      });
    });
  });

  describe('Database Optimization Endpoints', () => {
    describe('GET /api/v1/optimization/database/queries', () => {
      it('should return slow queries', async () => {
        const response = await request(app)
          .get('/api/v1/optimization/database/queries')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        if (response.body.data.length > 0) {
          expect(response.body.data[0]).toHaveProperty('id');
          expect(response.body.data[0]).toHaveProperty('query');
          expect(response.body.data[0]).toHaveProperty('executionTime');
          expect(response.body.data[0]).toHaveProperty('frequency');
          expect(response.body.data[0]).toHaveProperty('table');
        }
      });
    });

    describe('POST /api/v1/optimization/database/optimize', () => {
      it('should optimize a database query', async () => {
        const response = await request(app)
          .post('/api/v1/optimization/database/optimize')
          .send({
            query: 'SELECT * FROM products WHERE category_id = ?',
            optimization: 'index'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('originalQuery');
        expect(response.body.data).toHaveProperty('optimizedQuery');
        expect(response.body.data).toHaveProperty('improvements');
        expect(response.body.data).toHaveProperty('estimatedPerformanceGain');
        expect(response.body.data).toHaveProperty('risks');
      });
    });

    describe('GET /api/v1/optimization/database/indexes', () => {
      it('should return index recommendations', async () => {
        const response = await request(app)
          .get('/api/v1/optimization/database/indexes')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        if (response.body.data.length > 0) {
          expect(response.body.data[0]).toHaveProperty('table');
          expect(response.body.data[0]).toHaveProperty('columns');
          expect(response.body.data[0]).toHaveProperty('type');
          expect(response.body.data[0]).toHaveProperty('reason');
          expect(response.body.data[0]).toHaveProperty('estimatedImprovement');
          expect(response.body.data[0]).toHaveProperty('priority');
        }
      });
    });
  });

  describe('API Optimization Endpoints', () => {
    describe('GET /api/v1/optimization/api/endpoints', () => {
      it('should return endpoint performance data', async () => {
        const response = await request(app)
          .get('/api/v1/optimization/api/endpoints')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        if (response.body.data.length > 0) {
          expect(response.body.data[0]).toHaveProperty('endpoint');
          expect(response.body.data[0]).toHaveProperty('method');
          expect(response.body.data[0]).toHaveProperty('averageResponseTime');
          expect(response.body.data[0]).toHaveProperty('requestsPerSecond');
          expect(response.body.data[0]).toHaveProperty('errorRate');
          expect(response.body.data[0]).toHaveProperty('cacheHitRate');
        }
      });
    });

    describe('POST /api/v1/optimization/api/optimize', () => {
      it('should optimize an API endpoint', async () => {
        const response = await request(app)
          .post('/api/v1/optimization/api/optimize')
          .send({
            endpoint: '/api/v1/products',
            optimizations: ['caching', 'compression']
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('endpoint');
        expect(response.body.data).toHaveProperty('originalPerformance');
        expect(response.body.data).toHaveProperty('optimizedPerformance');
        expect(response.body.data).toHaveProperty('improvements');
        expect(response.body.data).toHaveProperty('estimatedGain');
        expect(response.body.data).toHaveProperty('implementationSteps');
      });
    });

    describe('GET /api/v1/optimization/api/recommendations', () => {
      it('should return optimization recommendations', async () => {
        const response = await request(app)
          .get('/api/v1/optimization/api/recommendations')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        
        if (response.body.data.length > 0) {
          expect(response.body.data[0]).toHaveProperty('endpoint');
          expect(response.body.data[0]).toHaveProperty('type');
          expect(response.body.data[0]).toHaveProperty('priority');
          expect(response.body.data[0]).toHaveProperty('description');
          expect(response.body.data[0]).toHaveProperty('estimatedImprovement');
          expect(response.body.data[0]).toHaveProperty('implementation');
        }
      });
    });
  });

  describe('System Diagnostics Endpoints', () => {
    describe('GET /api/v1/diagnostics/system', () => {
      it('should return system diagnostics', async () => {
        const response = await request(app)
          .get('/api/v1/diagnostics/system')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('metrics');
        expect(response.body.data).toHaveProperty('alerts');
        expect(response.body.data).toHaveProperty('thresholds');
        expect(response.body.data).toHaveProperty('history');
        expect(response.body.data).toHaveProperty('system');
      });
    });

    describe('POST /api/v1/diagnostics/analyze', () => {
      it('should analyze performance trends', async () => {
        const response = await request(app)
          .post('/api/v1/diagnostics/analyze')
          .send({
            type: 'trend',
            parameters: { days: 7 }
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
      });

      it('should analyze performance bottlenecks', async () => {
        const response = await request(app)
          .post('/api/v1/diagnostics/analyze')
          .send({
            type: 'bottleneck',
            parameters: {}
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
      });

      it('should analyze capacity', async () => {
        const response = await request(app)
          .post('/api/v1/diagnostics/analyze')
          .send({
            type: 'capacity',
            parameters: {}
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
      });

      it('should return error for unknown analysis type', async () => {
        const response = await request(app)
          .post('/api/v1/diagnostics/analyze')
          .send({
            type: 'unknown',
            parameters: {}
          })
          .expect(500);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/cache/clear')
        .send({})
        .expect(200); // Should still work with default values

      expect(response.body).toHaveProperty('success', true);
    });

    it('should handle invalid endpoint optimization', async () => {
      const response = await request(app)
        .post('/api/v1/optimization/api/optimize')
        .send({
          endpoint: '/api/v1/nonexistent',
          optimizations: ['caching']
        })
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager();
  });

  afterEach(async () => {
    await cacheManager.disconnect();
  });

  it('should initialize with memory cache', async () => {
    const status = await cacheManager.getStatus();
    expect(status.memory).toBeDefined();
    expect(status.memory.keys).toBeGreaterThanOrEqual(0);
  });

  it('should set and get cache values', async () => {
    const key = 'test:key';
    const value = { test: 'data' };
    
    await cacheManager.set(key, value, 300);
    const retrieved = await cacheManager.get(key);
    
    expect(retrieved).toEqual(value);
  });

  it('should return null for non-existent keys', async () => {
    const retrieved = await cacheManager.get('nonexistent:key');
    expect(retrieved).toBeNull();
  });

  it('should clear cache by pattern', async () => {
    await cacheManager.set('test:key1', 'value1', 300, 'memory');
    await cacheManager.set('test:key2', 'value2', 300, 'memory');
    await cacheManager.set('other:key', 'value3', 300, 'memory');
    
    await cacheManager.clearCache('test:*', 'memory');
    
    expect(await cacheManager.get('test:key1', 'memory')).toBeNull();
    expect(await cacheManager.get('test:key2', 'memory')).toBeNull();
    expect(await cacheManager.get('other:key', 'memory')).not.toBeNull();
  });
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  it('should get performance metrics', async () => {
    const metrics = await monitor.getPerformanceMetrics();
    
    expect(metrics).toHaveProperty('cpu');
    expect(metrics).toHaveProperty('memory');
    expect(metrics).toHaveProperty('disk');
    expect(metrics).toHaveProperty('network');
    expect(metrics).toHaveProperty('application');
  });

  it('should get alerts', async () => {
    const alerts = await monitor.getAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should configure alert thresholds', async () => {
    const thresholds = [
      {
        metric: 'cpu.usage',
        warning: 70,
        critical: 90,
        enabled: true
      }
    ];

    await expect(monitor.configureAlerts(thresholds, {})).resolves.not.toThrow();
  });

  it('should get system diagnostics', async () => {
    const diagnostics = await monitor.getSystemDiagnostics();
    
    expect(diagnostics).toHaveProperty('metrics');
    expect(diagnostics).toHaveProperty('alerts');
    expect(diagnostics).toHaveProperty('thresholds');
    expect(diagnostics).toHaveProperty('history');
    expect(diagnostics).toHaveProperty('system');
  });
});

describe('DatabaseOptimizer', () => {
  let optimizer: DatabaseOptimizer;

  beforeEach(() => {
    optimizer = new DatabaseOptimizer();
  });

  it('should get slow queries', async () => {
    const queries = await optimizer.getSlowQueries();
    expect(Array.isArray(queries)).toBe(true);
    
    if (queries.length > 0) {
      expect(queries[0]).toHaveProperty('id');
      expect(queries[0]).toHaveProperty('query');
      expect(queries[0]).toHaveProperty('executionTime');
    }
  });

  it('should optimize queries', async () => {
    const optimization = await optimizer.optimizeQuery(
      'SELECT * FROM products WHERE category_id = ?',
      'index'
    );
    
    expect(optimization).toHaveProperty('originalQuery');
    expect(optimization).toHaveProperty('optimizedQuery');
    expect(optimization).toHaveProperty('improvements');
    expect(optimization).toHaveProperty('estimatedPerformanceGain');
    expect(optimization).toHaveProperty('risks');
  });

  it('should get index recommendations', async () => {
    const recommendations = await optimizer.getIndexRecommendations();
    expect(Array.isArray(recommendations)).toBe(true);
    
    if (recommendations.length > 0) {
      expect(recommendations[0]).toHaveProperty('table');
      expect(recommendations[0]).toHaveProperty('columns');
      expect(recommendations[0]).toHaveProperty('type');
      expect(recommendations[0]).toHaveProperty('reason');
      expect(recommendations[0]).toHaveProperty('estimatedImprovement');
      expect(recommendations[0]).toHaveProperty('priority');
    }
  });
});

describe('ApiOptimizer', () => {
  let optimizer: ApiOptimizer;

  beforeEach(() => {
    optimizer = new ApiOptimizer();
  });

  it('should get endpoint performance', async () => {
    const endpoints = await optimizer.getEndpointPerformance();
    expect(Array.isArray(endpoints)).toBe(true);
    
    if (endpoints.length > 0) {
      expect(endpoints[0]).toHaveProperty('endpoint');
      expect(endpoints[0]).toHaveProperty('method');
      expect(endpoints[0]).toHaveProperty('averageResponseTime');
      expect(endpoints[0]).toHaveProperty('requestsPerSecond');
      expect(endpoints[0]).toHaveProperty('errorRate');
      expect(endpoints[0]).toHaveProperty('cacheHitRate');
    }
  });

  it('should optimize endpoints', async () => {
    const optimization = await optimizer.optimizeEndpoint(
      '/api/v1/products',
      ['caching', 'compression']
    );
    
    expect(optimization).toHaveProperty('endpoint');
    expect(optimization).toHaveProperty('originalPerformance');
    expect(optimization).toHaveProperty('optimizedPerformance');
    expect(optimization).toHaveProperty('improvements');
    expect(optimization).toHaveProperty('estimatedGain');
    expect(optimization).toHaveProperty('implementationSteps');
  });

  it('should get optimization recommendations', async () => {
    const recommendations = await optimizer.getOptimizationRecommendations();
    expect(Array.isArray(recommendations)).toBe(true);
    
    if (recommendations.length > 0) {
      expect(recommendations[0]).toHaveProperty('endpoint');
      expect(recommendations[0]).toHaveProperty('type');
      expect(recommendations[0]).toHaveProperty('priority');
      expect(recommendations[0]).toHaveProperty('description');
      expect(recommendations[0]).toHaveProperty('estimatedImprovement');
      expect(recommendations[0]).toHaveProperty('implementation');
    }
  });
}); 