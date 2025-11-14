"use client";

import { create } from "zustand";
import { env } from "@/lib/env";

// Detect mobile device for performance optimization
const isMobile = typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

// Log device type for debugging
if (typeof window !== 'undefined') {
  console.log('[Settings] Device type:', isMobile ? 'Mobile' : 'Desktop');
}

export type MyceliumSettings = {
  algorithm: "dla" | "slime";
  particleCount: number;
  growthSpeed: number;
  attractionStrength: number;
  opacity: number;
  devicePixelRatioCap: number;
  gridAlign: number;
  gridSize: number;
  seeds: number;
  walkers: number;
  stepsPerFrame: number;
  biasToPointer: number;
  workgroupSize: number;
  ringOuterMinPx: number;
  ringOuterFrac: number;
  ringInnerMinPx: number;
  ringInnerFrac: number;
  respawnMarginMinPx: number;
  respawnMarginFrac: number;
  ringRefreshInterval: number;
  torusEdgePadPx: number;
  twoDFallbackSeedRadius: number;
  twoDFallbackStickManhattanRadius: number;
  twoDFallbackThickenRadius: number;
  // Slime mold (Physarum) parameters
  slimeSensorAngleMilliRad: number; // milliradians
  slimeSensorDistance: number;      // pixels
  slimeTurnAngleMilliRad: number;   // milliradians
  slimeMoveSpeedMilliPx: number;    // milli-pixels per step
  slimeDepositMilli: number;        // milli intensity per step
  slimeDecayMilli: number;          // milli decay per frame
  slimeSpawnMode: "uniform" | "center";
  slimeSpawnRadiusFrac: number;     // fraction of min(gridW,gridH)
  slimeDiffuse: number;             // 0..1 blur amount
};

export const useMyceliumSettings = create<
  MyceliumSettings & {
    setOpacity: (v: number) => void;
  }
>((set) => ({
  algorithm: "slime",
  particleCount: 100,
  growthSpeed: 0.35,
  attractionStrength: 0.85,
  opacity: 1, // Math.max(env.NEXT_PUBLIC_MYCELIUM_OPACITY, 0.8),
  devicePixelRatioCap: isMobile ? 0.5 : 1, // Lower resolution on mobile (50%)
  gridAlign: 32,
  gridSize: isMobile ? 128 : 512, // Much smaller grid on mobile (128 vs 512)
  seeds: 1,
  walkers: isMobile ? 100 : 200, // Very sparse: 100 mobile, 200 desktop
  stepsPerFrame: isMobile ? 2 : 4, // Slower growth for sparser look
  biasToPointer: 0.1,
  workgroupSize: 64,
  ringOuterMinPx: 12,
  ringOuterFrac: 0.06,
  ringInnerMinPx: 8,
  ringInnerFrac: 0.03,
  respawnMarginMinPx: 8,
  respawnMarginFrac: 0.04,
  ringRefreshInterval: 128,
  torusEdgePadPx: 2,
  twoDFallbackSeedRadius: isMobile ? 1 : 2,
  twoDFallbackStickManhattanRadius: isMobile ? 1 : 2,
  twoDFallbackThickenRadius: isMobile ? 0 : 1,
  slimeSensorAngleMilliRad: 785, // ~pi/4
  slimeSensorDistance: isMobile ? 15 : 20, // Shorter sensor distance on mobile
  slimeTurnAngleMilliRad: 600,   // a bit larger turns
  slimeMoveSpeedMilliPx: 100,    // 0.3 px/step
  slimeDepositMilli: isMobile ? 150 : 120,  // More visible on mobile
  slimeDecayMilli: isMobile ? 15 : 20,      // Slightly slower fade on mobile
  slimeSpawnMode: "center",
  slimeSpawnRadiusFrac: 0.03,
  slimeDiffuse: 0.08,
  setOpacity: (v: number) => set({ opacity: Math.min(1, Math.max(0, v)) }),
}));
