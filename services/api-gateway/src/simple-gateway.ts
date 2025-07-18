import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { createLogger, format, transports } from 'winston';

// Service routing configuration
const serviceRoutes = [
  {
    path: '/api/v1/products',
    target: 'http://localhost:3001',
    port: 3001,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 100 }
  },
  {
    path: '/api/v1/marketplaces',
    target: 'http://localhost:3002',
    port: 3002,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 50 }
  },
  {
    path: '/api/v1/vendors',
    target: 'http://localhost:3003',
    port: 3003,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 50 }
  },
  {
    path: '/api/v1/orders',
    target: 'http://localhost:3004',
    port: 3004,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 200 }
  },
  {
    path: '/api/v1/pricing',
    target: 'http://localhost:3005',
    port: 3005,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 100 }
  },
  {
    path: '/api/v1/inventory',
    target: 'http://localhost:3006',
    port: 3006,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 150 }
  },
  {
    path: '/api/v1/accounting',
    target: 'http://localhost:3007',
    port: 3007,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 50 }
  },
  {
    path: '/api/v1/analytics',
    target: 'http://localhost:3008',
    port: 3008,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 30 }
  },
  {
    path: '/api/v1/tenants',
    target: 'http://localhost:3009',
    port: 3009,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 100 }
  },
  {
    path: '/api/v1/auth',
    target: 'http://localhost:3009',
    port: 3009,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 200 }
  }
];

export class SimpleApiGateway {
  private app: express.Application;
  private logger: any;
  private port: number;

  constructor(port: number = 3000) {
    this.port = port;
    this.app = express();
    this.setupLogger();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupLogger(): void {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      defaultMeta: { service: 'API Gateway' },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        })
      ]
    });
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Global rate limiting
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: {
        error: 'Too many requests from this IP',
        message: 'Please try again later'
      }
    });
    this.app.use('/api/v1', globalLimiter);

    // Authentication middleware
    this.app.use('/api/v1', this.authMiddleware);
  }

  private authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Bearer token is required'
      });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const secret = process.env['JWT_SECRET'] || 'default-secret';
      const decoded = jwt.verify(token, secret) as any;
      
      // Set tenant context
      (req as any).tenantContext = {
        tenantId: decoded.tenantId,
        features: decoded.permissions || []
      };

      (req as any).user = {
        userId: decoded.userId,
        role: decoded.role,
        permissions: decoded.permissions || []
      };

      this.logger.info('Authentication successful', {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        path: req.path
      });

      next();
    } catch (error) {
      this.logger.warn('JWT verification failed', { error });
      res.status(401).json({
        error: 'Invalid token',
        message: 'JWT token is invalid or malformed'
      });
    }
  };

  private setupRoutes(): void {
    // Gateway info endpoints
    this.app.get('/gateway/info', (_req: Request, res: Response) => {
      res.json({
        name: 'API Gateway',
        version: '1.0.0',
        description: 'API Gateway for Vault microservices',
        services: serviceRoutes.map(route => ({
          path: route.path,
          target: route.target,
          port: route.port
        })),
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/gateway/routes', (_req: Request, res: Response) => {
      res.json({
        routes: serviceRoutes,
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/gateway/health', async (_req: Request, res: Response) => {
      try {
        const serviceHealth = await this.checkServiceHealth();
        const allHealthy = serviceHealth.every(service => service.status === 'healthy');
        
        res.json({
          status: allHealthy ? 'healthy' : 'degraded',
          service: 'API Gateway',
          timestamp: new Date().toISOString(),
          services: serviceHealth
        });
      } catch (error) {
        this.logger.error('Health check failed', { error });
        res.status(503).json({
          status: 'unhealthy',
          service: 'API Gateway',
          error: 'Health check failed'
        });
      }
    });

    // Setup proxy routes for each service
    serviceRoutes.forEach(route => {
      this.setupServiceProxy(route);
    });
  }

  private setupServiceProxy(route: any): void {
    // Apply service-specific rate limiting
    if (route.rateLimit) {
      const serviceLimiter = rateLimit({
        windowMs: route.rateLimit.windowMs,
        max: route.rateLimit.max,
        message: {
          error: 'Rate limit exceeded',
          message: `Too many requests to ${route.path} service`
        },
        keyGenerator: (req: Request) => {
          return (req as any).tenantContext?.tenantId || req.ip || 'unknown';
        }
      });

      this.app.use(route.path, serviceLimiter);
    }

    // Create proxy middleware
    const proxy = createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      onProxyReq: (proxyReq: any, req: Request) => {
        // Forward tenant context
        if ((req as any).tenantContext) {
          proxyReq.setHeader('x-tenant-id', (req as any).tenantContext.tenantId);
        }

        // Forward user context
        if ((req as any).user) {
          proxyReq.setHeader('x-user-id', (req as any).user.userId);
          proxyReq.setHeader('x-user-role', (req as any).user.role || '');
        }

        this.logger.info('Proxying request', {
          method: req.method,
          path: req.path,
          target: route.target,
          tenantId: (req as any).tenantContext?.tenantId
        });
      },
      onProxyRes: (proxyRes: any, req: Request) => {
        this.logger.info('Proxy response received', {
          method: req.method,
          path: req.path,
          statusCode: proxyRes.statusCode,
          tenantId: (req as any).tenantContext?.tenantId
        });
      },
      onError: (err: any, req: Request, res: Response) => {
        this.logger.error('Proxy error', {
          error: err.message,
          method: req.method,
          path: req.path,
          target: route.target
        });

        res.status(502).json({
          error: 'Service unavailable',
          message: `Unable to reach ${route.path} service`,
          service: route.path,
          timestamp: new Date().toISOString()
        });
      }
    });

    this.app.use(route.path, proxy);
  }

  private async checkServiceHealth(): Promise<Array<{service: string, status: string, port: number}>> {
    const healthChecks = serviceRoutes.map(async (route) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(`${route.target}/health`, {
            method: 'GET',
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          return {
            service: route.path,
            status: response.ok ? 'healthy' : 'unhealthy',
            port: route.port
          };
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (error) {
        return {
          service: route.path,
          status: 'unhealthy',
          port: route.port
        };
      }
    });

    return Promise.all(healthChecks);
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        this.logger.info(`API Gateway started on port ${this.port}`);
        resolve();
      });
    });
  }

  public async shutdown(): Promise<void> {
    this.logger.info('API Gateway shutting down...');
  }
} 