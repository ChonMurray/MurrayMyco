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
      className="group block backdrop-blur-[2px] bg-background/50 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-center py-4">
          <div className="relative w-1/2 aspect-square">
            <Image
              src={image}
              alt={title}
              width={400}
              height={400}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="px-4 pb-4">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-foreground/80 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-foreground/70 line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
