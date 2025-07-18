import { z } from 'zod';

// Marketplace Types
export const MarketplaceTypeSchema = z.enum(['amazon', 'walmart', 'ebay', 'newegg', 'rakuten']);
export type MarketplaceType = z.infer<typeof MarketplaceTypeSchema>;

export const MarketplaceStatusSchema = z.enum(['active', 'inactive', 'suspended']);
export type MarketplaceStatus = z.infer<typeof MarketplaceStatusSchema>;

// Marketplace Credentials
export const MarketplaceCredentialsSchema = z.object({
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  sellerId: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  endpoint: z.string().url().optional(),
  marketplaceId: z.string().optional(),
  region: z.string().optional()
});

// Marketplace Settings
export const MarketplaceSettingsSchema = z.object({
  autoSync: z.boolean().default(false),
  syncInterval: z.number().positive().default(3600), // seconds
  priceMarkup: z.number().positive().default(1.1),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  inventoryThreshold: z.number().int().min(0).default(10),
  shippingTemplate: z.string().optional(),
  fulfillmentType: z.enum(['fba', 'fbm', 'seller_fulfilled']).optional(),
  notifications: z.object({
    lowStock: z.boolean().default(true),
    priceChanges: z.boolean().default(true),
    orderStatus: z.boolean().default(true)
  }).default({})
});

// Marketplace Schema
export const MarketplaceSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  marketplaceId: z.string(),
  name: z.string().min(1).max(100),
  type: MarketplaceTypeSchema,
  status: MarketplaceStatusSchema.default('active'),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  settings: MarketplaceSettingsSchema.default({}),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Marketplace Types
export const CreateMarketplaceSchema = z.object({
  name: z.string().min(1).max(100),
  type: MarketplaceTypeSchema,
  credentials: MarketplaceCredentialsSchema.optional(),
  settings: MarketplaceSettingsSchema.optional()
});

// Update Marketplace Types
export const UpdateMarketplaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: MarketplaceTypeSchema.optional(),
  credentials: MarketplaceCredentialsSchema.optional(),
  settings: MarketplaceSettingsSchema.optional(),
  status: MarketplaceStatusSchema.optional()
});

// Marketplace Listing Types
export const ListingStatusSchema = z.enum(['active', 'inactive', 'pending', 'error', 'deleted']);
export type ListingStatus = z.infer<typeof ListingStatusSchema>;

export const MarketplaceListingSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  marketplaceId: z.string().cuid(),
  productId: z.string().cuid(),
  externalId: z.string(),
  status: ListingStatusSchema.default('active'),
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().default('USD'),
  quantity: z.number().int().min(0).default(0),
  attributes: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Marketplace Listing Types
export const CreateMarketplaceListingSchema = z.object({
  productId: z.string().cuid(),
  externalId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().default('USD'),
  quantity: z.number().int().min(0).default(0),
  attributes: z.record(z.any()).optional()
});

// Update Marketplace Listing Types
export const UpdateMarketplaceListingSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  status: ListingStatusSchema.optional(),
  attributes: z.record(z.any()).optional()
});

// Marketplace Order Types
export const MarketplaceOrderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'partially_refunded'
]);
export type MarketplaceOrderStatus = z.infer<typeof MarketplaceOrderStatusSchema>;

export const MarketplaceOrderItemSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  total: z.number().positive()
});

export const MarketplaceOrderSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  marketplaceId: z.string().cuid(),
  externalId: z.string(),
  status: MarketplaceOrderStatusSchema.default('pending'),
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(1).max(100).optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.string().default('USD'),
  items: z.array(MarketplaceOrderItemSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Sync Operation Types
export const SyncOperationTypeSchema = z.enum(['inventory', 'pricing', 'listings', 'orders']);
export type SyncOperationType = z.infer<typeof SyncOperationTypeSchema>;

export const SyncOperationStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'failed']);
export type SyncOperationStatus = z.infer<typeof SyncOperationStatusSchema>;

export const SyncOperationSchema = z.object({
  id: z.string().cuid(),
  marketplaceId: z.string().cuid(),
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
export type Marketplace = z.infer<typeof MarketplaceSchema>;
export type CreateMarketplace = z.infer<typeof CreateMarketplaceSchema>;
export type UpdateMarketplace = z.infer<typeof UpdateMarketplaceSchema>;
export type MarketplaceCredentials = z.infer<typeof MarketplaceCredentialsSchema>;
export type MarketplaceSettings = z.infer<typeof MarketplaceSettingsSchema>;

export type MarketplaceListing = z.infer<typeof MarketplaceListingSchema>;
export type CreateMarketplaceListing = z.infer<typeof CreateMarketplaceListingSchema>;
export type UpdateMarketplaceListing = z.infer<typeof UpdateMarketplaceListingSchema>;
export type MarketplaceOrderItem = z.infer<typeof MarketplaceOrderItemSchema>;

export type MarketplaceOrder = z.infer<typeof MarketplaceOrderSchema>;
export type SyncOperation = z.infer<typeof SyncOperationSchema>; 