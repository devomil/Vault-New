import { PrismaClient } from '@prisma/client';

// Create a singleton Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database utilities
export class DatabaseService {
  private client: PrismaClient;

  constructor() {
    this.client = prisma;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // Get database statistics
  async getStats() {
    const [
      tenantCount,
      userCount,
      productCount,
      orderCount,
    ] = await Promise.all([
      this.client.tenant.count(),
      this.client.user.count(),
      this.client.product.count(),
      this.client.order.count(),
    ]);

    return {
      tenants: tenantCount,
      users: userCount,
      products: productCount,
      orders: orderCount,
    };
  }

  // Cleanup connections
  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}

// Export the database service instance
export const databaseService = new DatabaseService();

// Export types
export type { PrismaClient } from '@prisma/client';
export type { Tenant, User, Product, Order, Marketplace, Vendor } from '@prisma/client'; 