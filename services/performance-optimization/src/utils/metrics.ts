import { register, Counter, Histogram, Gauge } from 'prom-client';

// Create metrics registry
export const metrics = {
  register,
  
  // HTTP request metrics
  httpRequestTotal: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status']
  }),
  
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  }),
  
  // Cache metrics
  cacheHits: new Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type', 'key_pattern']
  }),
  
  cacheMisses: new Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type', 'key_pattern']
  }),
  
  cacheSize: new Gauge({
    name: 'cache_size',
    help: 'Current cache size',
    labelNames: ['cache_type']
  }),
  
  // Performance metrics
  databaseQueryDuration: new Histogram({
    name: 'database_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
  }),
  
  apiResponseTime: new Histogram({
    name: 'api_response_time_seconds',
    help: 'API response time in seconds',
    labelNames: ['endpoint', 'method'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  }),
  
  // Memory and CPU metrics
  memoryUsage: new Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type']
  }),
  
  cpuUsage: new Gauge({
    name: 'cpu_usage_percent',
    help: 'CPU usage percentage'
  }),
  
  // Active connections
  activeConnections: new Gauge({
    name: 'active_connections',
    help: 'Number of active connections'
  })
};

// Update system metrics periodically
setInterval(() => {
  const memUsage = process.memoryUsage();
  metrics.memoryUsage.set({ type: 'rss' }, memUsage.rss);
  metrics.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
  metrics.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
  metrics.memoryUsage.set({ type: 'external' }, memUsage.external);
}, 30000); // Update every 30 seconds 