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
  category,
  slug,
}: PostCardProps) {
  return (
    <Link
      href={`/learning-center/${slug}`}
      className="group block border border-foreground/20 rounded-lg p-6 hover:border-foreground/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-xl font-semibold group-hover:text-foreground/80 transition-colors">
          {title}
        </h3>
        {category && (
          <span className="text-xs px-2 py-1 rounded bg-foreground/10 text-foreground/70 whitespace-nowrap">
            {category}
          </span>
        )}
      </div>
      <p className="text-sm text-foreground/70 mb-4 line-clamp-3">
        {description}
      </p>
      {date && (
        <p className="text-xs text-foreground/50">
          {date}
        </p>
      )}
    </Link>
  );
}
