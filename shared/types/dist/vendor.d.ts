import { z } from 'zod';
export declare const VendorTypeSchema: z.ZodEnum<["ingram_micro", "td_synnex", "dh_distributing", "wynit", "other"]>;
export type VendorType = z.infer<typeof VendorTypeSchema>;
export declare const VendorStatusSchema: z.ZodEnum<["active", "inactive", "suspended"]>;
export type VendorStatus = z.infer<typeof VendorStatusSchema>;
export declare const VendorCredentialsSchema: z.ZodObject<{
    apiKey: z.ZodOptional<z.ZodString>;
    apiSecret: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    accessToken: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
    endpoint: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryAttempts: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    endpoint?: string | undefined;
    username?: string | undefined;
    password?: string | undefined;
    timeout?: number | undefined;
    retryAttempts?: number | undefined;
}, {
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    endpoint?: string | undefined;
    username?: string | undefined;
    password?: string | undefined;
    timeout?: number | undefined;
    retryAttempts?: number | undefined;
}>;
export declare const VendorSettingsSchema: z.ZodObject<{
    autoSync: z.ZodDefault<z.ZodBoolean>;
    syncInterval: z.ZodDefault<z.ZodNumber>;
    priceMarkup: z.ZodDefault<z.ZodNumber>;
    minOrderQuantity: z.ZodDefault<z.ZodNumber>;
    maxOrderQuantity: z.ZodDefault<z.ZodNumber>;
    leadTime: z.ZodDefault<z.ZodNumber>;
    paymentTerms: z.ZodDefault<z.ZodString>;
    shippingMethod: z.ZodDefault<z.ZodString>;
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
    minOrderQuantity: number;
    maxOrderQuantity: number;
    leadTime: number;
    paymentTerms: string;
    shippingMethod: string;
}, {
    notifications?: {
        lowStock?: boolean | undefined;
        priceChanges?: boolean | undefined;
        orderStatus?: boolean | undefined;
    } | undefined;
    autoSync?: boolean | undefined;
    syncInterval?: number | undefined;
    priceMarkup?: number | undefined;
    minOrderQuantity?: number | undefined;
    maxOrderQuantity?: number | undefined;
    leadTime?: number | undefined;
    paymentTerms?: string | undefined;
    shippingMethod?: string | undefined;
}>;
export declare const VendorSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    vendorId: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["ingram_micro", "td_synnex", "dh_distributing", "wynit", "other"]>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "suspended"]>>;
    apiKey: z.ZodOptional<z.ZodString>;
    apiSecret: z.ZodOptional<z.ZodString>;
    settings: z.ZodDefault<z.ZodObject<{
        autoSync: z.ZodDefault<z.ZodBoolean>;
        syncInterval: z.ZodDefault<z.ZodNumber>;
        priceMarkup: z.ZodDefault<z.ZodNumber>;
        minOrderQuantity: z.ZodDefault<z.ZodNumber>;
        maxOrderQuantity: z.ZodDefault<z.ZodNumber>;
        leadTime: z.ZodDefault<z.ZodNumber>;
        paymentTerms: z.ZodDefault<z.ZodString>;
        shippingMethod: z.ZodDefault<z.ZodString>;
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
        minOrderQuantity: number;
        maxOrderQuantity: number;
        leadTime: number;
        paymentTerms: string;
        shippingMethod: string;
    }, {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minOrderQuantity?: number | undefined;
        maxOrderQuantity?: number | undefined;
        leadTime?: number | undefined;
        paymentTerms?: string | undefined;
        shippingMethod?: string | undefined;
    }>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    name: string;
    type: "other" | "ingram_micro" | "td_synnex" | "dh_distributing" | "wynit";
    status: "active" | "inactive" | "suspended";
    createdAt: Date;
    updatedAt: Date;
    settings: {
        notifications: {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        };
        autoSync: boolean;
        syncInterval: number;
        priceMarkup: number;
        minOrderQuantity: number;
        maxOrderQuantity: number;
        leadTime: number;
        paymentTerms: string;
        shippingMethod: string;
    };
    vendorId: string;
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
}, {
    id: string;
    tenantId: string;
    name: string;
    type: "other" | "ingram_micro" | "td_synnex" | "dh_distributing" | "wynit";
    createdAt: Date;
    updatedAt: Date;
    vendorId: string;
    status?: "active" | "inactive" | "suspended" | undefined;
    apiKey?: string | undefined;
    apiSecret?: string | undefined;
    settings?: {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minOrderQuantity?: number | undefined;
        maxOrderQuantity?: number | undefined;
        leadTime?: number | undefined;
        paymentTerms?: string | undefined;
        shippingMethod?: string | undefined;
    } | undefined;
}>;
export declare const CreateVendorSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["ingram_micro", "td_synnex", "dh_distributing", "wynit", "other"]>;
    credentials: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        apiSecret: z.ZodOptional<z.ZodString>;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        accessToken: z.ZodOptional<z.ZodString>;
        refreshToken: z.ZodOptional<z.ZodString>;
        endpoint: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
        retryAttempts: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        endpoint?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
        timeout?: number | undefined;
        retryAttempts?: number | undefined;
    }, {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        endpoint?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
        timeout?: number | undefined;
        retryAttempts?: number | undefined;
    }>>;
    settings: z.ZodOptional<z.ZodObject<{
        autoSync: z.ZodDefault<z.ZodBoolean>;
        syncInterval: z.ZodDefault<z.ZodNumber>;
        priceMarkup: z.ZodDefault<z.ZodNumber>;
        minOrderQuantity: z.ZodDefault<z.ZodNumber>;
        maxOrderQuantity: z.ZodDefault<z.ZodNumber>;
        leadTime: z.ZodDefault<z.ZodNumber>;
        paymentTerms: z.ZodDefault<z.ZodString>;
        shippingMethod: z.ZodDefault<z.ZodString>;
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
        minOrderQuantity: number;
        maxOrderQuantity: number;
        leadTime: number;
        paymentTerms: string;
        shippingMethod: string;
    }, {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minOrderQuantity?: number | undefined;
        maxOrderQuantity?: number | undefined;
        leadTime?: number | undefined;
        paymentTerms?: string | undefined;
        shippingMethod?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "other" | "ingram_micro" | "td_synnex" | "dh_distributing" | "wynit";
    settings?: {
        notifications: {
            lowStock: boolean;
            priceChanges: boolean;
            orderStatus: boolean;
        };
        autoSync: boolean;
        syncInterval: number;
        priceMarkup: number;
        minOrderQuantity: number;
        maxOrderQuantity: number;
        leadTime: number;
        paymentTerms: string;
        shippingMethod: string;
    } | undefined;
    credentials?: {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        endpoint?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
        timeout?: number | undefined;
        retryAttempts?: number | undefined;
    } | undefined;
}, {
    name: string;
    type: "other" | "ingram_micro" | "td_synnex" | "dh_distributing" | "wynit";
    settings?: {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minOrderQuantity?: number | undefined;
        maxOrderQuantity?: number | undefined;
        leadTime?: number | undefined;
        paymentTerms?: string | undefined;
        shippingMethod?: string | undefined;
    } | undefined;
    credentials?: {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        endpoint?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
        timeout?: number | undefined;
        retryAttempts?: number | undefined;
    } | undefined;
}>;
export declare const UpdateVendorSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["ingram_micro", "td_synnex", "dh_distributing", "wynit", "other"]>>;
    credentials: z.ZodOptional<z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        apiSecret: z.ZodOptional<z.ZodString>;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        accessToken: z.ZodOptional<z.ZodString>;
        refreshToken: z.ZodOptional<z.ZodString>;
        endpoint: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
        retryAttempts: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        endpoint?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
        timeout?: number | undefined;
        retryAttempts?: number | undefined;
    }, {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        endpoint?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
        timeout?: number | undefined;
        retryAttempts?: number | undefined;
    }>>;
    settings: z.ZodOptional<z.ZodObject<{
        autoSync: z.ZodDefault<z.ZodBoolean>;
        syncInterval: z.ZodDefault<z.ZodNumber>;
        priceMarkup: z.ZodDefault<z.ZodNumber>;
        minOrderQuantity: z.ZodDefault<z.ZodNumber>;
        maxOrderQuantity: z.ZodDefault<z.ZodNumber>;
        leadTime: z.ZodDefault<z.ZodNumber>;
        paymentTerms: z.ZodDefault<z.ZodString>;
        shippingMethod: z.ZodDefault<z.ZodString>;
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
        minOrderQuantity: number;
        maxOrderQuantity: number;
        leadTime: number;
        paymentTerms: string;
        shippingMethod: string;
    }, {
        notifications?: {
            lowStock?: boolean | undefined;
            priceChanges?: boolean | undefined;
            orderStatus?: boolean | undefined;
        } | undefined;
        autoSync?: boolean | undefined;
        syncInterval?: number | undefined;
        priceMarkup?: number | undefined;
        minOrderQuantity?: number | undefined;
        maxOrderQuantity?: number | undefined;
        leadTime?: number | undefined;
        paymentTerms?: string | undefined;
        shippingMethod?: string | undefined;
    }>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "other" | "ingram_micro" | "td_synnex" | "dh_distributing" | "wynit" | undefined;
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
        minOrderQuantity: number;
        maxOrderQuantity: number;
        leadTime: number;
        paymentTerms: string;
        shippingMethod: string;
    } | undefined;
    credentials?: {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        endpoint?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
        timeout?: number | undefined;
        retryAttempts?: number | undefined;
    } | undefined;
}, {
    name?: string | undefined;
    type?: "other" | "ingram_micro" | "td_synnex" | "dh_distributing" | "wynit" | undefined;
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
        minOrderQuantity?: number | undefined;
        maxOrderQuantity?: number | undefined;
        leadTime?: number | undefined;
        paymentTerms?: string | undefined;
        shippingMethod?: string | undefined;
    } | undefined;
    credentials?: {
        apiKey?: string | undefined;
        apiSecret?: string | undefined;
        accessToken?: string | undefined;
        refreshToken?: string | undefined;
        endpoint?: string | undefined;
        username?: string | undefined;
        password?: string | undefined;
        timeout?: number | undefined;
        retryAttempts?: number | undefined;
    } | undefined;
}>;
export declare const VendorProductStatusSchema: z.ZodEnum<["active", "inactive", "discontinued", "out_of_stock"]>;
export type VendorProductStatus = z.infer<typeof VendorProductStatusSchema>;
export declare const VendorProductSchema: z.ZodObject<{
    id: z.ZodString;
    vendorId: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    price: z.ZodOptional<z.ZodNumber>;
    cost: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodDefault<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "discontinued", "out_of_stock"]>>;
    description: z.ZodOptional<z.ZodString>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    status: "active" | "inactive" | "discontinued" | "out_of_stock";
    createdAt: Date;
    updatedAt: Date;
    vendorId: string;
    sku: string;
    quantity: number;
    description?: string | undefined;
    attributes?: Record<string, any> | undefined;
    price?: number | undefined;
    cost?: number | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    vendorId: string;
    sku: string;
    status?: "active" | "inactive" | "discontinued" | "out_of_stock" | undefined;
    description?: string | undefined;
    attributes?: Record<string, any> | undefined;
    price?: number | undefined;
    quantity?: number | undefined;
    cost?: number | undefined;
}>;
export declare const CreateVendorProductSchema: z.ZodObject<{
    vendorId: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    price: z.ZodOptional<z.ZodNumber>;
    cost: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodDefault<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    vendorId: string;
    sku: string;
    quantity: number;
    description?: string | undefined;
    attributes?: Record<string, any> | undefined;
    price?: number | undefined;
    cost?: number | undefined;
}, {
    name: string;
    vendorId: string;
    sku: string;
    description?: string | undefined;
    attributes?: Record<string, any> | undefined;
    price?: number | undefined;
    quantity?: number | undefined;
    cost?: number | undefined;
}>;
export declare const UpdateVendorProductSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    cost: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "discontinued", "out_of_stock"]>>;
    description: z.ZodOptional<z.ZodString>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "active" | "inactive" | "discontinued" | "out_of_stock" | undefined;
    description?: string | undefined;
    sku?: string | undefined;
    attributes?: Record<string, any> | undefined;
    price?: number | undefined;
    quantity?: number | undefined;
    cost?: number | undefined;
}, {
    name?: string | undefined;
    status?: "active" | "inactive" | "discontinued" | "out_of_stock" | undefined;
    description?: string | undefined;
    sku?: string | undefined;
    attributes?: Record<string, any> | undefined;
    price?: number | undefined;
    quantity?: number | undefined;
    cost?: number | undefined;
}>;
export declare const VendorOrderStatusSchema: z.ZodEnum<["pending", "confirmed", "shipped", "delivered", "cancelled", "backordered"]>;
export type VendorOrderStatus = z.infer<typeof VendorOrderStatusSchema>;
export declare const VendorOrderItemSchema: z.ZodObject<{
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
export declare const VendorOrderSchema: z.ZodObject<{
    id: z.ZodString;
    vendorId: z.ZodString;
    orderId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "confirmed", "shipped", "delivered", "cancelled", "backordered"]>>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
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
    status: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" | "backordered";
    createdAt: Date;
    updatedAt: Date;
    vendorId: string;
    orderId: string;
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
    createdAt: Date;
    updatedAt: Date;
    vendorId: string;
    orderId: string;
    status?: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" | "backordered" | undefined;
    totalAmount?: number | undefined;
    items?: {
        name: string;
        total: number;
        sku: string;
        price: number;
        quantity: number;
    }[] | undefined;
}>;
export declare const CreateVendorOrderSchema: z.ZodObject<{
    vendorId: z.ZodString;
    orderId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
    totalAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    vendorId: string;
    items: {
        name: string;
        total: number;
        sku: string;
        price: number;
        quantity: number;
    }[];
    orderId: string;
    totalAmount?: number | undefined;
}, {
    vendorId: string;
    items: {
        name: string;
        total: number;
        sku: string;
        price: number;
        quantity: number;
    }[];
    orderId: string;
    totalAmount?: number | undefined;
}>;
export declare const UpdateVendorOrderSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "shipped", "delivered", "cancelled", "backordered"]>>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
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
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" | "backordered" | undefined;
    totalAmount?: number | undefined;
    items?: {
        name: string;
        total: number;
        sku: string;
        price: number;
        quantity: number;
    }[] | undefined;
}, {
    status?: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" | "backordered" | undefined;
    totalAmount?: number | undefined;
    items?: {
        name: string;
        total: number;
        sku: string;
        price: number;
        quantity: number;
    }[] | undefined;
}>;
export declare const SyncOperationTypeSchema: z.ZodEnum<["products", "pricing", "inventory", "orders"]>;
export type SyncOperationType = z.infer<typeof SyncOperationTypeSchema>;
export declare const SyncOperationStatusSchema: z.ZodEnum<["pending", "in_progress", "completed", "failed"]>;
export type SyncOperationStatus = z.infer<typeof SyncOperationStatusSchema>;
export declare const SyncOperationSchema: z.ZodObject<{
    id: z.ZodString;
    vendorId: z.ZodString;
    type: z.ZodEnum<["products", "pricing", "inventory", "orders"]>;
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
    type: "orders" | "products" | "inventory" | "pricing";
    status: "pending" | "in_progress" | "completed" | "failed";
    createdAt: Date;
    updatedAt: Date;
    vendorId: string;
    itemsProcessed: number;
    itemsTotal: number;
    error?: string | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
}, {
    id: string;
    type: "orders" | "products" | "inventory" | "pricing";
    createdAt: Date;
    updatedAt: Date;
    vendorId: string;
    status?: "pending" | "in_progress" | "completed" | "failed" | undefined;
    error?: string | undefined;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
    itemsProcessed?: number | undefined;
    itemsTotal?: number | undefined;
}>;
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
//# sourceMappingURL=vendor.d.ts.map