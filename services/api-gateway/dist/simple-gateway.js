"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleApiGateway = void 0;
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const winston_1 = require("winston");
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
    }
];
class SimpleApiGateway {
    constructor(port = 3000) {
        this.authMiddleware = (req, res, next) => {
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
                const decoded = jsonwebtoken_1.default.verify(token, secret);
                // Set tenant context
                req.tenantContext = {
                    tenantId: decoded.tenantId,
                    features: decoded.permissions || []
                };
                req.user = {
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
            }
            catch (error) {
                this.logger.warn('JWT verification failed', { error });
                res.status(401).json({
                    error: 'Invalid token',
                    message: 'JWT token is invalid or malformed'
                });
            }
        };
        this.port = port;
        this.app = (0, express_1.default)();
        this.setupLogger();
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupLogger() {
        this.logger = (0, winston_1.createLogger)({
            level: 'info',
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
            defaultMeta: { service: 'API Gateway' },
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
        // Global rate limiting
        const globalLimiter = (0, express_rate_limit_1.default)({
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
    setupRoutes() {
        // Gateway info endpoints
        this.app.get('/gateway/info', (_req, res) => {
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
        this.app.get('/gateway/routes', (_req, res) => {
            res.json({
                routes: serviceRoutes,
                timestamp: new Date().toISOString()
            });
        });
        this.app.get('/gateway/health', async (_req, res) => {
            try {
                const serviceHealth = await this.checkServiceHealth();
                const allHealthy = serviceHealth.every(service => service.status === 'healthy');
                res.json({
                    status: allHealthy ? 'healthy' : 'degraded',
                    service: 'API Gateway',
                    timestamp: new Date().toISOString(),
                    services: serviceHealth
                });
            }
            catch (error) {
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
    setupServiceProxy(route) {
        // Apply service-specific rate limiting
        if (route.rateLimit) {
            const serviceLimiter = (0, express_rate_limit_1.default)({
                windowMs: route.rateLimit.windowMs,
                max: route.rateLimit.max,
                message: {
                    error: 'Rate limit exceeded',
                    message: `Too many requests to ${route.path} service`
                },
                keyGenerator: (req) => {
                    return req.tenantContext?.tenantId || req.ip || 'unknown';
                }
            });
            this.app.use(route.path, serviceLimiter);
        }
        // Create proxy middleware
        const proxy = (0, http_proxy_middleware_1.createProxyMiddleware)({
            target: route.target,
            changeOrigin: true,
            onProxyReq: (proxyReq, req) => {
                // Forward tenant context
                if (req.tenantContext) {
                    proxyReq.setHeader('x-tenant-id', req.tenantContext.tenantId);
                }
                // Forward user context
                if (req.user) {
                    proxyReq.setHeader('x-user-id', req.user.userId);
                    proxyReq.setHeader('x-user-role', req.user.role || '');
                }
                this.logger.info('Proxying request', {
                    method: req.method,
                    path: req.path,
                    target: route.target,
                    tenantId: req.tenantContext?.tenantId
                });
            },
            onProxyRes: (proxyRes, req) => {
                this.logger.info('Proxy response received', {
                    method: req.method,
                    path: req.path,
                    statusCode: proxyRes.statusCode,
                    tenantId: req.tenantContext?.tenantId
                });
            },
            onError: (err, req, res) => {
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
    async checkServiceHealth() {
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
                }
                catch (fetchError) {
                    clearTimeout(timeoutId);
                    throw fetchError;
                }
            }
            catch (error) {
                return {
                    service: route.path,
                    status: 'unhealthy',
                    port: route.port
                };
            }
        });
        return Promise.all(healthChecks);
    }
    async start() {
        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
                this.logger.info(`API Gateway started on port ${this.port}`);
                resolve();
            });
        });
    }
    async shutdown() {
        this.logger.info('API Gateway shutting down...');
    }
}
exports.SimpleApiGateway = SimpleApiGateway;
//# sourceMappingURL=simple-gateway.js.map