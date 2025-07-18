"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncOperationSchema = exports.SyncOperationStatusSchema = exports.SyncOperationTypeSchema = exports.UpdateVendorOrderSchema = exports.CreateVendorOrderSchema = exports.VendorOrderSchema = exports.VendorOrderItemSchema = exports.VendorOrderStatusSchema = exports.UpdateVendorProductSchema = exports.CreateVendorProductSchema = exports.VendorProductSchema = exports.VendorProductStatusSchema = exports.UpdateVendorSchema = exports.CreateVendorSchema = exports.VendorSchema = exports.VendorSettingsSchema = exports.VendorCredentialsSchema = exports.VendorStatusSchema = exports.VendorTypeSchema = void 0;
const zod_1 = require("zod");
// Vendor Types
exports.VendorTypeSchema = zod_1.z.enum(['ingram_micro', 'td_synnex', 'dh_distributing', 'wynit', 'other']);
exports.VendorStatusSchema = zod_1.z.enum(['active', 'inactive', 'suspended']);
exports.VendorCredentialsSchema = zod_1.z.object({
    apiKey: zod_1.z.string().optional(),
    apiSecret: zod_1.z.string().optional(),
    username: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
    accessToken: zod_1.z.string().optional(),
    refreshToken: zod_1.z.string().optional(),
    endpoint: zod_1.z.string().url().optional(),
    timeout: zod_1.z.number().positive().optional(),
    retryAttempts: zod_1.z.number().positive().optional()
});
exports.VendorSettingsSchema = zod_1.z.object({
    autoSync: zod_1.z.boolean().default(false),
    syncInterval: zod_1.z.number().positive().default(3600), // seconds
    priceMarkup: zod_1.z.number().positive().default(1.1),
    minOrderQuantity: zod_1.z.number().positive().default(1),
    maxOrderQuantity: zod_1.z.number().positive().default(1000),
    leadTime: zod_1.z.number().positive().default(7), // days
    paymentTerms: zod_1.z.string().default('Net 30'),
    shippingMethod: zod_1.z.string().default('Standard'),
    notifications: zod_1.z.object({
        lowStock: zod_1.z.boolean().default(true),
        priceChanges: zod_1.z.boolean().default(true),
        orderStatus: zod_1.z.boolean().default(true)
    }).default({})
});
exports.VendorSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    vendorId: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(100),
    type: exports.VendorTypeSchema,
    status: exports.VendorStatusSchema.default('active'),
    apiKey: zod_1.z.string().optional(),
    apiSecret: zod_1.z.string().optional(),
    settings: exports.VendorSettingsSchema.default({}),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.CreateVendorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: exports.VendorTypeSchema,
    credentials: exports.VendorCredentialsSchema.optional(),
    settings: exports.VendorSettingsSchema.optional()
});
exports.UpdateVendorSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    type: exports.VendorTypeSchema.optional(),
    credentials: exports.VendorCredentialsSchema.optional(),
    settings: exports.VendorSettingsSchema.optional(),
    status: exports.VendorStatusSchema.optional()
});
// Vendor Product Types
exports.VendorProductStatusSchema = zod_1.z.enum(['active', 'inactive', 'discontinued', 'out_of_stock']);
exports.VendorProductSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    vendorId: zod_1.z.string().cuid(),
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    price: zod_1.z.number().positive().optional(),
    cost: zod_1.z.number().positive().optional(),
    quantity: zod_1.z.number().int().min(0).default(0),
    status: exports.VendorProductStatusSchema.default('active'),
    description: zod_1.z.string().optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.CreateVendorProductSchema = zod_1.z.object({
    vendorId: zod_1.z.string().cuid(),
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    price: zod_1.z.number().positive().optional(),
    cost: zod_1.z.number().positive().optional(),
    quantity: zod_1.z.number().int().min(0).default(0),
    description: zod_1.z.string().optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional()
});
exports.UpdateVendorProductSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1).max(50).optional(),
    name: zod_1.z.string().min(1).max(200).optional(),
    price: zod_1.z.number().positive().optional(),
    cost: zod_1.z.number().positive().optional(),
    quantity: zod_1.z.number().int().min(0).optional(),
    status: exports.VendorProductStatusSchema.optional(),
    description: zod_1.z.string().optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional()
});
// Vendor Order Types
exports.VendorOrderStatusSchema = zod_1.z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'backordered']);
exports.VendorOrderItemSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    quantity: zod_1.z.number().int().positive(),
    price: zod_1.z.number().positive(),
    total: zod_1.z.number().positive()
});
exports.VendorOrderSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    vendorId: zod_1.z.string().cuid(),
    orderId: zod_1.z.string(),
    status: exports.VendorOrderStatusSchema.default('pending'),
    totalAmount: zod_1.z.number().positive().optional(),
    items: zod_1.z.array(exports.VendorOrderItemSchema).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.CreateVendorOrderSchema = zod_1.z.object({
    vendorId: zod_1.z.string().cuid(),
    orderId: zod_1.z.string(),
    items: zod_1.z.array(exports.VendorOrderItemSchema),
    totalAmount: zod_1.z.number().positive().optional()
});
exports.UpdateVendorOrderSchema = zod_1.z.object({
    status: exports.VendorOrderStatusSchema.optional(),
    totalAmount: zod_1.z.number().positive().optional(),
    items: zod_1.z.array(exports.VendorOrderItemSchema).optional()
});
// Sync Operation Types
exports.SyncOperationTypeSchema = zod_1.z.enum(['products', 'pricing', 'inventory', 'orders']);
exports.SyncOperationStatusSchema = zod_1.z.enum(['pending', 'in_progress', 'completed', 'failed']);
exports.SyncOperationSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    vendorId: zod_1.z.string().cuid(),
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
//# sourceMappingURL=vendor.js.map