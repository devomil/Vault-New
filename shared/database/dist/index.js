"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RLSManager = exports.databaseService = exports.DatabaseService = exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Create a singleton Prisma client instance
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient();
if (process.env['NODE_ENV'] !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
// Database utilities
class DatabaseService {
    client;
    constructor() {
        this.client = exports.prisma;
    }
    // Health check
    async healthCheck() {
        try {
            await this.client.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
    // Get database statistics
    async getStats() {
        const [tenantCount, userCount, productCount, orderCount,] = await Promise.all([
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
    async disconnect() {
        await this.client.$disconnect();
    }
}
exports.DatabaseService = DatabaseService;
// Export the database service instance
exports.databaseService = new DatabaseService();
// Export RLS utilities
var rls_utils_1 = require("./rls-utils");
Object.defineProperty(exports, "RLSManager", { enumerable: true, get: function () { return rls_utils_1.RLSManager; } });
//# sourceMappingURL=index.js.map