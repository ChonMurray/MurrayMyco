import ProductCard from "@/components/cards/ProductCard";

const kits = [
  {
    title: "Oyster Mushroom Starter Kit",
    description: "Complete kit with substrate, culture, and instructions. Perfect for beginners.",
    image: "/placeholder-mushroom.jpg",
    slug: "oyster-starter-kit",
  },
  {
    title: "Lion's Mane Grow Kit",
    description: "Everything needed to grow your own Lion's Mane at home. Includes detailed guide.",
    image: "/placeholder-mushroom.jpg",
    slug: "lions-mane-kit",
  },
  {
    title: "Shiitake Log Kit",
    description: "Traditional log cultivation method. Long-term production for years to come.",
    image: "/placeholder-mushroom.jpg",
    slug: "shiitake-log-kit",
  },
];

export default function GrowKitsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Grow Kits</h1>
      <p className="text-foreground/70 mb-12 max-w-2xl">
        Complete mushroom growing kits designed for ease and success. Everything you need to grow gourmet mushrooms at home.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <ProductCard
            key={kit.slug}
            title={kit.title}
            description={kit.description}
            image={kit.image}
            slug={kit.slug}
            category="grow-kits"
          />
        ))}
      </div>
    </section>
  );
}
