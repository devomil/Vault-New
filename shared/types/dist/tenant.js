"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTenantRequestSchema = exports.CreateTenantRequestSchema = exports.TenantContextSchema = exports.TenantFeaturesSchema = exports.TenantLimitsSchema = exports.NotificationConfigSchema = exports.InventoryConfigSchema = exports.PricingConfigSchema = exports.VendorConfigSchema = exports.MarketplaceConfigSchema = exports.TenantStatus = void 0;
const zod_1 = require("zod");
// Tenant status enum
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "active";
    TenantStatus["SUSPENDED"] = "suspended";
    TenantStatus["TRIAL"] = "trial";
    TenantStatus["PENDING"] = "pending";
    TenantStatus["CANCELLED"] = "cancelled";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
// Tenant configuration schemas
exports.MarketplaceConfigSchema = zod_1.z.object({
    marketplaceId: zod_1.z.string(),
    name: zod_1.z.string(),
    apiKey: zod_1.z.string().optional(),
    apiSecret: zod_1.z.string().optional(),
    accessToken: zod_1.z.string().optional(),
    refreshToken: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
    settings: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.VendorConfigSchema = zod_1.z.object({
    vendorId: zod_1.z.string(),
    name: zod_1.z.string(),
    apiKey: zod_1.z.string().optional(),
    apiSecret: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
    settings: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.PricingConfigSchema = zod_1.z.object({
    defaultMarkup: zod_1.z.number().min(0).max(100),
    mapEnforcement: zod_1.z.boolean().default(true),
    governmentPricing: zod_1.z.boolean().default(false),
    competitivePricing: zod_1.z.boolean().default(false),
    autoRepricing: zod_1.z.boolean().default(false),
});
exports.InventoryConfigSchema = zod_1.z.object({
    lowStockThreshold: zod_1.z.number().min(0),
    reorderPoint: zod_1.z.number().min(0),
    safetyStock: zod_1.z.number().min(0),
    autoReorder: zod_1.z.boolean().default(false),
});
exports.NotificationConfigSchema = zod_1.z.object({
    email: zod_1.z.boolean().default(true),
    sms: zod_1.z.boolean().default(false),
    webhook: zod_1.z.boolean().default(false),
    webhookUrl: zod_1.z.string().url().optional(),
});
exports.TenantLimitsSchema = zod_1.z.object({
    maxProducts: zod_1.z.number().min(1),
    maxOrdersPerDay: zod_1.z.number().min(1),
    apiRateLimit: zod_1.z.number().min(1),
    storageLimit: zod_1.z.number().min(1), // in MB
    concurrentUsers: zod_1.z.number().min(1),
});
exports.TenantFeaturesSchema = zod_1.z.object({
    aiEnabled: zod_1.z.boolean().default(false),
    advancedAnalytics: zod_1.z.boolean().default(false),
    automationEnabled: zod_1.z.boolean().default(false),
    customIntegrations: zod_1.z.boolean().default(false),
    multiCurrency: zod_1.z.boolean().default(false),
    advancedReporting: zod_1.z.boolean().default(false),
});
// Export schemas for validation
exports.TenantContextSchema = zod_1.z.object({
    tenantId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    status: zod_1.z.nativeEnum(TenantStatus),
    configuration: zod_1.z.object({
        marketplaces: zod_1.z.array(exports.MarketplaceConfigSchema),
        vendors: zod_1.z.array(exports.VendorConfigSchema),
        pricing: exports.PricingConfigSchema,
        inventory: exports.InventoryConfigSchema,
        notifications: exports.NotificationConfigSchema,
    }),
    limits: exports.TenantLimitsSchema,
    features: exports.TenantFeaturesSchema,
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.CreateTenantRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    configuration: zod_1.z.object({
        marketplaces: zod_1.z.array(exports.MarketplaceConfigSchema).optional(),
        vendors: zod_1.z.array(exports.VendorConfigSchema).optional(),
        pricing: exports.PricingConfigSchema.partial().optional(),
        inventory: exports.InventoryConfigSchema.partial().optional(),
        notifications: exports.NotificationConfigSchema.partial().optional(),
    }).optional(),
    limits: exports.TenantLimitsSchema.partial().optional(),
    features: exports.TenantFeaturesSchema.partial().optional(),
});
exports.UpdateTenantRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    status: zod_1.z.nativeEnum(TenantStatus).optional(),
    configuration: zod_1.z.object({
        marketplaces: zod_1.z.array(exports.MarketplaceConfigSchema).optional(),
        vendors: zod_1.z.array(exports.VendorConfigSchema).optional(),
        pricing: exports.PricingConfigSchema.partial().optional(),
        inventory: exports.InventoryConfigSchema.partial().optional(),
        notifications: exports.NotificationConfigSchema.partial().optional(),
    }).optional(),
    limits: exports.TenantLimitsSchema.partial().optional(),
    features: exports.TenantFeaturesSchema.partial().optional(),
});
//# sourceMappingURL=tenant.js.map