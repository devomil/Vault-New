import { z } from 'zod';
export declare const PricingRuleTypeSchema: z.ZodEnum<["markup", "markdown", "fixed_price", "percentage", "competitive", "dynamic"]>;
export type PricingRuleType = z.infer<typeof PricingRuleTypeSchema>;
export declare const PricingRuleStatusSchema: z.ZodEnum<["active", "inactive", "draft"]>;
export type PricingRuleStatus = z.infer<typeof PricingRuleStatusSchema>;
export declare const PricingConditionSchema: z.ZodObject<{
    field: z.ZodString;
    operator: z.ZodEnum<["equals", "not_equals", "greater_than", "less_than", "contains", "in", "not_in"]>;
    value: z.ZodAny;
    logicalOperator: z.ZodOptional<z.ZodEnum<["and", "or"]>>;
}, "strip", z.ZodTypeAny, {
    field: string;
    operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
    value?: any;
    logicalOperator?: "and" | "or" | undefined;
}, {
    field: string;
    operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
    value?: any;
    logicalOperator?: "and" | "or" | undefined;
}>;
export declare const PricingActionSchema: z.ZodObject<{
    type: z.ZodEnum<["set_price", "adjust_percentage", "adjust_fixed", "set_markup"]>;
    value: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
    currency: string;
    value: number;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}, {
    type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
    value: number;
    currency?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}>;
