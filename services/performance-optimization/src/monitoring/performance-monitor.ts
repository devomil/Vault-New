import { logger } from '../utils/logger';

export interface PerformanceMetrics {
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    free: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    free: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  application: {
    uptime: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
}

export interface AlertThreshold {
  metric: string;
  warning: number;
  critical: number;
  enabled: boolean;
}

export class PerformanceMonitor {
  private alerts: Alert[] = [];
  private thresholds: Map<string, AlertThreshold> = new Map();
  private metricsHistory: PerformanceMetrics[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.initializeDefaultThresholds();
    this.startMonitoring();
  }

  private initializeDefaultThresholds(): void {
    const defaultThresholds: AlertThreshold[] = [
      { metric: 'cpu.usage', warning: 70, critical: 90, enabled: true },
      { metric: 'memory.percentage', warning: 80, critical: 95, enabled: true },
      { metric: 'disk.percentage', warning: 85, critical: 95, enabled: true },
      { metric: 'application.errorRate', warning: 5, critical: 10, enabled: true },
      { metric: 'application.averageResponseTime', warning: 1000, critical: 3000, enabled: true }
    ];

    defaultThresholds.forEach(threshold => {
      this.thresholds.set(threshold.metric, threshold);
    });
  }

  private startMonitoring(): void {
    // Monitor system metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Check alerts every minute
    setInterval(() => {
      this.checkAlerts();
    }, 60000);
  }

  private async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.getCurrentMetrics();
      this.metricsHistory.push(metrics);
      
