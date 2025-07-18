import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

export interface SlowQuery {
  id: string;
  query: string;
  executionTime: number;
  frequency: number;
  table: string;
  timestamp: string;
  optimization: string;
}

export interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'single' | 'composite' | 'unique';
  reason: string;
  estimatedImprovement: number;
  priority: 'low' | 'medium' | 'high';
}

export interface QueryOptimization {
  originalQuery: string;
  optimizedQuery: string;
  improvements: string[];
  estimatedPerformanceGain: number;
  risks: string[];
}

export class DatabaseOptimizer {
  private slowQueries: SlowQuery[] = [];
  private queryHistory: Map<string, number[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock slow queries for demonstration
    this.slowQueries = [
      {
        id: 'query_001',
        query: 'SELECT * FROM products WHERE category_id = ? AND price > ? ORDER BY created_at DESC',
        executionTime: 2500,
        frequency: 150,
        table: 'products',
        timestamp: new Date().toISOString(),
        optimization: 'Add index on (category_id, price, created_at)'
      },
      {
        id: 'query_002',
        query: 'SELECT COUNT(*) FROM orders WHERE status = ? AND created_at >= ?',
        executionTime: 1800,
        frequency: 89,
        table: 'orders',
        timestamp: new Date().toISOString(),
        optimization: 'Add index on (status, created_at)'
      },
      {
        id: 'query_003',
        query: 'SELECT p.*, c.name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.active = true',
        executionTime: 3200,
        frequency: 67,
        table: 'products',
        timestamp: new Date().toISOString(),
        optimization: 'Add index on (active, category_id) and ensure foreign key index exists'
      }
    ];

    // Mock query history
    this.queryHistory.set('query_001', [2500, 2400, 2600, 2300, 2700]);
    this.queryHistory.set('query_002', [1800, 1750, 1850, 1700, 1900]);
    this.queryHistory.set('query_003', [3200, 3100, 3300, 3000, 3400]);
  }

  async getSlowQueries(): Promise<SlowQuery[]> {
    try {
      const start = Date.now();
      
      // In a real implementation, this would query the database for slow query logs
      const queries = this.slowQueries.filter(query => query.executionTime > 1000);
      
      const duration = Date.now() - start;
      metrics.databaseQueryDuration.observe({ operation: 'get_slow_queries', table: 'system' }, duration / 1000);
      
      return queries;
    } catch (error) {
      logger.error('Error getting slow queries:', error);
      throw error;
    }
  }

  async optimizeQuery(query: string, optimization: string): Promise<QueryOptimization> {
    try {
      const start = Date.now();
      
      // Mock query optimization logic
      const optimizedQuery = this.generateOptimizedQuery(query, optimization);
      const improvements = this.analyzeImprovements(query, optimizedQuery);
      const estimatedGain = this.estimatePerformanceGain(query, optimizedQuery);
      const risks = this.assessRisks(optimizedQuery);
      
      const duration = Date.now() - start;
      metrics.databaseQueryDuration.observe({ operation: 'optimize_query', table: 'system' }, duration / 1000);
      
      return {
        originalQuery: query,
        optimizedQuery,
        improvements,
        estimatedPerformanceGain: estimatedGain,
        risks
      };
    } catch (error) {
      logger.error('Error optimizing query:', error);
      throw error;
    }
  }

  async getIndexRecommendations(): Promise<IndexRecommendation[]> {
    try {
      const start = Date.now();
      
      // Mock index recommendations based on slow queries
      const recommendations: IndexRecommendation[] = [
        {
          table: 'products',
          columns: ['category_id', 'price', 'created_at'],
          type: 'composite',
          reason: 'Frequently used in ORDER BY and WHERE clauses',
          estimatedImprovement: 85,
          priority: 'high'
        },
        {
          table: 'orders',
          columns: ['status', 'created_at'],
          type: 'composite',
          reason: 'Used in filtering and date range queries',
          estimatedImprovement: 70,
          priority: 'high'
        },
        {
          table: 'products',
          columns: ['active', 'category_id'],
          type: 'composite',
          reason: 'Used in JOIN operations with active filter',
          estimatedImprovement: 60,
          priority: 'medium'
        },
        {
          table: 'categories',
          columns: ['id'],
          type: 'unique',
          reason: 'Primary key for JOIN operations',
          estimatedImprovement: 40,
          priority: 'low'
        }
      ];
      
      const duration = Date.now() - start;
      metrics.databaseQueryDuration.observe({ operation: 'get_index_recommendations', table: 'system' }, duration / 1000);
      
      return recommendations;
    } catch (error) {
      logger.error('Error getting index recommendations:', error);
      throw error;
    }
  }

