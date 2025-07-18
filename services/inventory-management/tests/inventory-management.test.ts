import { InventoryManagementService } from '../src/inventory-management-service';

describe('Inventory Management Service', () => {
  let service: InventoryManagementService;

  beforeEach(() => {
    service = new InventoryManagementService({
      name: 'Inventory Management Service',
      port: 3006,
      version: '1.0.0',
      environment: 'test'
    });
  });

  describe('Service Configuration', () => {
    it('should initialize with correct configuration', () => {
      expect(service).toBeDefined();
      expect(service['config'].name).toBe('Inventory Management Service');
      expect(service['config'].port).toBe(3006);
      expect(service['config'].version).toBe('1.0.0');
    });

    it('should have required endpoints', () => {
      const endpoints = service['getServiceEndpoints']();
      expect(endpoints).toContain('GET /api/v1/inventory');
      expect(endpoints).toContain('GET /api/v1/inventory/:productId');
      expect(endpoints).toContain('PUT /api/v1/inventory/:productId');
      expect(endpoints).toContain('POST /api/v1/inventory/:productId/adjust');
    });

    it('should have service description', () => {
      const description = service['getServiceDescription']();
      expect(description).toBe('Handle inventory tracking and management');
    });
  });

  describe('Service Methods', () => {
    it('should have inventory management methods', () => {
      expect(typeof service['getInventory']).toBe('function');
      expect(typeof service['getInventoryByProduct']).toBe('function');
      expect(typeof service['updateInventory']).toBe('function');
      expect(typeof service['adjustInventory']).toBe('function');
    });

    it('should have inventory alerts methods', () => {
      expect(typeof service['getInventoryAlerts']).toBe('function');
      expect(typeof service['getLowStockItems']).toBe('function');
    });

    it('should have inventory reservation methods', () => {
      expect(typeof service['reserveInventory']).toBe('function');
      expect(typeof service['releaseInventory']).toBe('function');
    });

    it('should have inventory movements methods', () => {
      expect(typeof service['getInventoryMovements']).toBe('function');
      expect(typeof service['createInventoryMovement']).toBe('function');
    });
  });
}); 