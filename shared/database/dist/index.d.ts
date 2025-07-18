import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare class DatabaseService {
    private client;
    constructor();
    healthCheck(): Promise<boolean>;
    getStats(): Promise<{
        tenants: number;
        users: number;
        products: number;
        orders: number;
    }>;
    disconnect(): Promise<void>;
}
export declare const databaseService: DatabaseService;
export { RLSManager } from './rls-utils';
export type { PrismaClient } from '@prisma/client';
export type { Tenant, User, Product, Order, Marketplace, Vendor } from '@prisma/client';
//# sourceMappingURL=index.d.ts.map