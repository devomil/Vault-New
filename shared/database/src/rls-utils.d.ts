import { PrismaClient } from '@prisma/client';
/**
 * Row-Level Security (RLS) Utilities
 * Provides functions to manage tenant context and RLS operations
 */
export declare class RLSManager {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Set the tenant context for the current database session
     * This enables RLS policies to filter data by tenant
     */
    setTenantContext(tenantId: string): Promise<void>;
    /**
     * Clear the tenant context from the current database session
     * This disables RLS policies (use with caution)
     */
    clearTenantContext(): Promise<void>;
    /**
     * Get the current tenant ID from the database session context
     */
    getCurrentTenantId(): Promise<string | null>;
    /**
     * Execute a query with tenant context set
     * This is a convenience method for running queries with RLS enabled
     */
    withTenantContext<T>(tenantId: string, queryFn: () => Promise<T>): Promise<T>;
    /**
     * Verify that RLS is working correctly for a tenant
     * This tests that data isolation is functioning properly
     */
    verifyRLSIsolation(tenantId: string): Promise<{
        isWorking: boolean;
        tenantCount: number;
        otherTenantCount: number;
        details: string;
    }>;
    /**
     * Get RLS status for all tables
     */
    getRLSStatus(): Promise<Array<{
        tableName: string;
        hasRLS: boolean;
        policyCount: number;
    }>>;
}
/**
 * Middleware function for Express.js to automatically set tenant context
 * This should be used in API routes to ensure RLS is active
 */
export declare function createTenantContextMiddleware(prisma: PrismaClient): (req: any, res: any, next: any) => Promise<void>;
/**
 * Cleanup middleware to clear tenant context after request
 */
export declare function createTenantContextCleanupMiddleware(): (req: any, res: any, next: any) => Promise<void>;
/**
 * Utility function to create a Prisma client with RLS support
 */
export declare function createRLSPrismaClient(): PrismaClient & {
    rls: RLSManager;
};
//# sourceMappingURL=rls-utils.d.ts.map