export declare const PricingRuleSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["markup", "markdown", "fixed_price", "percentage", "competitive", "dynamic"]>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "draft"]>>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["equals", "not_equals", "greater_than", "less_than", "contains", "in", "not_in"]>;
        value: z.ZodAny;
        logicalOperator: z.ZodOptional<z.ZodEnum<["and", "or"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }, {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }>, "many">>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["set_price", "adjust_percentage", "adjust_fixed", "set_markup"]>;
        value: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        minPrice: z.ZodOptional<z.ZodNumber>;
        maxPrice: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        currency: string;
        value: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }, {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        value: number;
        currency?: string | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }>, "many">>;
    priority: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    name: string;
    type: "markup" | "markdown" | "fixed_price" | "percentage" | "competitive" | "dynamic";
    status: "active" | "inactive" | "draft";
    createdAt: Date;
    updatedAt: Date;
    priority: number;
    conditions?: {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }[] | undefined;
    actions?: {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        currency: string;
        value: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }[] | undefined;
}, {
    id: string;
    tenantId: string;
    name: string;
    type: "markup" | "markdown" | "fixed_price" | "percentage" | "competitive" | "dynamic";
    createdAt: Date;
    updatedAt: Date;
    status?: "active" | "inactive" | "draft" | undefined;
    conditions?: {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }[] | undefined;
    actions?: {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        value: number;
        currency?: string | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }[] | undefined;
    priority?: number | undefined;
}>;
export declare const CreatePricingRuleSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["markup", "markdown", "fixed_price", "percentage", "competitive", "dynamic"]>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "draft"]>>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["equals", "not_equals", "greater_than", "less_than", "contains", "in", "not_in"]>;
        value: z.ZodAny;
        logicalOperator: z.ZodOptional<z.ZodEnum<["and", "or"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }, {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }>, "many">>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["set_price", "adjust_percentage", "adjust_fixed", "set_markup"]>;
        value: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        minPrice: z.ZodOptional<z.ZodNumber>;
        maxPrice: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        currency: string;
        value: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }, {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        value: number;
        currency?: string | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }>, "many">>;
    priority: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "markup" | "markdown" | "fixed_price" | "percentage" | "competitive" | "dynamic";
    priority: number;
    status?: "active" | "inactive" | "draft" | undefined;
    conditions?: {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }[] | undefined;
    actions?: {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        currency: string;
        value: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }[] | undefined;
}, {
    name: string;
    type: "markup" | "markdown" | "fixed_price" | "percentage" | "competitive" | "dynamic";
    status?: "active" | "inactive" | "draft" | undefined;
    conditions?: {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }[] | undefined;
    actions?: {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        value: number;
        currency?: string | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }[] | undefined;
    priority?: number | undefined;
}>;
export declare const UpdatePricingRuleSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["markup", "markdown", "fixed_price", "percentage", "competitive", "dynamic"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "draft"]>>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["equals", "not_equals", "greater_than", "less_than", "contains", "in", "not_in"]>;
        value: z.ZodAny;
        logicalOperator: z.ZodOptional<z.ZodEnum<["and", "or"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }, {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }>, "many">>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["set_price", "adjust_percentage", "adjust_fixed", "set_markup"]>;
        value: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        minPrice: z.ZodOptional<z.ZodNumber>;
        maxPrice: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        currency: string;
        value: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }, {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        value: number;
        currency?: string | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }>, "many">>;
    priority: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "markup" | "markdown" | "fixed_price" | "percentage" | "competitive" | "dynamic" | undefined;
    status?: "active" | "inactive" | "draft" | undefined;
    conditions?: {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }[] | undefined;
    actions?: {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        currency: string;
        value: number;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }[] | undefined;
    priority?: number | undefined;
}, {
    name?: string | undefined;
    type?: "markup" | "markdown" | "fixed_price" | "percentage" | "competitive" | "dynamic" | undefined;
    status?: "active" | "inactive" | "draft" | undefined;
    conditions?: {
        field: string;
        operator: "in" | "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_in";
        value?: any;
        logicalOperator?: "and" | "or" | undefined;
    }[] | undefined;
    actions?: {
        type: "set_price" | "adjust_percentage" | "adjust_fixed" | "set_markup";
        value: number;
        currency?: string | undefined;
        minPrice?: number | undefined;
        maxPrice?: number | undefined;
    }[] | undefined;
    priority?: number | undefined;
}>;
export declare const PriceCalculationRequestSchema: z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodString>;
    basePrice: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    quantity: z.ZodDefault<z.ZodNumber>;
    customerType: z.ZodOptional<z.ZodString>;
    marketplace: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    quantity: number;
    basePrice: number;
    sku?: string | undefined;
    productId?: string | undefined;
    region?: string | undefined;
    customerType?: string | undefined;
    marketplace?: string | undefined;
}, {
    basePrice: number;
    currency?: string | undefined;
    sku?: string | undefined;
    productId?: string | undefined;
    region?: string | undefined;
    quantity?: number | undefined;
    customerType?: string | undefined;
    marketplace?: string | undefined;
}>;
export declare const PriceCalculationResponseSchema: z.ZodObject<{
    originalPrice: z.ZodNumber;
    calculatedPrice: z.ZodNumber;
    currency: z.ZodString;
    appliedRules: z.ZodArray<z.ZodString, "many">;
    markup: z.ZodOptional<z.ZodNumber>;
    discount: z.ZodOptional<z.ZodNumber>;
    finalPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    currency: string;
    originalPrice: number;
    calculatedPrice: number;
    appliedRules: string[];
    finalPrice: number;
    markup?: number | undefined;
    discount?: number | undefined;
}, {
    currency: string;
    originalPrice: number;
    calculatedPrice: number;
    appliedRules: string[];
    finalPrice: number;
    markup?: number | undefined;
    discount?: number | undefined;
}>;
export type PricingRule = z.infer<typeof PricingRuleSchema>;
export type CreatePricingRule = z.infer<typeof CreatePricingRuleSchema>;
export type UpdatePricingRule = z.infer<typeof UpdatePricingRuleSchema>;
export type PricingCondition = z.infer<typeof PricingConditionSchema>;
export type PricingAction = z.infer<typeof PricingActionSchema>;
export type PriceCalculationRequest = z.infer<typeof PriceCalculationRequestSchema>;
export type PriceCalculationResponse = z.infer<typeof PriceCalculationResponseSchema>;
//# sourceMappingURL=pricing.d.ts.map