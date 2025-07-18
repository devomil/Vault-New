import { z } from 'zod';

// Vendor Types
export const VendorTypeSchema = z.enum(['ingram_micro', 'td_synnex', 'dh_distributing', 'wynit', 'other']);
export type VendorType = z.infer<typeof VendorTypeSchema>;

export const VendorStatusSchema = z.enum(['active', 'inactive', 'suspended']);
export type VendorStatus = z.infer<typeof VendorStatusSchema>;

export const VendorCredentialsSchema = z.object({
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  endpoint: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  retryAttempts: z.number().positive().optional()
});

export const VendorSettingsSchema = z.object({
  autoSync: z.boolean().default(false),
  syncInterval: z.number().positive().default(3600), // seconds
  priceMarkup: z.number().positive().default(1.1),
  minOrderQuantity: z.number().positive().default(1),
  maxOrderQuantity: z.number().positive().default(1000),
  leadTime: z.number().positive().default(7), // days
  paymentTerms: z.string().default('Net 30'),
  shippingMethod: z.string().default('Standard'),
  notifications: z.object({
    lowStock: z.boolean().default(true),
    priceChanges: z.boolean().default(true),
    orderStatus: z.boolean().default(true)
  }).default({})
});

export const VendorSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  vendorId: z.string(),
  name: z.string().min(1).max(100),
  type: VendorTypeSchema,
  status: VendorStatusSchema.default('active'),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  settings: VendorSettingsSchema.default({}),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateVendorSchema = z.object({
  name: z.string().min(1).max(100),
  type: VendorTypeSchema,
  credentials: VendorCredentialsSchema.optional(),
  settings: VendorSettingsSchema.optional()
});

export const UpdateVendorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: VendorTypeSchema.optional(),
  credentials: VendorCredentialsSchema.optional(),
  settings: VendorSettingsSchema.optional(),
  status: VendorStatusSchema.optional()
});

// Vendor Product Types
export const VendorProductStatusSchema = z.enum(['active', 'inactive', 'discontinued', 'out_of_stock']);
export type VendorProductStatus = z.infer<typeof VendorProductStatusSchema>;

export const VendorProductSchema = z.object({
  id: z.string().cuid(),
  vendorId: z.string().cuid(),
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  price: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  quantity: z.number().int().min(0).default(0),
  status: VendorProductStatusSchema.default('active'),
  description: z.string().optional(),
  attributes: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateVendorProductSchema = z.object({
  vendorId: z.string().cuid(),
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  price: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  quantity: z.number().int().min(0).default(0),
  description: z.string().optional(),
  attributes: z.record(z.any()).optional()
});

export const UpdateVendorProductSchema = z.object({
  sku: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
  price: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  quantity: z.number().int().min(0).optional(),
  status: VendorProductStatusSchema.optional(),
  description: z.string().optional(),
  attributes: z.record(z.any()).optional()
});

// Vendor Order Types
export const VendorOrderStatusSchema = z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'backordered']);
export type VendorOrderStatus = z.infer<typeof VendorOrderStatusSchema>;

export const VendorOrderItemSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  total: z.number().positive()
});

export const VendorOrderSchema = z.object({
  id: z.string().cuid(),
  vendorId: z.string().cuid(),
  orderId: z.string(),
  status: VendorOrderStatusSchema.default('pending'),
  totalAmount: z.number().positive().optional(),
  items: z.array(VendorOrderItemSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateVendorOrderSchema = z.object({
  vendorId: z.string().cuid(),
  orderId: z.string(),
  items: z.array(VendorOrderItemSchema),
  totalAmount: z.number().positive().optional()
});

export const UpdateVendorOrderSchema = z.object({
  status: VendorOrderStatusSchema.optional(),
  totalAmount: z.number().positive().optional(),
  items: z.array(VendorOrderItemSchema).optional()
});

// Sync Operation Types
export const SyncOperationTypeSchema = z.enum(['products', 'pricing', 'inventory', 'orders']);
export type SyncOperationType = z.infer<typeof SyncOperationTypeSchema>;

export const SyncOperationStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'failed']);
export type SyncOperationStatus = z.infer<typeof SyncOperationStatusSchema>;

export const SyncOperationSchema = z.object({
  id: z.string().cuid(),
  vendorId: z.string().cuid(),
  type: SyncOperationTypeSchema,
  status: SyncOperationStatusSchema.default('pending'),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
  itemsProcessed: z.number().int().min(0).default(0),
  itemsTotal: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Export types
export type Vendor = z.infer<typeof VendorSchema>;
export type CreateVendor = z.infer<typeof CreateVendorSchema>;
export type UpdateVendor = z.infer<typeof UpdateVendorSchema>;
export type VendorCredentials = z.infer<typeof VendorCredentialsSchema>;
export type VendorSettings = z.infer<typeof VendorSettingsSchema>;

export type VendorProduct = z.infer<typeof VendorProductSchema>;
export type CreateVendorProduct = z.infer<typeof CreateVendorProductSchema>;
export type UpdateVendorProduct = z.infer<typeof UpdateVendorProductSchema>;
export type VendorOrderItem = z.infer<typeof VendorOrderItemSchema>;

export type VendorOrder = z.infer<typeof VendorOrderSchema>;
export type CreateVendorOrder = z.infer<typeof CreateVendorOrderSchema>;
export type UpdateVendorOrder = z.infer<typeof UpdateVendorOrderSchema>;

export type SyncOperation = z.infer<typeof SyncOperationSchema>; 