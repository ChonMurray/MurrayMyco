"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMyceliumSettings } from "@/state/useMyceliumSettings";

export default function Controls() {
  const pathname = usePathname();
  const { opacity, setOpacity } = useMyceliumSettings();
  useEffect(() => {
    console.log("[MYCO] Controls mounted");
  }, []);
  const hide = pathname === "/dla" || pathname === "/";
  if (hide) return null;
  return (
    <div className="fixed bottom-3 right-3 z-20 rounded-lg bg-background/70 backdrop-blur-md border border-black/5 dark:border-white/10 px-3 py-2 text-xs text-foreground/80">
      <div className="flex items-center gap-2">
        <span>Opacity</span>
        <input
          aria-label="Mycelium opacity"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
        />
        <span>{opacity.toFixed(2)}</span>
      </div>
    </div>
  );
}
