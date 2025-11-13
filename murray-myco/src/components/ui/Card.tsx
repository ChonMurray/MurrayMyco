import { cn } from "@/utils/cn";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-black/5 dark:border-white/10 bg-background/60 p-6", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-medium tracking-tight">{children}</h3>;
}

export function CardText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground/70 mt-2">{children}</p>;
}
