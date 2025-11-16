import { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export default function GlassCard({ children, hover = false, className = "", ...props }: GlassCardProps) {
  const baseStyles = "backdrop-blur-[2px] bg-background/50 border border-white/10 rounded-lg";
  const hoverStyles = hover ? "hover:border-white/20 transition-colors" : "";
  const combinedClassName = `${baseStyles} ${hoverStyles} ${className}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
}
