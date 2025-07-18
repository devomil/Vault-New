"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayService = void 0;
const http_proxy_middleware_1 = require("http-proxy-middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const shared_middleware_1 = require("@vault/shared-middleware");
const zod_1 = require("zod");
// JWT payload schema
const JwtPayloadSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    userId: zod_1.z.string(),
    role: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    exp: zod_1.z.number()
});
class ApiGatewayService extends shared_middleware_1.ServiceTemplate {
    constructor(config) {
        super(config);
        this.serviceRoutes = [
            {
                path: '/api/v1/products',
                target: 'http://localhost:3001',
                port: 3001,
                requiresAuth: true,
                rateLimit: { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
            },
            {
                path: '/api/v1/marketplaces',
                target: 'http://localhost:3002',
                port: 3002,
                requiresAuth: true,
                rateLimit: { windowMs: 15 * 60 * 1000, max: 50 }
            },
            {
                path: '/api/v1/vendors',
                target: 'http://localhost:3003',
                port: 3003,
                requiresAuth: true,
                rateLimit: { windowMs: 15 * 60 * 1000, max: 50 }
            },
            {
                path: '/api/v1/orders',
                target: 'http://localhost:3004',
                port: 3004,
                requiresAuth: true,
                rateLimit: { windowMs: 15 * 60 * 1000, max: 200 }
            },
            {
                path: '/api/v1/pricing',
                target: 'http://localhost:3005',
                port: 3005,
                requiresAuth: true,
                rateLimit: { windowMs: 15 * 60 * 1000, max: 100 }
            },
            {
                path: '/api/v1/inventory',
                target: 'http://localhost:3006',
                port: 3006,
                requiresAuth: true,
                rateLimit: { windowMs: 15 * 60 * 1000, max: 150 }
            },
            {
                path: '/api/v1/accounting',
                target: 'http://localhost:3007',
                port: 3007,
                requiresAuth: true,
                rateLimit: { windowMs: 15 * 60 * 1000, max: 50 }
            },
            {
                path: '/api/v1/analytics',
                target: 'http://localhost:3008',
                port: 3008,
                requiresAuth: true,
                rateLimit: { windowMs: 15 * 60 * 1000, max: 30 }
            }
        ];
        /**
         * Authentication middleware
         */
        this.authenticationMiddleware = async (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    res.status(401).json({
                        error: 'Authentication required',
                        message: 'Bearer token is required'
                    });
                    return;
                }
                const token = authHeader.substring(7); // Remove 'Bearer ' prefix
                try {
                    // Verify JWT token
                    const decoded = jsonwebtoken_1.default.verify(token, process.env['JWT_SECRET'] || 'default-secret');
                    // Validate payload structure
                    const validatedPayload = JwtPayloadSchema.parse(decoded);
                    // Check if token is expired
                    if (Date.now() >= validatedPayload.exp * 1000) {
                        res.status(401).json({
                            error: 'Token expired',
                            message: 'JWT token has expired'
                        });
                        return;
                    }
                    // Set tenant context
                    const tenantContext = {
                        tenantId: validatedPayload.tenantId,
                        features: validatedPayload.permissions || []
                    };
                    req.tenantContext = tenantContext;
                    req.user = {
                        userId: validatedPayload.userId,
                        role: validatedPayload.role || undefined,
                        permissions: validatedPayload.permissions || []
                    };
                    this.logger.info('Authentication successful', {
                        userId: validatedPayload.userId,
                        tenantId: validatedPayload.tenantId,
                        path: req.path
                    });
                    next();
                }
                catch (jwtError) {
                    this.logger.warn('JWT verification failed', { error: jwtError });
                    res.status(401).json({
                        error: 'Invalid token',
                        message: 'JWT token is invalid or malformed'
                    });
                }
            }
            catch (error) {
                this.logger.error('Authentication middleware error', { error });
                res.status(500).json({
                    error: 'Authentication error',
                    message: 'Failed to process authentication'
                });
            }
        };
        /**
         * Gateway info endpoint
         */
        this.gatewayInfo = (req, res) => {
            res.json({
                name: this.config.name,
                version: this.config.version,
                environment: this.config.environment,
                description: this.getServiceDescription(),
                endpoints: this.getServiceEndpoints(),
                services: this.serviceRoutes.map(route => ({
                    path: route.path,
                    target: route.target,
                    port: route.port,
                    requiresAuth: route.requiresAuth
                })),
                timestamp: new Date().toISOString()
            });
        };
        /**
         * List all available routes
         */
        this.listRoutes = (req, res) => {
            res.json({
                routes: this.serviceRoutes.map(route => ({
                    path: route.path,
                    target: route.target,
                    port: route.port,
                    requiresAuth: route.requiresAuth,
                    rateLimit: route.rateLimit
                })),
                timestamp: new Date().toISOString()
            });
        };
        /**
         * Gateway health check
         */
        this.gatewayHealth = async (req, res) => {
            try {
                // Check health of all downstream services
                const serviceHealth = await this.checkServiceHealth();
                const allHealthy = serviceHealth.every(service => service.status === 'healthy');
                res.json({
                    status: allHealthy ? 'healthy' : 'degraded',
                    service: this.config.name,
                    version: this.config.version,
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    environment: this.config.environment,
                    services: serviceHealth
                });
            }
            catch (error) {
                this.logger.error('Gateway health check failed', { error });
                res.status(503).json({
                    status: 'unhealthy',
                    service: this.config.name,
                    error: 'Health check failed',
                    timestamp: new Date().toISOString()
                });
            }
        };
    }
    setupServiceRoutes() {
        // Global rate limiting
        this.setupGlobalRateLimit();
        // Authentication middleware
        this.app.use('/api/v1', this.authenticationMiddleware);
        // Setup proxy routes for each service
        this.serviceRoutes.forEach(route => {
            this.setupServiceProxy(route);
        });
        // Gateway info endpoint
        this.app.get('/gateway/info', this.gatewayInfo);
        this.app.get('/gateway/routes', this.listRoutes);
        this.app.get('/gateway/health', this.gatewayHealth);
    }
    getServiceDescription() {
        return 'API Gateway for Vault microservices - handles routing, authentication, rate limiting, and request forwarding';
    }
    getServiceEndpoints() {
        return [
            'GET /gateway/info',
            'GET /gateway/routes',
            'GET /gateway/health',
            'PROXY /api/v1/products/* → Product Intelligence (3001)',
            'PROXY /api/v1/marketplaces/* → Marketplace Integration (3002)',
            'PROXY /api/v1/vendors/* → Vendor Integration (3003)',
            'PROXY /api/v1/orders/* → Order Processing (3004)',
            'PROXY /api/v1/pricing/* → Pricing Engine (3005)',
            'PROXY /api/v1/inventory/* → Inventory Management (3006)',
            'PROXY /api/v1/accounting/* → Accounting System (3007)',
            'PROXY /api/v1/analytics/* → Analytics Engine (3008)'
        ];
    }
    /**
     * Setup global rate limiting
     */
    setupGlobalRateLimit() {
        const globalLimiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // limit each IP to 1000 requests per windowMs
            message: {
                error: 'Too many requests from this IP',
                message: 'Please try again later'
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/v1', globalLimiter);
    }
    /**
     * Setup proxy for a specific service
     */
    setupServiceProxy(route) {
        const proxyOptions = {
            target: route.target,
            changeOrigin: true,
            pathRewrite: {
                [`^${route.path}`]: route.path // Keep the original path
            },
            onProxyReq: (proxyReq, req, res) => {
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
            onProxyRes: (proxyRes, req, res) => {
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
                    target: route.target,
                    tenantId: req.tenantContext?.tenantId
                });
                res.status(502).json({
                    error: 'Service unavailable',
                    message: `Unable to reach ${route.path} service`,
                    service: route.path,
                    timestamp: new Date().toISOString()
                });
            }
        };
        // Apply service-specific rate limiting if configured
        if (route.rateLimit) {
            const serviceLimiter = (0, express_rate_limit_1.default)({
                windowMs: route.rateLimit.windowMs,
                max: route.rateLimit.max,
                message: route.rateLimit.message || {
                    error: 'Rate limit exceeded',
                    message: `Too many requests to ${route.path} service`
                },
                keyGenerator: (req) => {
                    // Rate limit per tenant
                    return req.tenantContext?.tenantId || req.ip || 'unknown';
                }
            });
            this.app.use(route.path, serviceLimiter);
        }
        // Create proxy middleware
        const proxy = (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions);
        this.app.use(route.path, proxy);
    }
    /**
     * Check health of all downstream services
     */
    async checkServiceHealth() {
        const healthChecks = this.serviceRoutes.map(async (route) => {
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
}
exports.ApiGatewayService = ApiGatewayService;
//# sourceMappingURL=api-gateway-service.js.map