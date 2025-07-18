import { z } from 'zod';
export declare const InventoryStatusSchema: z.ZodEnum<["in_stock", "low_stock", "out_of_stock", "backordered"]>;
export type InventoryStatus = z.infer<typeof InventoryStatusSchema>;
export declare const InventorySchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    productId: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
    reserved: z.ZodDefault<z.ZodNumber>;
    available: z.ZodDefault<z.ZodNumber>;
    lowStockThreshold: z.ZodDefault<z.ZodNumber>;
    reorderPoint: z.ZodDefault<z.ZodNumber>;
    safetyStock: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
    lowStockThreshold: number;
    reorderPoint: number;
    safetyStock: number;
    productId: string;
    quantity: number;
    reserved: number;
    available: number;
}, {
    id: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
    productId: string;
    lowStockThreshold?: number | undefined;
    reorderPoint?: number | undefined;
    safetyStock?: number | undefined;
    quantity?: number | undefined;
    reserved?: number | undefined;
    available?: number | undefined;
}>;
export declare const CreateInventorySchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodDefault<z.ZodNumber>;
    lowStockThreshold: z.ZodDefault<z.ZodNumber>;
    reorderPoint: z.ZodDefault<z.ZodNumber>;
    safetyStock: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lowStockThreshold: number;
    reorderPoint: number;
    safetyStock: number;
    productId: string;
    quantity: number;
}, {
    productId: string;
    lowStockThreshold?: number | undefined;
    reorderPoint?: number | undefined;
    safetyStock?: number | undefined;
    quantity?: number | undefined;
}>;
export declare const UpdateInventorySchema: z.ZodObject<{
    quantity: z.ZodOptional<z.ZodNumber>;
    reserved: z.ZodOptional<z.ZodNumber>;
    lowStockThreshold: z.ZodOptional<z.ZodNumber>;
    reorderPoint: z.ZodOptional<z.ZodNumber>;
    safetyStock: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lowStockThreshold?: number | undefined;
    reorderPoint?: number | undefined;
    safetyStock?: number | undefined;
    quantity?: number | undefined;
    reserved?: number | undefined;
}, {
    lowStockThreshold?: number | undefined;
    reorderPoint?: number | undefined;
    safetyStock?: number | undefined;
    quantity?: number | undefined;
    reserved?: number | undefined;
}>;
export declare const MovementTypeSchema: z.ZodEnum<["purchase", "sale", "return", "adjustment", "transfer", "damage", "expiry"]>;
export type MovementType = z.infer<typeof MovementTypeSchema>;
export declare const InventoryMovementSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    productId: z.ZodString;
    type: z.ZodEnum<["purchase", "sale", "return", "adjustment", "transfer", "damage", "expiry"]>;
    quantity: z.ZodNumber;
    previousQuantity: z.ZodNumber;
    newQuantity: z.ZodNumber;
    reference: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    type: "sale" | "purchase" | "adjustment" | "transfer" | "return" | "damage" | "expiry";
    createdAt: Date;
    productId: string;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reference?: string | undefined;
    notes?: string | undefined;
}, {
    id: string;
    tenantId: string;
    type: "sale" | "purchase" | "adjustment" | "transfer" | "return" | "damage" | "expiry";
    createdAt: Date;
    productId: string;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reference?: string | undefined;
    notes?: string | undefined;
}>;
export declare const CreateInventoryMovementSchema: z.ZodObject<{
    productId: z.ZodString;
    type: z.ZodEnum<["purchase", "sale", "return", "adjustment", "transfer", "damage", "expiry"]>;
    quantity: z.ZodNumber;
    reference: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "sale" | "purchase" | "adjustment" | "transfer" | "return" | "damage" | "expiry";
    productId: string;
    quantity: number;
    reference?: string | undefined;
    notes?: string | undefined;
}, {
    type: "sale" | "purchase" | "adjustment" | "transfer" | "return" | "damage" | "expiry";
    productId: string;
    quantity: number;
    reference?: string | undefined;
    notes?: string | undefined;
}>;
export declare const AlertTypeSchema: z.ZodEnum<["low_stock", "out_of_stock", "overstock", "expiry_warning"]>;
export type AlertType = z.infer<typeof AlertTypeSchema>;
export declare const AlertStatusSchema: z.ZodEnum<["active", "acknowledged", "resolved"]>;
export type AlertStatus = z.infer<typeof AlertStatusSchema>;
export declare const InventoryAlertSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    productId: z.ZodString;
    type: z.ZodEnum<["low_stock", "out_of_stock", "overstock", "expiry_warning"]>;
    status: z.ZodDefault<z.ZodEnum<["active", "acknowledged", "resolved"]>>;
    message: z.ZodString;
    threshold: z.ZodOptional<z.ZodNumber>;
    currentValue: z.ZodOptional<z.ZodNumber>;
    acknowledgedAt: z.ZodOptional<z.ZodDate>;
    resolvedAt: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    type: "out_of_stock" | "low_stock" | "overstock" | "expiry_warning";
    status: "active" | "acknowledged" | "resolved";
    createdAt: Date;
    updatedAt: Date;
    message: string;
    productId: string;
    threshold?: number | undefined;
    currentValue?: number | undefined;
    acknowledgedAt?: Date | undefined;
    resolvedAt?: Date | undefined;
}, {
    id: string;
    tenantId: string;
    type: "out_of_stock" | "low_stock" | "overstock" | "expiry_warning";
    createdAt: Date;
    updatedAt: Date;
    message: string;
    productId: string;
    status?: "active" | "acknowledged" | "resolved" | undefined;
    threshold?: number | undefined;
    currentValue?: number | undefined;
    acknowledgedAt?: Date | undefined;
    resolvedAt?: Date | undefined;
}>;
export declare const CreateInventoryAlertSchema: z.ZodObject<{
    productId: z.ZodString;
    type: z.ZodEnum<["low_stock", "out_of_stock", "overstock", "expiry_warning"]>;
    message: z.ZodString;
    threshold: z.ZodOptional<z.ZodNumber>;
    currentValue: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "out_of_stock" | "low_stock" | "overstock" | "expiry_warning";
    message: string;
    productId: string;
    threshold?: number | undefined;
    currentValue?: number | undefined;
}, {
    type: "out_of_stock" | "low_stock" | "overstock" | "expiry_warning";
    message: string;
    productId: string;
    threshold?: number | undefined;
    currentValue?: number | undefined;
}>;
export declare const UpdateInventoryAlertSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["active", "acknowledged", "resolved"]>>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "acknowledged" | "resolved" | undefined;
    message?: string | undefined;
}, {
    status?: "active" | "acknowledged" | "resolved" | undefined;
    message?: string | undefined;
}>;
export declare const InventoryAnalyticsSchema: z.ZodObject<{
    totalProducts: z.ZodNumber;
    totalValue: z.ZodNumber;
    lowStockItems: z.ZodNumber;
    outOfStockItems: z.ZodNumber;
    overstockItems: z.ZodNumber;
    turnoverRate: z.ZodNumber;
    averageStockLevel: z.ZodNumber;
    topProducts: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        sku: z.ZodString;
        name: z.ZodString;
        quantity: z.ZodNumber;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        value: number;
        sku: string;
        productId: string;
        quantity: number;
    }, {
        name: string;
        value: number;
        sku: string;
        productId: string;
        quantity: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    topProducts: {
        name: string;
        value: number;
        sku: string;
        productId: string;
        quantity: number;
    }[];
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    overstockItems: number;
    turnoverRate: number;
    averageStockLevel: number;
}, {
    topProducts: {
        name: string;
        value: number;
        sku: string;
        productId: string;
        quantity: number;
    }[];
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    overstockItems: number;
    turnoverRate: number;
    averageStockLevel: number;
}>;
export type Inventory = z.infer<typeof InventorySchema>;
export type CreateInventory = z.infer<typeof CreateInventorySchema>;
export type UpdateInventory = z.infer<typeof UpdateInventorySchema>;
export type InventoryMovement = z.infer<typeof InventoryMovementSchema>;
export type CreateInventoryMovement = z.infer<typeof CreateInventoryMovementSchema>;
export type InventoryAlert = z.infer<typeof InventoryAlertSchema>;
export type CreateInventoryAlert = z.infer<typeof CreateInventoryAlertSchema>;
export type UpdateInventoryAlert = z.infer<typeof UpdateInventoryAlertSchema>;
export type InventoryAnalytics = z.infer<typeof InventoryAnalyticsSchema>;
//# sourceMappingURL=inventory.d.ts.map