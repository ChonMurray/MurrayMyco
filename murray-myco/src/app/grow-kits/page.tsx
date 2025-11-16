import ProductCard from "@/components/cards/ProductCard";

const kits = [
  {
    title: "Blue Oyster",
    description: "Complete kit with substrate, culture, and instructions. Perfect for beginners.",
    image: "/images/grow_bag_transparent.png",
    slug: "blue-oyster-kit",
  },
  {
    title: "Lion's Mane",
    description: "Everything needed to grow your own Lion's Mane at home. Includes detailed guide.",
    image: "/images/grow_bag_transparent.png",
    slug: "lions-mane-kit",
  },
  {
    title: "Pink Oyster",
    description: "Fast-growing kit with beautiful pink mushrooms. Great for first-time growers.",
    image: "/images/grow_bag_transparent.png",
    slug: "pink-oyster-kit",
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
