"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceCalculationResponseSchema = exports.PriceCalculationRequestSchema = exports.UpdatePricingRuleSchema = exports.CreatePricingRuleSchema = exports.PricingRuleSchema = exports.PricingActionSchema = exports.PricingConditionSchema = exports.PricingRuleStatusSchema = exports.PricingRuleTypeSchema = void 0;
const zod_1 = require("zod");
// Pricing Rule Types
exports.PricingRuleTypeSchema = zod_1.z.enum([
    'markup',
    'markdown',
    'fixed_price',
    'percentage',
    'competitive',
    'dynamic'
]);
exports.PricingRuleStatusSchema = zod_1.z.enum(['active', 'inactive', 'draft']);
// Pricing Rule Conditions
exports.PricingConditionSchema = zod_1.z.object({
    field: zod_1.z.string().min(1),
    operator: zod_1.z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'not_in']),
    value: zod_1.z.any(),
    logicalOperator: zod_1.z.enum(['and', 'or']).optional()
});
// Pricing Rule Actions
exports.PricingActionSchema = zod_1.z.object({
    type: zod_1.z.enum(['set_price', 'adjust_percentage', 'adjust_fixed', 'set_markup']),
    value: zod_1.z.number(),
    currency: zod_1.z.string().default('USD'),
    minPrice: zod_1.z.number().positive().optional(),
    maxPrice: zod_1.z.number().positive().optional()
});
// Pricing Rule Schema
exports.PricingRuleSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    name: zod_1.z.string().min(1).max(100),
    type: exports.PricingRuleTypeSchema,
    status: exports.PricingRuleStatusSchema.default('active'),
    conditions: zod_1.z.array(exports.PricingConditionSchema).optional(),
    actions: zod_1.z.array(exports.PricingActionSchema).optional(),
    priority: zod_1.z.number().int().min(0).default(0),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Pricing Rule Types
exports.CreatePricingRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: exports.PricingRuleTypeSchema,
    status: exports.PricingRuleStatusSchema.optional(),
    conditions: zod_1.z.array(exports.PricingConditionSchema).optional(),
    actions: zod_1.z.array(exports.PricingActionSchema).optional(),
    priority: zod_1.z.number().int().min(0).default(0)
});
// Update Pricing Rule Types
exports.UpdatePricingRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    type: exports.PricingRuleTypeSchema.optional(),
    status: exports.PricingRuleStatusSchema.optional(),
    conditions: zod_1.z.array(exports.PricingConditionSchema).optional(),
    actions: zod_1.z.array(exports.PricingActionSchema).optional(),
    priority: zod_1.z.number().int().min(0).optional()
});
// Price Calculation Types
exports.PriceCalculationRequestSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid().optional(),
    sku: zod_1.z.string().min(1).max(50).optional(),
    basePrice: zod_1.z.number().positive(),
    currency: zod_1.z.string().default('USD'),
    quantity: zod_1.z.number().int().positive().default(1),
    customerType: zod_1.z.string().optional(),
    marketplace: zod_1.z.string().optional(),
    region: zod_1.z.string().optional()
});
exports.PriceCalculationResponseSchema = zod_1.z.object({
    originalPrice: zod_1.z.number().positive(),
    calculatedPrice: zod_1.z.number().positive(),
    currency: zod_1.z.string(),
    appliedRules: zod_1.z.array(zod_1.z.string()),
    markup: zod_1.z.number().optional(),
    discount: zod_1.z.number().optional(),
    finalPrice: zod_1.z.number().positive()
});
//# sourceMappingURL=pricing.js.map