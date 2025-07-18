import request from 'supertest';
import app from '../src/index';
import { AuthenticationService } from '../src/auth/authentication-service';
import { AuthorizationService } from '../src/auth/authorization-service';
import { AuditService } from '../src/audit/audit-service';
import { ComplianceService } from '../src/compliance/compliance-service';
import { EncryptionService } from '../src/encryption/encryption-service';

describe('Security & Compliance Service', () => {
  let authService: AuthenticationService;
  let authzService: AuthorizationService;
  let auditService: AuditService;
  let complianceService: ComplianceService;
  let encryptionService: EncryptionService;

  beforeEach(() => {
    authService = new AuthenticationService();
    authzService = new AuthorizationService();
    auditService = new AuditService();
    complianceService = new ComplianceService();
    encryptionService = new EncryptionService();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'security-compliance');
    });
  });

  describe('Authentication Service', () => {
    describe('login', () => {
      it('should authenticate valid user', async () => {
        const result = await authService.login('admin', 'password', 'tenant-001');
        expect(result.success).toBe(true);
        expect(result.token).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(result.user).toBeDefined();
        expect(result.user?.username).toBe('admin');
      });

      it('should reject invalid credentials', async () => {
        const result = await authService.login('invalid', 'wrong', 'tenant-001');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid credentials');
      });

      it('should reject user from wrong tenant', async () => {
        const result = await authService.login('admin', 'password', 'tenant-999');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid credentials');
      });
    });

    describe('token validation', () => {
      it('should validate valid token', async () => {
        const loginResult = await authService.login('admin', 'password', 'tenant-001');
        const validationResult = await authService.validateToken(loginResult.token!, 'tenant-001');
        expect(validationResult.valid).toBe(true);
        expect(validationResult.user).toBeDefined();
      });

      it('should reject invalid token', async () => {
        const result = await authService.validateToken('invalid-token', 'tenant-001');
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('token refresh', () => {
      it('should refresh valid token', async () => {
        const loginResult = await authService.login('admin', 'password', 'tenant-001');
        const refreshResult = await authService.refreshToken(loginResult.refreshToken!, 'tenant-001');
        expect(refreshResult.success).toBe(true);
        expect(refreshResult.token).toBeDefined();
        expect(refreshResult.refreshToken).toBeDefined();
      });

      it('should reject invalid refresh token', async () => {
        const result = await authService.refreshToken('invalid-refresh-token', 'tenant-001');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Authorization Service', () => {
    describe('permission checking', () => {
      it('should allow admin access to all resources', async () => {
        const result = await authzService.checkPermission('admin-token', 'any-resource', 'any-action', 'tenant-001');
        expect(result.allowed).toBe(true);
      });

      it('should deny unauthorized access', async () => {
        const result = await authzService.checkPermission('user-token', 'admin-panel', 'access', 'tenant-001');
        expect(result.allowed).toBe(false);
        expect(result.reason).toBeDefined();
      });
    });

    describe('role management', () => {
      it('should get roles for tenant', async () => {
        const roles = await authzService.getRoles('tenant-001');
        expect(roles).toBeInstanceOf(Array);
        expect(roles.length).toBeGreaterThan(0);
        expect(roles[0]).toHaveProperty('name');
        expect(roles[0]).toHaveProperty('permissions');
      });

      it('should create new role', async () => {
        const result = await authzService.createRole('test-role', ['perm-001'], 'tenant-001');
        expect(result.success).toBe(true);
        expect(result.role).toBeDefined();
        expect(result.role?.name).toBe('test-role');
      });
    });
  });

  describe('Audit Service', () => {
    describe('event logging', () => {
      it('should log audit event', async () => {
        await auditService.logEvent('TEST_EVENT', {
          tenantId: 'tenant-001',
          userId: 'user-001',
          details: 'Test event details'
        });
        
        const events = await auditService.getEvents({ tenantId: 'tenant-001' });
        const testEvent = events.find(e => e.eventType === 'TEST_EVENT');
        expect(testEvent).toBeDefined();
        expect(testEvent?.tenantId).toBe('tenant-001');
      });
    });

    describe('event retrieval', () => {
      it('should get events with filters', async () => {
        const events = await auditService.getEvents({
          tenantId: 'tenant-001',
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          limit: 10
        });
        expect(events).toBeInstanceOf(Array);
        expect(events.length).toBeLessThanOrEqual(10);
      });
    });

    describe('security threats', () => {
      it('should get security threats', async () => {
        const threats = await auditService.getSecurityThreats({
          tenantId: 'tenant-001',
          severity: 'high'
        });
        expect(threats).toBeInstanceOf(Array);
      });
    });

    describe('security alerts', () => {
      it('should get security alerts', async () => {
        const alerts = await auditService.getSecurityAlerts('tenant-001', 'active');
        expect(alerts).toBeInstanceOf(Array);
      });
    });

    describe('security reports', () => {
      it('should generate security report', async () => {
        const report = await auditService.generateSecurityReport({
          tenantId: 'tenant-001',
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        });
        
        expect(report).toHaveProperty('period');
        expect(report).toHaveProperty('summary');
        expect(report).toHaveProperty('threats');
        expect(report).toHaveProperty('alerts');
        expect(report).toHaveProperty('recommendations');
      });
    });
  });

  describe('Compliance Service', () => {
    describe('compliance status', () => {
      it('should get compliance status for all frameworks', async () => {
        const statuses = await complianceService.getComplianceStatus('tenant-001');
        expect(statuses).toBeInstanceOf(Array);
        expect(statuses.length).toBeGreaterThan(0);
        
        const gdprStatus = statuses.find(s => s.framework === 'GDPR');
        expect(gdprStatus).toBeDefined();
        expect(gdprStatus).toHaveProperty('complianceScore');
        expect(gdprStatus).toHaveProperty('overallStatus');
      });
    });

    describe('compliance checks', () => {
      it('should get compliance checks for framework', async () => {
        const checks = await complianceService.getComplianceChecks('tenant-001', 'GDPR');
        expect(checks).toBeInstanceOf(Array);
        expect(checks.length).toBeGreaterThan(0);
        expect(checks[0]).toHaveProperty('framework', 'GDPR');
      });

      it('should run compliance checks', async () => {
        const result = await complianceService.runComplianceChecks('tenant-001', 'GDPR');
        expect(result.success).toBe(true);
        expect(result.results).toBeInstanceOf(Array);
        expect(result.results.length).toBeGreaterThan(0);
      });
    });

    describe('compliance reports', () => {
      it('should get compliance reports', async () => {
        const reports = await complianceService.getComplianceReports({
          tenantId: 'tenant-001',
          framework: 'GDPR'
        });
        expect(reports).toBeInstanceOf(Array);
      });

      it('should generate compliance report', async () => {
        const result = await complianceService.generateComplianceReport('tenant-001', 'GDPR');
        expect(result.success).toBe(true);
        expect(result.report).toBeDefined();
        expect(result.report).toHaveProperty('framework', 'GDPR');
        expect(result.report).toHaveProperty('status');
        expect(result.report).toHaveProperty('checks');
        expect(result.report).toHaveProperty('recommendations');
      });
    });
  });

  describe('Encryption Service', () => {
    describe('encryption and decryption', () => {
      it('should encrypt and decrypt data with AES key', async () => {
        const testData = 'sensitive data to encrypt';
        const keyId = 'key-001';
        const tenantId = 'tenant-001';

        const encrypted = await encryptionService.encrypt(testData, keyId, tenantId);
        expect(encrypted).toHaveProperty('encryptedData');
        expect(encrypted).toHaveProperty('keyId', keyId);
        expect(encrypted).toHaveProperty('algorithm');

        const decrypted = await encryptionService.decrypt(encrypted, keyId, tenantId);
        expect(decrypted).toBe(testData);
      });

      it('should reject encryption with invalid key', async () => {
        await expect(
          encryptionService.encrypt('test', 'invalid-key', 'tenant-001')
        ).rejects.toThrow('Invalid or inactive encryption key');
      });
    });

    describe('key management', () => {
      it('should get encryption keys for tenant', async () => {
        const keys = await encryptionService.getKeys('tenant-001');
        expect(keys).toBeInstanceOf(Array);
        expect(keys.length).toBeGreaterThan(0);
        expect(keys[0]).toHaveProperty('tenantId', 'tenant-001');
      });

      it('should create new encryption key', async () => {
        const result = await encryptionService.createKey('test-key', 'AES-256', 'tenant-001');
        expect(result.success).toBe(true);
        expect(result.key).toBeDefined();
        expect(result.key?.name).toBe('test-key');
        expect(result.key?.type).toBe('AES-256');
      });

      it('should rotate encryption key', async () => {
        const result = await encryptionService.rotateKey('key-001', 'tenant-001');
        expect(result.success).toBe(true);
        expect(result.newKeyId).toBeDefined();
      });

      it('should deactivate encryption key', async () => {
        const result = await encryptionService.deactivateKey('key-001', 'tenant-001');
        expect(result.success).toBe(true);
      });
    });

    describe('key status', () => {
      it('should get key status', async () => {
        const result = await encryptionService.getKeyStatus('key-001', 'tenant-001');
        expect(result.success).toBe(true);
        expect(result.status).toBeDefined();
        expect(result.status).toHaveProperty('id', 'key-001');
        expect(result.status).toHaveProperty('isActive');
      });
    });
  });

  describe('API Endpoints', () => {
    describe('Authentication endpoints', () => {
      it('POST /api/v1/auth/login should authenticate user', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({
            username: 'admin',
            password: 'password',
            tenantId: 'tenant-001'
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
      });

      it('POST /api/v1/auth/validate should validate token', async () => {
        const loginResponse = await request(app)
          .post('/api/v1/auth/login')
          .send({
            username: 'admin',
            password: 'password',
            tenantId: 'tenant-001'
          });

        const response = await request(app)
          .post('/api/v1/auth/validate')
          .send({
            token: loginResponse.body.token,
            tenantId: 'tenant-001'
          });

        expect(response.status).toBe(200);
        expect(response.body.valid).toBe(true);
      });
    });

    describe('Authorization endpoints', () => {
      it('GET /api/v1/auth/roles should get roles', async () => {
        const response = await request(app)
          .get('/api/v1/auth/roles?tenantId=tenant-001');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('Audit endpoints', () => {
      it('GET /api/v1/audit/events should get audit events', async () => {
        const response = await request(app)
          .get('/api/v1/audit/events?tenantId=tenant-001&limit=10');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('GET /api/v1/audit/reports/security should get security report', async () => {
        const response = await request(app)
          .get('/api/v1/audit/reports/security?tenantId=tenant-001');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('summary');
      });
    });

    describe('Compliance endpoints', () => {
      it('GET /api/v1/compliance/status should get compliance status', async () => {
        const response = await request(app)
          .get('/api/v1/compliance/status?tenantId=tenant-001');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('GET /api/v1/compliance/checks should get compliance checks', async () => {
        const response = await request(app)
          .get('/api/v1/compliance/checks?tenantId=tenant-001&framework=GDPR');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('Encryption endpoints', () => {
      it('GET /api/v1/encryption/keys should get encryption keys', async () => {
        const response = await request(app)
          .get('/api/v1/encryption/keys?tenantId=tenant-001');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('POST /api/v1/encryption/encrypt should encrypt data', async () => {
        const response = await request(app)
          .post('/api/v1/encryption/encrypt')
          .send({
            data: 'test data',
            keyId: 'key-001',
            tenantId: 'tenant-001'
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('encryptedData');
      });
    });

    describe('Security monitoring endpoints', () => {
      it('GET /api/v1/security/threats should get security threats', async () => {
        const response = await request(app)
          .get('/api/v1/security/threats?tenantId=tenant-001');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('GET /api/v1/security/alerts should get security alerts', async () => {
        const response = await request(app)
          .get('/api/v1/security/alerts?tenantId=tenant-001');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes', async () => {
      const response = await request(app).get('/api/v1/invalid-route');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should handle server errors gracefully', async () => {
      // Test error handling by accessing a non-existent endpoint that would cause a 500 error
      const response = await request(app)
        .post('/api/v1/encryption/encrypt')
        .send({
          data: null, // This should cause a validation error
          keyId: 'invalid-key',
          tenantId: 'tenant-001'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 