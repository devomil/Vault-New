// Global test setup
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  createMockTenant: () => ({
    id: 'test-tenant-id',
    name: 'Test Tenant',
    slug: 'test-tenant',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockUser: () => ({
    id: 'test-user-id',
    tenantId: 'test-tenant-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockProduct: () => ({
    id: 'test-product-id',
    tenantId: 'test-tenant-id',
    sku: 'TEST-SKU-001',
    name: 'Test Product',
    description: 'Test product description',
    category: 'Electronics',
    brand: 'Test Brand',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 