import { z } from 'zod';
export declare enum TenantStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    TRIAL = "trial",
    PENDING = "pending",
    CANCELLED = "cancelled"
}
export declare const MarketplaceConfigSchema: z.ZodObject<{
    marketplaceId: z.ZodString;
    name: z.ZodString;
    apiKey: z.ZodOptional<z.ZodString>;
    apiSecret: z.ZodOptional<z.ZodString>;
    accessToken: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    marketplaceId: string;
    isActive: boolean;
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    settings?: Record<string, unknown> | undefined;
}, {
    name: string;
    marketplaceId: string;
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    isActive?: boolean | undefined;
    settings?: Record<string, unknown> | undefined;
}>;
export declare const VendorConfigSchema: z.ZodObject<{
    vendorId: z.ZodString;
    name: z.ZodString;
    apiKey: z.ZodOptional<z.ZodString>;
    apiSecret: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    vendorId: string;
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    settings?: Record<string, unknown> | undefined;
}, {
    name: string;
    vendorId: string;
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    isActive?: boolean | undefined;
    settings?: Record<string, unknown> | undefined;
}>;
export declare const PricingConfigSchema: z.ZodObject<{
    defaultMarkup: z.ZodNumber;
    mapEnforcement: z.ZodDefault<z.ZodBoolean>;
    governmentPricing: z.ZodDefault<z.ZodBoolean>;
    competitivePricing: z.ZodDefault<z.ZodBoolean>;
    autoRepricing: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    defaultMarkup: number;
    mapEnforcement: boolean;
    governmentPricing: boolean;
    competitivePricing: boolean;
    autoRepricing: boolean;
}, {
    defaultMarkup: number;
    mapEnforcement?: boolean | undefined;
    governmentPricing?: boolean | undefined;
    competitivePricing?: boolean | undefined;
    autoRepricing?: boolean | undefined;
}>;
export declare const InventoryConfigSchema: z.ZodObject<{
    lowStockThreshold: z.ZodNumber;
    reorderPoint: z.ZodNumber;
    safetyStock: z.ZodNumber;
    autoReorder: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    lowStockThreshold: number;
    reorderPoint: number;
    safetyStock: number;
    autoReorder: boolean;
}, {
    lowStockThreshold: number;
    reorderPoint: number;
    safetyStock: number;
    autoReorder?: boolean | undefined;
}>;
export declare const NotificationConfigSchema: z.ZodObject<{
    email: z.ZodDefault<z.ZodBoolean>;
    sms: z.ZodDefault<z.ZodBoolean>;
    webhook: z.ZodDefault<z.ZodBoolean>;
    webhookUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: boolean;
    sms: boolean;
    webhook: boolean;
    webhookUrl?: string | undefined;
}, {
    email?: boolean | undefined;
    sms?: boolean | undefined;
    webhook?: boolean | undefined;
    webhookUrl?: string | undefined;
}>;
export declare const TenantLimitsSchema: z.ZodObject<{
    maxProducts: z.ZodNumber;
    maxOrdersPerDay: z.ZodNumber;
    apiRateLimit: z.ZodNumber;
    storageLimit: z.ZodNumber;
    concurrentUsers: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    maxProducts: number;
    maxOrdersPerDay: number;
    apiRateLimit: number;
    storageLimit: number;
    concurrentUsers: number;
}, {
    maxProducts: number;
    maxOrdersPerDay: number;
    apiRateLimit: number;
    storageLimit: number;
    concurrentUsers: number;
}>;
export declare const TenantFeaturesSchema: z.ZodObject<{
    aiEnabled: z.ZodDefault<z.ZodBoolean>;
    advancedAnalytics: z.ZodDefault<z.ZodBoolean>;
    automationEnabled: z.ZodDefault<z.ZodBoolean>;
    customIntegrations: z.ZodDefault<z.ZodBoolean>;
    multiCurrency: z.ZodDefault<z.ZodBoolean>;
    advancedReporting: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    aiEnabled: boolean;
    advancedAnalytics: boolean;
    automationEnabled: boolean;
    customIntegrations: boolean;
    multiCurrency: boolean;
    advancedReporting: boolean;
}, {
    aiEnabled?: boolean | undefined;
    advancedAnalytics?: boolean | undefined;
    automationEnabled?: boolean | undefined;
    customIntegrations?: boolean | undefined;
    multiCurrency?: boolean | undefined;
    advancedReporting?: boolean | undefined;
}>;
export interface TenantConfiguration {
    marketplaces: z.infer<typeof MarketplaceConfigSchema>[];
    vendors: z.infer<typeof VendorConfigSchema>[];
    pricing: z.infer<typeof PricingConfigSchema>;
    inventory: z.infer<typeof InventoryConfigSchema>;
    notifications: z.infer<typeof NotificationConfigSchema>;
}
export interface TenantLimits {
    maxProducts: number;
    maxOrdersPerDay: number;
    apiRateLimit: number;
    storageLimit: number;
    concurrentUsers: number;
}
export interface TenantFeatures {
    aiEnabled: boolean;
    advancedAnalytics: boolean;
    automationEnabled: boolean;
    customIntegrations: boolean;
    multiCurrency: boolean;
    advancedReporting: boolean;
}
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
export interface CreateTenantRequest {
    name: string;
    configuration: Partial<TenantConfiguration>;
    limits?: Partial<TenantLimits>;
    features?: Partial<TenantFeatures>;
}
export interface UpdateTenantRequest {
    name?: string;
    status?: TenantStatus;
    configuration?: Partial<TenantConfiguration>;
    limits?: Partial<TenantLimits>;
    features?: Partial<TenantFeatures>;
}
export interface TenantUsage {
    tenantId: string;
    productsCount: number;
    ordersToday: number;
    apiCallsToday: number;
    storageUsed: number;
    activeUsers: number;
    lastActivity: Date;
}
export interface TenantBilling {
    tenantId: string;
    plan: string;
    billingCycle: 'monthly' | 'yearly';
    nextBillingDate: Date;
    amount: number;
    currency: string;
    status: 'active' | 'past_due' | 'cancelled';
}
export declare const TenantContextSchema: z.ZodObject<{
    tenantId: z.ZodString;
    name: z.ZodString;
    status: z.ZodNativeEnum<typeof TenantStatus>;
    configuration: z.ZodObject<{
        marketplaces: z.ZodArray<z.ZodObject<{
            marketplaceId: z.ZodString;
            name: z.ZodString;
            apiKey: z.ZodOptional<z.ZodString>;
            apiSecret: z.ZodOptional<z.ZodString>;
            accessToken: z.ZodOptional<z.ZodString>;
            refreshToken: z.ZodOptional<z.ZodString>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            marketplaceId: string;
            isActive: boolean;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }, {
            name: string;
            marketplaceId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }>, "many">;
        vendors: z.ZodArray<z.ZodObject<{
            vendorId: z.ZodString;
            name: z.ZodString;
            apiKey: z.ZodOptional<z.ZodString>;
            apiSecret: z.ZodOptional<z.ZodString>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            isActive: boolean;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }, {
            name: string;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }>, "many">;
        pricing: z.ZodObject<{
            defaultMarkup: z.ZodNumber;
            mapEnforcement: z.ZodDefault<z.ZodBoolean>;
            governmentPricing: z.ZodDefault<z.ZodBoolean>;
            competitivePricing: z.ZodDefault<z.ZodBoolean>;
            autoRepricing: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            defaultMarkup: number;
            mapEnforcement: boolean;
            governmentPricing: boolean;
            competitivePricing: boolean;
            autoRepricing: boolean;
        }, {
            defaultMarkup: number;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        }>;
        inventory: z.ZodObject<{
            lowStockThreshold: z.ZodNumber;
            reorderPoint: z.ZodNumber;
            safetyStock: z.ZodNumber;
            autoReorder: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            lowStockThreshold: number;
            reorderPoint: number;
            safetyStock: number;
            autoReorder: boolean;
        }, {
            lowStockThreshold: number;
            reorderPoint: number;
            safetyStock: number;
            autoReorder?: boolean | undefined;
        }>;
        notifications: z.ZodObject<{
            email: z.ZodDefault<z.ZodBoolean>;
            sms: z.ZodDefault<z.ZodBoolean>;
            webhook: z.ZodDefault<z.ZodBoolean>;
            webhookUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            email: boolean;
            sms: boolean;
            webhook: boolean;
            webhookUrl?: string | undefined;
        }, {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        inventory: {
            lowStockThreshold: number;
            reorderPoint: number;
            safetyStock: number;
            autoReorder: boolean;
        };
        marketplaces: {
            name: string;
            marketplaceId: string;
            isActive: boolean;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[];
        vendors: {
            name: string;
            isActive: boolean;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[];
        pricing: {
            defaultMarkup: number;
            mapEnforcement: boolean;
            governmentPricing: boolean;
            competitivePricing: boolean;
            autoRepricing: boolean;
        };
        notifications: {
            email: boolean;
            sms: boolean;
            webhook: boolean;
            webhookUrl?: string | undefined;
        };
    }, {
        inventory: {
            lowStockThreshold: number;
            reorderPoint: number;
            safetyStock: number;
            autoReorder?: boolean | undefined;
        };
        marketplaces: {
            name: string;
            marketplaceId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[];
        vendors: {
            name: string;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[];
        pricing: {
            defaultMarkup: number;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        };
        notifications: {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        };
    }>;
    limits: z.ZodObject<{
        maxProducts: z.ZodNumber;
        maxOrdersPerDay: z.ZodNumber;
        apiRateLimit: z.ZodNumber;
        storageLimit: z.ZodNumber;
        concurrentUsers: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        maxProducts: number;
        maxOrdersPerDay: number;
        apiRateLimit: number;
        storageLimit: number;
        concurrentUsers: number;
    }, {
        maxProducts: number;
        maxOrdersPerDay: number;
        apiRateLimit: number;
        storageLimit: number;
        concurrentUsers: number;
    }>;
    features: z.ZodObject<{
        aiEnabled: z.ZodDefault<z.ZodBoolean>;
        advancedAnalytics: z.ZodDefault<z.ZodBoolean>;
        automationEnabled: z.ZodDefault<z.ZodBoolean>;
        customIntegrations: z.ZodDefault<z.ZodBoolean>;
        multiCurrency: z.ZodDefault<z.ZodBoolean>;
        advancedReporting: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        aiEnabled: boolean;
        advancedAnalytics: boolean;
        automationEnabled: boolean;
        customIntegrations: boolean;
        multiCurrency: boolean;
        advancedReporting: boolean;
    }, {
        aiEnabled?: boolean | undefined;
        advancedAnalytics?: boolean | undefined;
        automationEnabled?: boolean | undefined;
        customIntegrations?: boolean | undefined;
        multiCurrency?: boolean | undefined;
        advancedReporting?: boolean | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    name: string;
    status: TenantStatus;
    createdAt: Date;
    updatedAt: Date;
    configuration: {
        inventory: {
            lowStockThreshold: number;
            reorderPoint: number;
            safetyStock: number;
            autoReorder: boolean;
        };
        marketplaces: {
            name: string;
            marketplaceId: string;
            isActive: boolean;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[];
        vendors: {
            name: string;
            isActive: boolean;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[];
        pricing: {
            defaultMarkup: number;
            mapEnforcement: boolean;
            governmentPricing: boolean;
            competitivePricing: boolean;
            autoRepricing: boolean;
        };
        notifications: {
            email: boolean;
            sms: boolean;
            webhook: boolean;
            webhookUrl?: string | undefined;
        };
    };
    limits: {
        maxProducts: number;
        maxOrdersPerDay: number;
        apiRateLimit: number;
        storageLimit: number;
        concurrentUsers: number;
    };
    features: {
        aiEnabled: boolean;
        advancedAnalytics: boolean;
        automationEnabled: boolean;
        customIntegrations: boolean;
        multiCurrency: boolean;
        advancedReporting: boolean;
    };
}, {
    tenantId: string;
    name: string;
    status: TenantStatus;
    createdAt: Date;
    updatedAt: Date;
    configuration: {
        inventory: {
            lowStockThreshold: number;
            reorderPoint: number;
            safetyStock: number;
            autoReorder?: boolean | undefined;
        };
        marketplaces: {
            name: string;
            marketplaceId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[];
        vendors: {
            name: string;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[];
        pricing: {
            defaultMarkup: number;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        };
        notifications: {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        };
    };
    limits: {
        maxProducts: number;
        maxOrdersPerDay: number;
        apiRateLimit: number;
        storageLimit: number;
        concurrentUsers: number;
    };
    features: {
        aiEnabled?: boolean | undefined;
        advancedAnalytics?: boolean | undefined;
        automationEnabled?: boolean | undefined;
        customIntegrations?: boolean | undefined;
        multiCurrency?: boolean | undefined;
        advancedReporting?: boolean | undefined;
    };
}>;
export declare const CreateTenantRequestSchema: z.ZodObject<{
    name: z.ZodString;
    configuration: z.ZodOptional<z.ZodObject<{
        marketplaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
            marketplaceId: z.ZodString;
            name: z.ZodString;
            apiKey: z.ZodOptional<z.ZodString>;
            apiSecret: z.ZodOptional<z.ZodString>;
            accessToken: z.ZodOptional<z.ZodString>;
            refreshToken: z.ZodOptional<z.ZodString>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            marketplaceId: string;
            isActive: boolean;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }, {
            name: string;
            marketplaceId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }>, "many">>;
        vendors: z.ZodOptional<z.ZodArray<z.ZodObject<{
            vendorId: z.ZodString;
            name: z.ZodString;
            apiKey: z.ZodOptional<z.ZodString>;
            apiSecret: z.ZodOptional<z.ZodString>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            isActive: boolean;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }, {
            name: string;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }>, "many">>;
        pricing: z.ZodOptional<z.ZodObject<{
            defaultMarkup: z.ZodOptional<z.ZodNumber>;
            mapEnforcement: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            governmentPricing: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            competitivePricing: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            autoRepricing: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        }, {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        }>>;
        inventory: z.ZodOptional<z.ZodObject<{
            lowStockThreshold: z.ZodOptional<z.ZodNumber>;
            reorderPoint: z.ZodOptional<z.ZodNumber>;
            safetyStock: z.ZodOptional<z.ZodNumber>;
            autoReorder: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        }, {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        }>>;
        notifications: z.ZodOptional<z.ZodObject<{
            email: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            sms: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            webhook: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            webhookUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        }, {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        inventory?: {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        } | undefined;
        marketplaces?: {
            name: string;
            marketplaceId: string;
            isActive: boolean;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        vendors?: {
            name: string;
            isActive: boolean;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        pricing?: {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
    }, {
        inventory?: {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        } | undefined;
        marketplaces?: {
            name: string;
            marketplaceId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        vendors?: {
            name: string;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        pricing?: {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
    }>>;
    limits: z.ZodOptional<z.ZodObject<{
        maxProducts: z.ZodOptional<z.ZodNumber>;
        maxOrdersPerDay: z.ZodOptional<z.ZodNumber>;
        apiRateLimit: z.ZodOptional<z.ZodNumber>;
        storageLimit: z.ZodOptional<z.ZodNumber>;
        concurrentUsers: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxProducts?: number | undefined;
        maxOrdersPerDay?: number | undefined;
        apiRateLimit?: number | undefined;
        storageLimit?: number | undefined;
        concurrentUsers?: number | undefined;
    }, {
        maxProducts?: number | undefined;
        maxOrdersPerDay?: number | undefined;
        apiRateLimit?: number | undefined;
        storageLimit?: number | undefined;
        concurrentUsers?: number | undefined;
    }>>;
    features: z.ZodOptional<z.ZodObject<{
        aiEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        advancedAnalytics: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        automationEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        customIntegrations: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        multiCurrency: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        advancedReporting: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        aiEnabled?: boolean | undefined;
        advancedAnalytics?: boolean | undefined;
        automationEnabled?: boolean | undefined;
        customIntegrations?: boolean | undefined;
        multiCurrency?: boolean | undefined;
        advancedReporting?: boolean | undefined;
    }, {
        aiEnabled?: boolean | undefined;
        advancedAnalytics?: boolean | undefined;
        automationEnabled?: boolean | undefined;
        customIntegrations?: boolean | undefined;
        multiCurrency?: boolean | undefined;
        advancedReporting?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    configuration?: {
        inventory?: {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        } | undefined;
        marketplaces?: {
            name: string;
            marketplaceId: string;
            isActive: boolean;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        vendors?: {
            name: string;
            isActive: boolean;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        pricing?: {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
    } | undefined;
    limits?: {
        maxProducts?: number | undefined;
        maxOrdersPerDay?: number | undefined;
        apiRateLimit?: number | undefined;
        storageLimit?: number | undefined;
        concurrentUsers?: number | undefined;
    } | undefined;
    features?: {
        aiEnabled?: boolean | undefined;
        advancedAnalytics?: boolean | undefined;
        automationEnabled?: boolean | undefined;
        customIntegrations?: boolean | undefined;
        multiCurrency?: boolean | undefined;
        advancedReporting?: boolean | undefined;
    } | undefined;
}, {
    name: string;
    configuration?: {
        inventory?: {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        } | undefined;
        marketplaces?: {
            name: string;
            marketplaceId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        vendors?: {
            name: string;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        pricing?: {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
    } | undefined;
    limits?: {
        maxProducts?: number | undefined;
        maxOrdersPerDay?: number | undefined;
        apiRateLimit?: number | undefined;
        storageLimit?: number | undefined;
        concurrentUsers?: number | undefined;
    } | undefined;
    features?: {
        aiEnabled?: boolean | undefined;
        advancedAnalytics?: boolean | undefined;
        automationEnabled?: boolean | undefined;
        customIntegrations?: boolean | undefined;
        multiCurrency?: boolean | undefined;
        advancedReporting?: boolean | undefined;
    } | undefined;
}>;
export declare const UpdateTenantRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof TenantStatus>>;
    configuration: z.ZodOptional<z.ZodObject<{
        marketplaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
            marketplaceId: z.ZodString;
            name: z.ZodString;
            apiKey: z.ZodOptional<z.ZodString>;
            apiSecret: z.ZodOptional<z.ZodString>;
            accessToken: z.ZodOptional<z.ZodString>;
            refreshToken: z.ZodOptional<z.ZodString>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            marketplaceId: string;
            isActive: boolean;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }, {
            name: string;
            marketplaceId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }>, "many">>;
        vendors: z.ZodOptional<z.ZodArray<z.ZodObject<{
            vendorId: z.ZodString;
            name: z.ZodString;
            apiKey: z.ZodOptional<z.ZodString>;
            apiSecret: z.ZodOptional<z.ZodString>;
            isActive: z.ZodDefault<z.ZodBoolean>;
            settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            isActive: boolean;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }, {
            name: string;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }>, "many">>;
        pricing: z.ZodOptional<z.ZodObject<{
            defaultMarkup: z.ZodOptional<z.ZodNumber>;
            mapEnforcement: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            governmentPricing: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            competitivePricing: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            autoRepricing: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        }, {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        }>>;
        inventory: z.ZodOptional<z.ZodObject<{
            lowStockThreshold: z.ZodOptional<z.ZodNumber>;
            reorderPoint: z.ZodOptional<z.ZodNumber>;
            safetyStock: z.ZodOptional<z.ZodNumber>;
            autoReorder: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        }, {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        }>>;
        notifications: z.ZodOptional<z.ZodObject<{
            email: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            sms: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            webhook: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            webhookUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        }, {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        inventory?: {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        } | undefined;
        marketplaces?: {
            name: string;
            marketplaceId: string;
            isActive: boolean;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        vendors?: {
            name: string;
            isActive: boolean;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        pricing?: {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
    }, {
        inventory?: {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        } | undefined;
        marketplaces?: {
            name: string;
            marketplaceId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        vendors?: {
            name: string;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        pricing?: {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
    }>>;
    limits: z.ZodOptional<z.ZodObject<{
        maxProducts: z.ZodOptional<z.ZodNumber>;
        maxOrdersPerDay: z.ZodOptional<z.ZodNumber>;
        apiRateLimit: z.ZodOptional<z.ZodNumber>;
        storageLimit: z.ZodOptional<z.ZodNumber>;
        concurrentUsers: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxProducts?: number | undefined;
        maxOrdersPerDay?: number | undefined;
        apiRateLimit?: number | undefined;
        storageLimit?: number | undefined;
        concurrentUsers?: number | undefined;
    }, {
        maxProducts?: number | undefined;
        maxOrdersPerDay?: number | undefined;
        apiRateLimit?: number | undefined;
        storageLimit?: number | undefined;
        concurrentUsers?: number | undefined;
    }>>;
    features: z.ZodOptional<z.ZodObject<{
        aiEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        advancedAnalytics: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        automationEnabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        customIntegrations: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        multiCurrency: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        advancedReporting: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        aiEnabled?: boolean | undefined;
        advancedAnalytics?: boolean | undefined;
        automationEnabled?: boolean | undefined;
        customIntegrations?: boolean | undefined;
        multiCurrency?: boolean | undefined;
        advancedReporting?: boolean | undefined;
    }, {
        aiEnabled?: boolean | undefined;
        advancedAnalytics?: boolean | undefined;
        automationEnabled?: boolean | undefined;
        customIntegrations?: boolean | undefined;
        multiCurrency?: boolean | undefined;
        advancedReporting?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: TenantStatus | undefined;
    configuration?: {
        inventory?: {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        } | undefined;
        marketplaces?: {
            name: string;
            marketplaceId: string;
            isActive: boolean;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        vendors?: {
            name: string;
            isActive: boolean;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        pricing?: {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
    } | undefined;
    limits?: {
        maxProducts?: number | undefined;
        maxOrdersPerDay?: number | undefined;
        apiRateLimit?: number | undefined;
        storageLimit?: number | undefined;
        concurrentUsers?: number | undefined;
    } | undefined;
    features?: {
        aiEnabled?: boolean | undefined;
        advancedAnalytics?: boolean | undefined;
        automationEnabled?: boolean | undefined;
        customIntegrations?: boolean | undefined;
        multiCurrency?: boolean | undefined;
        advancedReporting?: boolean | undefined;
    } | undefined;
}, {
    name?: string | undefined;
    status?: TenantStatus | undefined;
    configuration?: {
        inventory?: {
            lowStockThreshold?: number | undefined;
            reorderPoint?: number | undefined;
            safetyStock?: number | undefined;
            autoReorder?: boolean | undefined;
        } | undefined;
        marketplaces?: {
            name: string;
            marketplaceId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            accessToken?: string | undefined;
            refreshToken?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        vendors?: {
            name: string;
            vendorId: string;
            apiKey?: string | undefined;
            apiSecret?: string | undefined;
            isActive?: boolean | undefined;
            settings?: Record<string, unknown> | undefined;
        }[] | undefined;
        pricing?: {
            defaultMarkup?: number | undefined;
            mapEnforcement?: boolean | undefined;
            governmentPricing?: boolean | undefined;
            competitivePricing?: boolean | undefined;
            autoRepricing?: boolean | undefined;
        } | undefined;
        notifications?: {
            email?: boolean | undefined;
            sms?: boolean | undefined;
            webhook?: boolean | undefined;
            webhookUrl?: string | undefined;
        } | undefined;
    } | undefined;
    limits?: {
        maxProducts?: number | undefined;
        maxOrdersPerDay?: number | undefined;
        apiRateLimit?: number | undefined;
        storageLimit?: number | undefined;
        concurrentUsers?: number | undefined;
    } | undefined;
    features?: {
        aiEnabled?: boolean | undefined;
        advancedAnalytics?: boolean | undefined;
        automationEnabled?: boolean | undefined;
        customIntegrations?: boolean | undefined;
        multiCurrency?: boolean | undefined;
        advancedReporting?: boolean | undefined;
    } | undefined;
}>;
//# sourceMappingURL=tenant.d.ts.map