  async analyzeQueryPerformance(queryId: string): Promise<any> {
    try {
      const query = this.slowQueries.find(q => q.id === queryId);
      if (!query) {
        throw new Error(`Query with ID ${queryId} not found`);
      }

      const history = this.queryHistory.get(queryId) || [];
      const averageTime = history.reduce((sum, time) => sum + time, 0) / history.length;
      const minTime = Math.min(...history);
      const maxTime = Math.max(...history);
      const variance = this.calculateVariance(history, averageTime);

      return {
        queryId,
        currentExecutionTime: query.executionTime,
        averageExecutionTime: averageTime,
        minExecutionTime: minTime,
        maxExecutionTime: maxTime,
        variance,
        frequency: query.frequency,
        impact: this.calculateImpact(query.executionTime, query.frequency),
        recommendations: this.generateQueryRecommendations(query, history)
      };
    } catch (error) {
      logger.error('Error analyzing query performance:', error);
      throw error;
    }
  }

  async getDatabaseStats(): Promise<any> {
    try {
      const start = Date.now();
      
      // Mock database statistics
      const stats = {
        totalTables: 15,
        totalIndexes: 45,
        totalQueries: 1250,
        slowQueries: this.slowQueries.length,
        averageQueryTime: 450,
        cacheHitRate: 78.5,
        connectionPool: {
          active: 12,
          idle: 8,
          max: 20
        },
        storage: {
          used: '2.5GB',
          total: '10GB',
          percentage: 25
        }
      };
      
      const duration = Date.now() - start;
      metrics.databaseQueryDuration.observe({ operation: 'get_database_stats', table: 'system' }, duration / 1000);
      
      return stats;
    } catch (error) {
      logger.error('Error getting database stats:', error);
      throw error;
    }
  }

  private generateOptimizedQuery(originalQuery: string, optimization: string): string {
    // Mock query optimization logic
    if (optimization.includes('index')) {
      // Simulate adding index hints
      return originalQuery.replace('SELECT', 'SELECT /*+ INDEX(table_name index_name) */');
    } else if (optimization.includes('limit')) {
      // Simulate adding LIMIT clause
      return originalQuery + ' LIMIT 1000';
    } else if (optimization.includes('join')) {
      // Simulate optimizing JOIN
      return originalQuery.replace('JOIN', 'INNER JOIN');
    }
    
    return originalQuery;
  }

  private analyzeImprovements(_originalQuery: string, optimizedQuery: string): string[] {
    const improvements = [];
    
    if (optimizedQuery.includes('/*+ INDEX')) {
      improvements.push('Added index hint for better query plan');
    }
    
    if (optimizedQuery.includes('LIMIT')) {
      improvements.push('Added LIMIT clause to reduce result set size');
    }
    
    if (optimizedQuery.includes('INNER JOIN')) {
      improvements.push('Specified INNER JOIN for better performance');
    }
    
    if (improvements.length === 0) {
      improvements.push('Query structure optimized');
    }
    
    return improvements;
  }

  private estimatePerformanceGain(_originalQuery: string, optimizedQuery: string): number {
    // Mock performance gain estimation
    let gain = 0;
    
    if (optimizedQuery.includes('/*+ INDEX')) {
      gain += 40;
    }
    
    if (optimizedQuery.includes('LIMIT')) {
      gain += 25;
    }
    
    if (optimizedQuery.includes('INNER JOIN')) {
      gain += 15;
    }
    
    return Math.min(gain, 80); // Cap at 80% improvement
  }

  private assessRisks(optimizedQuery: string): string[] {
    const risks = [];
    
    if (optimizedQuery.includes('/*+ INDEX')) {
      risks.push('Index hint may become invalid if index structure changes');
    }
    
    if (optimizedQuery.includes('LIMIT')) {
      risks.push('LIMIT may exclude relevant results');
    }
    
    if (risks.length === 0) {
      risks.push('Low risk optimization');
    }
    
    return risks;
  }

  private calculateVariance(values: number[], mean: number): number {
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private calculateImpact(executionTime: number, frequency: number): string {
    const impact = executionTime * frequency;
    
    if (impact > 1000000) return 'critical';
    if (impact > 500000) return 'high';
    if (impact > 100000) return 'medium';
    return 'low';
  }

  private generateQueryRecommendations(query: SlowQuery, history: number[]): string[] {
    const recommendations = [];
    
    if (query.executionTime > 2000) {
      recommendations.push('Consider query optimization or indexing');
    }
    
    if (query.frequency > 100) {
      recommendations.push('High frequency query - consider caching');
    }
    
    const variance = this.calculateVariance(history, history.reduce((sum, time) => sum + time, 0) / history.length);
    if (variance > 100000) {
      recommendations.push('High execution time variance - investigate root cause');
    }
    
    if (query.query.includes('SELECT *')) {
      recommendations.push('Specify only required columns instead of SELECT *');
    }
    
    return recommendations;
  }
} 