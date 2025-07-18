import Redis from 'ioredis';
import NodeCache from 'node-cache';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  keys: number;
}

export interface CacheStatus {
  redis: {
    connected: boolean;
    status: string;
  };
  memory: {
    size: number;
    keys: number;
  };
  overall: {
    status: string;
    lastCheck: string;
  };
}

export class CacheManager {
  private redis: Redis | null = null;
  private memoryCache: NodeCache;
  private stats = {
    hits: 0,
    misses: 0
  };

  constructor() {
    this.memoryCache = new NodeCache({
      stdTTL: 300, // 5 minutes default
      checkperiod: 60, // Check for expired keys every minute
      useClones: false
    });

    this.initializeRedis();
    this.setupEventListeners();
  }

  private async initializeRedis(): Promise<void> {
    try {
      const redisUrl = process.env['REDIS_URL'] || 'redis://localhost:6379';
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      await this.redis.connect();
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.warn('Redis connection failed, using memory cache only:', error);
      this.redis = null;
    }
  }

  private setupEventListeners(): void {
    this.memoryCache.on('expired', (key: string) => {
      logger.debug(`Memory cache key expired: ${key}`);
    });

    this.memoryCache.on('flush', () => {
      logger.info('Memory cache flushed');
    });
  }

  async get(key: string, cacheType: 'redis' | 'memory' | 'both' = 'both'): Promise<any> {
    const start = Date.now();
    
    try {
      // Try memory cache first if applicable
      if (cacheType === 'memory' || cacheType === 'both') {
        const memoryValue = this.memoryCache.get(key);
        if (memoryValue !== undefined) {
          this.stats.hits++;
          metrics.cacheHits.inc({ cache_type: 'memory', key_pattern: this.getKeyPattern(key) });
          logger.debug(`Memory cache hit for key: ${key}`);
          return memoryValue;
        }
      }

      // Try Redis if available and applicable
      if (this.redis && (cacheType === 'redis' || cacheType === 'both')) {
        const redisValue = await this.redis.get(key);
        if (redisValue !== null) {
          this.stats.hits++;
          metrics.cacheHits.inc({ cache_type: 'redis', key_pattern: this.getKeyPattern(key) });
          logger.debug(`Redis cache hit for key: ${key}`);
          
          // Store in memory cache for faster subsequent access
          if (cacheType === 'both') {
            this.memoryCache.set(key, JSON.parse(redisValue));
          }
          
          return JSON.parse(redisValue);
        }
      }

      // Cache miss
      this.stats.misses++;
      metrics.cacheMisses.inc({ cache_type: cacheType, key_pattern: this.getKeyPattern(key) });
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    } finally {
      const duration = Date.now() - start;
      metrics.apiResponseTime.observe({ endpoint: 'cache_get', method: 'GET' }, duration / 1000);
    }
  }

  async set(key: string, value: any, ttl: number = 300, cacheType: 'redis' | 'memory' | 'both' = 'both'): Promise<void> {
    try {
      if (cacheType === 'memory' || cacheType === 'both') {
        this.memoryCache.set(key, value, ttl);
      }

      if (this.redis && (cacheType === 'redis' || cacheType === 'both')) {
        await this.redis.setex(key, ttl, JSON.stringify(value));
      }

      logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`);
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async delete(key: string, cacheType: 'redis' | 'memory' | 'both' = 'both'): Promise<void> {
    try {
      if (cacheType === 'memory' || cacheType === 'both') {
        this.memoryCache.del(key);
      }

      if (this.redis && (cacheType === 'redis' || cacheType === 'both')) {
        await this.redis.del(key);
      }

      logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async clearCache(pattern?: string, cacheType: 'redis' | 'memory' | 'both' = 'both'): Promise<void> {
    try {
      if (cacheType === 'memory' || cacheType === 'both') {
        if (pattern) {
          const keys = this.memoryCache.keys();
          // Convert pattern to regex for proper matching
          const patternRegex = new RegExp(pattern.replace(/\*/g, '.*'));
          const matchingKeys = keys.filter(key => patternRegex.test(key));
          matchingKeys.forEach(key => this.memoryCache.del(key));
          logger.info(`Cleared ${matchingKeys.length} memory cache keys matching pattern: ${pattern}`);
        } else {
          this.memoryCache.flushAll();
          logger.info('Cleared all memory cache');
        }
      }

      if (this.redis && (cacheType === 'redis' || cacheType === 'both')) {
        if (pattern) {
          const keys = await this.redis.keys(pattern);
          if (keys.length > 0) {
            await this.redis.del(...keys);
            logger.info(`Cleared ${keys.length} Redis cache keys matching pattern: ${pattern}`);
          }
        } else {
          await this.redis.flushall();
          logger.info('Cleared all Redis cache');
        }
      }
    } catch (error) {
      logger.error('Error clearing cache:', error);
      throw error;
    }
  }

  async getStatus(): Promise<CacheStatus> {
    const redisStatus = {
      connected: false,
      status: 'disconnected'
    };

    if (this.redis) {
      try {
        await this.redis.ping();
        redisStatus.connected = true;
        redisStatus.status = 'connected';
      } catch (error) {
        redisStatus.status = 'error';
      }
    }

    return {
      redis: redisStatus,
      memory: {
        size: this.memoryCache.getStats().vsize,
        keys: this.memoryCache.keys().length
      },
      overall: {
        status: redisStatus.connected ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString()
      }
    };
  }

  async getStats(): Promise<CacheStats> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    const memoryStats = this.memoryCache.getStats();
    const redisKeys = this.redis ? await this.redis.dbsize() : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      size: memoryStats.vsize,
      keys: memoryStats.keys + redisKeys
    };
  }

  private getKeyPattern(key: string): string {
    // Extract pattern from key for metrics
    const parts = key.split(':');
    return parts.length > 1 ? `${parts[0]}:*` : '*';
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
    }
    this.memoryCache.close();
  }
} 