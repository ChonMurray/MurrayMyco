import Link from "next/link";

interface PostCardProps {
  title: string;
  description: string;
  date?: string;
  category?: string;
  slug: string;
}

export default function PostCard({
  title,
  description,
  date,
  slug,
}: PostCardProps) {
  return (
    <Link
      href={`/learning-center/${slug}`}
      className="group block backdrop-blur-[2px] bg-background/50 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
    >
      <div className="text-left">
        {/* Stacked layout: title on top, description below - left aligned */}
        <h3 className="text-xl font-semibold mb-3 group-hover:text-foreground/80 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-foreground/70 line-clamp-3">
          {description}
        </p>
        {date && (
          <p className="text-xs text-foreground/50 mt-4">
            {date}
          </p>
        )}
      </div>
    </Link>
  );
}
