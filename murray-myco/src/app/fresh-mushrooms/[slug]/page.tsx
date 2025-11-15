interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: "blue-oyster" },
    { slug: "lions-mane" },
    { slug: "shiitake" },
  ];
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="space-y-8">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight capitalize">
          {slug.replace(/-/g, " ")}
        </h1>

        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <p>
            Detailed information about this product coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}
