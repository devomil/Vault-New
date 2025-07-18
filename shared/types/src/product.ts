import { z } from 'zod';

// Product Status Types
export const ProductStatusSchema = z.enum(['active', 'inactive', 'discontinued', 'draft']);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

// Product Types
export const ProductSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  status: ProductStatusSchema.default('active'),
  attributes: z.record(z.any()).optional(),
  images: z.array(z.string().url()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Product Variant Types
export const ProductVariantSchema = z.object({
  id: z.string().cuid(),
  productId: z.string().cuid(),
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  attributes: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Create Product Types
export const CreateProductSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  status: ProductStatusSchema.optional(),
  attributes: z.record(z.any()).optional(),
  images: z.array(z.string().url()).optional()
});

// Update Product Types
export const UpdateProductSchema = z.object({
  sku: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  status: ProductStatusSchema.optional(),
  attributes: z.record(z.any()).optional(),
  images: z.array(z.string().url()).optional()
});

// Create Product Variant Types
export const CreateProductVariantSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  attributes: z.record(z.any()).optional()
});

// Update Product Variant Types
export const UpdateProductVariantSchema = z.object({
  sku: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
  attributes: z.record(z.any()).optional()
});

// Export types
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;

export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type CreateProductVariant = z.infer<typeof CreateProductVariantSchema>;
export type UpdateProductVariant = z.infer<typeof UpdateProductVariantSchema>; 