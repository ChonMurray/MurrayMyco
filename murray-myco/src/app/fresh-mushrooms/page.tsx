import ProductCard from "@/components/cards/ProductCard";

const products = [
  {
    title: "Blue Oyster",
    description: "Delicate, savory flavor with a tender texture. Perfect for stir-fries and soups.",
    image: "/placeholder-mushroom.jpg",
    slug: "blue-oyster",
  },
  {
    title: "Lion's Mane",
    description: "Unique seafood-like flavor and texture. Excellent for gourmet dishes.",
    image: "/placeholder-mushroom.jpg",
    slug: "lions-mane",
  },
  {
    title: "Shiitake",
    description: "Rich, umami flavor that adds depth to any dish. A culinary favorite.",
    image: "/placeholder-mushroom.jpg",
    slug: "shiitake",
  },
];

export default function FreshMushroomsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Fresh Mushrooms</h1>
      <p className="text-foreground/70 mb-12 max-w-2xl">
        Premium locally-grown mushrooms, cultivated with precision and care.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            title={product.title}
            description={product.description}
            image={product.image}
            slug={product.slug}
            category="fresh-mushrooms"
          />
        ))}
      </div>
    </section>
  );
}
