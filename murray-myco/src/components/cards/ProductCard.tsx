import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  title: string;
  description: string;
  image: string;
  slug: string;
  category: "fresh-mushrooms" | "grow-kits" | "liquid-cultures";
}

export default function ProductCard({
  title,
  description,
  image,
  slug,
  category,
}: ProductCardProps) {
  return (
    <Link
      href={`/${category}/${slug}`}
      className="group block border border-foreground/20 rounded-lg overflow-hidden hover:border-foreground/40 transition-colors"
    >
      <div className="aspect-square relative bg-foreground/5">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-foreground/80 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-foreground/70 line-clamp-3">
          {description}
        </p>
      </div>
    </Link>
  );
}
