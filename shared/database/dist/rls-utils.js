"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RLSManager = void 0;
exports.createTenantContextMiddleware = createTenantContextMiddleware;
exports.createTenantContextCleanupMiddleware = createTenantContextCleanupMiddleware;
exports.createRLSPrismaClient = createRLSPrismaClient;
const client_1 = require("@prisma/client");
/**
 * Row-Level Security (RLS) Utilities
 * Provides functions to manage tenant context and RLS operations
 */
class RLSManager {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Set the tenant context for the current database session
     * This enables RLS policies to filter data by tenant
     */
    async setTenantContext(tenantId) {
        await this.prisma.$executeRaw `SELECT vault.set_tenant_context(${tenantId})`;
    }
    /**
     * Clear the tenant context from the current database session
     * This disables RLS policies (use with caution)
     */
    async clearTenantContext() {
        await this.prisma.$executeRaw `SELECT vault.clear_tenant_context()`;
    }
    /**
     * Get the current tenant ID from the database session context
     */
    async getCurrentTenantId() {
        const result = await this.prisma.$queryRaw `
      SELECT vault.get_tenant_id() as get_tenant_id
    `;
        return result[0]?.get_tenant_id || null;
    }
    /**
     * Execute a query with tenant context set
     * This is a convenience method for running queries with RLS enabled
     */
    async withTenantContext(tenantId, queryFn) {
        try {
            await this.setTenantContext(tenantId);
            return await queryFn();
        }
        finally {
            await this.clearTenantContext();
        }
    }
    /**
     * Verify that RLS is working correctly for a tenant
     * This tests that data isolation is functioning properly
     */
    async verifyRLSIsolation(tenantId) {
        try {
            // Set tenant context
            await this.setTenantContext(tenantId);
            // Count records visible to this tenant
            const tenantCount = await this.prisma.tenant.count();
            // Clear context and count all records
            await this.clearTenantContext();
            const totalCount = await this.prisma.tenant.count();
            const otherTenantCount = totalCount - tenantCount;
            const isWorking = tenantCount === 1 && totalCount > 1;
            return {
                isWorking,
                tenantCount,
                otherTenantCount,
                details: `Tenant ${tenantId} can see ${tenantCount} tenant(s), total tenants: ${totalCount}`
            };
        }
        catch (error) {
            return {
                isWorking: false,
                tenantCount: 0,
                otherTenantCount: 0,
                details: `RLS verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    /**
     * Get RLS status for all tables
     */
    async getRLSStatus() {
        const result = await this.prisma.$queryRaw `
      SELECT 
        t.tablename,
        t.rowsecurity,
        COUNT(p.policyname) as policy_count
      FROM pg_tables t
      LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'vault'
      WHERE t.schemaname = 'vault'
      GROUP BY t.tablename, t.rowsecurity
      ORDER BY t.tablename
    `;
        return result.map(row => ({
            tableName: row.tablename,
            hasRLS: row.rowsecurity,
            policyCount: parseInt(row.policy_count.toString())
        }));
    }
}
exports.RLSManager = RLSManager;
/**
 * Middleware function for Express.js to automatically set tenant context
 * This should be used in API routes to ensure RLS is active
 */
function createTenantContextMiddleware(prisma) {
    const rlsManager = new RLSManager(prisma);
    return async (req, res, next) => {
        const tenantId = req.headers['x-tenant-id'] || req.headers['tenant-id'];
        if (tenantId) {
            try {
                await rlsManager.setTenantContext(tenantId);
                // Store the RLS manager in the request for cleanup
                req.rlsManager = rlsManager;
                next();
            }
            catch (error) {
                console.error('Failed to set tenant context:', error);
                res.status(500).json({ error: 'Failed to set tenant context' });
            }
        }
        else {
            // No tenant ID provided, continue without RLS
            next();
        }
    };
}
/**
 * Cleanup middleware to clear tenant context after request
 */
function createTenantContextCleanupMiddleware() {
    return async (req, res, next) => {
        // Override res.end to ensure cleanup happens
        const originalEnd = res.end;
        res.end = async function (...args) {
            if (req.rlsManager) {
                try {
                    await req.rlsManager.clearTenantContext();
                }
                catch (error) {
                    console.error('Failed to clear tenant context:', error);
                }
            }
            return originalEnd.apply(this, args);
        };
        next();
    };
}
/**
 * Utility function to create a Prisma client with RLS support
 */
function createRLSPrismaClient() {
    const prisma = new client_1.PrismaClient();
    const rlsManager = new RLSManager(prisma);
    return Object.assign(prisma, { rls: rlsManager });
}
//# sourceMappingURL=rls-utils.js.map