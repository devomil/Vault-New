import { z } from 'zod';

// Inventory Status Types
export const InventoryStatusSchema = z.enum(['in_stock', 'low_stock', 'out_of_stock', 'backordered']);
export type InventoryStatus = z.infer<typeof InventoryStatusSchema>;

// Inventory Schema
export const InventorySchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  productId: z.string().cuid(),
  quantity: z.number().int().min(0).default(0),
  reserved: z.number().int().min(0).default(0),
  available: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  reorderPoint: z.number().int().min(0).default(5),
  safetyStock: z.number().int().min(0).default(20),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Inventory Types
export const CreateInventorySchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  reorderPoint: z.number().int().min(0).default(5),
  safetyStock: z.number().int().min(0).default(20)
});

// Update Inventory Types
export const UpdateInventorySchema = z.object({
  quantity: z.number().int().min(0).optional(),
  reserved: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  reorderPoint: z.number().int().min(0).optional(),
  safetyStock: z.number().int().min(0).optional()
});

// Inventory Movement Types
export const MovementTypeSchema = z.enum([
  'purchase',
  'sale',
  'return',
  'adjustment',
  'transfer',
  'damage',
  'expiry'
]);
export type MovementType = z.infer<typeof MovementTypeSchema>;

export const InventoryMovementSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  productId: z.string().cuid(),
  type: MovementTypeSchema,
  quantity: z.number().int(),
  previousQuantity: z.number().int().min(0),
  newQuantity: z.number().int().min(0),
  reference: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date()
});

// Create Inventory Movement Types
export const CreateInventoryMovementSchema = z.object({
  productId: z.string().cuid(),
  type: MovementTypeSchema,
  quantity: z.number().int(),
  reference: z.string().optional(),
  notes: z.string().optional()
});

// Inventory Alert Types
export const AlertTypeSchema = z.enum(['low_stock', 'out_of_stock', 'overstock', 'expiry_warning']);
export type AlertType = z.infer<typeof AlertTypeSchema>;

export const AlertStatusSchema = z.enum(['active', 'acknowledged', 'resolved']);
export type AlertStatus = z.infer<typeof AlertStatusSchema>;

export const InventoryAlertSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  productId: z.string().cuid(),
  type: AlertTypeSchema,
  status: AlertStatusSchema.default('active'),
  message: z.string().min(1),
  threshold: z.number().optional(),
  currentValue: z.number().optional(),
  acknowledgedAt: z.date().optional(),
  resolvedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Inventory Alert Types
export const CreateInventoryAlertSchema = z.object({
  productId: z.string().cuid(),
  type: AlertTypeSchema,
  message: z.string().min(1),
  threshold: z.number().optional(),
  currentValue: z.number().optional()
});

// Update Inventory Alert Types
export const UpdateInventoryAlertSchema = z.object({
  status: AlertStatusSchema.optional(),
  message: z.string().min(1).optional()
});

// Inventory Analytics Types
export const InventoryAnalyticsSchema = z.object({
  totalProducts: z.number().int().min(0),
  totalValue: z.number().positive(),
  lowStockItems: z.number().int().min(0),
  outOfStockItems: z.number().int().min(0),
  overstockItems: z.number().int().min(0),
  turnoverRate: z.number().positive(),
  averageStockLevel: z.number().positive(),
  topProducts: z.array(z.object({
    productId: z.string().cuid(),
    sku: z.string(),
    name: z.string(),
    quantity: z.number().int().min(0),
    value: z.number().positive()
  }))
});

// Export types
export type Inventory = z.infer<typeof InventorySchema>;
export type CreateInventory = z.infer<typeof CreateInventorySchema>;
export type UpdateInventory = z.infer<typeof UpdateInventorySchema>;

export type InventoryMovement = z.infer<typeof InventoryMovementSchema>;
export type CreateInventoryMovement = z.infer<typeof CreateInventoryMovementSchema>;

export type InventoryAlert = z.infer<typeof InventoryAlertSchema>;
export type CreateInventoryAlert = z.infer<typeof CreateInventoryAlertSchema>;
export type UpdateInventoryAlert = z.infer<typeof UpdateInventoryAlertSchema>;

export type InventoryAnalytics = z.infer<typeof InventoryAnalyticsSchema>; 