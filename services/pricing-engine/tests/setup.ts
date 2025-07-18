// Test setup for pricing-engine service
import dotenv from 'dotenv';
import { prisma } from '@vault/shared-database';

// Load environment variables
dotenv.config();

// Mock environment variables for testing
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3007';
process.env['DATABASE_URL'] = 'postgresql://vault:vaultpass@localhost:5433/vault';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Test data setup
export const setupTestData = async (): Promise<void> => {
  try {
    // Create test tenant if it doesn't exist
    const testTenantId = 'test-tenant-123';
    await prisma.tenant.upsert({
      where: { id: testTenantId },
      update: {},
      create: {
        id: testTenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('Test data setup completed');
  } catch (error) {
    console.error('Error setting up test data:', error);
    throw error;
  }
};

// Cleanup test data
export const cleanupTestData = async (): Promise<void> => {
  try {
    // Clean up test pricing rules
    await prisma.pricingRule.deleteMany({
      where: { tenantId: 'test-tenant-123' }
    });

    console.log('Test data cleanup completed');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}; 