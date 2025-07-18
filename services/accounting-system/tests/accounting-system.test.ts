import { AccountingSystemService } from '../src/accounting-system-service';

describe('Accounting System Service', () => {
  let service: AccountingSystemService;

  beforeEach(() => {
    service = new AccountingSystemService({
      name: 'Accounting System Service',
      port: 3007,
      version: '1.0.0',
      environment: 'test'
    });
  });

  describe('Service Configuration', () => {
    it('should initialize with correct configuration', () => {
      expect(service).toBeDefined();
      expect(service['config'].name).toBe('Accounting System Service');
      expect(service['config'].port).toBe(3007);
      expect(service['config'].version).toBe('1.0.0');
    });

    it('should have service description', () => {
      const description = service['getServiceDescription']();
      expect(description).toBe('Handle financial transactions and accounting');
    });

    it('should have required endpoints', () => {
      const endpoints = service['getServiceEndpoints']();
      expect(Array.isArray(endpoints)).toBe(true);
      expect(endpoints.length).toBeGreaterThan(0);
    });
  });

  describe('Service Methods', () => {
    it('should have accounting methods', () => {
      // Test that the service has the expected structure
      expect(typeof service['setupServiceRoutes']).toBe('function');
      expect(typeof service['getServiceDescription']).toBe('function');
      expect(typeof service['getServiceEndpoints']).toBe('function');
    });
  });
}); 