      // Keep only recent history
      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
      }
    } catch (error) {
      logger.error('Error collecting metrics:', error);
    }
  }

  private async getCurrentMetrics(): Promise<PerformanceMetrics> {
    const memUsage = process.memoryUsage();

    return {
      cpu: {
        usage: this.calculateCpuUsage(),
        load: this.getSystemLoad()
      },
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        free: memUsage.heapTotal - memUsage.heapUsed,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      disk: {
        used: 0, // Would need fs.statfs or similar
        total: 0,
        free: 0,
        percentage: 0
      },
      network: {
        bytesIn: 0, // Would need network monitoring
        bytesOut: 0,
        connections: 0
      },
      application: {
        uptime: process.uptime(),
        requestsPerSecond: this.calculateRequestsPerSecond(),
        averageResponseTime: this.calculateAverageResponseTime(),
        errorRate: this.calculateErrorRate()
      }
    };
  }

  private calculateCpuUsage(): number {
    // Simplified CPU usage calculation
    const startUsage = process.cpuUsage();
    const startTime = Date.now();
    
    // Simulate some work to measure CPU
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.random();
    }
    
    const endUsage = process.cpuUsage(startUsage);
    const endTime = Date.now();
    
    const cpuPercent = (endUsage.user + endUsage.system) / ((endTime - startTime) * 1000) * 100;
    return Math.min(cpuPercent, 100);
  }

  private getSystemLoad(): number[] {
    // Mock system load average
    return [0.5, 0.3, 0.2];
  }

  private calculateRequestsPerSecond(): number {
    // Mock calculation based on recent metrics
    return Math.random() * 100 + 50;
  }

  private calculateAverageResponseTime(): number {
    // Mock calculation
    return Math.random() * 500 + 100;
  }

  private calculateErrorRate(): number {
    // Mock calculation
    return Math.random() * 5;
  }

  private checkAlerts(): void {
    if (this.metricsHistory.length === 0) return;

    const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    if (!currentMetrics) return;

    this.thresholds.forEach((threshold, metric) => {
      if (!threshold.enabled) return;

      const value = this.getMetricValue(currentMetrics, metric);
      if (value === null) return;

      if (value >= threshold.critical) {
        this.createAlert('critical', metric, value, threshold.critical);
      } else if (value >= threshold.warning) {
        this.createAlert('warning', metric, value, threshold.warning);
      }
    });
  }

  private getMetricValue(metrics: PerformanceMetrics, path: string): number | null {
    const parts = path.split('.');
    let current: any = metrics;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }

    return typeof current === 'number' ? current : null;
  }

  private createAlert(type: 'warning' | 'critical', metric: string, value: number, threshold: number): void {
    const existingAlert = this.alerts.find(alert => 
      alert.metric === metric && !alert.acknowledged
    );

    if (existingAlert) {
      // Update existing alert
      existingAlert.type = type;
      existingAlert.value = value;
      existingAlert.threshold = threshold;
      existingAlert.timestamp = new Date().toISOString();
    } else {
      // Create new alert
      const alert: Alert = {
        id: this.generateAlertId(),
        type,
        message: `${metric} is ${type}: ${value} (threshold: ${threshold})`,
        metric,
        value,
        threshold,
        timestamp: new Date().toISOString(),
        acknowledged: false
      };
      this.alerts.push(alert);
    }

    logger.warn(`Performance alert: ${metric} = ${value} (${type})`);
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    if (this.metricsHistory.length === 0) {
      return await this.getCurrentMetrics();
    }
    const lastMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    return lastMetrics || await this.getCurrentMetrics();
  }

  async getAlerts(): Promise<Alert[]> {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  async configureAlerts(thresholds: AlertThreshold[], _rules: any): Promise<void> {
    // Clear existing thresholds
    this.thresholds.clear();

    // Add new thresholds
    thresholds.forEach(threshold => {
      this.thresholds.set(threshold.metric, threshold);
    });

    logger.info(`Configured ${thresholds.length} alert thresholds`);
  }

  async getSystemDiagnostics(): Promise<any> {
    const currentMetrics = await this.getPerformanceMetrics();
    const alerts = await this.getAlerts();

    return {
      metrics: currentMetrics,
      alerts: alerts.length,
      thresholds: Array.from(this.thresholds.values()),
      history: {
        size: this.metricsHistory.length,
        maxSize: this.maxHistorySize
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime()
      }
    };
  }

  async analyzePerformance(type: string, parameters: any): Promise<any> {
    switch (type) {
      case 'trend':
        return this.analyzeTrends(parameters);
      case 'bottleneck':
        return this.analyzeBottlenecks(parameters);
      case 'capacity':
        return this.analyzeCapacity(parameters);
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }
  }

  private analyzeTrends(_parameters: any): any {
    if (this.metricsHistory.length < 10) {
      return { error: 'Insufficient data for trend analysis' };
    }

    const recentMetrics = this.metricsHistory.slice(-10);
    const cpuTrend = this.calculateTrend(recentMetrics.map(m => m.cpu.usage));
    const memoryTrend = this.calculateTrend(recentMetrics.map(m => m.memory.percentage));

    return {
      cpu: {
        trend: cpuTrend,
        average: cpuTrend.average,
        direction: cpuTrend.direction
      },
      memory: {
        trend: memoryTrend,
        average: memoryTrend.average,
        direction: memoryTrend.direction
      }
    };
  }

  private analyzeBottlenecks(_parameters: any): any {
    if (this.metricsHistory.length === 0) {
      return { error: 'No metrics available for analysis' };
    }

    const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    if (!currentMetrics) {
      return { error: 'No current metrics available' };
    }

    const bottlenecks = [];

    if (currentMetrics.cpu.usage > 80) {
      bottlenecks.push({
        type: 'cpu',
        severity: 'high',
        usage: currentMetrics.cpu.usage,
        recommendation: 'Consider scaling CPU resources or optimizing CPU-intensive operations'
      });
    }

    if (currentMetrics.memory.percentage > 85) {
      bottlenecks.push({
        type: 'memory',
        severity: 'high',
        usage: currentMetrics.memory.percentage,
        recommendation: 'Consider increasing memory allocation or optimizing memory usage'
      });
    }

    if (currentMetrics.application.errorRate > 5) {
      bottlenecks.push({
        type: 'errors',
        severity: 'medium',
        rate: currentMetrics.application.errorRate,
        recommendation: 'Investigate error patterns and fix underlying issues'
      });
    }

    return { bottlenecks };
  }

  private analyzeCapacity(_parameters: any): any {
    if (this.metricsHistory.length === 0) {
      return { error: 'No metrics available for analysis' };
    }

    const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    if (!currentMetrics) {
      return { error: 'No current metrics available' };
    }
    
    return {
      cpu: {
        current: currentMetrics.cpu.usage,
        capacity: 100,
        available: 100 - currentMetrics.cpu.usage,
        utilization: `${currentMetrics.cpu.usage}%`
      },
      memory: {
        current: currentMetrics.memory.used,
        capacity: currentMetrics.memory.total,
        available: currentMetrics.memory.free,
        utilization: `${currentMetrics.memory.percentage.toFixed(1)}%`
      },
      recommendations: this.generateCapacityRecommendations(currentMetrics)
    };
  }

  private calculateTrend(values: number[]): any {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const direction = secondAvg > firstAvg ? 'increasing' : secondAvg < firstAvg ? 'decreasing' : 'stable';
    
    return { average, direction, values };
  }

  private generateCapacityRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations = [];

    if (metrics.cpu.usage > 80) {
      recommendations.push('Consider horizontal scaling or CPU optimization');
    }

    if (metrics.memory.percentage > 85) {
      recommendations.push('Increase memory allocation or optimize memory usage');
    }

    if (metrics.application.errorRate > 5) {
      recommendations.push('Implement error monitoring and fix critical issues');
    }

    if (recommendations.length === 0) {
      recommendations.push('System capacity is healthy, continue monitoring');
    }

    return recommendations;
  }
} 