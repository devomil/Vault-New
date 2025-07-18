import { z } from 'zod';

// Pricing Rule Types
export const PricingRuleTypeSchema = z.enum([
  'markup',
  'markdown',
  'fixed_price',
  'percentage',
  'competitive',
  'dynamic'
]);
export type PricingRuleType = z.infer<typeof PricingRuleTypeSchema>;

export const PricingRuleStatusSchema = z.enum(['active', 'inactive', 'draft']);
export type PricingRuleStatus = z.infer<typeof PricingRuleStatusSchema>;

// Pricing Rule Conditions
export const PricingConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'not_in']),
  value: z.any(),
  logicalOperator: z.enum(['and', 'or']).optional()
});

// Pricing Rule Actions
export const PricingActionSchema = z.object({
  type: z.enum(['set_price', 'adjust_percentage', 'adjust_fixed', 'set_markup']),
  value: z.number(),
  currency: z.string().default('USD'),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional()
});

// Pricing Rule Schema
export const PricingRuleSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  name: z.string().min(1).max(100),
  type: PricingRuleTypeSchema,
  status: PricingRuleStatusSchema.default('active'),
  conditions: z.array(PricingConditionSchema).optional(),
  actions: z.array(PricingActionSchema).optional(),
  priority: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Pricing Rule Types
export const CreatePricingRuleSchema = z.object({
  name: z.string().min(1).max(100),
  type: PricingRuleTypeSchema,
  status: PricingRuleStatusSchema.optional(),
  conditions: z.array(PricingConditionSchema).optional(),
  actions: z.array(PricingActionSchema).optional(),
  priority: z.number().int().min(0).default(0)
});

// Update Pricing Rule Types
export const UpdatePricingRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: PricingRuleTypeSchema.optional(),
  status: PricingRuleStatusSchema.optional(),
  conditions: z.array(PricingConditionSchema).optional(),
  actions: z.array(PricingActionSchema).optional(),
  priority: z.number().int().min(0).optional()
});

// Price Calculation Types
export const PriceCalculationRequestSchema = z.object({
  productId: z.string().cuid().optional(),
  sku: z.string().min(1).max(50).optional(),
  basePrice: z.number().positive(),
  currency: z.string().default('USD'),
  quantity: z.number().int().positive().default(1),
  customerType: z.string().optional(),
  marketplace: z.string().optional(),
  region: z.string().optional()
});

export const PriceCalculationResponseSchema = z.object({
  originalPrice: z.number().positive(),
  calculatedPrice: z.number().positive(),
  currency: z.string(),
  appliedRules: z.array(z.string()),
  markup: z.number().optional(),
  discount: z.number().optional(),
  finalPrice: z.number().positive()
});

// Export types
export type PricingRule = z.infer<typeof PricingRuleSchema>;
export type CreatePricingRule = z.infer<typeof CreatePricingRuleSchema>;
export type UpdatePricingRule = z.infer<typeof UpdatePricingRuleSchema>;
export type PricingCondition = z.infer<typeof PricingConditionSchema>;
export type PricingAction = z.infer<typeof PricingActionSchema>;

export type PriceCalculationRequest = z.infer<typeof PriceCalculationRequestSchema>;
export type PriceCalculationResponse = z.infer<typeof PriceCalculationResponseSchema>; 