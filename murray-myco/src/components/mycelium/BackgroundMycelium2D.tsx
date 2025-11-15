"use client";

import { useEffect, useRef, useState } from "react";
import { useMyceliumSettings } from "@/state/useMyceliumSettings";

interface Particle {
  x: number;
  y: number;
  r: number;
}

export default function BackgroundMycelium2D() {
  const {
    opacity,
    walkers: maxWalkers,
    stepsPerFrame,
    devicePixelRatioCap,
    gridAlign,
  } = useMyceliumSettings();

  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const treeRef = useRef<Particle[]>([]);
  const walkersRef = useRef<Particle[]>([]);
  const radiusRef = useRef<number>(8);
  const shrinkRef = useRef<number>(0.995);
  const rafRef = useRef<number | null>(null);
  const colorRef = useRef<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });

  const computeGrid = () => {
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), devicePixelRatioCap);
    const roundUp = (v: number, m: number) => Math.max(m, Math.ceil(v / m) * m);
    const gw = roundUp(window.innerWidth * dpr, gridAlign);
    const gh = roundUp(window.innerHeight * dpr, gridAlign);
    return { gw, gh };
  };

  const createWalker = (gw: number, gh: number, radius: number): Particle => {
    const ang = Math.random() * 2 * Math.PI;
    const x = gw / 2 + radius * Math.cos(ang);
    const y = gh / 2 + radius * Math.sin(ang);
    return { x, y, r: 3 };
  };

  const checkStuck = (walker: Particle, tree: Particle[]): boolean => {
    for (const particle of tree) {
      const d = Math.sqrt((walker.x - particle.x) ** 2 + (walker.y - particle.y) ** 2);
      if (d < walker.r + particle.r) {
        return true;
      }
    }
    return false;
  };

  // Mount effect
  useEffect(() => {
    setMounted(true);
    console.log("[DLA2D] Component mounted");
  }, []);

  // Resolve CSS color once per mount
  useEffect(() => {
    if (!mounted) return;
    const parseCssColor = (css: string): { r: number; g: number; b: number } => {
      const s = css.trim();
      if (s.startsWith("#")) {
        const v = s.slice(1);
        const r = parseInt(v.slice(0, 2), 16);
        const g = parseInt(v.slice(2, 4), 16);
        const b = parseInt(v.slice(4, 6), 16);
        return { r, g, b };
      }
      const m = s.match(/rgba?\(([^)]+)\)/i);
      if (m) {
        const parts = m[1].split(",").map((p) => parseFloat(p.trim()));
        return { r: Math.round(parts[0]), g: Math.round(parts[1]), b: Math.round(parts[2]) };
      }
      return { r: 255, g: 255, b: 255 };
    };
    const cssColor = getComputedStyle(document.documentElement).getPropertyValue("--fg-primary") || "#ffffff";
    colorRef.current = parseCssColor(cssColor);
    console.log("[DLA2D] Color resolved:", colorRef.current);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("[DLA2D] Canvas ref is null, skipping");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("[DLA2D] 2D context unavailable");
      return;
    }
    console.log("[DLA2D] Animation starting...");

    const { gw, gh } = computeGrid();
    console.log("[DLA2D] Grid size:", gw, "x", gh);
    canvas.width = gw;
    canvas.height = gh;
    ctx.imageSmoothingEnabled = false;

    const handleResize = () => {
      const { gw: nw, gh: nh } = computeGrid();
      if (canvas.width !== nw || canvas.height !== nh) {
        canvas.width = nw;
        canvas.height = nh;
        // Reset simulation
        treeRef.current = [{ x: nw / 2, y: nh / 2, r: 3 }];
        walkersRef.current = [];
        radiusRef.current = Math.min(nw, nh) / 2;
        for (let i = 0; i < maxWalkers; i++) {
          radiusRef.current *= shrinkRef.current;
          walkersRef.current.push(createWalker(nw, nh, radiusRef.current));
        }
      }
    };
    window.addEventListener("resize", handleResize);

    // Initialize: seed at center
    treeRef.current = [{ x: gw / 2, y: gh / 2, r: 3 }];
    walkersRef.current = [];
    radiusRef.current = Math.min(gw, gh) / 2;
    console.log("[DLA2D] Seed at:", gw / 2, gh / 2, "Initial radius:", radiusRef.current);

    // Spawn initial walkers
    for (let i = 0; i < maxWalkers; i++) {
      radiusRef.current *= shrinkRef.current;
      walkersRef.current.push(createWalker(gw, gh, radiusRef.current));
    }
    console.log("[DLA2D] Spawned", walkersRef.current.length, "initial walkers");

    const loop = () => {
      // Clear background
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.clearRect(0, 0, gw, gh);

      // Draw only the tree (structure)
      const { r, g, b } = colorRef.current;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      for (const particle of treeRef.current) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Update walkers (multiple iterations per frame)
      for (let n = 0; n < stepsPerFrame; n++) {
        for (let i = walkersRef.current.length - 1; i >= 0; i--) {
          const walker = walkersRef.current[i];
          // Random walk
          const angle = Math.random() * 2 * Math.PI;
          walker.x += Math.cos(angle);
          walker.y += Math.sin(angle);

          // Check if stuck
          if (checkStuck(walker, treeRef.current)) {
            treeRef.current.push(walker);
            walkersRef.current.splice(i, 1);
          }
        }
      }

      // Spawn new walkers to maintain maxWalkers
      while (walkersRef.current.length < maxWalkers && radiusRef.current > 1) {
        radiusRef.current *= shrinkRef.current;
        walkersRef.current.push(createWalker(gw, gh, radiusRef.current));
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    console.log("[DLA2D] Animation loop started");
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      console.log("[DLA2D] Animation stopped");
    };
  }, [mounted, maxWalkers, stepsPerFrame, devicePixelRatioCap, gridAlign]);

  return (
    <div aria-hidden className="myco-bg fixed inset-0 z-0 pointer-events-none" data-opacity={opacity}>
      {!mounted && <div style={{ position: 'fixed', top: 10, left: 10, color: 'white', zIndex: 9999 }}>DLA2D Loading...</div>}
      <canvas ref={canvasRef} className="myco-canvas" />
      <div style={{ position: 'fixed', bottom: 10, left: 10, color: 'white', zIndex: 9999, fontSize: '12px' }}>
        DLA2D Active - Tree: {treeRef.current.length} Walkers: {walkersRef.current.length}
      </div>
    </div>
  );
}
