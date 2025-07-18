import { PrismaClient } from '@prisma/client';

// Set test environment variables
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-secret-key';
process.env['DATABASE_URL'] = 'postgresql://vault:vaultpass@localhost:5433/vault';

// Global test setup
beforeAll(async () => {
  // Ensure test database is clean
  const prisma = new PrismaClient();
  
  try {
    // Clean up all test data
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  } catch (error) {
    console.warn('Test database cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
});

// Global test teardown
afterAll(async () => {
  // Clean up after all tests
  const prisma = new PrismaClient();
  
  try {
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  } catch (error) {
    console.warn('Test database cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}); 