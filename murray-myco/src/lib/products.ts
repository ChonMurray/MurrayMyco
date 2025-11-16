import { prisma } from "./prisma";
import type { Product, Variant, Category } from "@prisma/client";

export type ProductWithVariants = Product & {
  variants: Variant[];
  category: Category;
};

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * Get a category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return await prisma.category.findUnique({
    where: { slug },
  });
}

/**
 * Get all products for a specific category
 */
export async function getProductsByCategory(categorySlug: string): Promise<ProductWithVariants[]> {
  return await prisma.product.findMany({
    where: {
      category: {
        slug: categorySlug,
      },
    },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { priceCents: "asc" },
      },
      category: true,
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  return await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { priceCents: "asc" },
      },
      category: true,
    },
  });
}

/**
 * Get all products (optionally filter by active variants)
 */
export async function getAllProducts(): Promise<ProductWithVariants[]> {
  return await prisma.product.findMany({
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { priceCents: "asc" },
      },
      category: true,
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });
}

/**
 * Get a variant by ID
 */
export async function getVariantById(id: string): Promise<Variant | null> {
  return await prisma.variant.findUnique({
    where: { id },
  });
}

/**
 * Format price from cents to dollars
 */
export function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

/**
 * Get the lowest price for a product (from its variants)
 */
export function getLowestPrice(variants: Variant[]): number | null {
  if (variants.length === 0) return null;
  return Math.min(...variants.map((v) => v.priceCents));
}

/**
 * Get price range for a product
 */
export function getPriceRange(variants: Variant[]): string {
  if (variants.length === 0) return "Price unavailable";
  if (variants.length === 1) return formatPrice(variants[0].priceCents);

  const prices = variants.map((v) => v.priceCents).sort((a, b) => a - b);
  const min = prices[0];
  const max = prices[prices.length - 1];

  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}
