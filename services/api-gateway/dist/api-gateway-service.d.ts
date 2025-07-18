import { ServiceTemplate, ServiceConfig, TenantContext } from '@vault/shared-middleware';
export declare class ApiGatewayService extends ServiceTemplate {
    private serviceRoutes;
    constructor(config: ServiceConfig);
    protected setupServiceRoutes(): void;
    protected getServiceDescription(): string;
    protected getServiceEndpoints(): string[];
    /**
     * Setup global rate limiting
     */
    private setupGlobalRateLimit;
    /**
     * Authentication middleware
     */
    private authenticationMiddleware;
    /**
     * Setup proxy for a specific service
     */
    private setupServiceProxy;
    /**
     * Gateway info endpoint
     */
    private gatewayInfo;
    /**
     * List all available routes
     */
    private listRoutes;
    /**
     * Gateway health check
     */
    private gatewayHealth;
    /**
     * Check health of all downstream services
     */
    private checkServiceHealth;
}
declare global {
    namespace Express {
        interface Request {
            tenantContext?: TenantContext;
            user?: {
                userId: string;
                role?: string;
                permissions: string[];
            };
        }
    }
}
//# sourceMappingURL=api-gateway-service.d.ts.map