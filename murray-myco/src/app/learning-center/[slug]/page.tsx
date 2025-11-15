interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: "sterile-technique-fundamentals" },
    { slug: "liquid-culture-preparation" },
    { slug: "substrate-recipes" },
    { slug: "environmental-control" },
    { slug: "diy-equipment" },
    { slug: "troubleshooting" },
  ];
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="space-y-8">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight capitalize">
          {slug.replace(/-/g, " ")}
        </h1>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <p>
            Content for this article is being developed and will be available soon.
          </p>
        </div>
      </div>
    </section>
  );
}
