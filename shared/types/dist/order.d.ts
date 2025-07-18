import { z } from 'zod';
export declare const OrderStatusSchema: z.ZodEnum<["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded", "partially_refunded", "backordered", "on_hold"]>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export declare const AddressSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    address1: z.ZodString;
    address2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    email?: string | undefined;
    company?: string | undefined;
    address2?: string | undefined;
    phone?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    email?: string | undefined;
    company?: string | undefined;
    address2?: string | undefined;
    phone?: string | undefined;
}>;
export declare const OrderItemSchema: z.ZodObject<{
    id: z.ZodString;
    orderId: z.ZodString;
    productId: z.ZodOptional<z.ZodString>;
    sku: z.ZodString;
    name: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
    total: z.ZodNumber;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    total: number;
    sku: string;
    price: number;
    quantity: number;
    orderId: string;
    productId?: string | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    total: number;
    sku: string;
    price: number;
    quantity: number;
    orderId: string;
    productId?: string | undefined;
}>;
export declare const OrderSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    orderNumber: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded", "partially_refunded", "backordered", "on_hold"]>>;
    customerEmail: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    shippingAddress: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }>>;
    billingAddress: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }>>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        orderId: z.ZodString;
        productId: z.ZodOptional<z.ZodString>;
        sku: z.ZodString;
        name: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
        total: z.ZodNumber;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        total: number;
        sku: string;
        price: number;
        quantity: number;
        orderId: string;
        productId?: string | undefined;
    }, {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        total: number;
        sku: string;
        price: number;
        quantity: number;
        orderId: string;
        productId?: string | undefined;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    status: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" | "refunded" | "partially_refunded" | "backordered" | "processing" | "on_hold";
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    orderNumber: string;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    totalAmount?: number | undefined;
    items?: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        total: number;
        sku: string;
        price: number;
        quantity: number;
        orderId: string;
        productId?: string | undefined;
    }[] | undefined;
    shippingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    billingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
}, {
    id: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
    orderNumber: string;
    status?: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" | "refunded" | "partially_refunded" | "backordered" | "processing" | "on_hold" | undefined;
    currency?: string | undefined;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    totalAmount?: number | undefined;
    items?: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        total: number;
        sku: string;
        price: number;
        quantity: number;
        orderId: string;
        productId?: string | undefined;
    }[] | undefined;
    shippingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    billingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
}>;
export declare const CreateOrderItemSchema: z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    sku: z.ZodString;
    name: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    productId?: string | undefined;
}, {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    productId?: string | undefined;
}>;
export declare const CreateOrderSchema: z.ZodObject<{
    customerEmail: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    shippingAddress: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }>>;
    billingAddress: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }>>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodOptional<z.ZodString>;
        sku: z.ZodString;
        name: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        sku: string;
        price: number;
        quantity: number;
        productId?: string | undefined;
    }, {
        name: string;
        sku: string;
        price: number;
        quantity: number;
        productId?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    totalAmount?: number | undefined;
    items?: {
        name: string;
        sku: string;
        price: number;
        quantity: number;
        productId?: string | undefined;
    }[] | undefined;
    shippingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    billingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
}, {
    currency?: string | undefined;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    totalAmount?: number | undefined;
    items?: {
        name: string;
        sku: string;
        price: number;
        quantity: number;
        productId?: string | undefined;
    }[] | undefined;
    shippingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    billingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
}>;
export declare const UpdateOrderSchema: z.ZodObject<{
    customerEmail: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    shippingAddress: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }>>;
    billingAddress: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    currency?: string | undefined;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    totalAmount?: number | undefined;
    shippingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    billingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
}, {
    currency?: string | undefined;
    customerEmail?: string | undefined;
    customerName?: string | undefined;
    totalAmount?: number | undefined;
    shippingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    billingAddress?: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        email?: string | undefined;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    } | undefined;
}>;
export declare const UpdateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded", "partially_refunded", "backordered", "on_hold"]>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" | "refunded" | "partially_refunded" | "backordered" | "processing" | "on_hold";
}, {
    status: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" | "refunded" | "partially_refunded" | "backordered" | "processing" | "on_hold";
}>;
export declare const CreateOrderItemRequestSchema: z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    sku: z.ZodString;
    name: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    productId?: string | undefined;
}, {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    productId?: string | undefined;
}>;
export declare const UpdateOrderItemSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    quantity: z.ZodOptional<z.ZodNumber>;
    price: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    sku?: string | undefined;
    price?: number | undefined;
    quantity?: number | undefined;
}, {
    name?: string | undefined;
    sku?: string | undefined;
    price?: number | undefined;
    quantity?: number | undefined;
}>;
export declare const FulfillmentStatusSchema: z.ZodEnum<["pending", "in_progress", "shipped", "delivered", "failed", "cancelled"]>;
export type FulfillmentStatus = z.infer<typeof FulfillmentStatusSchema>;
export declare const FulfillmentSchema: z.ZodObject<{
    id: z.ZodString;
    orderId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "in_progress", "shipped", "delivered", "failed", "cancelled"]>>;
    trackingNumber: z.ZodOptional<z.ZodString>;
    carrier: z.ZodOptional<z.ZodString>;
    shippedAt: z.ZodOptional<z.ZodDate>;
    deliveredAt: z.ZodOptional<z.ZodDate>;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "cancelled" | "shipped" | "delivered" | "in_progress" | "failed";
    createdAt: Date;
    updatedAt: Date;
    orderId: string;
    trackingNumber?: string | undefined;
    carrier?: string | undefined;
    shippedAt?: Date | undefined;
    deliveredAt?: Date | undefined;
    notes?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    orderId: string;
    status?: "pending" | "cancelled" | "shipped" | "delivered" | "in_progress" | "failed" | undefined;
    trackingNumber?: string | undefined;
    carrier?: string | undefined;
    shippedAt?: Date | undefined;
    deliveredAt?: Date | undefined;
    notes?: string | undefined;
}>;
export declare const OrderAnalyticsSchema: z.ZodObject<{
    totalOrders: z.ZodNumber;
    totalRevenue: z.ZodNumber;
    averageOrderValue: z.ZodNumber;
    ordersByStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
    revenueByPeriod: z.ZodRecord<z.ZodString, z.ZodNumber>;
    topProducts: z.ZodArray<z.ZodObject<{
        sku: z.ZodString;
        name: z.ZodString;
        quantity: z.ZodNumber;
        revenue: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        revenue: number;
        name: string;
        sku: string;
        quantity: number;
    }, {
        revenue: number;
        name: string;
        sku: string;
        quantity: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    revenueByPeriod: Record<string, number>;
    topProducts: {
        revenue: number;
        name: string;
        sku: string;
        quantity: number;
    }[];
}, {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    revenueByPeriod: Record<string, number>;
    topProducts: {
        revenue: number;
        name: string;
        sku: string;
        quantity: number;
    }[];
}>;
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
export type UpdateOrderStatus = z.infer<typeof UpdateOrderStatusSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type CreateOrderItem = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderItemRequest = z.infer<typeof CreateOrderItemRequestSchema>;
export type UpdateOrderItem = z.infer<typeof UpdateOrderItemSchema>;
export type Fulfillment = z.infer<typeof FulfillmentSchema>;
export type OrderAnalytics = z.infer<typeof OrderAnalyticsSchema>;
//# sourceMappingURL=order.d.ts.map