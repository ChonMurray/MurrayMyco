"use client";

import { useEffect, useRef } from "react";
import { useMyceliumSettings } from "@/state/useMyceliumSettings";

// Detect mobile device for performance optimization
const isMobile = typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

// Configuration constants
const CELL_SIZE = 2;
const PARTICLE_COUNT = isMobile ? 500 : 2000;
const MIN_SPAWN_RADIUS = 30;
const STUCK_RADIUS = 2;
const MAX_STUCK = isMobile ? 2000 : 10000;
const ANGLE_BUCKETS = 360;
const SPAWN_BUFFER = 30;
const RESPAWN_DISTANCE = 100;
const TAPERED_WIDTH_MIN = 0.1;
const TAPERED_WIDTH_MAX = 1.0;
const WALKING_PARTICLE_RADIUS = 0.0;
const ZOOM_SCALE = 2; // Scale factor for "zooming in" - higher = more zoomed in
const ROTATION_ANGLE = 45; // Rotation angle in degrees (0-360)
const MYCELIUM_COLOR = "69, 69, 69"; // RGB values for mycelium color (default: white)
const MYCELIUM_ALPHA = 1.0; // Alpha/opacity of mycelium lines (0.0 - 1.0)
const UPDATES_PER_FRAME = 10; // Number of update iterations per animation frame (higher = faster growth)

interface StuckParticle {
  x: number;
  y: number;
  parent: StuckParticle | null;
  generation: number;
}

