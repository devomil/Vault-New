import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { RLSManager } from '@vault/shared-database';
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
export declare abstract class BaseService {
    protected prisma: PrismaClient;
    protected rlsManager: RLSManager;
    protected logger: any;
    protected config: ServiceConfig;
    constructor(config: ServiceConfig);
    private setupLogger;
    /**
     * Extract tenant context from request headers or JWT token
     */
    protected extractTenantContext(req: Request): TenantContext | null;
    /**
     * Set tenant context for database operations
     */
    protected setTenantContext(tenantId: string): Promise<void>;
    /**
     * Clear tenant context
     */
    protected clearTenantContext(): Promise<void>;
    /**
     * Tenant context middleware
     */
    tenantContextMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Error handling middleware
     */
    errorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => void;
    /**
     * Health check endpoint
     */
    healthCheck: (req: Request, res: Response) => Promise<void>;
    /**
     * Graceful shutdown
     */
    shutdown(): Promise<void>;
    /**
     * Abstract method that each service must implement
     */
    abstract start(): Promise<void>;
}
declare global {
    namespace Express {
        interface Request {
            tenantContext?: TenantContext;
        }
    }
}
//# sourceMappingURL=base-service.d.ts.map