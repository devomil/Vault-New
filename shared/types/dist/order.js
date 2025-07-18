"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderAnalyticsSchema = exports.FulfillmentSchema = exports.FulfillmentStatusSchema = exports.UpdateOrderItemSchema = exports.CreateOrderItemRequestSchema = exports.UpdateOrderStatusSchema = exports.UpdateOrderSchema = exports.CreateOrderSchema = exports.CreateOrderItemSchema = exports.OrderSchema = exports.OrderItemSchema = exports.AddressSchema = exports.OrderStatusSchema = void 0;
const zod_1 = require("zod");
// Order Status Types
exports.OrderStatusSchema = zod_1.z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'partially_refunded',
    'backordered',
    'on_hold'
]);
// Address Types
exports.AddressSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(50),
    lastName: zod_1.z.string().min(1).max(50),
    company: zod_1.z.string().optional(),
    address1: zod_1.z.string().min(1).max(100),
    address2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1).max(50),
    state: zod_1.z.string().min(1).max(50),
    postalCode: zod_1.z.string().min(1).max(20),
    country: zod_1.z.string().min(1).max(50),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional()
});
// Order Item Types
exports.OrderItemSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    orderId: zod_1.z.string().cuid(),
    productId: zod_1.z.string().cuid().optional(),
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    quantity: zod_1.z.number().int().positive(),
    price: zod_1.z.number().positive(),
    total: zod_1.z.number().positive(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Order Types
exports.OrderSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    orderNumber: zod_1.z.string().min(1).max(50),
    status: exports.OrderStatusSchema.default('pending'),
    customerEmail: zod_1.z.string().email().optional(),
    customerName: zod_1.z.string().min(1).max(100).optional(),
    totalAmount: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().default('USD'),
    shippingAddress: exports.AddressSchema.optional(),
    billingAddress: exports.AddressSchema.optional(),
    items: zod_1.z.array(exports.OrderItemSchema).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Order Types
exports.CreateOrderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid().optional(),
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    quantity: zod_1.z.number().int().positive(),
    price: zod_1.z.number().positive()
});
exports.CreateOrderSchema = zod_1.z.object({
    customerEmail: zod_1.z.string().email().optional(),
    customerName: zod_1.z.string().min(1).max(100).optional(),
    totalAmount: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().default('USD'),
    shippingAddress: exports.AddressSchema.optional(),
    billingAddress: exports.AddressSchema.optional(),
    items: zod_1.z.array(exports.CreateOrderItemSchema).optional()
});
// Update Order Types
exports.UpdateOrderSchema = zod_1.z.object({
    customerEmail: zod_1.z.string().email().optional(),
    customerName: zod_1.z.string().min(1).max(100).optional(),
    totalAmount: zod_1.z.number().positive().optional(),
    currency: zod_1.z.string().optional(),
    shippingAddress: exports.AddressSchema.optional(),
    billingAddress: exports.AddressSchema.optional()
});
exports.UpdateOrderStatusSchema = zod_1.z.object({
    status: exports.OrderStatusSchema
});
// Create Order Item Types
exports.CreateOrderItemRequestSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid().optional(),
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    quantity: zod_1.z.number().int().positive(),
    price: zod_1.z.number().positive()
});
// Update Order Item Types
exports.UpdateOrderItemSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1).max(50).optional(),
    name: zod_1.z.string().min(1).max(200).optional(),
    quantity: zod_1.z.number().int().positive().optional(),
    price: zod_1.z.number().positive().optional()
});
// Order Fulfillment Types
exports.FulfillmentStatusSchema = zod_1.z.enum([
    'pending',
    'in_progress',
    'shipped',
    'delivered',
    'failed',
    'cancelled'
]);
exports.FulfillmentSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    orderId: zod_1.z.string().cuid(),
    status: exports.FulfillmentStatusSchema.default('pending'),
    trackingNumber: zod_1.z.string().optional(),
    carrier: zod_1.z.string().optional(),
    shippedAt: zod_1.z.date().optional(),
    deliveredAt: zod_1.z.date().optional(),
    notes: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Order Analytics Types
exports.OrderAnalyticsSchema = zod_1.z.object({
    totalOrders: zod_1.z.number().int().min(0),
    totalRevenue: zod_1.z.number().positive(),
    averageOrderValue: zod_1.z.number().positive(),
    ordersByStatus: zod_1.z.record(zod_1.z.number().int().min(0)),
    revenueByPeriod: zod_1.z.record(zod_1.z.number().positive()),
    topProducts: zod_1.z.array(zod_1.z.object({
        sku: zod_1.z.string(),
        name: zod_1.z.string(),
        quantity: zod_1.z.number().int().min(0),
        revenue: zod_1.z.number().positive()
    }))
});
//# sourceMappingURL=order.js.map