import { z } from 'zod';

// Order Status Types
export const OrderStatusSchema = z.enum([
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
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

// Address Types
export const AddressSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  company: z.string().optional(),
  address1: z.string().min(1).max(100),
  address2: z.string().optional(),
  city: z.string().min(1).max(50),
  state: z.string().min(1).max(50),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(50),
  phone: z.string().optional(),
  email: z.string().email().optional()
});

// Order Item Types
export const OrderItemSchema = z.object({
  id: z.string().cuid(),
  orderId: z.string().cuid(),
  productId: z.string().cuid().optional(),
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  total: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Order Types
export const OrderSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  orderNumber: z.string().min(1).max(50),
  status: OrderStatusSchema.default('pending'),
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(1).max(100).optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.string().default('USD'),
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional(),
  items: z.array(OrderItemSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Order Types
export const CreateOrderItemSchema = z.object({
  productId: z.string().cuid().optional(),
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  price: z.number().positive()
});

export const CreateOrderSchema = z.object({
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(1).max(100).optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.string().default('USD'),
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional(),
  items: z.array(CreateOrderItemSchema).optional()
});

// Update Order Types
export const UpdateOrderSchema = z.object({
  customerEmail: z.string().email().optional(),
  customerName: z.string().min(1).max(100).optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.string().optional(),
  shippingAddress: AddressSchema.optional(),
  billingAddress: AddressSchema.optional()
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema
});

// Create Order Item Types
export const CreateOrderItemRequestSchema = z.object({
  productId: z.string().cuid().optional(),
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  price: z.number().positive()
});

// Update Order Item Types
export const UpdateOrderItemSchema = z.object({
  sku: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
  quantity: z.number().int().positive().optional(),
  price: z.number().positive().optional()
});

// Order Fulfillment Types
export const FulfillmentStatusSchema = z.enum([
  'pending',
  'in_progress',
  'shipped',
  'delivered',
  'failed',
  'cancelled'
]);
export type FulfillmentStatus = z.infer<typeof FulfillmentStatusSchema>;

export const FulfillmentSchema = z.object({
  id: z.string().cuid(),
  orderId: z.string().cuid(),
  status: FulfillmentStatusSchema.default('pending'),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  shippedAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Order Analytics Types
export const OrderAnalyticsSchema = z.object({
  totalOrders: z.number().int().min(0),
  totalRevenue: z.number().positive(),
  averageOrderValue: z.number().positive(),
  ordersByStatus: z.record(z.number().int().min(0)),
  revenueByPeriod: z.record(z.number().positive()),
  topProducts: z.array(z.object({
    sku: z.string(),
    name: z.string(),
    quantity: z.number().int().min(0),
    revenue: z.number().positive()
  }))
});

// Export types
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