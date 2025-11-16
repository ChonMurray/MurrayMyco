import ProductCard from "@/components/cards/ProductCard";
import { getProductsByCategory } from "@/lib/products";

export const dynamic = 'force-dynamic';

export default async function GrowKitsPage() {
  const kits = await getProductsByCategory("grow-kits");

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Grow Kits</h1>
      <p className="text-foreground/70 mb-12 max-w-2xl">
        Complete mushroom growing kits designed for ease and success. Everything you need to grow gourmet mushrooms at home.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kits.length === 0 ? (
          <p className="text-foreground/70 col-span-full text-center py-8">
            No kits available at this time.
          </p>
        ) : (
          kits.map((kit) => (
            <ProductCard
              key={kit.slug}
              product={kit}
              category="grow-kits"
            />
          ))
        )}
      </div>
    </section>
  );
}
