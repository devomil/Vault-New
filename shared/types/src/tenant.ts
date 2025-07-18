import { z } from 'zod';

// Tenant status enum
export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

// Tenant configuration schemas
export const MarketplaceConfigSchema = z.object({
  marketplaceId: z.string(),
  name: z.string(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  isActive: z.boolean().default(true),
  settings: z.record(z.unknown()).optional(),
});

export const VendorConfigSchema = z.object({
  vendorId: z.string(),
  name: z.string(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  isActive: z.boolean().default(true),
  settings: z.record(z.unknown()).optional(),
});

export const PricingConfigSchema = z.object({
  defaultMarkup: z.number().min(0).max(100),
  mapEnforcement: z.boolean().default(true),
  governmentPricing: z.boolean().default(false),
  competitivePricing: z.boolean().default(false),
  autoRepricing: z.boolean().default(false),
});

export const InventoryConfigSchema = z.object({
  lowStockThreshold: z.number().min(0),
  reorderPoint: z.number().min(0),
  safetyStock: z.number().min(0),
  autoReorder: z.boolean().default(false),
});

export const NotificationConfigSchema = z.object({
  email: z.boolean().default(true),
  sms: z.boolean().default(false),
  webhook: z.boolean().default(false),
  webhookUrl: z.string().url().optional(),
});

export const TenantLimitsSchema = z.object({
  maxProducts: z.number().min(1),
  maxOrdersPerDay: z.number().min(1),
  apiRateLimit: z.number().min(1),
  storageLimit: z.number().min(1), // in MB
  concurrentUsers: z.number().min(1),
});

export const TenantFeaturesSchema = z.object({
  aiEnabled: z.boolean().default(false),
  advancedAnalytics: z.boolean().default(false),
  automationEnabled: z.boolean().default(false),
  customIntegrations: z.boolean().default(false),
  multiCurrency: z.boolean().default(false),
  advancedReporting: z.boolean().default(false),
});

// Tenant configuration interface
export interface TenantConfiguration {
  marketplaces: z.infer<typeof MarketplaceConfigSchema>[];
  vendors: z.infer<typeof VendorConfigSchema>[];
  pricing: z.infer<typeof PricingConfigSchema>;
  inventory: z.infer<typeof InventoryConfigSchema>;
  notifications: z.infer<typeof NotificationConfigSchema>;
}

// Tenant limits interface
export interface TenantLimits {
  maxProducts: number;
  maxOrdersPerDay: number;
  apiRateLimit: number;
  storageLimit: number;
  concurrentUsers: number;
}

// Tenant features interface
export interface TenantFeatures {
  aiEnabled: boolean;
  advancedAnalytics: boolean;
  automationEnabled: boolean;
  customIntegrations: boolean;
  multiCurrency: boolean;
  advancedReporting: boolean;
}

// Main tenant context interface
export interface TenantContext {
  tenantId: string;
  name: string;
  status: TenantStatus;
  configuration: TenantConfiguration;
  limits: TenantLimits;
  features: TenantFeatures;
  createdAt: Date;
  updatedAt: Date;
}

// Tenant creation request
export interface CreateTenantRequest {
  name: string;
  configuration: Partial<TenantConfiguration>;
  limits?: Partial<TenantLimits>;
  features?: Partial<TenantFeatures>;
}

// Tenant update request
export interface UpdateTenantRequest {
  name?: string;
  status?: TenantStatus;
  configuration?: Partial<TenantConfiguration>;
  limits?: Partial<TenantLimits>;
  features?: Partial<TenantFeatures>;
}

// Tenant usage metrics
export interface TenantUsage {
  tenantId: string;
  productsCount: number;
  ordersToday: number;
  apiCallsToday: number;
  storageUsed: number; // in MB
  activeUsers: number;
  lastActivity: Date;
}

// Tenant billing information
export interface TenantBilling {
  tenantId: string;
  plan: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  amount: number;
  currency: string;
  status: 'active' | 'past_due' | 'cancelled';
}

// Export schemas for validation
export const TenantContextSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  status: z.nativeEnum(TenantStatus),
  configuration: z.object({
    marketplaces: z.array(MarketplaceConfigSchema),
    vendors: z.array(VendorConfigSchema),
    pricing: PricingConfigSchema,
    inventory: InventoryConfigSchema,
    notifications: NotificationConfigSchema,
  }),
  limits: TenantLimitsSchema,
  features: TenantFeaturesSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateTenantRequestSchema = z.object({
  name: z.string().min(1),
  configuration: z.object({
    marketplaces: z.array(MarketplaceConfigSchema).optional(),
    vendors: z.array(VendorConfigSchema).optional(),
    pricing: PricingConfigSchema.partial().optional(),
    inventory: InventoryConfigSchema.partial().optional(),
    notifications: NotificationConfigSchema.partial().optional(),
  }).optional(),
  limits: TenantLimitsSchema.partial().optional(),
  features: TenantFeaturesSchema.partial().optional(),
});

export const UpdateTenantRequestSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.nativeEnum(TenantStatus).optional(),
  configuration: z.object({
    marketplaces: z.array(MarketplaceConfigSchema).optional(),
    vendors: z.array(VendorConfigSchema).optional(),
    pricing: PricingConfigSchema.partial().optional(),
    inventory: InventoryConfigSchema.partial().optional(),
    notifications: NotificationConfigSchema.partial().optional(),
  }).optional(),
  limits: TenantLimitsSchema.partial().optional(),
  features: TenantFeaturesSchema.partial().optional(),
}); 