"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceTemplate = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const winston_1 = require("winston");
class ServiceTemplate {
    app;
    prisma;
    logger;
    config;
    constructor(config) {
        this.config = config;
        this.app = (0, express_1.default)();
        this.prisma = new client_1.PrismaClient();
        this.setupLogger();
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupLogger() {
        this.logger = (0, winston_1.createLogger)({
            level: process.env['LOG_LEVEL'] || 'info',
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.json()),
            defaultMeta: {
                service: this.config.name,
                version: this.config.version
            },
            transports: [
                new winston_1.transports.Console({
                    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
                })
            ]
        });
    }
    setupMiddleware() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(this.tenantContextMiddleware);
        this.app.use(this.errorHandler);
    }
    setupRoutes() {
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
    extractTenantContext(req) {
        const tenantId = req.headers['x-tenant-id'];
        if (tenantId) {
            return { tenantId };
        }
        return null;
    }
    /**
     * Tenant context middleware
     */
    tenantContextMiddleware = (req, res, next) => {
        try {
            const tenantContext = this.extractTenantContext(req);
            if (tenantContext) {
                req.tenantContext = tenantContext;
                this.logger.info('Tenant context set', {
                    tenantId: tenantContext.tenantId,
                    path: req.path
                });
            }
            else {
                this.logger.warn('No tenant context found', { path: req.path });
            }
            next();
        }
        catch (error) {
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
    errorHandler = (error, req, res, next) => {
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
    healthCheck = async (req, res) => {
        try {
            // Check database connection
            await this.prisma.$queryRaw `SELECT 1`;
            res.json({
                status: 'healthy',
                service: this.config.name,
                version: this.config.version,
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: this.config.environment
            });
        }
        catch (error) {
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
    serviceInfo = (req, res) => {
        res.json({
            name: this.config.name,
            version: this.config.version,
            environment: this.config.environment,
            description: this.getServiceDescription(),
            endpoints: this.getServiceEndpoints()
        });
    };
    /**
     * Start the service
     */
    async start() {
        try {
            this.app.listen(this.config.port, () => {
                this.logger.info(`Service started`, {
                    service: this.config.name,
                    port: this.config.port,
                    version: this.config.version,
                    environment: this.config.environment
                });
            });
        }
        catch (error) {
            this.logger.error('Failed to start service', { error });
            throw error;
        }
    }
    /**
     * Graceful shutdown
     */
    async shutdown() {
        this.logger.info('Shutting down service', { service: this.config.name });
        try {
            await this.prisma.$disconnect();
            this.logger.info('Database connection closed');
        }
        catch (error) {
            this.logger.error('Error during shutdown', { error });
        }
    }
}
exports.ServiceTemplate = ServiceTemplate;
//# sourceMappingURL=service-template.js.map