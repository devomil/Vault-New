// Test setup for Analytics Engine Service
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3005';

// Mock environment variables
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['DATABASE_URL'] = 'postgresql://vault:vaultpass@localhost:5433/vault';

// Increase timeout for tests
jest.setTimeout(30000); 