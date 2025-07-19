export declare class SimpleApiGateway {
    private app;
    private logger;
    private port;
    constructor(port?: number);
    private setupLogger;
    private setupMiddleware;
    private securityHeadersMiddleware;
    private requestLoggingMiddleware;
    private inputValidationMiddleware;
    private generateRequestId;
    private authMiddleware;
    private setupRoutes;
    private setupServiceProxy;
    private checkServiceHealth;
    start(): Promise<void>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=simple-gateway.d.ts.map