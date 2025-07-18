import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Ensure database is ready
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Global test timeout
jest.setTimeout(30000); 