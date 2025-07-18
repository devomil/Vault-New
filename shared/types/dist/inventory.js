"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryAnalyticsSchema = exports.UpdateInventoryAlertSchema = exports.CreateInventoryAlertSchema = exports.InventoryAlertSchema = exports.AlertStatusSchema = exports.AlertTypeSchema = exports.CreateInventoryMovementSchema = exports.InventoryMovementSchema = exports.MovementTypeSchema = exports.UpdateInventorySchema = exports.CreateInventorySchema = exports.InventorySchema = exports.InventoryStatusSchema = void 0;
const zod_1 = require("zod");
// Inventory Status Types
exports.InventoryStatusSchema = zod_1.z.enum(['in_stock', 'low_stock', 'out_of_stock', 'backordered']);
// Inventory Schema
exports.InventorySchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    productId: zod_1.z.string().cuid(),
    quantity: zod_1.z.number().int().min(0).default(0),
    reserved: zod_1.z.number().int().min(0).default(0),
    available: zod_1.z.number().int().min(0).default(0),
    lowStockThreshold: zod_1.z.number().int().min(0).default(10),
    reorderPoint: zod_1.z.number().int().min(0).default(5),
    safetyStock: zod_1.z.number().int().min(0).default(20),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Inventory Types
exports.CreateInventorySchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    quantity: zod_1.z.number().int().min(0).default(0),
    lowStockThreshold: zod_1.z.number().int().min(0).default(10),
    reorderPoint: zod_1.z.number().int().min(0).default(5),
    safetyStock: zod_1.z.number().int().min(0).default(20)
});
// Update Inventory Types
exports.UpdateInventorySchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(0).optional(),
    reserved: zod_1.z.number().int().min(0).optional(),
    lowStockThreshold: zod_1.z.number().int().min(0).optional(),
    reorderPoint: zod_1.z.number().int().min(0).optional(),
    safetyStock: zod_1.z.number().int().min(0).optional()
});
// Inventory Movement Types
exports.MovementTypeSchema = zod_1.z.enum([
    'purchase',
    'sale',
    'return',
    'adjustment',
    'transfer',
    'damage',
    'expiry'
]);
exports.InventoryMovementSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    productId: zod_1.z.string().cuid(),
    type: exports.MovementTypeSchema,
    quantity: zod_1.z.number().int(),
    previousQuantity: zod_1.z.number().int().min(0),
    newQuantity: zod_1.z.number().int().min(0),
    reference: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    createdAt: zod_1.z.date()
});
// Create Inventory Movement Types
exports.CreateInventoryMovementSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    type: exports.MovementTypeSchema,
    quantity: zod_1.z.number().int(),
    reference: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional()
});
// Inventory Alert Types
exports.AlertTypeSchema = zod_1.z.enum(['low_stock', 'out_of_stock', 'overstock', 'expiry_warning']);
exports.AlertStatusSchema = zod_1.z.enum(['active', 'acknowledged', 'resolved']);
exports.InventoryAlertSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    productId: zod_1.z.string().cuid(),
    type: exports.AlertTypeSchema,
    status: exports.AlertStatusSchema.default('active'),
    message: zod_1.z.string().min(1),
    threshold: zod_1.z.number().optional(),
    currentValue: zod_1.z.number().optional(),
    acknowledgedAt: zod_1.z.date().optional(),
    resolvedAt: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Inventory Alert Types
exports.CreateInventoryAlertSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    type: exports.AlertTypeSchema,
    message: zod_1.z.string().min(1),
    threshold: zod_1.z.number().optional(),
    currentValue: zod_1.z.number().optional()
});
// Update Inventory Alert Types
exports.UpdateInventoryAlertSchema = zod_1.z.object({
    status: exports.AlertStatusSchema.optional(),
    message: zod_1.z.string().min(1).optional()
});
// Inventory Analytics Types
exports.InventoryAnalyticsSchema = zod_1.z.object({
    totalProducts: zod_1.z.number().int().min(0),
    totalValue: zod_1.z.number().positive(),
    lowStockItems: zod_1.z.number().int().min(0),
    outOfStockItems: zod_1.z.number().int().min(0),
    overstockItems: zod_1.z.number().int().min(0),
    turnoverRate: zod_1.z.number().positive(),
    averageStockLevel: zod_1.z.number().positive(),
    topProducts: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().cuid(),
        sku: zod_1.z.string(),
        name: zod_1.z.string(),
        quantity: zod_1.z.number().int().min(0),
        value: zod_1.z.number().positive()
    }))
});
//# sourceMappingURL=inventory.js.map