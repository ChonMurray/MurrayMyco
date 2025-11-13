import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { NAV_SURFACE } from "@/config/navigation";

export default function ConsumerPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Surface: Consumer</h1>
      <p className="mt-4 text-foreground/80 max-w-2xl">
        Fresh mushrooms, grow kits, extracts, and dried products.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NAV_SURFACE.map((item) => (
          <Card key={item.href}>
            <CardTitle>{item.label}</CardTitle>
            <CardText>{item.description ?? "Explore"}</CardText>
          </Card>
        ))}
      </div>
    </section>
  );
}
