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
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const integration_test_routes_1 = __importDefault(require("./integration-test-routes"));
// Security configuration
const SECURITY_CONFIG = {
    // Rate limiting tiers
    rateLimits: {
        strict: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 requests per 15 minutes
        normal: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
        high: { windowMs: 15 * 60 * 1000, max: 1000 }, // 1000 requests per 15 minutes
    },
    // Security headers
    securityHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
    // CORS configuration
    cors: {
        origin: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:3000', 'https://your-domain.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-api-key'],
        exposedHeaders: ['x-tenant-id', 'x-request-id'],
        credentials: true,
        maxAge: 86400,
    }
};
// Service routing configuration
const serviceRoutes = [
    {
        path: '/api/v1/products',
        target: 'http://localhost:3001',
        port: 3001,
        rateLimit: SECURITY_CONFIG.rateLimits.normal
    },
    {
        path: '/api/v1/marketplaces',
        target: 'http://localhost:3002',
        port: 3002,
        rateLimit: SECURITY_CONFIG.rateLimits.strict
    },
    {
        path: '/api/v1/vendors',
        target: 'http://localhost:3003',
        port: 3003,
        rateLimit: SECURITY_CONFIG.rateLimits.strict
    },
    {
        path: '/api/v1/orders',
        target: 'http://localhost:3004',
        port: 3004,
        rateLimit: SECURITY_CONFIG.rateLimits.normal
    },
    {
        path: '/api/v1/pricing',
        target: 'http://localhost:3005',
        port: 3005,
        rateLimit: SECURITY_CONFIG.rateLimits.normal
    },
    {
        path: '/api/v1/inventory',
        target: 'http://localhost:3006',
        port: 3006,
        rateLimit: SECURITY_CONFIG.rateLimits.normal
    },
    {
        path: '/api/v1/accounting',
        target: 'http://localhost:3007',
        port: 3007,
        rateLimit: SECURITY_CONFIG.rateLimits.strict
    },
    {
        path: '/api/v1/analytics',
        target: 'http://localhost:3008',
        port: 3008,
        rateLimit: SECURITY_CONFIG.rateLimits.strict
    },
    {
        path: '/api/v1/tenants',
        target: 'http://localhost:3009',
        port: 3009,
        rateLimit: SECURITY_CONFIG.rateLimits.normal
    },
    {
        path: '/api/v1/auth',
        target: 'http://localhost:3009',
        port: 3009,
        rateLimit: SECURITY_CONFIG.rateLimits.strict
    },
    {
        path: '/api/v1/notifications',
        target: 'http://localhost:3010',
        port: 3010,
        rateLimit: SECURITY_CONFIG.rateLimits.normal
    },
    {
        path: '/api/v1/performance',
        target: 'http://localhost:3011',
        port: 3011,
        rateLimit: SECURITY_CONFIG.rateLimits.normal
    },
    {
        path: '/api/v1/security',
        target: 'http://localhost:3012',
        port: 3012,
        rateLimit: SECURITY_CONFIG.rateLimits.strict
    }
];
class SimpleApiGateway {
    constructor(port = 3000) {
        this.securityHeadersMiddleware = (req, res, next) => {
            // Add custom security headers
            Object.entries(SECURITY_CONFIG.securityHeaders).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
            // Add request ID for tracking
            const requestId = req.headers['x-request-id'] || this.generateRequestId();
            res.setHeader('x-request-id', requestId);
            req.requestId = requestId;
            next();
        };
        this.requestLoggingMiddleware = (req, res, next) => {
            const startTime = Date.now();
            // Log request
            this.logger.info('Incoming request', {
                requestId: req.requestId,
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                tenantId: req.headers['x-tenant-id'],
                timestamp: new Date().toISOString()
            });
            // Log response
            res.on('finish', () => {
                const duration = Date.now() - startTime;
                this.logger.info('Request completed', {
                    requestId: req.requestId,
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    duration: `${duration}ms`,
                    ip: req.ip,
                    tenantId: req.headers['x-tenant-id']
                });
            });
            next();
        };
        this.inputValidationMiddleware = (req, res, next) => {
            // Check for suspicious patterns
            const suspiciousPatterns = [
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi,
                /union\s+select/gi,
                /drop\s+table/gi,
                /insert\s+into/gi,
                /delete\s+from/gi,
                /update\s+set/gi,
                /exec\s*\(/gi,
                /eval\s*\(/gi,
                /\.\.\/\.\./g,
                /\.\.\\\.\./g
            ];
            const requestBody = JSON.stringify(req.body).toLowerCase();
            const requestQuery = JSON.stringify(req.query).toLowerCase();
            const requestParams = JSON.stringify(req.params).toLowerCase();
            const requestHeaders = JSON.stringify(req.headers).toLowerCase();
            const allRequestData = `${requestBody} ${requestQuery} ${requestParams} ${requestHeaders}`;
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(allRequestData)) {
                    this.logger.warn('Suspicious request detected', {
                        requestId: req.requestId,
                        pattern: pattern.source,
                        ip: req.ip,
                        path: req.path,
                        userAgent: req.get('User-Agent')
                    });
                    res.status(400).json({
                        error: 'Invalid request',
                        message: 'Request contains suspicious content'
                    });
                    return;
                }
            }
            next();
        };
        this.authMiddleware = (req, res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.logger.warn('Authentication failed - missing token', {
                    requestId: req.requestId,
                    ip: req.ip,
                    path: req.path
                });
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
                    requestId: req.requestId,
                    userId: decoded.userId,
                    tenantId: decoded.tenantId,
                    role: decoded.role,
                    path: req.path
                });
                next();
            }
            catch (error) {
                this.logger.warn('JWT verification failed', {
                    requestId: req.requestId,
                    error: error.message,
                    ip: req.ip,
                    path: req.path
                });
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
                }),
                new winston_1.transports.File({
                    filename: '/var/log/api-gateway/access.log',
                    level: 'info'
                }),
                new winston_1.transports.File({
                    filename: '/var/log/api-gateway/auth.log',
                    level: 'warn'
                })
            ]
        });
    }
    setupMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)(SECURITY_CONFIG.cors));
        // Add custom security headers
        this.app.use(this.securityHeadersMiddleware);
        // Request logging
        this.app.use(this.requestLoggingMiddleware);
        // Input validation
        this.app.use(this.inputValidationMiddleware);
        // Increase limits to handle large requests
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // CORS and header configuration
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id, x-api-key');
            res.setHeader('Access-Control-Max-Age', '86400');
            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
                return;
            }
            next();
        });
        // Increase header size limit
        this.app.use((req, _res, next) => {
            // Set larger header size limit
            req.setMaxListeners(0);
            next();
        });
        // Global rate limiting
        const globalLimiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // limit each IP to 1000 requests per windowMs
            message: {
                error: 'Too many requests from this IP',
                message: 'Please try again later'
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                this.logger.warn('Rate limit exceeded', {
                    ip: req.ip,
                    path: req.path,
                    userAgent: req.get('User-Agent')
                });
                res.status(429).json({
                    error: 'Too many requests',
                    message: 'Rate limit exceeded. Please try again later.'
                });
            }
        });
        this.app.use('/api/v1', globalLimiter);
        // Authentication middleware
        this.app.use('/api/v1', this.authMiddleware);
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        // Integration test routes (no authentication required for testing)
        this.app.use('/api/integration-test', integration_test_routes_1.default);
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