export default function DLABackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { opacity, showWalkingParticles } = useMyceliumSettings();

  console.log("[DLA] Component rendered, opacity:", opacity, "showWalking:", showWalkingParticles);

  useEffect(() => {
    console.log("[DLA] useEffect running");
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("[DLA] Canvas ref is null");
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      console.error("[DLA] Failed to get context");
      return;
    }

    console.log("[DLA] Canvas initialized successfully");

    // Type assertion since we know ctx is non-null after the check above
    const ctx: CanvasRenderingContext2D = context;

    // Set canvas size to window size with device pixel ratio
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate canvas size needed to cover viewport when rotated
    // For a rotated rectangle, we need to expand to cover the bounding box
    const rotationRad = (ROTATION_ANGLE * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rotationRad));
    const sin = Math.abs(Math.sin(rotationRad));

    // Bounding box dimensions when rotated
    const width = viewportWidth * cos + viewportHeight * sin;
    const height = viewportWidth * sin + viewportHeight * cos;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Apply zoom scale to make everything appear larger (zoomed in)
    ctx.scale(ZOOM_SCALE, ZOOM_SCALE);

    // Adjust logical dimensions for zoom (coordinate space is now smaller)
    const logicalWidth = width / ZOOM_SCALE;
    const logicalHeight = height / ZOOM_SCALE;

    // Note: Rotation is now handled via CSS transform to avoid coordinate system misalignment
    // The DLA algorithm works in unrotated space for proper spatial calculations

    // DLA State
    const stuck: StuckParticle[] = [];
    const stuckLookup: Map<string, StuckParticle> = new Map();
    const particles: { x: number; y: number }[] = [];

    // Spatial grid for O(1) collision detection (using logical dimensions)
    const gridWidth = Math.ceil(logicalWidth / CELL_SIZE);
    const gridHeight = Math.ceil(logicalHeight / CELL_SIZE);
    const grid: Set<string>[] = new Array(gridWidth * gridHeight).fill(null).map(() => new Set());

    // Track maximum radius in each angular direction
    const maxRadiusPerAngle: number[] = new Array(ANGLE_BUCKETS).fill(MIN_SPAWN_RADIUS);

    // Initialize with center seed (using logical dimensions)
    const centerX = logicalWidth / 2;
    const centerY = logicalHeight / 2;

    // Add random offset to seed position for variation between runs
    const seedJitterX = (Math.random() - 0.5) * 30;
    const seedJitterY = (Math.random() - 0.5) * 30;
    const seedX = Math.floor(centerX + seedJitterX);
    const seedY = Math.floor(centerY + seedJitterY);
    const centerKey = `${seedX},${seedY}`;

    const seed: StuckParticle = {
      x: seedX,
      y: seedY,
      parent: null,
      generation: 0
    };
    stuck.push(seed);
    stuckLookup.set(centerKey, seed);

    // Add to spatial grid
    const gridX = Math.floor(seedX / CELL_SIZE);
    const gridY = Math.floor(seedY / CELL_SIZE);
    const gridIndex = gridY * gridWidth + gridX;
    grid[gridIndex].add(centerKey);

    console.log("[DLA] Initialized with seed at", seedX, seedY);

    // Spawn initial particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      spawnParticle();
    }

    console.log("[DLA] Spawned", PARTICLE_COUNT, "initial particles");

    function spawnParticle() {
      // Build list of valid buckets (where spawn point would be on-screen)
      const validBuckets: number[] = [];
      for (let bucket = 0; bucket < ANGLE_BUCKETS; bucket++) {
        const angle = (bucket * Math.PI) / 180;
        const spawnRadius = maxRadiusPerAngle[bucket] + SPAWN_BUFFER;
        const x = centerX + Math.cos(angle) * spawnRadius;
        const y = centerY + Math.sin(angle) * spawnRadius;

        if (x >= 0 && x < logicalWidth && y >= 0 && y < logicalHeight) {
          validBuckets.push(bucket);
        }
      }

      // If no valid buckets, don't spawn
      if (validBuckets.length === 0) {
        return;
      }

      // Pick a random valid bucket
      const bucket = validBuckets[Math.floor(Math.random() * validBuckets.length)];
      const angle = (bucket * Math.PI) / 180;
      const spawnRadius = maxRadiusPerAngle[bucket] + SPAWN_BUFFER;

      // Add small random angular jitter (not the full offset) for variation
      const angleJitter = (Math.random() - 0.5) * 0.1; // ±2.8 degrees

      const x = centerX + Math.cos(angle + angleJitter) * spawnRadius;
      const y = centerY + Math.sin(angle + angleJitter) * spawnRadius;
      particles.push({ x, y });
    }

    function getKey(x: number, y: number): string {
      return `${Math.floor(x)},${Math.floor(y)}`;
    }

    function findNearestStuck(x: number, y: number): StuckParticle | null {
      // Use spatial grid for O(1) collision detection
      const gx = Math.floor(x / CELL_SIZE);
      const gy = Math.floor(y / CELL_SIZE);

      let nearest: StuckParticle | null = null;
      let nearestDist = STUCK_RADIUS;

      // Check neighboring grid cells
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const ngx = gx + dx;
          const ngy = gy + dy;

          if (ngx < 0 || ngx >= gridWidth || ngy < 0 || ngy >= gridHeight) continue;

          const idx = ngy * gridWidth + ngx;
          const cell = grid[idx];

          // Check particles in this cell
          for (const key of cell) {
            const particle = stuckLookup.get(key);
            if (particle) {
              const dist = Math.hypot(x - particle.x, y - particle.y);
              if (dist <= nearestDist) {
                nearest = particle;
                nearestDist = dist;
              }
            }
          }
        }
      }
      return nearest;
    }

    function update() {
      // Update each particle
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Random walk with small steps for contiguous growth
        const angle = Math.random() * Math.PI * 2;
        const step = 1;
        p.x += Math.cos(angle) * step;
        p.y += Math.sin(angle) * step;

        // Check if stuck
        const parent = findNearestStuck(p.x, p.y);
        if (parent) {
          const key = getKey(p.x, p.y);

          const newParticle: StuckParticle = {
            x: Math.floor(p.x),
            y: Math.floor(p.y),
            parent: parent,
            generation: parent.generation + 1
          };
          stuck.push(newParticle);
          stuckLookup.set(key, newParticle);

          // Add to spatial grid
          const gx = Math.floor(p.x / CELL_SIZE);
          const gy = Math.floor(p.y / CELL_SIZE);
          if (gx >= 0 && gx < gridWidth && gy >= 0 && gy < gridHeight) {
            const idx = gy * gridWidth + gx;
            grid[idx].add(key);
          }

          // Update maximum radius for this angle
          const deltaX = p.x - centerX;
          const deltaY = p.y - centerY;
          const particleAngle = Math.atan2(deltaY, deltaX);
          const particleAngleDegrees = ((particleAngle * 180 / Math.PI) + 360) % 360;
          const particleBucket = Math.floor(particleAngleDegrees);
          const particleRadius = Math.hypot(deltaX, deltaY);
          maxRadiusPerAngle[particleBucket] = Math.max(maxRadiusPerAngle[particleBucket], particleRadius);

          particles.splice(i, 1);

          // Spawn replacement if under max
          if (stuck.length < MAX_STUCK) {
            spawnParticle();
          }
        }
        // Respawn if too far from center (relative to growth in that direction)
        else {
          const offsetX = p.x - centerX;
          const offsetY = p.y - centerY;
          const particleAngle = Math.atan2(offsetY, offsetX);
          const particleAngleDegrees = ((particleAngle * 180 / Math.PI) + 360) % 360;
          const particleBucket = Math.floor(particleAngleDegrees);
          const particleRadius = Math.hypot(offsetX, offsetY);
          const maxRadiusInDirection = maxRadiusPerAngle[particleBucket];

          // Respawn if wandered too far beyond the growth front in this direction
          if (particleRadius > maxRadiusInDirection + RESPAWN_DISTANCE) {
            particles.splice(i, 1);
            spawnParticle();
          }
        }
      }
    }

    let frameCount = 0;
    function draw() {
      // Clear with transparent background (using logical dimensions)
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      // Find maximum generation to calculate relative age
      let maxGeneration = 0;
      stuck.forEach((particle) => {
        if (particle.generation > maxGeneration) {
          maxGeneration = particle.generation;
        }
      });

      // Draw threads (lines between particles and their parents)
      ctx.strokeStyle = `rgba(${MYCELIUM_COLOR}, ${MYCELIUM_ALPHA})`;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      stuck.forEach((particle) => {
        if (particle.parent) {
          // Tapered line width: oldest (gen 0) = max width, newest (gen maxGeneration) = min width
          const generationRatio = maxGeneration > 0 ? particle.generation / maxGeneration : 0;
          const taperedWidth = TAPERED_WIDTH_MAX - (generationRatio * (TAPERED_WIDTH_MAX - TAPERED_WIDTH_MIN));
          ctx.lineWidth = taperedWidth;

          ctx.beginPath();
          ctx.moveTo(particle.parent.x, particle.parent.y);
          ctx.lineTo(particle.x, particle.y);
          ctx.stroke();
        }
      });

      // Draw active walking particles (if enabled)
      if (showWalkingParticles) {
        ctx.fillStyle = `rgba(${MYCELIUM_COLOR}, ${opacity * 0.3})`;
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, WALKING_PARTICLE_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Log progress every 60 frames
      frameCount++;
      if (frameCount % 60 === 0) {
        console.log(`[DLA] Frame ${frameCount}: ${stuck.length} stuck particles, ${particles.length} active`);
      }
    }

    // Animation loop
    let animationId: number;
    let lastTime = performance.now();

    function animate(currentTime: number) {
      const deltaTime = currentTime - lastTime;

      // Run updates multiple times per frame for faster growth
      if (deltaTime >= 16) { // ~60fps
        for (let i = 0; i < UPDATES_PER_FRAME; i++) {
          update();
        }
        draw();
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(animate);
    }

    console.log("[DLA] Starting animation loop");
    animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      console.log("[DLA] Cleaning up animation");
      cancelAnimationFrame(animationId);
    };
  }, [opacity, showWalkingParticles]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          imageRendering: "crisp-edges",
          display: "block",
          transform: `translate(-50%, -50%) rotate(${ROTATION_ANGLE}deg)`,
          transformOrigin: "center center"
        }}
      />
    </div>
  );
}
