"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductVariantSchema = exports.CreateProductVariantSchema = exports.UpdateProductSchema = exports.CreateProductSchema = exports.ProductVariantSchema = exports.ProductSchema = exports.ProductStatusSchema = void 0;
const zod_1 = require("zod");
// Product Status Types
exports.ProductStatusSchema = zod_1.z.enum(['active', 'inactive', 'discontinued', 'draft']);
// Product Types
exports.ProductSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    tenantId: zod_1.z.string().cuid(),
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    status: exports.ProductStatusSchema.default('active'),
    attributes: zod_1.z.record(zod_1.z.any()).optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Product Variant Types
exports.ProductVariantSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    productId: zod_1.z.string().cuid(),
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    attributes: zod_1.z.record(zod_1.z.any()).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Create Product Types
exports.CreateProductSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    status: exports.ProductStatusSchema.optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional()
});
// Update Product Types
exports.UpdateProductSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1).max(50).optional(),
    name: zod_1.z.string().min(1).max(200).optional(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    status: exports.ProductStatusSchema.optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional()
});
// Create Product Variant Types
exports.CreateProductVariantSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    attributes: zod_1.z.record(zod_1.z.any()).optional()
});
// Update Product Variant Types
exports.UpdateProductVariantSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1).max(50).optional(),
    name: zod_1.z.string().min(1).max(200).optional(),
    attributes: zod_1.z.record(zod_1.z.any()).optional()
});
//# sourceMappingURL=product.js.map