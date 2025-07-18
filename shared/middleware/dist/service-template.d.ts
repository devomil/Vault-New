import express from 'express';
import { PrismaClient } from '@prisma/client';
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
export declare abstract class ServiceTemplate {
    protected app: express.Application;
    protected prisma: PrismaClient;
    protected logger: any;
    protected config: ServiceConfig;
    constructor(config: ServiceConfig);
    private setupLogger;
    private setupMiddleware;
    private setupRoutes;
    /**
     * Extract tenant context from request headers
     */
    private extractTenantContext;
    /**
     * Tenant context middleware
     */
    private tenantContextMiddleware;
    /**
     * Error handling middleware
     */
    private errorHandler;
    /**
     * Health check endpoint
     */
    private healthCheck;
    /**
     * Service info endpoint
     */
    private serviceInfo;
    /**
     * Abstract methods that each service must implement
     */
    protected abstract setupServiceRoutes(): void;
    protected abstract getServiceDescription(): string;
    protected abstract getServiceEndpoints(): string[];
    /**
     * Start the service
     */
    start(): Promise<void>;
    /**
     * Graceful shutdown
     */
    shutdown(): Promise<void>;
}
declare global {
    namespace Express {
        interface Request {
            tenantContext?: TenantContext;
        }
    }
}
//# sourceMappingURL=service-template.d.ts.map