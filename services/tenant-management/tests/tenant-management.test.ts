import request from 'supertest';
import { TenantManagementService } from '../src/tenant-management-service';
import { PrismaClient } from '@prisma/client';

describe('Tenant Management Service', () => {
  let service: TenantManagementService;
  let app: any;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Create service instance
    service = new TenantManagementService({
      name: 'tenant-management-test',
      port: 3009,
      version: '1.0.0',
      environment: 'test'
    });

    app = service['app'];
    prisma = service['prisma'];

    // Clean up test data
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.$disconnect();
  });

  describe('Health and Info Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('tenant-management-test');
    });

    it('should return service info', async () => {
      const response = await request(app).get('/info');
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('tenant-management-test');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('Tenant Management', () => {
    let testTenantId: string;

    it('should create a new tenant', async () => {
      const tenantData = {
        name: 'Test Company',
        configuration: {
          pricing: {
            defaultMarkup: 20,
            mapEnforcement: true
          },
          inventory: {
            lowStockThreshold: 15
          }
        }
      };

      const response = await request(app)
        .post('/api/v1/tenants')
        .send(tenantData);

      expect(response.status).toBe(201);
      expect(response.body.tenant).toBeDefined();
      expect(response.body.tenant.name).toBe('Test Company');
      expect(response.body.tenant.status).toBe('pending');

      testTenantId = response.body.tenant.id;
    });

    it('should not create tenant with duplicate name', async () => {
      const tenantData = {
        name: 'Test Company',
        configuration: {}
      };

      const response = await request(app)
        .post('/api/v1/tenants')
        .send(tenantData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Tenant with this name already exists');
    });

    it('should get all tenants', async () => {
      const response = await request(app).get('/api/v1/tenants');

      expect(response.status).toBe(200);
      expect(response.body.tenants).toBeDefined();
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should get specific tenant', async () => {
      const response = await request(app).get(`/api/v1/tenants/${testTenantId}`);

      expect(response.status).toBe(200);
      expect(response.body.tenant.id).toBe(testTenantId);
      expect(response.body.tenant.name).toBe('Test Company');
    });

    it('should update tenant', async () => {
      const updateData = {
        name: 'Updated Test Company',
        status: 'active'
      };

      const response = await request(app)
        .put(`/api/v1/tenants/${testTenantId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.tenant.name).toBe('Updated Test Company');
      expect(response.body.tenant.status).toBe('active');
    });

    it('should activate tenant', async () => {
      const response = await request(app)
        .post(`/api/v1/tenants/${testTenantId}/activate`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Tenant activated successfully');
    });

    it('should suspend tenant', async () => {
      const response = await request(app)
        .post(`/api/v1/tenants/${testTenantId}/suspend`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Tenant suspended successfully');
    });
  });

  describe('User Management', () => {
    let testTenantId: string;
    let testUserId: string;

    beforeAll(async () => {
      // Create a test tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: 'User Test Company',
          slug: 'user-test-company',
          status: 'active'
        }
      });
      testTenantId = tenant.id;
    });

    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        password: 'password123'
      };

      const response = await request(app)
        .post(`/api/v1/tenants/${testTenantId}/users`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('admin');

      testUserId = response.body.user.id;
    });

    it('should not create user with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'user',
        password: 'password123'
      };

      const response = await request(app)
        .post(`/api/v1/tenants/${testTenantId}/users`)
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User with this email already exists');
    });

    it('should get all users for tenant', async () => {
      const response = await request(app)
        .get(`/api/v1/tenants/${testTenantId}/users`);

      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should get specific user', async () => {
      const response = await request(app)
        .get(`/api/v1/tenants/${testTenantId}/users/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(testUserId);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should update user', async () => {
      const updateData = {
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        role: 'user'
      };

      const response = await request(app)
        .put(`/api/v1/tenants/${testTenantId}/users/${testUserId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.user.firstName).toBe('Updated John');
      expect(response.body.user.role).toBe('user');
    });

    it('should delete user', async () => {
      const response = await request(app)
        .delete(`/api/v1/tenants/${testTenantId}/users/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User deleted successfully');
    });
  });

  describe('Authentication', () => {
    let testTenantId: string;
    let testUserId: string;
    let authToken: string;

    beforeAll(async () => {
      // Create a test tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Auth Test Company',
          slug: 'auth-test-company',
          status: 'active'
        }
      });
      testTenantId = tenant.id;

      // Create a test user
      const user = await prisma.user.create({
        data: {
          tenantId: testTenantId,
          email: 'auth@example.com',
          firstName: 'Auth',
          lastName: 'User',
          role: 'admin'
        }
      });
      testUserId = user.id;
    });

    it('should register a new user', async () => {
      const registerData = {
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'user',
        password: 'password123',
        tenantId: testTenantId
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData);

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should login user', async () => {
      const loginData = {
        email: 'auth@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('auth@example.com');

      authToken = response.body.token;
    });

    it('should refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it('should logout user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('Configuration Management', () => {
    let testTenantId: string;

    beforeAll(async () => {
      // Create a test tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Config Test Company',
          slug: 'config-test-company',
          status: 'active',
          configuration: {
            pricing: {
              defaultMarkup: 15,
              competitivePricing: true
            },
            inventory: {
              lowStockThreshold: 10
            }
          }
        }
      });
      testTenantId = tenant.id;
    });

    it('should get tenant configuration', async () => {
      const response = await request(app)
        .get(`/api/v1/tenants/${testTenantId}/config`);

      expect(response.status).toBe(200);
      expect(response.body.configuration).toBeDefined();
      expect(response.body.configuration.pricing.defaultMarkup).toBe(15);
    });

    it('should update tenant configuration', async () => {
      const configUpdate = {
        configuration: {
          pricing: {
            defaultMarkup: 25,
            competitivePricing: true
          },
          notifications: {
            email: true,
            sms: true
          }
        }
      };

      const response = await request(app)
        .put(`/api/v1/tenants/${testTenantId}/config`)
        .send(configUpdate);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Tenant configuration updated successfully');
    });

    it('should get tenant usage', async () => {
      const response = await request(app)
        .get(`/api/v1/tenants/${testTenantId}/usage`);

      expect(response.status).toBe(200);
      expect(response.body.usage).toBeDefined();
      expect(response.body.usage.tenantId).toBe(testTenantId);
      expect(response.body.usage.productsCount).toBeDefined();
      expect(response.body.usage.usersCount).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tenant ID', async () => {
      const response = await request(app)
        .get('/api/v1/tenants/invalid-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Tenant not found');
    });

    it('should handle invalid user ID', async () => {
      const response = await request(app)
        .get('/api/v1/tenants/valid-tenant-id/users/invalid-user-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should handle invalid request data', async () => {
      const response = await request(app)
        .post('/api/v1/tenants')
        .send({ invalid: 'data' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request data');
    });
  });
}); 