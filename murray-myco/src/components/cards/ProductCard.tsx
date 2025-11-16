"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProductWithVariants } from "@/lib/products";
import { getPriceRange } from "@/lib/products";
import { useCart } from "@/state/useCart";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

interface ProductCardProps {
  product: ProductWithVariants;
  category: string;
}

export default function ProductCard({ product, category }: ProductCardProps) {
  const priceRange = getPriceRange(product.variants);
  const { addItem } = useCart();

  // Map product slug to image filename
  // For grow kits: use generic grow_bag image
  // For liquid cultures: no image (will hide the image section)
  // For fresh mushrooms: use product-specific images (e.g., "blue-oyster" -> "blue_oyster_transparent.png")
  const getImagePath = () => {
    if (category === 'grow-kits') {
      return '/images/grow_bag_transparent.png';
    }
    if (category === 'liquid-cultures') {
      return null;
    }
    return `/images/${product.slug.replace(/-/g, '_')}_transparent.png`;
  };

  const imagePath = getImagePath();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If only one variant, add it directly
    if (product.variants.length === 1) {
      const variant = product.variants[0];
      addItem({
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantName: variant.name,
        priceCents: variant.priceCents,
        maxStock: variant.stock,
      });
    } else {
      // Multiple variants - add the cheapest one by default
      // In a real app, you'd probably navigate to the product page to select variant
      const cheapestVariant = [...product.variants].sort((a, b) => a.priceCents - b.priceCents)[0];
      addItem({
        variantId: cheapestVariant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantName: cheapestVariant.name,
        priceCents: cheapestVariant.priceCents,
        maxStock: cheapestVariant.stock,
      });
    }
  };

  return (
    <GlassCard hover className="group overflow-hidden flex flex-col">
      <Link href={`/${category}/${product.slug}`} className="flex-1">
        <div className="flex flex-col h-full">
          {imagePath && (
            <div className="flex items-center justify-center py-4">
              <div className="relative w-1/2 aspect-square">
                <Image
                  src={imagePath}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
          <div className={`px-4 pb-4 flex-1 flex flex-col ${!imagePath ? 'pt-4' : ''}`}>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-foreground/80 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-foreground/70 line-clamp-2 flex-1">
              {product.summary}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">
                {priceRange}
              </span>
              {product.variants.length > 1 && (
                <span className="text-xs text-foreground/50">
                  {product.variants.length} options
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart button */}
      <div className="px-4 pb-4">
        <Button
          variant="secondary"
          fullWidth
          onClick={handleAddToCart}
          className="py-2 px-4 text-sm font-medium"
        >
          Add to Cart
        </Button>
      </div>
    </GlassCard>
  );
}
