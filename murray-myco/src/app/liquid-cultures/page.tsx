import ProductCard from "@/components/cards/ProductCard";

const cultures = [
  {
    title: "Blue Oyster LC",
    description: "Clean, vigorous culture ready for inoculation. Produced with cleanroom technique.",
    image: "/placeholder-mushroom.jpg",
    slug: "blue-oyster-lc",
  },
  {
    title: "Lion's Mane LC",
    description: "High-quality culture for reliable colonization. Sterile technique guaranteed.",
    image: "/placeholder-mushroom.jpg",
    slug: "lions-mane-lc",
  },
  {
    title: "Pink Oyster LC",
    description: "Premium culture for substrate inoculation. Verified clean and vigorous.",
    image: "/placeholder-mushroom.jpg",
    slug: "pink-oyster-lc",
  },
];

export default function LiquidCulturesPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Liquid Cultures</h1>
      <p className="text-foreground/70 mb-12 max-w-2xl">
        High-quality liquid cultures produced with cleanroom sterile technique. Ideal for home cultivators and researchers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cultures.map((culture) => (
          <ProductCard
            key={culture.slug}
            title={culture.title}
            description={culture.description}
            image={culture.image}
            slug={culture.slug}
            category="liquid-cultures"
          />
        ))}
      </div>
    </section>
  );
}
