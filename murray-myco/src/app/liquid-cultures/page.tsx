import ProductCard from "@/components/cards/ProductCard";
import { getProductsByCategory } from "@/lib/products";

export const dynamic = 'force-dynamic';

export default async function LiquidCulturesPage() {
  const cultures = await getProductsByCategory("liquid-cultures");

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Liquid Cultures</h1>
      <p className="text-foreground/70 mb-12 max-w-2xl">
        High-quality liquid cultures produced with cleanroom sterile technique. Ideal for home cultivators and researchers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cultures.length === 0 ? (
          <p className="text-foreground/70 col-span-full text-center py-8">
            No cultures available at this time.
          </p>
        ) : (
          cultures.map((culture) => (
            <ProductCard
              key={culture.slug}
              product={culture}
              category="liquid-cultures"
            />
          ))
        )}
      </div>
    </section>
  );
}
