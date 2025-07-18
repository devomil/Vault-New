import { z } from 'zod';
export declare const ProductStatusSchema: z.ZodEnum<["active", "inactive", "discontinued", "draft"]>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export declare const ProductSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "discontinued", "draft"]>>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    name: string;
    status: "active" | "inactive" | "draft" | "discontinued";
    createdAt: Date;
    updatedAt: Date;
    sku: string;
    description?: string | undefined;
    category?: string | undefined;
    brand?: string | undefined;
    attributes?: Record<string, any> | undefined;
    images?: string[] | undefined;
}, {
    id: string;
    tenantId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    sku: string;
    status?: "active" | "inactive" | "draft" | "discontinued" | undefined;
    description?: string | undefined;
    category?: string | undefined;
    brand?: string | undefined;
    attributes?: Record<string, any> | undefined;
    images?: string[] | undefined;
}>;
export declare const ProductVariantSchema: z.ZodObject<{
    id: z.ZodString;
    productId: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    sku: string;
    productId: string;
    attributes?: Record<string, any> | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    sku: string;
    productId: string;
    attributes?: Record<string, any> | undefined;
}>;
export declare const CreateProductSchema: z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "discontinued", "draft"]>>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sku: string;
    status?: "active" | "inactive" | "draft" | "discontinued" | undefined;
    description?: string | undefined;
    category?: string | undefined;
    brand?: string | undefined;
    attributes?: Record<string, any> | undefined;
    images?: string[] | undefined;
}, {
    name: string;
    sku: string;
    status?: "active" | "inactive" | "draft" | "discontinued" | undefined;
    description?: string | undefined;
    category?: string | undefined;
    brand?: string | undefined;
    attributes?: Record<string, any> | undefined;
    images?: string[] | undefined;
}>;
export declare const UpdateProductSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "discontinued", "draft"]>>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "active" | "inactive" | "draft" | "discontinued" | undefined;
    description?: string | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    brand?: string | undefined;
    attributes?: Record<string, any> | undefined;
    images?: string[] | undefined;
}, {
    name?: string | undefined;
    status?: "active" | "inactive" | "draft" | "discontinued" | undefined;
    description?: string | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    brand?: string | undefined;
    attributes?: Record<string, any> | undefined;
    images?: string[] | undefined;
}>;
export declare const CreateProductVariantSchema: z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sku: string;
    attributes?: Record<string, any> | undefined;
}, {
    name: string;
    sku: string;
    attributes?: Record<string, any> | undefined;
}>;
export declare const UpdateProductVariantSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    sku?: string | undefined;
    attributes?: Record<string, any> | undefined;
}, {
    name?: string | undefined;
    sku?: string | undefined;
    attributes?: Record<string, any> | undefined;
}>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type CreateProductVariant = z.infer<typeof CreateProductVariantSchema>;
export type UpdateProductVariant = z.infer<typeof UpdateProductVariantSchema>;
//# sourceMappingURL=product.d.ts.map