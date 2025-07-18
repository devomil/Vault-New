import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '@vault/shared-database';
import { createLogger, format, transports } from 'winston';

export interface ServiceConfig {
  name: string;
  port: number;
  version: string;
  environment: string;
}

export interface TenantContext {
  tenantId: string;
  tenantName?: string;
  tenantStatus?: string;
  features?: string[];
  limits?: Record<string, number>;
}

export abstract class ServiceTemplate {
  protected app: express.Application;
  protected prisma: typeof prisma;
  protected logger: any;
  protected config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.app = express();
    this.prisma = prisma;
    this.setupLogger();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupLogger(): void {
    this.logger = createLogger({
      level: process.env['LOG_LEVEL'] || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      defaultMeta: { 
        service: this.config.name,
        version: this.config.version 
      },
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
    this.app.use(this.tenantContextMiddleware);
    this.app.use(this.errorHandler);
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', this.healthCheck);
    
    // Service info endpoint
    this.app.get('/info', this.serviceInfo);
    
    // Setup service-specific routes
    this.setupServiceRoutes();
  }

  /**
   * Extract tenant context from request headers
   */
  private extractTenantContext(req: Request): TenantContext | null {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (tenantId) {
      return { tenantId };
    }

    return null;
  }

  /**
   * Tenant context middleware
   */
  private tenantContextMiddleware = (
    req: Request, 
    res: Response, 
    next: NextFunction
  ): void => {
    try {
      const tenantContext = this.extractTenantContext(req);
      
      if (tenantContext) {
        req.tenantContext = tenantContext;
        this.logger.info('Tenant context set', { 
          tenantId: tenantContext.tenantId,
          path: req.path 
        });
      } else {
        this.logger.warn('No tenant context found', { path: req.path });
      }
      
      next();
    } catch (error) {
      this.logger.error('Error setting tenant context', { error });
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to set tenant context' 
      });
    }
  };

  /**
   * Error handling middleware
   */
  private errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    this.logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      tenantId: req.tenantContext?.tenantId
    });

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    });
  };

  /**
   * Health check endpoint
   */
  private healthCheck = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      res.json({
        status: 'healthy',
        service: this.config.name,
        version: this.config.version,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: this.config.environment
      });
    } catch (error) {
      this.logger.error('Health check failed', { error });
      res.status(503).json({
        status: 'unhealthy',
        service: this.config.name,
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Service info endpoint
   */
  private serviceInfo = (_req: Request, res: Response): void => {
    res.json({
      name: this.config.name,
      version: this.config.version,
      environment: this.config.environment,
      description: this.getServiceDescription(),
      endpoints: this.getServiceEndpoints()
    });
  };

  /**
   * Abstract methods that each service must implement
   */
  protected abstract setupServiceRoutes(): void;
  protected abstract getServiceDescription(): string;
  protected abstract getServiceEndpoints(): string[];

  /**
   * Start the service
   */
  public async start(): Promise<void> {
    try {
      this.app.listen(this.config.port, () => {
        this.logger.info(`Service started`, {
          service: this.config.name,
          port: this.config.port,
          version: this.config.version,
          environment: this.config.environment
        });
      });
    } catch (error) {
      this.logger.error('Failed to start service', { error });
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down service', { service: this.config.name });
    
    try {
      await this.prisma.$disconnect();
      this.logger.info('Database connection closed');
    } catch (error) {
      this.logger.error('Error during shutdown', { error });
    }
  }
}

// Extend Express Request interface to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenantContext?: TenantContext;
    }
  }
} 