import { api } from './api';

export interface PerformanceMetrics {
  id: string;
  timestamp: string;
  serviceName: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface PerformanceAlert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  serviceName: string;
  resolved: boolean;
}

export interface OptimizationRecommendation {
  id: string;
  category: 'database' | 'api' | 'caching' | 'frontend';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'implemented' | 'ignored';
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  cacheSize: number;
  evictions: number;
}

class PerformanceService {
  // Get current performance metrics
  async getMetrics(serviceName?: string): Promise<PerformanceMetrics[]> {
    try {
      const response = await api.get('/performance/metrics', {
        params: { serviceName }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      return [];
    }
  }

  // Get performance alerts
  async getAlerts(resolved?: boolean): Promise<PerformanceAlert[]> {
    try {
      const response = await api.get('/performance/alerts', {
        params: { resolved }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch performance alerts:', error);
      return [];
    }
  }

  // Get optimization recommendations
  async getRecommendations(): Promise<OptimizationRecommendation[]> {
    try {
      const response = await api.get('/performance/recommendations');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch optimization recommendations:', error);
      return [];
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<CacheStats> {
    try {
      const response = await api.get('/performance/cache-stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
      return {
        hitRate: 0,
        missRate: 0,
        totalRequests: 0,
        cacheSize: 0,
        evictions: 0
      };
    }
  }

  // Resolve an alert
  async resolveAlert(alertId: string): Promise<void> {
    try {
      await api.patch(`/performance/alerts/${alertId}/resolve`);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  }

  // Update recommendation status
  async updateRecommendationStatus(
    recommendationId: string, 
    status: 'implemented' | 'ignored'
  ): Promise<void> {
    try {
      await api.patch(`/performance/recommendations/${recommendationId}`, {
        status
      });
    } catch (error) {
      console.error('Failed to update recommendation status:', error);
    }
  }

  // Get real-time performance data (WebSocket simulation)
  subscribeToMetrics(callback: (metrics: PerformanceMetrics) => void): () => void {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const mockMetrics: PerformanceMetrics = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        serviceName: ['api-gateway', 'order-processing', 'inventory-management'][Math.floor(Math.random() * 3)],
        responseTime: Math.random() * 1000,
        throughput: Math.random() * 1000,
        errorRate: Math.random() * 5,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        status: ['healthy', 'warning', 'critical'][Math.floor(Math.random() * 3)] as any
      };
      callback(mockMetrics);
    }, 5000);

    return () => clearInterval(interval);
  }
}

export const performanceService = new PerformanceService(); 