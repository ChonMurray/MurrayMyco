import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { NAV_SUBSURFACE } from "@/config/navigation";

export default function LabPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Subsurface: Scientific / B2B</h1>
      <p className="mt-4 text-foreground/80 max-w-2xl">
        Cultures, media, substrates, and lab-grade materials.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NAV_SUBSURFACE.map((item) => (
          <Card key={item.href}>
            <CardTitle>{item.label}</CardTitle>
            <CardText>{item.description ?? "Learn more"}</CardText>
          </Card>
        ))}
      </div>
    </section>
  );
}
