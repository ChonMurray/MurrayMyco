"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useMyceliumSettings } from "@/state/useMyceliumSettings";

function DLAField() {
  const { gridSize, walkers, stepsPerFrame, biasToPointer } = useMyceliumSettings();

  const texRef = useRef<THREE.DataTexture | null>(null);
  const occupiedRef = useRef<Uint8Array>(new Uint8Array(gridSize * gridSize));
  const walkersRef = useRef<Float32Array>(new Float32Array(walkers * 2));
  const warmupFramesRef = useRef<number>(0);
  const startTimeMsRef = useRef<number>(typeof performance !== "undefined" ? performance.now() : Date.now());
  const lastStatsTimeMsRef = useRef<number>(typeof performance !== "undefined" ? performance.now() : Date.now());
  const framesSinceStatsRef = useRef<number>(0);
  const firstStickLoggedRef = useRef<boolean>(false);
  const warmupCompletedLoggedRef = useRef<boolean>(false);
  const frameIndexRef = useRef<number>(0);
  const targetFrameMs = 16.0;
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const solidTestMode = searchParams?.get("solid") === "1";

  const fail = (message: string): never => {
    throw new Error(`[DLA-FAIL] ${message}`);
  };
  const shouldDebug =
    (typeof window !== "undefined" && (
      (window as unknown as { __MYCO_DEBUG__?: boolean }).__MYCO_DEBUG__ === true ||
      new URLSearchParams(window.location.search).get("mycoDebug") === "1" ||
      (typeof localStorage !== "undefined" && localStorage.getItem("MYCO_DEBUG") === "1")
    )) ||
    process.env.NODE_ENV !== "production";

  useEffect(() => {
    console.log("[DLA] DLAField mounted");
    if (shouldDebug) {
      console.log("[DLA] Debug logging enabled");
    }
  }, [shouldDebug]);

  // Seed exactly one central occupied pixel and a small visible blob in the texture
  useEffect(() => {
    const occ = occupiedRef.current;
    occ.fill(0);

    const cx = Math.floor(gridSize / 2);
    const cy = Math.floor(gridSize / 2);
    occ[cy * gridSize + cx] = 255;

    const tex = texRef.current;
    if (tex) {
      const data = tex.image.data as Uint8Array;
      if (!data || data.length === 0) fail("Texture image data missing after creation");
      data.fill(0);
      for (let oy = -2; oy <= 2; oy += 1) {
        for (let ox = -2; ox <= 2; ox += 1) {
          const nx = (cx + ox + gridSize) % gridSize;
          const ny = (cy + oy + gridSize) % gridSize;
          const ai = (ny * gridSize + nx) * 4 + 3;
          data[ai] = 255;
        }
      }
      tex.needsUpdate = true;
      const centerAlpha = data[(cy * gridSize + cx) * 4 + 3];
      if (centerAlpha === 0) fail("Seeding failed: center alpha is 0");
    }
    console.log("[DLA] Seed effect ran", { gridSize });
    if (shouldDebug) {
      // Seed initialization complete
      console.info("[DLA] Seeded center", { gridSize });
    }
  }, [gridSize, shouldDebug]);

  // Initialize walkers uniformly random to ensure early contact
  useEffect(() => {
    const w = walkersRef.current;
    for (let i = 0; i < walkers; i += 1) {
      w[i * 2 + 0] = Math.floor(Math.random() * gridSize);
      w[i * 2 + 1] = Math.floor(Math.random() * gridSize);
    }
    if (shouldDebug) {
      console.info("[DLA] Walkers randomized", { walkers, gridSize });
    }
  }, [gridSize, walkers, shouldDebug]);

  const dataTexture = useMemo(() => {
    const data = new Uint8Array(gridSize * gridSize * 4);
    const texture = new THREE.DataTexture(data, gridSize, gridSize, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texRef.current = texture;
    if (shouldDebug) {
      console.info("[DLA] Texture and material created", { gridSize });
    }
    if ((texture.image.data as Uint8Array).length !== gridSize * gridSize * 4) {
      fail(`Texture data size mismatch: got ${(texture.image.data as Uint8Array).length}, expected ${gridSize * gridSize * 4}`);
    }
    return texture;
  }, [gridSize, shouldDebug]);

  useFrame(() => {
    const occ = occupiedRef.current;
    const w = walkersRef.current;
    const maybeTex = texRef.current;
    if (!maybeTex) fail("DataTexture not initialized in frame loop");
    const dataTex = maybeTex as THREE.DataTexture & { image: { data: ArrayLike<number> } };
    const imageData = dataTex.image.data;
    // Convert ArrayBufferView generically to Uint8Array view without copying
    const data = imageData instanceof Uint8Array ? imageData : new Uint8Array((imageData as ArrayBufferView).buffer);
    if (!data || data.length !== gridSize * gridSize * 4) {
      fail(`Frame data invalid length: ${data ? data.length : 0}`);
    }

    let spf = stepsPerFrame;
    if (warmupFramesRef.current > 0) { spf *= 12; warmupFramesRef.current -= 1; }
    // Adaptive steps: reduce if last frame was too slow
    const lastDelta = typeof performance !== "undefined" ? performance.now() - lastStatsTimeMsRef.current : 0;
    if (lastDelta > targetFrameMs) {
      spf = Math.max(100, Math.floor(spf * 0.8));
    }

    for (let step = 0; step < spf; step += 1) {
      const i = Math.floor(Math.random() * walkers);
      let x = w[i * 2 + 0];
      let y = w[i * 2 + 1];

      // Simple random walk with slight inward bias to center
      const cx = Math.floor(gridSize / 2);
      const cy = Math.floor(gridSize / 2);
      const dx = Math.sign(cx - x);
      const dy = Math.sign(cy - y);

      if (Math.random() < biasToPointer) {
        if (Math.random() < 0.5) x += dx; else y += dy;
      } else {
        const r = Math.floor(Math.random() * 4);
        if (r === 0) x += 1; else if (r === 1) x -= 1; else if (r === 2) y += 1; else y -= 1;
      }

      if (x < 0) x = gridSize - 1; if (x >= gridSize) x = 0;
      if (y < 0) y = gridSize - 1; if (y >= gridSize) y = 0;

      const idx = y * gridSize + x;
      let near = false;
      for (let oy = -1; oy <= 1 && !near; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (ox === 0 && oy === 0) continue;
          const nx = (x + ox + gridSize) % gridSize;
          const ny = (y + oy + gridSize) % gridSize;
          // 4-neighborhood only to slow aggregation
          if ((ox === 0 || oy === 0) && occ[ny * gridSize + nx]) { near = true; break; }
        }
      }

      if (near) {
        occ[idx] = 255;
        // bloom a little
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const nx = (x + ox + gridSize) % gridSize;
            const ny = (y + oy + gridSize) % gridSize;
            const ai = (ny * gridSize + nx) * 4 + 3;
            data[ai] = 255;
          }
        }
        if (shouldDebug && !firstStickLoggedRef.current) {
          const now = typeof performance !== "undefined" ? performance.now() : Date.now();
          const elapsedMs = Math.max(0, now - startTimeMsRef.current);
          console.info("[DLA] First aggregation", { x, y, elapsedMs: Math.round(elapsedMs) });
          firstStickLoggedRef.current = true;
        }
        // respawn randomly to keep exploring
        w[i * 2 + 0] = Math.floor(Math.random() * gridSize);
        w[i * 2 + 1] = Math.floor(Math.random() * gridSize);
      } else {
        w[i * 2 + 0] = x;
        w[i * 2 + 1] = y;
      }
    }

    // fade non-occupied pixels in chunks to reduce per-frame work
    const chunk = 4;
    const startIndex = (frameIndexRef.current % chunk);
    for (let i = startIndex; i < occ.length; i += chunk) {
      const ai = i * 4 + 3;
      if (!occ[i]) {
        const v = data[ai] - 1;
        data[ai] = v > 0 ? v : 0;
      } else {
        data[ai] = 255;
      }
    }

    // update texture every other frame to reduce GL traffic
    if ((frameIndexRef.current & 1) === 0) {
      dataTex.needsUpdate = true;
    }
    frameIndexRef.current += 1;

    // Stats and heartbeats
    if (shouldDebug) {
      framesSinceStatsRef.current += 1;
      if (!warmupCompletedLoggedRef.current && warmupFramesRef.current === 0) {
        console.info("[DLA] Warmup complete");
        warmupCompletedLoggedRef.current = true;
      }
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const deltaMs = now - lastStatsTimeMsRef.current;
      if (deltaMs >= 1000) {
        const frames = framesSinceStatsRef.current;
        framesSinceStatsRef.current = 0;
        lastStatsTimeMsRef.current = now;
        let occupiedCount = 0;
        for (let i = 0; i < occ.length; i += 1) {
          if (occ[i]) occupiedCount += 1;
        }
        const fps = Math.round((frames * 1000) / deltaMs);
        const effectiveSpf = warmupFramesRef.current > 0 ? stepsPerFrame * 12 : stepsPerFrame;
        console.debug("[DLA] Heartbeat", {
          fps,
          occupied: occupiedCount,
          walkers,
          gridSize,
          stepsPerFrame: effectiveSpf,
          warmupRemaining: Math.max(0, warmupFramesRef.current),
        });
        // Always crash on degenerate states
        if (occupiedCount === 0) fail("Degenerate state: no occupied pixels");
        if (occupiedCount === occ.length && frames > 300) fail("Degenerate state: full occupancy");
      }
    }

    // Always emit a lightweight 5s heartbeat to confirm frames, even when debug is off
    const nowMs = typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsedSinceStart = nowMs - startTimeMsRef.current;
    if (elapsedSinceStart > 0 && Math.floor(elapsedSinceStart / 5000) !== Math.floor((elapsedSinceStart - (1000 / 60)) / 5000)) {
      console.log("[DLA] Frame heartbeat");
    }
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        transparent={false}
        depthWrite={false}
        depthTest={false}
        uniforms={{ uTex: { value: dataTexture }, uColor: { value: new THREE.Color((() => { const c = getComputedStyle(document.documentElement).getPropertyValue('--fg-primary'); if (!c || c.trim() === '') { throw new Error('[DLA-FAIL] Missing CSS var --fg-primary'); } return c; })()) }, uSolid: { value: solidTestMode ? 1 : 0 } }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            // Fullscreen clip-space quad
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform sampler2D uTex;
          uniform vec3 uColor;
          uniform float uSolid;
          void main() {
            if (uSolid > 0.5) {
              gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
              return;
            }
            float v = texture2D(uTex, vUv).a;
            // Max visibility: any non-zero alpha draws full-intensity
            float brightness = v > 0.0 ? 1.0 : 0.0;
            gl_FragColor = vec4(uColor * brightness, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export function BackgroundMycelium() {
  const { devicePixelRatioCap } = useMyceliumSettings();
  return (
    <div aria-hidden className="myco-bg pointer-events-none fixed inset-0 z-50" data-opacity={1}>
      <Canvas
        className="myco-canvas"
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          console.log("[DLA] Canvas created");
        }}
        dpr={[1, devicePixelRatioCap]}
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
      >
        <DLAField />
      </Canvas>
    </div>
  );
}

export default BackgroundMycelium;
