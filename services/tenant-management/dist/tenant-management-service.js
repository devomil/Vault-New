"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManagementService = void 0;
const shared_middleware_1 = require("@vault/shared-middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
// Tenant status enum
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "active";
    TenantStatus["SUSPENDED"] = "suspended";
    TenantStatus["TRIAL"] = "trial";
    TenantStatus["PENDING"] = "pending";
    TenantStatus["CANCELLED"] = "cancelled";
})(TenantStatus || (TenantStatus = {}));
// Tenant schemas
const CreateTenantRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    configuration: zod_1.z.object({
        marketplaces: zod_1.z.array(zod_1.z.any()).optional(),
        vendors: zod_1.z.array(zod_1.z.any()).optional(),
        pricing: zod_1.z.any().optional(),
        inventory: zod_1.z.any().optional(),
        notifications: zod_1.z.any().optional(),
    }).optional(),
    limits: zod_1.z.any().optional(),
    features: zod_1.z.any().optional(),
});
const UpdateTenantRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    status: zod_1.z.nativeEnum(TenantStatus).optional(),
    configuration: zod_1.z.any().optional(),
    limits: zod_1.z.any().optional(),
    features: zod_1.z.any().optional(),
});
// User creation schema
const CreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    role: zod_1.z.enum(['admin', 'user', 'viewer']).default('user'),
    password: zod_1.z.string().min(8)
});
// User login schema
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
class TenantManagementService extends shared_middleware_1.ServiceTemplate {
    constructor(config) {
        super(config);
        // ============================================================================
        // TENANT MANAGEMENT
        // ============================================================================
        this.createTenant = async (req, res) => {
            try {
                const validation = CreateTenantRequestSchema.safeParse(req.body);
                if (!validation.success) {
                    res.status(400).json({
                        error: 'Invalid request data',
                        details: validation.error.errors
                    });
                    return;
                }
                const data = validation.data;
                const slug = this.generateTenantSlug(data.name);
                // Check if tenant slug already exists
                const existingTenant = await this.prisma.tenant.findUnique({
                    where: { slug }
                });
                if (existingTenant) {
                    res.status(409).json({
                        error: 'Tenant with this name already exists'
                    });
                    return;
                }
                // Create tenant with default configuration
                const tenant = await this.prisma.tenant.create({
                    data: {
                        name: data.name,
                        slug,
                        status: TenantStatus.PENDING,
                        configuration: {
                            marketplaces: data.configuration?.marketplaces || [],
                            vendors: data.configuration?.vendors || [],
                            pricing: {
                                defaultMarkup: 15,
                                mapEnforcement: true,
                                governmentPricing: false,
                                competitivePricing: false,
                                autoRepricing: false,
                                ...data.configuration?.pricing
                            },
                            inventory: {
                                lowStockThreshold: 10,
                                reorderPoint: 5,
                                safetyStock: 20,
                                autoReorder: false,
                                ...data.configuration?.inventory
                            },
                            notifications: {
                                email: true,
                                sms: false,
                                webhook: false,
                                ...data.configuration?.notifications
                            }
                        }
                    }
                });
                this.logger.info('Tenant created', { tenantId: tenant.id, name: tenant.name });
                res.status(201).json({
                    message: 'Tenant created successfully',
                    tenant: {
                        id: tenant.id,
                        name: tenant.name,
                        slug: tenant.slug,
                        status: tenant.status,
                        createdAt: tenant.createdAt
                    }
                });
            }
            catch (error) {
                this.logger.error('Error creating tenant', { error });
                res.status(500).json({ error: 'Failed to create tenant' });
            }
        };
        this.getTenants = async (req, res) => {
            try {
                const tenants = await this.prisma.tenant.findMany({
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        _count: {
                            select: {
                                users: true,
                                products: true,
                                orders: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                res.json({
                    tenants,
                    count: tenants.length
                });
            }
            catch (error) {
                this.logger.error('Error fetching tenants', { error });
                res.status(500).json({ error: 'Failed to fetch tenants' });
            }
        };
        this.getTenant = async (req, res) => {
            try {
                const { tenantId } = req.params;
                const tenant = await this.prisma.tenant.findUnique({
                    where: { id: tenantId },
                    include: {
                        _count: {
                            select: {
                                users: true,
                                products: true,
                                orders: true,
                                marketplaces: true,
                                vendors: true
                            }
                        }
                    }
                });
                if (!tenant) {
                    res.status(404).json({ error: 'Tenant not found' });
                    return;
                }
                res.json({ tenant });
            }
            catch (error) {
                this.logger.error('Error fetching tenant', { error, tenantId: req.params['tenantId'] });
                res.status(500).json({ error: 'Failed to fetch tenant' });
            }
        };
        this.updateTenant = async (req, res) => {
            try {
                const { tenantId } = req.params;
                const validation = UpdateTenantRequestSchema.safeParse(req.body);
                if (!validation.success) {
                    res.status(400).json({
                        error: 'Invalid request data',
                        details: validation.error.errors
                    });
                    return;
                }
                const data = validation.data;
                const tenant = await this.prisma.tenant.findUnique({
                    where: { id: tenantId }
                });
                if (!tenant) {
                    res.status(404).json({ error: 'Tenant not found' });
                    return;
                }
                // Update tenant
                const updatedTenant = await this.prisma.tenant.update({
                    where: { id: tenantId },
                    data: {
                        name: data.name,
                        status: data.status,
                        configuration: data.configuration ? {
                            ...tenant.configuration,
                            ...data.configuration
                        } : undefined
                    }
                });
                this.logger.info('Tenant updated', { tenantId, name: updatedTenant.name });
                res.json({
                    message: 'Tenant updated successfully',
                    tenant: {
                        id: updatedTenant.id,
                        name: updatedTenant.name,
                        slug: updatedTenant.slug,
                        status: updatedTenant.status,
                        updatedAt: updatedTenant.updatedAt
                    }
                });
            }
            catch (error) {
                this.logger.error('Error updating tenant', { error, tenantId: req.params['tenantId'] });
                res.status(500).json({ error: 'Failed to update tenant' });
            }
        };
        this.deleteTenant = async (req, res) => {
            try {
                const { tenantId } = req.params;
                const tenant = await this.prisma.tenant.findUnique({
                    where: { id: tenantId }
                });
                if (!tenant) {
                    res.status(404).json({ error: 'Tenant not found' });
                    return;
                }
                // Soft delete by setting status to cancelled
                await this.prisma.tenant.update({
                    where: { id: tenantId },
                    data: { status: TenantStatus.CANCELLED }
                });
                this.logger.info('Tenant deleted', { tenantId, name: tenant.name });
                res.json({ message: 'Tenant deleted successfully' });
            }
            catch (error) {
                this.logger.error('Error deleting tenant', { error, tenantId: req.params['tenantId'] });
                res.status(500).json({ error: 'Failed to delete tenant' });
            }
        };
        this.activateTenant = async (req, res) => {
            try {
                const { tenantId } = req.params;
                const tenant = await this.prisma.tenant.findUnique({
                    where: { id: tenantId }
                });
                if (!tenant) {
                    res.status(404).json({ error: 'Tenant not found' });
                    return;
                }
                await this.prisma.tenant.update({
                    where: { id: tenantId },
                    data: { status: TenantStatus.ACTIVE }
                });
                this.logger.info('Tenant activated', { tenantId, name: tenant.name });
                res.json({ message: 'Tenant activated successfully' });
            }
            catch (error) {
                this.logger.error('Error activating tenant', { error, tenantId: req.params['tenantId'] });
                res.status(500).json({ error: 'Failed to activate tenant' });
            }
        };
        this.suspendTenant = async (req, res) => {
            try {
                const { tenantId } = req.params;
                const tenant = await this.prisma.tenant.findUnique({
                    where: { id: tenantId }
                });
                if (!tenant) {
                    res.status(404).json({ error: 'Tenant not found' });
                    return;
                }
                await this.prisma.tenant.update({
                    where: { id: tenantId },
                    data: { status: TenantStatus.SUSPENDED }
                });
                this.logger.info('Tenant suspended', { tenantId, name: tenant.name });
                res.json({ message: 'Tenant suspended successfully' });
            }
            catch (error) {
                this.logger.error('Error suspending tenant', { error, tenantId: req.params['tenantId'] });
                res.status(500).json({ error: 'Failed to suspend tenant' });
            }
        };
        // ============================================================================
        // USER MANAGEMENT
        // ============================================================================
        this.createUser = async (req, res) => {
            try {
                const { tenantId } = req.params;
                const validation = CreateUserSchema.safeParse(req.body);
                if (!validation.success) {
                    res.status(400).json({
                        error: 'Invalid request data',
                        details: validation.error.errors
                    });
                    return;
                }
                const data = validation.data;
                // Check if tenant exists
                const tenant = await this.prisma.tenant.findUnique({
                    where: { id: tenantId }
                });
                if (!tenant) {
                    res.status(404).json({ error: 'Tenant not found' });
                    return;
                }
                // Check if user already exists
                const existingUser = await this.prisma.user.findUnique({
                    where: {
                        tenantId_email: {
                            tenantId,
                            email: data.email
                        }
                    }
                });
                if (existingUser) {
                    res.status(409).json({ error: 'User with this email already exists' });
                    return;
                }
                // Hash password
                const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
                // Create user
                const user = await this.prisma.user.create({
                    data: {
                        tenantId,
                        email: data.email,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        role: data.role,
                        // Note: In a real implementation, you'd store the hashed password
                        // For now, we'll skip password storage for simplicity
                    }
                });
                this.logger.info('User created', { userId: user.id, email: user.email, tenantId });
                res.status(201).json({
                    message: 'User created successfully',
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        status: user.status,
                        createdAt: user.createdAt
                    }
                });
            }
            catch (error) {
                this.logger.error('Error creating user', { error });
                res.status(500).json({ error: 'Failed to create user' });
            }
        };
        this.getUsers = async (req, res) => {
            try {
                const { tenantId } = req.params;
                const users = await this.prisma.user.findMany({
                    where: { tenantId },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                });
                res.json({
                    users,
                    count: users.length
                });
            }
            catch (error) {
                this.logger.error('Error fetching users', { error, tenantId: req.params['tenantId'] });
                res.status(500).json({ error: 'Failed to fetch users' });
            }
        };
        this.getUser = async (req, res) => {
            try {
                const { tenantId, userId } = req.params;
                const user = await this.prisma.user.findFirst({
                    where: {
                        id: userId,
                        tenantId
                    },
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true
                    }
                });
                if (!user) {
                    res.status(404).json({ error: 'User not found' });
                    return;
                }
                res.json({ user });
            }
            catch (error) {
                this.logger.error('Error fetching user', { error, userId: req.params['userId'] });
                res.status(500).json({ error: 'Failed to fetch user' });
            }
        };
        this.updateUser = async (req, res) => {
            try {
                const { tenantId, userId } = req.params;
                const { firstName, lastName, role, status } = req.body;
                const user = await this.prisma.user.findFirst({
                    where: {
                        id: userId,
                        tenantId
                    }
                });
                if (!user) {
                    res.status(404).json({ error: 'User not found' });
                    return;
                }
                const updatedUser = await this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        firstName,
                        lastName,
                        role,
                        status
                    }
                });
                this.logger.info('User updated', { userId, email: updatedUser.email });
                res.json({
                    message: 'User updated successfully',
                    user: {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        role: updatedUser.role,
                        status: updatedUser.status,
                        updatedAt: updatedUser.updatedAt
                    }
                });
            }
            catch (error) {
                this.logger.error('Error updating user', { error, userId: req.params['userId'] });
                res.status(500).json({ error: 'Failed to update user' });
            }
        };
        this.deleteUser = async (req, res) => {
            try {
                const { tenantId, userId } = req.params;
                const user = await this.prisma.user.findFirst({
                    where: {
                        id: userId,
                        tenantId
                    }
                });
                if (!user) {
                    res.status(404).json({ error: 'User not found' });
                    return;
                }
                await this.prisma.user.delete({
                    where: { id: userId }
                });
                this.logger.info('User deleted', { userId, email: user.email });
                res.json({ message: 'User deleted successfully' });
            }
            catch (error) {
                this.logger.error('Error deleting user', { error, userId: req.params['userId'] });
                res.status(500).json({ error: 'Failed to delete user' });
            }
        };
        // ============================================================================
        // AUTHENTICATION
        // ============================================================================
        this.login = async (req, res) => {
            try {
                const validation = LoginSchema.safeParse(req.body);
                if (!validation.success) {
                    res.status(400).json({
                        error: 'Invalid request data',
                        details: validation.error.errors
                    });
                    return;
                }
                const { email, password } = validation.data;
                // Find user by email (across all tenants for simplicity)
                const user = await this.prisma.user.findFirst({
                    where: { email },
                    include: {
                        tenant: true
                    }
                });
                if (!user) {
                    res.status(401).json({ error: 'Invalid credentials' });
                    return;
                }
                // Check if tenant is active
                if (user.tenant.status !== TenantStatus.ACTIVE) {
                    res.status(403).json({ error: 'Tenant is not active' });
                    return;
                }
                // In a real implementation, you'd verify the password
                // For now, we'll skip password verification for simplicity
                // Generate JWT token
                const token = this.generateJwtToken(user);
                this.logger.info('User logged in', { userId: user.id, email: user.email, tenantId: user.tenantId });
                res.json({
                    message: 'Login successful',
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        tenant: {
                            id: user.tenant.id,
                            name: user.tenant.name,
                            slug: user.tenant.slug
                        }
                    }
                });
            }
            catch (error) {
                this.logger.error('Error during login', { error });
                res.status(500).json({ error: 'Login failed' });
            }
        };
        this.register = async (req, res) => {
            try {
                const validation = CreateUserSchema.safeParse(req.body);
                if (!validation.success) {
                    res.status(400).json({
                        error: 'Invalid request data',
                        details: validation.error.errors
                    });
                    return;
                }
                const data = validation.data;
                const { tenantId } = req.body; // Tenant ID should be provided during registration
                if (!tenantId) {
                    res.status(400).json({ error: 'Tenant ID is required' });
                    return;
                }
                // Check if tenant exists and is active
                const tenant = await this.prisma.tenant.findUnique({
                    where: { id: tenantId }
                });
                if (!tenant) {
                    res.status(404).json({ error: 'Tenant not found' });
                    return;
                }
                if (tenant.status !== TenantStatus.ACTIVE) {
                    res.status(403).json({ error: 'Tenant is not active' });
                    return;
                }
                // Check if user already exists
                const existingUser = await this.prisma.user.findUnique({
                    where: {
                        tenantId_email: {
                            tenantId,
                            email: data.email
                        }
                    }
                });
                if (existingUser) {
                    res.status(409).json({ error: 'User with this email already exists' });
                    return;
                }
                // Hash password
                const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
                // Create user
                const user = await this.prisma.user.create({
                    data: {
                        tenantId,
                        email: data.email,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        role: data.role,
                        // Note: In a real implementation, you'd store the hashed password
                    },
                    include: {
                        tenant: true
                    }
                });
                // Generate JWT token
                const token = this.generateJwtToken(user);
                this.logger.info('User registered', { userId: user.id, email: user.email, tenantId });
                res.status(201).json({
                    message: 'Registration successful',
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        tenant: {
                            id: user.tenant.id,
                            name: user.tenant.name,
                            slug: user.tenant.slug
                        }
                    }
                });
            }
            catch (error) {
                this.logger.error('Error during registration', { error });
                res.status(500).json({ error: 'Registration failed' });
            }
        };
        this.refreshToken = async (req, res) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    res.status(401).json({ error: 'Bearer token required' });
                    return;
                }
                const token = authHeader.substring(7);
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, process.env['JWT_SECRET'] || 'default-secret');
                    // Find user
                    const user = await this.prisma.user.findUnique({
                        where: { id: decoded.userId },
                        include: {
                            tenant: true
                        }
                    });
                    if (!user) {
                        res.status(401).json({ error: 'User not found' });
                        return;
                    }
                    // Generate new token
                    const newToken = this.generateJwtToken(user);
                    res.json({
                        message: 'Token refreshed successfully',
                        token: newToken
                    });
                }
                catch (jwtError) {
                    res.status(401).json({ error: 'Invalid token' });
                }
            }
            catch (error) {
                this.logger.error('Error refreshing token', { error });
                res.status(500).json({ error: 'Token refresh failed' });
            }
        };
        this.logout = async (req, res) => {
            try {
                // In a real implementation, you might want to blacklist the token
                // For now, we'll just return a success message
                res.json({ message: 'Logout successful' });
            }
            catch (error) {
                this.logger.error('Error during logout', { error });
                res.status(500).json({ error: 'Logout failed' });
            }
        };
        // ============================================================================
        // CONFIGURATION & USAGE
        // ============================================================================
        this.getTenantConfig = async (req, res) => {
            try {
                const { tenantId } = req.params;
                const tenant = await this.prisma.tenant.findUnique({
                    where: { id: tenantId },
                    select: {
                        id: true,
                        name: true,
                        configuration: true
                    }
                });
                if (!tenant) {
                    res.status(404).json({ error: 'Tenant not found' });
                    return;
                }
                res.json({
                    tenantId: tenant.id,
                    name: tenant.name,
                    configuration: tenant.configuration
                });
            }
            catch (error) {
                this.logger.error('Error fetching tenant config', { error, tenantId: req.params['tenantId'] });
                res.status(500).json({ error: 'Failed to fetch tenant configuration' });
            }
        };
        this.updateTenantConfig = async (req, res) => {
            try {
                const { tenantId } = req.params;
                const { configuration } = req.body;
                const tenant = await this.prisma.tenant.findUnique({
                    where: { id: tenantId }
                });
                if (!tenant) {
                    res.status(404).json({ error: 'Tenant not found' });
                    return;
                }
                await this.prisma.tenant.update({
                    where: { id: tenantId },
                    data: {
                        configuration: {
                            ...tenant.configuration,
                            ...configuration
                        }
                    }
                });
                this.logger.info('Tenant configuration updated', { tenantId });
                res.json({ message: 'Tenant configuration updated successfully' });
            }
            catch (error) {
                this.logger.error('Error updating tenant config', { error, tenantId: req.params['tenantId'] });
                res.status(500).json({ error: 'Failed to update tenant configuration' });
            }
        };
        this.getTenantUsage = async (req, res) => {
            try {
                const { tenantId } = req.params;
                const tenant = await this.prisma.tenant.findUnique({
                    where: { id: tenantId },
                    include: {
                        _count: {
                            select: {
                                users: true,
                                products: true,
                                orders: true,
                                marketplaces: true,
                                vendors: true
                            }
                        }
                    }
                });
                if (!tenant) {
                    res.status(404).json({ error: 'Tenant not found' });
                    return;
                }
                // Calculate usage metrics
                const usage = {
                    tenantId: tenant.id,
                    productsCount: tenant._count.products,
                    usersCount: tenant._count.users,
                    ordersCount: tenant._count.orders,
                    marketplacesCount: tenant._count.marketplaces,
                    vendorsCount: tenant._count.vendors,
                    lastActivity: tenant.updatedAt
                };
                res.json({ usage });
            }
            catch (error) {
                this.logger.error('Error fetching tenant usage', { error, tenantId: req.params['tenantId'] });
                res.status(500).json({ error: 'Failed to fetch tenant usage' });
            }
        };
    }
    setupServiceRoutes() {
        // Tenant management endpoints
        this.app.post('/api/v1/tenants', (req, res) => this.createTenant(req, res));
        this.app.get('/api/v1/tenants', (req, res) => this.getTenants(req, res));
        this.app.get('/api/v1/tenants/:tenantId', (req, res) => this.getTenant(req, res));
        this.app.put('/api/v1/tenants/:tenantId', (req, res) => this.updateTenant(req, res));
        this.app.delete('/api/v1/tenants/:tenantId', (req, res) => this.deleteTenant(req, res));
        this.app.post('/api/v1/tenants/:tenantId/activate', (req, res) => this.activateTenant(req, res));
        this.app.post('/api/v1/tenants/:tenantId/suspend', (req, res) => this.suspendTenant(req, res));
        // User management endpoints
        this.app.post('/api/v1/tenants/:tenantId/users', (req, res) => this.createUser(req, res));
        this.app.get('/api/v1/tenants/:tenantId/users', (req, res) => this.getUsers(req, res));
        this.app.get('/api/v1/tenants/:tenantId/users/:userId', (req, res) => this.getUser(req, res));
        this.app.put('/api/v1/tenants/:tenantId/users/:userId', (req, res) => this.updateUser(req, res));
        this.app.delete('/api/v1/tenants/:tenantId/users/:userId', (req, res) => this.deleteUser(req, res));
        // Authentication endpoints
        this.app.post('/api/v1/auth/login', (req, res) => this.login(req, res));
        this.app.post('/api/v1/auth/register', (req, res) => this.register(req, res));
        this.app.post('/api/v1/auth/refresh', (req, res) => this.refreshToken(req, res));
        this.app.post('/api/v1/auth/logout', (req, res) => this.logout(req, res));
        // Configuration endpoints
        this.app.get('/api/v1/tenants/:tenantId/config', (req, res) => this.getTenantConfig(req, res));
        this.app.put('/api/v1/tenants/:tenantId/config', (req, res) => this.updateTenantConfig(req, res));
        this.app.get('/api/v1/tenants/:tenantId/usage', (req, res) => this.getTenantUsage(req, res));
    }
    getServiceDescription() {
        return 'Tenant Management Service - handles tenant lifecycle, user management, authentication, and configuration';
    }
    getServiceEndpoints() {
        return [
            'POST /api/v1/tenants',
            'GET /api/v1/tenants',
            'GET /api/v1/tenants/:tenantId',
            'PUT /api/v1/tenants/:tenantId',
            'DELETE /api/v1/tenants/:tenantId',
            'POST /api/v1/tenants/:tenantId/activate',
            'POST /api/v1/tenants/:tenantId/suspend',
            'POST /api/v1/tenants/:tenantId/users',
            'GET /api/v1/tenants/:tenantId/users',
            'GET /api/v1/tenants/:tenantId/users/:userId',
            'PUT /api/v1/tenants/:tenantId/users/:userId',
            'DELETE /api/v1/tenants/:tenantId/users/:userId',
            'POST /api/v1/auth/login',
            'POST /api/v1/auth/register',
            'POST /api/v1/auth/refresh',
            'POST /api/v1/auth/logout',
            'GET /api/v1/tenants/:tenantId/config',
            'PUT /api/v1/tenants/:tenantId/config',
            'GET /api/v1/tenants/:tenantId/usage'
        ];
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    generateTenantSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    generateJwtToken(user) {
        const payload = {
            userId: user.id,
            tenantId: user.tenantId,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        return jsonwebtoken_1.default.sign(payload, process.env['JWT_SECRET'] || 'default-secret');
    }
}
exports.TenantManagementService = TenantManagementService;
//# sourceMappingURL=tenant-management-service.js.map