"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncOperationSchema = exports.SyncOperationStatusSchema = exports.SyncOperationTypeSchema = exports.MarketplaceOrderSchema = exports.MarketplaceOrderItemSchema = exports.MarketplaceOrderStatusSchema = exports.UpdateMarketplaceListingSchema = exports.CreateMarketplaceListingSchema = exports.MarketplaceListingSchema = exports.ListingStatusSchema = exports.UpdateMarketplaceSchema = exports.CreateMarketplaceSchema = exports.MarketplaceSchema = exports.MarketplaceSettingsSchema = exports.MarketplaceCredentialsSchema = exports.MarketplaceStatusSchema = exports.MarketplaceTypeSchema = void 0;
const zod_1 = require("zod");
// Marketplace Types
exports.MarketplaceTypeSchema = zod_1.z.enum(['amazon', 'walmart', 'ebay', 'newegg', 'rakuten']);
exports.MarketplaceStatusSchema = zod_1.z.enum(['active', 'inactive', 'suspended']);
// Marketplace Credentials
exports.MarketplaceCredentialsSchema = zod_1.z.object({
    apiKey: zod_1.z.string().optional(),
    apiSecret: zod_1.z.string().optional(),
    sellerId: zod_1.z.string().optional(),
    accessToken: zod_1.z.string().optional(),
    refreshToken: zod_1.z.string().optional(),
    endpoint: zod_1.z.string().url().optional(),
    marketplaceId: zod_1.z.string().optional(),
    region: zod_1.z.string().optional()
});
// Marketplace Settings
exports.MarketplaceSettingsSchema = zod_1.z.object({
    autoSync: zod_1.z.boolean().default(false),
    syncInterval: zod_1.z.number().positive().default(3600), // seconds
    priceMarkup: zod_1.z.number().positive().default(1.1),
    minPrice: zod_1.z.number().positive().optional(),
    maxPrice: zod_1.z.number().positive().optional(),
    inventoryThreshold: zod_1.z.number().int().min(0).default(10),
    shippingTemplate: zod_1.z.string().optional(),
    fulfillmentType: zod_1.z.enum(['fba', 'fbm', 'seller_fulfilled']).optional(),
    notifications: zod_1.z.object({
        lowStock: zod_1.z.boolean().default(true),
        priceChanges: zod_1.z.boolean().default(true),
        orderStatus: zod_1.z.boolean().default(true)
    }).default({})
});
// Marketplace Schema
exports.MarketplaceSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    marketplaceId: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(100),
    type: exports.MarketplaceTypeSchema,
    status: exports.MarketplaceStatusSchema.default('active'),
    apiKey: zod_1.z.string().optional(),
    apiSecret: zod_1.z.string().optional(),
    accessToken: zod_1.z.string().optional(),
    refreshToken: zod_1.z.string().optional(),
    settings: exports.MarketplaceSettingsSchema.default({}),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Marketplace Types
exports.CreateMarketplaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: exports.MarketplaceTypeSchema,
    credentials: exports.MarketplaceCredentialsSchema.optional(),
    settings: exports.MarketplaceSettingsSchema.optional()
});
// Update Marketplace Types
exports.UpdateMarketplaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    type: exports.MarketplaceTypeSchema.optional(),
    credentials: exports.MarketplaceCredentialsSchema.optional(),
    settings: exports.MarketplaceSettingsSchema.optional(),
    status: exports.MarketplaceStatusSchema.optional()
});
// Marketplace Listing Types
exports.ListingStatusSchema = zod_1.z.enum(['active', 'inactive', 'pending', 'error', 'deleted']);
exports.MarketplaceListingSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    marketplaceId: zod_1.z.string().cuid(),
    productId: zod_1.z.string().cuid(),
    externalId: zod_1.z.string(),
    status: exports.ListingStatusSchema.default('active'),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().default('USD'),
    quantity: zod_1.z.number().int().min(0).default(0),
    attributes: zod_1.z.record(zod_1.z.any()).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Marketplace Listing Types
exports.CreateMarketplaceListingSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    externalId: zod_1.z.string(),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().default('USD'),
    quantity: zod_1.z.number().int().min(0).default(0),
    attributes: zod_1.z.record(zod_1.z.any()).optional()
});
// Update Marketplace Listing Types
exports.UpdateMarketplaceListingSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().optional(),
    quantity: zod_1.z.number().int().min(0).optional(),
    status: exports.ListingStatusSchema.optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional()
});
// Marketplace Order Types
exports.MarketplaceOrderStatusSchema = zod_1.z.enum([
    'pending',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'partially_refunded'
]);
exports.MarketplaceOrderItemSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    quantity: zod_1.z.number().int().positive(),
    price: zod_1.z.number().positive(),
    total: zod_1.z.number().positive()
});
exports.MarketplaceOrderSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    marketplaceId: zod_1.z.string().cuid(),
    externalId: zod_1.z.string(),
    status: exports.MarketplaceOrderStatusSchema.default('pending'),
    customerEmail: zod_1.z.string().email().optional(),
    customerName: zod_1.z.string().min(1).max(100).optional(),
    totalAmount: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().default('USD'),
    items: zod_1.z.array(exports.MarketplaceOrderItemSchema).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Sync Operation Types
exports.SyncOperationTypeSchema = zod_1.z.enum(['inventory', 'pricing', 'listings', 'orders']);
exports.SyncOperationStatusSchema = zod_1.z.enum(['pending', 'in_progress', 'completed', 'failed']);
exports.SyncOperationSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    marketplaceId: zod_1.z.string().cuid(),
    type: exports.SyncOperationTypeSchema,
    status: exports.SyncOperationStatusSchema.default('pending'),
    startedAt: zod_1.z.date().optional(),
    completedAt: zod_1.z.date().optional(),
    error: zod_1.z.string().optional(),
    itemsProcessed: zod_1.z.number().int().min(0).default(0),
    itemsTotal: zod_1.z.number().int().min(0).default(0),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
//# sourceMappingURL=marketplace.js.map