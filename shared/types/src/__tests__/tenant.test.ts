import { 
  TenantStatus, 
  TenantContext, 
  TenantContextSchema,
  CreateTenantRequestSchema,
  UpdateTenantRequestSchema 
} from '../tenant';

describe('Tenant Types', () => {
  describe('TenantStatus enum', () => {
    it('should have correct status values', () => {
      expect(TenantStatus.ACTIVE).toBe('active');
      expect(TenantStatus.SUSPENDED).toBe('suspended');
      expect(TenantStatus.TRIAL).toBe('trial');
      expect(TenantStatus.PENDING).toBe('pending');
      expect(TenantStatus.CANCELLED).toBe('cancelled');
    });
  });

  describe('TenantContext interface', () => {
    it('should have all required properties', () => {
      const tenant: TenantContext = {
        tenantId: 'test-id',
        name: 'Test Tenant',
        status: TenantStatus.ACTIVE,
        configuration: {
          marketplaces: [],
          vendors: [],
          pricing: {
            defaultMarkup: 15,
            mapEnforcement: true,
            governmentPricing: false,
            competitivePricing: false,
            autoRepricing: false,
          },
          inventory: {
            lowStockThreshold: 10,
            reorderPoint: 5,
            safetyStock: 20,
            autoReorder: false,
          },
          notifications: {
            email: true,
            sms: false,
            webhook: false,
          },
        },
        limits: {
          maxProducts: 1000,
          maxOrdersPerDay: 100,
          apiRateLimit: 1000,
          storageLimit: 1024,
          concurrentUsers: 10,
        },
        features: {
          aiEnabled: false,
          advancedAnalytics: false,
          automationEnabled: false,
          customIntegrations: false,
          multiCurrency: false,
          advancedReporting: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(tenant.tenantId).toBe('test-id');
      expect(tenant.name).toBe('Test Tenant');
      expect(tenant.status).toBe(TenantStatus.ACTIVE);
    });
  });

  describe('TenantContextSchema validation', () => {
    it('should validate a correct tenant context object', () => {
      const validTenant = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Tenant',
        status: 'active',
        configuration: {
          marketplaces: [],
          vendors: [],
          pricing: {
            defaultMarkup: 15,
            mapEnforcement: true,
            governmentPricing: false,
            competitivePricing: false,
            autoRepricing: false,
          },
          inventory: {
            lowStockThreshold: 10,
            reorderPoint: 5,
            safetyStock: 20,
            autoReorder: false,
          },
          notifications: {
            email: true,
            sms: false,
            webhook: false,
          },
        },
        limits: {
          maxProducts: 1000,
          maxOrdersPerDay: 100,
          apiRateLimit: 1000,
          storageLimit: 1024,
          concurrentUsers: 10,
        },
        features: {
          aiEnabled: false,
          advancedAnalytics: false,
          automationEnabled: false,
          customIntegrations: false,
          multiCurrency: false,
          advancedReporting: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = TenantContextSchema.safeParse(validTenant);
      expect(result.success).toBe(true);
    });

    it('should reject invalid tenant status', () => {
      const invalidTenant = {
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Tenant',
        status: 'invalid-status',
        configuration: {
          marketplaces: [],
          vendors: [],
          pricing: {
            defaultMarkup: 15,
            mapEnforcement: true,
            governmentPricing: false,
            competitivePricing: false,
            autoRepricing: false,
          },
          inventory: {
            lowStockThreshold: 10,
            reorderPoint: 5,
            safetyStock: 20,
            autoReorder: false,
          },
          notifications: {
            email: true,
            sms: false,
            webhook: false,
          },
        },
        limits: {
          maxProducts: 1000,
          maxOrdersPerDay: 100,
          apiRateLimit: 1000,
          storageLimit: 1024,
          concurrentUsers: 10,
        },
        features: {
          aiEnabled: false,
          advancedAnalytics: false,
          automationEnabled: false,
          customIntegrations: false,
          multiCurrency: false,
          advancedReporting: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = TenantContextSchema.safeParse(invalidTenant);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('status');
      }
    });
  });

  describe('CreateTenantRequestSchema validation', () => {
    it('should validate a correct create tenant request', () => {
      const validRequest = {
        name: 'New Tenant',
        configuration: {
          pricing: {
            defaultMarkup: 20,
            mapEnforcement: true,
          },
        },
      };

      const result = CreateTenantRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('UpdateTenantRequestSchema validation', () => {
    it('should validate a correct update tenant request', () => {
      const validRequest = {
        name: 'Updated Tenant Name',
        status: 'active',
      };

      const result = UpdateTenantRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });
}); 