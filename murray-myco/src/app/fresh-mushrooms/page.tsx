import ProductCard from "@/components/cards/ProductCard";
import { getProductsByCategory } from "@/lib/products";

export default async function FreshMushroomsPage() {
  const products = await getProductsByCategory("fresh");

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Fresh Mushrooms</h1>
      <p className="text-foreground/70 mb-12 max-w-2xl">
        Premium locally-grown mushrooms, cultivated with precision and care.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <p className="text-foreground/70 col-span-full text-center py-8">
            No products available at this time.
          </p>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              category="fresh-mushrooms"
            />
          ))
        )}
      </div>
    </section>
  );
}
