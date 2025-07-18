import { z } from 'zod';
export declare const MarketplaceTypeSchema: z.ZodEnum<["amazon", "walmart", "ebay", "newegg", "rakuten"]>;
export type MarketplaceType = z.infer<typeof MarketplaceTypeSchema>;
export declare const MarketplaceStatusSchema: z.ZodEnum<["active", "inactive", "suspended"]>;
export type MarketplaceStatus = z.infer<typeof MarketplaceStatusSchema>;
export declare const MarketplaceCredentialsSchema: z.ZodObject<{
    apiKey: z.ZodOptional<z.ZodString>;
    apiSecret: z.ZodOptional<z.ZodString>;
    sellerId: z.ZodOptional<z.ZodString>;
    accessToken: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
    endpoint: z.ZodOptional<z.ZodString>;
    marketplaceId: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    marketplaceId?: string | undefined;
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    sellerId?: string | undefined;
    endpoint?: string | undefined;
    region?: string | undefined;
}, {
    marketplaceId?: string | undefined;
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    sellerId?: string | undefined;
    endpoint?: string | undefined;
    region?: string | undefined;
}>;
export declare const MarketplaceSettingsSchema: z.ZodObject<{
    autoSync: z.ZodDefault<z.ZodBoolean>;
    syncInterval: z.ZodDefault<z.ZodNumber>;
    priceMarkup: z.ZodDefault<z.ZodNumber>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    inventoryThreshold: z.ZodDefault<z.ZodNumber>;
    shippingTemplate: z.ZodOptional<z.ZodString>;
    fulfillmentType: z.ZodOptional<z.ZodEnum<["fba", "fbm", "seller_fulfilled"]>>;
    notifications: z.ZodDefault<z.ZodObject<{
        lowStock: z.ZodDefault<z.ZodBoolean>;
        priceChanges: z.ZodDefault<z.ZodBoolean>;
        orderStatus: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        lowStock: boolean;
        priceChanges: boolean;
        orderStatus: boolean;
    }, {
        lowStock?: boolean | undefined;
        priceChanges?: boolean | undefined;
        orderStatus?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    notifications: {
        lowStock: boolean;
        priceChanges: boolean;
        orderStatus: boolean;
    };
    autoSync: boolean;
    syncInterval: number;
    priceMarkup: number;
    inventoryThreshold: number;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    shippingTemplate?: string | undefined;
    fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
}, {
    notifications?: {
        lowStock?: boolean | undefined;
        priceChanges?: boolean | undefined;
        orderStatus?: boolean | undefined;
    } | undefined;
    autoSync?: boolean | undefined;
    syncInterval?: number | undefined;
    priceMarkup?: number | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    inventoryThreshold?: number | undefined;
    shippingTemplate?: string | undefined;
    fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
}>;
export declare const MarketplaceSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    marketplaceId: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["amazon", "walmart", "ebay", "newegg", "rakuten"]>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "suspended"]>>;
    apiKey: z.ZodOptional<z.ZodString>;
    apiSecret: z.ZodOptional<z.ZodString>;
    accessToken: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
    settings: z.ZodDefault<z.ZodObject<{
        autoSync: z.ZodDefault<z.ZodBoolean>;
        syncInterval: z.ZodDefault<z.ZodNumber>;
        priceMarkup: z.ZodDefault<z.ZodNumber>;
        minPrice: z.ZodOptional<z.ZodNumber>;
        maxPrice: z.ZodOptional<z.ZodNumber>;
        inventoryThreshold: z.ZodDefault<z.ZodNumber>;
        shippingTemplate: z.ZodOptional<z.ZodString>;
        fulfillmentType: z.ZodOptional<z.ZodEnum<["fba", "fbm", "seller_fulfilled"]>>;
        notifications: z.ZodDefault<z.ZodObject<{
            lowStock: z.ZodDefault<z.ZodBoolean>;
            priceChanges: z.ZodDefault<z.ZodBoolean>;
            orderStatus: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        }, {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        notifications: {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        };
        autoSync: boolean;
        syncInterval: number;
        priceMarkup: number;
        inventoryThreshold: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    }, {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        inventoryThreshold?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    }>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    name: string;
    type: "amazon" | "walmart" | "ebay" | "newegg" | "rakuten";
    status: "active" | "inactive" | "suspended";
    createdAt: Date;
    updatedAt: Date;
    marketplaceId: string;
    settings: {
        notifications: {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        };
        autoSync: boolean;
        syncInterval: number;
        priceMarkup: number;
        inventoryThreshold: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    };
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
}, {
    id: string;
    tenantId: string;
    name: string;
    type: "amazon" | "walmart" | "ebay" | "newegg" | "rakuten";
    createdAt: Date;
    updatedAt: Date;
    marketplaceId: string;
    status?: "active" | "inactive" | "suspended" | undefined;
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    settings?: {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        inventoryThreshold?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    } | undefined;
}>;
export declare const CreateMarketplaceSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["amazon", "walmart", "ebay", "newegg", "rakuten"]>;
    credentials: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        apiSecret: z.ZodOptional<z.ZodString>;
        sellerId: z.ZodOptional<z.ZodString>;
        accessToken: z.ZodOptional<z.ZodString>;
        refreshToken: z.ZodOptional<z.ZodString>;
        endpoint: z.ZodOptional<z.ZodString>;
        marketplaceId: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        marketplaceId?: string | undefined;
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        sellerId?: string | undefined;
        endpoint?: string | undefined;
        region?: string | undefined;
    }, {
        marketplaceId?: string | undefined;
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        sellerId?: string | undefined;
        endpoint?: string | undefined;
        region?: string | undefined;
    }>>;
    settings: z.ZodOptional<z.ZodObject<{
        autoSync: z.ZodDefault<z.ZodBoolean>;
        syncInterval: z.ZodDefault<z.ZodNumber>;
        priceMarkup: z.ZodDefault<z.ZodNumber>;
        minPrice: z.ZodOptional<z.ZodNumber>;
        maxPrice: z.ZodOptional<z.ZodNumber>;
        inventoryThreshold: z.ZodDefault<z.ZodNumber>;
        shippingTemplate: z.ZodOptional<z.ZodString>;
        fulfillmentType: z.ZodOptional<z.ZodEnum<["fba", "fbm", "seller_fulfilled"]>>;
        notifications: z.ZodDefault<z.ZodObject<{
            lowStock: z.ZodDefault<z.ZodBoolean>;
            priceChanges: z.ZodDefault<z.ZodBoolean>;
            orderStatus: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        }, {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        notifications: {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        };
        autoSync: boolean;
        syncInterval: number;
        priceMarkup: number;
        inventoryThreshold: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    }, {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        inventoryThreshold?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "amazon" | "walmart" | "ebay" | "newegg" | "rakuten";
    settings?: {
        notifications: {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        };
        autoSync: boolean;
        syncInterval: number;
        priceMarkup: number;
        inventoryThreshold: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    } | undefined;
    credentials?: {
        marketplaceId?: string | undefined;
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        sellerId?: string | undefined;
        endpoint?: string | undefined;
        region?: string | undefined;
    } | undefined;
}, {
    name: string;
    type: "amazon" | "walmart" | "ebay" | "newegg" | "rakuten";
    settings?: {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        inventoryThreshold?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    } | undefined;
    credentials?: {
        marketplaceId?: string | undefined;
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        sellerId?: string | undefined;
        endpoint?: string | undefined;
        region?: string | undefined;
    } | undefined;
}>;
export declare const UpdateMarketplaceSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["amazon", "walmart", "ebay", "newegg", "rakuten"]>>;
    credentials: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        apiSecret: z.ZodOptional<z.ZodString>;
        sellerId: z.ZodOptional<z.ZodString>;
        accessToken: z.ZodOptional<z.ZodString>;
        refreshToken: z.ZodOptional<z.ZodString>;
        endpoint: z.ZodOptional<z.ZodString>;
        marketplaceId: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        marketplaceId?: string | undefined;
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        sellerId?: string | undefined;
        endpoint?: string | undefined;
        region?: string | undefined;
    }, {
        marketplaceId?: string | undefined;
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        sellerId?: string | undefined;
        endpoint?: string | undefined;
        region?: string | undefined;
    }>>;
    settings: z.ZodOptional<z.ZodObject<{
        autoSync: z.ZodDefault<z.ZodBoolean>;
        syncInterval: z.ZodDefault<z.ZodNumber>;
        priceMarkup: z.ZodDefault<z.ZodNumber>;
        minPrice: z.ZodOptional<z.ZodNumber>;
        maxPrice: z.ZodOptional<z.ZodNumber>;
        inventoryThreshold: z.ZodDefault<z.ZodNumber>;
        shippingTemplate: z.ZodOptional<z.ZodString>;
        fulfillmentType: z.ZodOptional<z.ZodEnum<["fba", "fbm", "seller_fulfilled"]>>;
        notifications: z.ZodDefault<z.ZodObject<{
            lowStock: z.ZodDefault<z.ZodBoolean>;
            priceChanges: z.ZodDefault<z.ZodBoolean>;
            orderStatus: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        }, {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        notifications: {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        };
        autoSync: boolean;
        syncInterval: number;
        priceMarkup: number;
        inventoryThreshold: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    }, {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        inventoryThreshold?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    }>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "amazon" | "walmart" | "ebay" | "newegg" | "rakuten" | undefined;
    status?: "active" | "inactive" | "suspended" | undefined;
    settings?: {
        notifications: {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        };
        autoSync: boolean;
        syncInterval: number;
        priceMarkup: number;
        inventoryThreshold: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    } | undefined;
    credentials?: {
        marketplaceId?: string | undefined;
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        sellerId?: string | undefined;
        endpoint?: string | undefined;
        region?: string | undefined;
    } | undefined;
}, {
    name?: string | undefined;
    type?: "amazon" | "walmart" | "ebay" | "newegg" | "rakuten" | undefined;
    status?: "active" | "inactive" | "suspended" | undefined;
    settings?: {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
        inventoryThreshold?: number | undefined;
        shippingTemplate?: string | undefined;
        fulfillmentType?: "fba" | "fbm" | "seller_fulfilled" | undefined;
    } | undefined;
    credentials?: {
        marketplaceId?: string | undefined;
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        sellerId?: string | undefined;
        endpoint?: string | undefined;
        region?: string | undefined;
    } | undefined;
}>;
export declare const ListingStatusSchema: z.ZodEnum<["active", "inactive", "pending", "error", "deleted"]>;
export type ListingStatus = z.infer<typeof ListingStatusSchema>;
export declare const MarketplaceListingSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    marketplaceId: z.ZodString;
    productId: z.ZodString;
    externalId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "pending", "error", "deleted"]>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    quantity: z.ZodDefault<z.ZodNumber>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: "active" | "inactive" | "pending" | "error" | "deleted";
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    marketplaceId: string;
    productId: string;
    externalId: string;
    quantity: number;
    description?: string | undefined;
    attributes?: Record<string, any> | undefined;
    title?: string | undefined;
    price?: number | undefined;
}, {
    id: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
    marketplaceId: string;
    productId: string;
    externalId: string;
    status?: "active" | "inactive" | "pending" | "error" | "deleted" | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    attributes?: Record<string, any> | undefined;
    title?: string | undefined;
    price?: number | undefined;
    quantity?: number | undefined;
}>;
export declare const CreateMarketplaceListingSchema: z.ZodObject<{
    productId: z.ZodString;
    externalId: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    quantity: z.ZodDefault<z.ZodNumber>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    productId: string;
    externalId: string;
    quantity: number;
    description?: string | undefined;
    attributes?: Record<string, any> | undefined;
    title?: string | undefined;
    price?: number | undefined;
}, {
    productId: string;
    externalId: string;
    currency?: string | undefined;
    description?: string | undefined;
    attributes?: Record<string, any> | undefined;
    title?: string | undefined;
    price?: number | undefined;
    quantity?: number | undefined;
}>;
export declare const UpdateMarketplaceListingSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    quantity: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending", "error", "deleted"]>>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "inactive" | "pending" | "error" | "deleted" | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    attributes?: Record<string, any> | undefined;
    title?: string | undefined;
    price?: number | undefined;
    quantity?: number | undefined;
}, {
    status?: "active" | "inactive" | "pending" | "error" | "deleted" | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    attributes?: Record<string, any> | undefined;
    title?: string | undefined;
    price?: number | undefined;
    quantity?: number | undefined;
}>;
export declare const MarketplaceOrderStatusSchema: z.ZodEnum<["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded", "partially_refunded"]>;
export type MarketplaceOrderStatus = z.infer<typeof MarketplaceOrderStatusSchema>;
export declare const MarketplaceOrderItemSchema: z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    total: number;
    sku: string;
    price: number;
    quantity: number;
}, {
    name: string;
    total: number;
    sku: string;
    price: number;
    quantity: number;
}>;
export declare const MarketplaceOrderSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    marketplaceId: z.ZodString;
    externalId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded", "partially_refunded"]>>;
    customerEmail: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sku: z.ZodString;
        name: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        total: number;
        sku: string;
        price: number;
        quantity: number;
    }, {
        name: string;
        total: number;
        sku: string;
        price: number;
        quantity: number;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" | "refunded" | "partially_refunded";
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    marketplaceId: string;
    externalId: string;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    totalAmount?: number | undefined;
    items?: {
        name: string;
        total: number;
        sku: string;
        price: number;
        quantity: number;
    }[] | undefined;
}, {
    id: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
    marketplaceId: string;
    externalId: string;
    status?: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" | "refunded" | "partially_refunded" | undefined;
    currency?: string | undefined;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    totalAmount?: number | undefined;
    items?: {
        name: string;
        total: number;
        sku: string;
        price: number;
        quantity: number;
    }[] | undefined;
}>;
export declare const SyncOperationTypeSchema: z.ZodEnum<["inventory", "pricing", "listings", "orders"]>;
export type SyncOperationType = z.infer<typeof SyncOperationTypeSchema>;
export declare const SyncOperationStatusSchema: z.ZodEnum<["pending", "in_progress", "completed", "failed"]>;
export type SyncOperationStatus = z.infer<typeof SyncOperationStatusSchema>;
export declare const SyncOperationSchema: z.ZodObject<{
    id: z.ZodString;
    marketplaceId: z.ZodString;
    type: z.ZodEnum<["inventory", "pricing", "listings", "orders"]>;
    status: z.ZodDefault<z.ZodEnum<["pending", "in_progress", "completed", "failed"]>>;
    startedAt: z.ZodOptional<z.ZodDate>;
    completedAt: z.ZodOptional<z.ZodDate>;
    error: z.ZodOptional<z.ZodString>;
    itemsProcessed: z.ZodDefault<z.ZodNumber>;
    itemsTotal: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "orders" | "inventory" | "pricing" | "listings";
    status: "pending" | "in_progress" | "completed" | "failed";
    createdAt: Date;
    updatedAt: Date;
    marketplaceId: string;
    itemsProcessed: number;
    itemsTotal: number;
    error?: string | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
}, {
    id: string;
    type: "orders" | "inventory" | "pricing" | "listings";
    createdAt: Date;
    updatedAt: Date;
    marketplaceId: string;
    status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
    error?: string | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
    itemsProcessed?: number | undefined;
    itemsTotal?: number | undefined;
}>;
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
//# sourceMappingURL=marketplace.d.ts.map