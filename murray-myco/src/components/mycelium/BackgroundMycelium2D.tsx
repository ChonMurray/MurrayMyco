"use client";

import { useEffect, useRef, useState } from "react";
import { useMyceliumSettings } from "@/state/useMyceliumSettings";

export default function BackgroundMycelium2D() {
  const {
    opacity,
    walkers,
    stepsPerFrame,
    devicePixelRatioCap,
    gridAlign,
    twoDFallbackSeedRadius,
    twoDFallbackStickManhattanRadius,
    twoDFallbackThickenRadius,
  } = useMyceliumSettings();

  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // These are recreated on mount/resize as needed
  const occRef = useRef<Uint8Array>(new Uint8Array(1));
  const walkersRef = useRef<Float32Array>(new Float32Array(walkers * 2));
  const rafRef = useRef<number | null>(null);
  const frameIndexRef = useRef<number>(0);
  const colorRef = useRef<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });

  const fail = (message: string): never => {
    throw new Error(`[DLA2D-FAIL] ${message}`);
  };

  const computeGrid = () => {
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), devicePixelRatioCap);
    const roundUp = (v: number, m: number) => Math.max(m, Math.ceil(v / m) * m);
    const gw = roundUp(window.innerWidth * dpr, gridAlign);
    const gh = roundUp(window.innerHeight * dpr, gridAlign);
    return { gw, gh };
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

  // Randomize walkers
  useEffect(() => {
    if (!mounted) return;
    const { gw, gh } = computeGrid();
    const w = walkersRef.current;
    for (let i = 0; i < walkers; i += 1) {
      w[i * 2 + 0] = Math.floor(Math.random() * gw);
      w[i * 2 + 1] = Math.floor(Math.random() * gh);
    }
    console.log("[DLA2D] Walkers initialized:", walkers);
  }, [mounted, walkers, devicePixelRatioCap]);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("[DLA2D] Canvas ref is null, skipping");
      return;
    }
    const ctx = (canvas as HTMLCanvasElement).getContext("2d");
    if (!ctx) {
      console.error("[DLA2D] 2D context unavailable");
      return;
    }
    console.log("[DLA2D] Animation starting...");

    const { gw, gh } = computeGrid();
    (canvas as HTMLCanvasElement).width = gw;
    (canvas as HTMLCanvasElement).height = gh;
    (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;
    const handleResize = () => {
      const { gw: nw, gh: nh } = computeGrid();
      if ((canvas as HTMLCanvasElement).width !== nw || (canvas as HTMLCanvasElement).height !== nh) {
        (canvas as HTMLCanvasElement).width = nw;
        (canvas as HTMLCanvasElement).height = nh;
        const newOcc = new Uint8Array(nh * nw);
        occRef.current = newOcc;
        // re-seed
        const cx = Math.floor(nw / 2);
        const cy = Math.floor(nh / 2);
        for (let oy = -2; oy <= 2; oy++) {
          for (let ox = -2; ox <= 2; ox++) {
            const nx = (cx + ox + nw) % nw;
            const ny = (cy + oy + nh) % nh;
            newOcc[ny * nw + nx] = 255;
          }
        }
      }
      // styles handled by CSS class
    };
    window.addEventListener("resize", handleResize);

    const image = (ctx as CanvasRenderingContext2D).createImageData(gw, gh);
    const pixels = image.data; // Uint8ClampedArray RGBA
    const occ = (occRef.current = new Uint8Array(gh * gw));
    // seed center blob
    const scx = Math.floor(gw / 2);
    const scy = Math.floor(gh / 2);
    for (let oy = -twoDFallbackSeedRadius; oy <= twoDFallbackSeedRadius; oy++) {
      for (let ox = -twoDFallbackSeedRadius; ox <= twoDFallbackSeedRadius; ox++) {
        const nx = (scx + ox + gw) % gw;
        const ny = (scy + oy + gh) % gh;
        occ[ny * gw + nx] = 255;
      }
    }
    const w = walkersRef.current;

    // first paint will happen in loop; nothing drawn here

    const loop = () => {
      // steps
      for (let step = 0; step < stepsPerFrame; step++) {
        const i = Math.floor(Math.random() * walkers);
        let x = w[i * 2 + 0];
        let y = w[i * 2 + 1];

        // Random 4-neighborhood walk
        switch (Math.floor(Math.random() * 4)) {
          case 0: x += 1; break;
          case 1: x -= 1; break;
          case 2: y += 1; break;
          default: y -= 1; break;
        }
        if (x < 0) x = gw - 1; if (x >= gw) x = 0;
        if (y < 0) y = gh - 1; if (y >= gh) y = 0;

        const idx = y * gw + x;
        let near = false;
        // Expand stick radius to speed up visible propagation (Manhattan radius from settings)
        for (let oy = -twoDFallbackStickManhattanRadius; oy <= twoDFallbackStickManhattanRadius && !near; oy++) {
          for (let ox = -2; ox <= 2; ox++) {
            if (ox === 0 && oy === 0) continue;
            if (Math.abs(ox) + Math.abs(oy) > twoDFallbackStickManhattanRadius) continue;
            const nx = (x + ox + gw) % gw;
            const ny = (y + oy + gh) % gh;
            if (occ[ny * gw + nx]) { near = true; break; }
          }
        }

      if (near) {
        // Thicken structure from settings
        for (let oy = -twoDFallbackThickenRadius; oy <= twoDFallbackThickenRadius; oy++) {
          for (let ox = -twoDFallbackThickenRadius; ox <= twoDFallbackThickenRadius; ox++) {
            const nx = (x + ox + gw) % gw;
            const ny = (y + oy + gh) % gh;
            occ[ny * gw + nx] = 255;
          }
        }
        // respawn
        w[i * 2 + 0] = Math.floor(Math.random() * gw);
        w[i * 2 + 1] = Math.floor(Math.random() * gh);
      } else {
        w[i * 2 + 0] = x;
        w[i * 2 + 1] = y;
      }
      }

      // render only permanent occupancy: clear and draw occ==255 in CSS primary foreground color
      pixels.fill(0);
      const { r, g, b } = colorRef.current;
      for (let i = 0; i < occ.length; i++) {
        if (occ[i]) {
          const pi = i * 4;
          pixels[pi + 0] = r;
          pixels[pi + 1] = g;
          pixels[pi + 2] = b;
          pixels[pi + 3] = 255;
        }
      }

      (ctx as CanvasRenderingContext2D).putImageData(image, 0, 0);
      frameIndexRef.current += 1;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    console.log("[DLA2D] Animation loop started");
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      console.log("[DLA2D] Animation stopped");
    };
  }, [mounted, walkers, stepsPerFrame, devicePixelRatioCap]);

  return (
    <div aria-hidden className="myco-bg fixed inset-0 z-0 pointer-events-none" data-opacity={opacity}>
      <canvas ref={canvasRef} className="myco-canvas" />
    </div>
  );
}


