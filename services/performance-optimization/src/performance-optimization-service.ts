import express from 'express';
import { CacheManager } from './cache/cache-manager';
import { PerformanceMonitor } from './monitoring/performance-monitor';
import { DatabaseOptimizer } from './optimization/database-optimizer';
import { ApiOptimizer } from './optimization/api-optimizer';
import { logger } from './utils/logger';
import { metrics } from './utils/metrics';

const router = express.Router();

// Initialize services
const cacheManager = new CacheManager();
const performanceMonitor = new PerformanceMonitor();
const databaseOptimizer = new DatabaseOptimizer();
const apiOptimizer = new ApiOptimizer();

// Cache Management Endpoints
router.get('/cache/status', async (_req, res) => {
  try {
    const start = Date.now();
    const status = await cacheManager.getStatus();
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/cache/status', method: 'GET' }, duration / 1000);
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting cache status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache status'
    });
  }
});

router.post('/cache/clear', async (req, res) => {
  try {
    const { pattern, cacheType } = req.body;
    const start = Date.now();
    
    await cacheManager.clearCache(pattern, cacheType);
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/cache/clear', method: 'POST' }, duration / 1000);
    
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      pattern,
      cacheType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

router.get('/cache/stats', async (_req, res) => {
  try {
    const start = Date.now();
    const stats = await cacheManager.getStats();
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/cache/stats', method: 'GET' }, duration / 1000);
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats'
    });
  }
});

// Performance Monitoring Endpoints
router.get('/monitoring/performance', async (_req, res) => {
  try {
    const start = Date.now();
    const performance = await performanceMonitor.getPerformanceMetrics();
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/monitoring/performance', method: 'GET' }, duration / 1000);
    
    res.json({
      success: true,
      data: performance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics'
    });
  }
});

router.get('/monitoring/alerts', async (_req, res) => {
  try {
    const start = Date.now();
    const alerts = await performanceMonitor.getAlerts();
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/monitoring/alerts', method: 'GET' }, duration / 1000);
    
    res.json({
      success: true,
      data: alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alerts'
    });
  }
});

router.post('/monitoring/alerts/configure', async (req, res) => {
  try {
    const { thresholds, rules } = req.body;
    const start = Date.now();
    
    await performanceMonitor.configureAlerts(thresholds, rules);
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/monitoring/alerts/configure', method: 'POST' }, duration / 1000);
    
    res.json({
      success: true,
      message: 'Alerts configured successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error configuring alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to configure alerts'
    });
  }
});

// Database Optimization Endpoints
router.get('/optimization/database/queries', async (_req, res) => {
  try {
    const start = Date.now();
    const queries = await databaseOptimizer.getSlowQueries();
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/optimization/database/queries', method: 'GET' }, duration / 1000);
    
    res.json({
      success: true,
      data: queries,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting slow queries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get slow queries'
    });
  }
});

router.post('/optimization/database/optimize', async (req, res) => {
  try {
    const { query, optimization } = req.body;
    const start = Date.now();
    
    const result = await databaseOptimizer.optimizeQuery(query, optimization);
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/optimization/database/optimize', method: 'POST' }, duration / 1000);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error optimizing query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize query'
    });
  }
});

router.get('/optimization/database/indexes', async (_req, res) => {
  try {
    const start = Date.now();
    const indexes = await databaseOptimizer.getIndexRecommendations();
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/optimization/database/indexes', method: 'GET' }, duration / 1000);
    
    res.json({
      success: true,
      data: indexes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting index recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get index recommendations'
    });
  }
});

// API Optimization Endpoints
router.get('/optimization/api/endpoints', async (_req, res) => {
  try {
    const start = Date.now();
    const endpoints = await apiOptimizer.getEndpointPerformance();
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/optimization/api/endpoints', method: 'GET' }, duration / 1000);
    
    res.json({
      success: true,
      data: endpoints,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting endpoint performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get endpoint performance'
    });
  }
});

router.post('/optimization/api/optimize', async (req, res) => {
  try {
    const { endpoint, optimizations } = req.body;
    const start = Date.now();
    
    const result = await apiOptimizer.optimizeEndpoint(endpoint, optimizations);
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/optimization/api/optimize', method: 'POST' }, duration / 1000);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error optimizing endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize endpoint'
    });
  }
});

router.get('/optimization/api/recommendations', async (_req, res) => {
  try {
    const start = Date.now();
    const recommendations = await apiOptimizer.getOptimizationRecommendations();
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/optimization/api/recommendations', method: 'GET' }, duration / 1000);
    
    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting optimization recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get optimization recommendations'
    });
  }
});

// System Health and Diagnostics
router.get('/diagnostics/system', async (_req, res) => {
  try {
    const start = Date.now();
    const diagnostics = await performanceMonitor.getSystemDiagnostics();
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/diagnostics/system', method: 'GET' }, duration / 1000);
    
    res.json({
      success: true,
      data: diagnostics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting system diagnostics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system diagnostics'
    });
  }
});

router.post('/diagnostics/analyze', async (req, res) => {
  try {
    const { type, parameters } = req.body;
    const start = Date.now();
    
    const analysis = await performanceMonitor.analyzePerformance(type, parameters);
    const duration = Date.now() - start;
    
    metrics.apiResponseTime.observe({ endpoint: '/diagnostics/analyze', method: 'POST' }, duration / 1000);
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error analyzing performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze performance'
    });
  }
});

export { router as performanceOptimizationService }; 