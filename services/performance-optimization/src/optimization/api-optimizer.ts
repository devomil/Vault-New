import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

export interface EndpointPerformance {
  endpoint: string;
  method: string;
  averageResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  cacheHitRate: number;
  lastOptimized: string;
  optimizationScore: number;
}

export interface OptimizationRecommendation {
  endpoint: string;
  type: 'caching' | 'compression' | 'pagination' | 'indexing' | 'query_optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedImprovement: number;
  implementation: string;
}

export interface ApiOptimization {
  endpoint: string;
  originalPerformance: EndpointPerformance;
  optimizedPerformance: EndpointPerformance;
  improvements: string[];
  estimatedGain: number;
  implementationSteps: string[];
}

export class ApiOptimizer {
  private endpointMetrics: Map<string, EndpointPerformance> = new Map();
  private optimizationHistory: ApiOptimization[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock endpoint performance data
    const mockEndpoints: EndpointPerformance[] = [
      {
        endpoint: '/api/v1/products',
        method: 'GET',
        averageResponseTime: 850,
        requestsPerSecond: 45,
        errorRate: 2.1,
        cacheHitRate: 65,
        lastOptimized: '2024-01-15T10:30:00Z',
        optimizationScore: 72
      },
      {
        endpoint: '/api/v1/orders',
        method: 'POST',
        averageResponseTime: 1200,
        requestsPerSecond: 23,
        errorRate: 1.8,
        cacheHitRate: 0,
        lastOptimized: '2024-01-10T14:20:00Z',
        optimizationScore: 58
      },
      {
        endpoint: '/api/v1/users/profile',
        method: 'GET',
        averageResponseTime: 450,
        requestsPerSecond: 67,
        errorRate: 0.5,
        cacheHitRate: 85,
        lastOptimized: '2024-01-20T09:15:00Z',
        optimizationScore: 89
      },
      {
        endpoint: '/api/v1/analytics/reports',
        method: 'GET',
        averageResponseTime: 3200,
        requestsPerSecond: 8,
        errorRate: 5.2,
        cacheHitRate: 30,
        lastOptimized: '2024-01-05T16:45:00Z',
        optimizationScore: 34
      }
    ];

    mockEndpoints.forEach(endpoint => {
      this.endpointMetrics.set(`${endpoint.method}:${endpoint.endpoint}`, endpoint);
    });
  }

  async getEndpointPerformance(): Promise<EndpointPerformance[]> {
    try {
      const start = Date.now();
      
      const endpoints = Array.from(this.endpointMetrics.values());
      
      const duration = Date.now() - start;
      metrics.apiResponseTime.observe({ endpoint: 'get_endpoint_performance', method: 'GET' }, duration / 1000);
      
      return endpoints;
    } catch (error) {
      logger.error('Error getting endpoint performance:', error);
      throw error;
    }
  }

  async optimizeEndpoint(endpoint: string, optimizations: string[]): Promise<ApiOptimization> {
    try {
      const start = Date.now();
      
      const key = this.findEndpointKey(endpoint);
      if (!key) {
        throw new Error(`Endpoint ${endpoint} not found`);
      }

      const originalPerformance = this.endpointMetrics.get(key)!;
      const optimizedPerformance = this.applyOptimizations(originalPerformance, optimizations);
      const improvements = this.analyzeImprovements(originalPerformance, optimizedPerformance);
      const estimatedGain = this.calculatePerformanceGain(originalPerformance, optimizedPerformance);
      const implementationSteps = this.generateImplementationSteps(optimizations);

      const optimization: ApiOptimization = {
        endpoint,
        originalPerformance,
        optimizedPerformance,
        improvements,
        estimatedGain,
        implementationSteps
      };

      // Update the endpoint metrics with optimized performance
      this.endpointMetrics.set(key, optimizedPerformance);
      this.optimizationHistory.push(optimization);

      const duration = Date.now() - start;
      metrics.apiResponseTime.observe({ endpoint: 'optimize_endpoint', method: 'POST' }, duration / 1000);

      return optimization;
    } catch (error) {
      logger.error('Error optimizing endpoint:', error);
      throw error;
    }
  }

