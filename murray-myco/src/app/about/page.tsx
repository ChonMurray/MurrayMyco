import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { NAV_ROOT } from "@/config/navigation";

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Root System: Research & Background</h1>
      <p className="mt-4 text-foreground/80 max-w-2xl">
        Methodologies, research narratives, and company background.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NAV_ROOT.map((item) => (
          <Card key={item.href}>
            <CardTitle>{item.label}</CardTitle>
            <CardText>{item.description ?? "Discover"}</CardText>
          </Card>
        ))}
      </div>
    </section>
  );
}
