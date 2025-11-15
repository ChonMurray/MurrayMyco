interface KitPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: "oyster-starter-kit" },
    { slug: "lions-mane-kit" },
    { slug: "shiitake-log-kit" },
  ];
}

export default async function KitPage({ params }: KitPageProps) {
  const { slug } = await params;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="space-y-8">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight capitalize">
          {slug.replace(/-/g, " ")}
        </h1>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <p>
            Detailed information about this grow kit coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}