  async getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    try {
      const start = Date.now();
      
      const recommendations: OptimizationRecommendation[] = [];
      const endpoints = Array.from(this.endpointMetrics.values());

      endpoints.forEach(endpoint => {
        // Check for caching opportunities
        if (endpoint.cacheHitRate < 70 && endpoint.method === 'GET') {
          recommendations.push({
            endpoint: endpoint.endpoint,
            type: 'caching',
            priority: endpoint.cacheHitRate < 50 ? 'high' : 'medium',
            description: `Low cache hit rate (${endpoint.cacheHitRate}%) - implement caching strategy`,
            estimatedImprovement: 40,
            implementation: 'Add Redis caching with appropriate TTL'
          });
        }

        // Check for response time issues
        if (endpoint.averageResponseTime > 1000) {
          recommendations.push({
            endpoint: endpoint.endpoint,
            type: 'query_optimization',
            priority: endpoint.averageResponseTime > 2000 ? 'critical' : 'high',
            description: `Slow response time (${endpoint.averageResponseTime}ms) - optimize database queries`,
            estimatedImprovement: 60,
            implementation: 'Review and optimize database queries, add indexes'
          });
        }

        // Check for high error rates
        if (endpoint.errorRate > 2) {
          recommendations.push({
            endpoint: endpoint.endpoint,
            type: 'query_optimization',
            priority: endpoint.errorRate > 5 ? 'critical' : 'high',
            description: `High error rate (${endpoint.errorRate}%) - investigate and fix issues`,
            estimatedImprovement: 80,
            implementation: 'Add error handling, validate inputs, fix underlying issues'
          });
        }

        // Check for compression opportunities
        if (endpoint.averageResponseTime > 500 && endpoint.method === 'GET') {
          recommendations.push({
            endpoint: endpoint.endpoint,
            type: 'compression',
            priority: 'medium',
            description: 'Enable response compression to reduce bandwidth',
            estimatedImprovement: 25,
            implementation: 'Add gzip/brotli compression middleware'
          });
        }

        // Check for pagination opportunities
        if (endpoint.requestsPerSecond > 50 && endpoint.method === 'GET') {
          recommendations.push({
            endpoint: endpoint.endpoint,
            type: 'pagination',
            priority: 'medium',
            description: 'High request rate - implement pagination',
            estimatedImprovement: 30,
            implementation: 'Add pagination parameters and limit result sets'
          });
        }
      });

      // Sort by priority and estimated improvement
      recommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        return priorityDiff !== 0 ? priorityDiff : b.estimatedImprovement - a.estimatedImprovement;
      });

      const duration = Date.now() - start;
      metrics.apiResponseTime.observe({ endpoint: 'get_optimization_recommendations', method: 'GET' }, duration / 1000);

      return recommendations;
    } catch (error) {
      logger.error('Error getting optimization recommendations:', error);
      throw error;
    }
  }

  async getOptimizationHistory(): Promise<ApiOptimization[]> {
    return this.optimizationHistory;
  }

  async analyzeEndpointTrends(endpoint: string, days: number = 7): Promise<any> {
    try {
      const key = this.findEndpointKey(endpoint);
      if (!key) {
        throw new Error(`Endpoint ${endpoint} not found`);
      }

      const performance = this.endpointMetrics.get(key)!;
      
      // Mock trend analysis
      const trends = {
        responseTime: {
          trend: 'stable',
          average: performance.averageResponseTime,
          min: performance.averageResponseTime * 0.8,
          max: performance.averageResponseTime * 1.2
        },
        requests: {
          trend: 'increasing',
          average: performance.requestsPerSecond,
          growth: 5.2
        },
        errors: {
          trend: 'decreasing',
          average: performance.errorRate,
          improvement: 15.3
        }
      };

      return {
        endpoint,
        period: `${days} days`,
        trends,
        recommendations: this.generateTrendRecommendations(trends)
      };
    } catch (error) {
      logger.error('Error analyzing endpoint trends:', error);
      throw error;
    }
  }

  private findEndpointKey(endpoint: string): string | undefined {
    return Array.from(this.endpointMetrics.keys()).find(key => key.includes(endpoint));
  }

  private applyOptimizations(performance: EndpointPerformance, optimizations: string[]): EndpointPerformance {
    const optimized = { ...performance };

    optimizations.forEach(optimization => {
      switch (optimization.toLowerCase()) {
        case 'caching':
          optimized.cacheHitRate = Math.min(95, optimized.cacheHitRate + 25);
          optimized.averageResponseTime *= 0.6;
          break;
        case 'compression':
          optimized.averageResponseTime *= 0.8;
          break;
        case 'pagination':
          optimized.averageResponseTime *= 0.7;
          optimized.requestsPerSecond *= 1.2;
          break;
        case 'indexing':
          optimized.averageResponseTime *= 0.5;
          optimized.errorRate *= 0.8;
          break;
        case 'query_optimization':
          optimized.averageResponseTime *= 0.6;
          optimized.errorRate *= 0.7;
          break;
      }
    });

    optimized.lastOptimized = new Date().toISOString();
    optimized.optimizationScore = this.calculateOptimizationScore(optimized);

    return optimized;
  }

  private analyzeImprovements(original: EndpointPerformance, optimized: EndpointPerformance): string[] {
    const improvements = [];

    if (optimized.averageResponseTime < original.averageResponseTime) {
      const improvement = ((original.averageResponseTime - optimized.averageResponseTime) / original.averageResponseTime * 100).toFixed(1);
      improvements.push(`Response time improved by ${improvement}%`);
    }

    if (optimized.cacheHitRate > original.cacheHitRate) {
      improvements.push(`Cache hit rate increased from ${original.cacheHitRate}% to ${optimized.cacheHitRate}%`);
    }

    if (optimized.errorRate < original.errorRate) {
      const improvement = ((original.errorRate - optimized.errorRate) / original.errorRate * 100).toFixed(1);
      improvements.push(`Error rate reduced by ${improvement}%`);
    }

    if (optimized.requestsPerSecond > original.requestsPerSecond) {
      improvements.push(`Throughput increased from ${original.requestsPerSecond} to ${optimized.requestsPerSecond} req/s`);
    }

    return improvements;
  }

  private calculatePerformanceGain(original: EndpointPerformance, optimized: EndpointPerformance): number {
    const responseTimeGain = (original.averageResponseTime - optimized.averageResponseTime) / original.averageResponseTime * 100;
    const errorRateGain = (original.errorRate - optimized.errorRate) / original.errorRate * 100;
    const cacheGain = (optimized.cacheHitRate - original.cacheHitRate) / 100 * 20;

    return Math.round((responseTimeGain + errorRateGain + cacheGain) / 3);
  }

  private generateImplementationSteps(optimizations: string[]): string[] {
    const steps: string[] = [];

    optimizations.forEach(optimization => {
      switch (optimization.toLowerCase()) {
        case 'caching':
          steps.push('Implement Redis caching layer');
          steps.push('Configure appropriate TTL for different data types');
          steps.push('Add cache invalidation strategies');
          break;
        case 'compression':
          steps.push('Add gzip/brotli compression middleware');
          steps.push('Configure compression thresholds');
          break;
        case 'pagination':
          steps.push('Add pagination parameters to API');
          steps.push('Implement cursor-based pagination');
          steps.push('Add pagination metadata to responses');
          break;
        case 'indexing':
          steps.push('Analyze slow queries');
          steps.push('Add database indexes');
          steps.push('Optimize query structure');
          break;
        case 'query_optimization':
          steps.push('Review database queries');
          steps.push('Add query caching');
          steps.push('Optimize database connections');
          break;
      }
    });

    return steps;
  }

  private calculateOptimizationScore(performance: EndpointPerformance): number {
    let score = 100;

    // Deduct points for slow response time
    if (performance.averageResponseTime > 2000) score -= 30;
    else if (performance.averageResponseTime > 1000) score -= 15;
    else if (performance.averageResponseTime > 500) score -= 5;

    // Deduct points for high error rate
    if (performance.errorRate > 5) score -= 25;
    else if (performance.errorRate > 2) score -= 10;
    else if (performance.errorRate > 1) score -= 5;

    // Add points for good cache hit rate
    if (performance.cacheHitRate > 80) score += 10;
    else if (performance.cacheHitRate > 60) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private generateTrendRecommendations(trends: any): string[] {
    const recommendations = [];

    if (trends.responseTime.trend === 'increasing') {
      recommendations.push('Response time is trending upward - investigate performance bottlenecks');
    }

    if (trends.requests.trend === 'increasing' && trends.requests.growth > 10) {
      recommendations.push('High request growth - consider scaling infrastructure');
    }

    if (trends.errors.trend === 'increasing') {
      recommendations.push('Error rate is increasing - investigate and fix issues');
    }

    return recommendations;
  }
} 