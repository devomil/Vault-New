"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const client_1 = require("@prisma/client");
const winston_1 = require("winston");
const shared_database_1 = require("@vault/shared-database");
class BaseService {
    prisma;
    rlsManager;
    logger;
    config;
    constructor(config) {
        this.config = config;
        this.prisma = new client_1.PrismaClient();
        this.rlsManager = new shared_database_1.RLSManager(this.prisma);
        this.setupLogger();
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
    /**
     * Extract tenant context from request headers or JWT token
     */
    extractTenantContext(req) {
        // Check for tenant ID in headers (for internal service communication)
        const tenantId = req.headers['x-tenant-id'];
        if (tenantId) {
            return { tenantId };
        }
        // Check for JWT token with tenant context (for external API calls)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                // TODO: Implement JWT verification and tenant extraction
                // For now, return null to indicate no tenant context
                return null;
            }
            catch (error) {
                this.logger.error('Failed to extract tenant from JWT', { error });
                return null;
            }
        }
        return null;
    }
    /**
     * Set tenant context for database operations
     */
    async setTenantContext(tenantId) {
        await this.rlsManager.setTenantContext(tenantId);
    }
    /**
     * Clear tenant context
     */
    async clearTenantContext() {
        await this.rlsManager.clearTenantContext();
    }
    /**
     * Tenant context middleware
     */
    tenantContextMiddleware = async (req, res, next) => {
        try {
            const tenantContext = this.extractTenantContext(req);
            if (tenantContext) {
                await this.setTenantContext(tenantContext.tenantId);
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
exports.BaseService = BaseService;
//# sourceMappingURL=base-service.js.map