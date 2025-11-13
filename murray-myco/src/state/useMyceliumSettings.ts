"use client";

import { create } from "zustand";
import { env } from "@/lib/env";

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
  devicePixelRatioCap: 1,
  gridAlign: 32,
  gridSize: 512,
  seeds: 1,
  walkers: 1500,
  stepsPerFrame: 8,
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
  twoDFallbackSeedRadius: 2,
  twoDFallbackStickManhattanRadius: 2,
  twoDFallbackThickenRadius: 1,
  slimeSensorAngleMilliRad: 785, // ~pi/4
  slimeSensorDistance: 20,
  slimeTurnAngleMilliRad: 600,   // a bit larger turns
  slimeMoveSpeedMilliPx: 100,    // 0.3 px/step
  slimeDepositMilli: 120,        // less trail intensity
  slimeDecayMilli: 20,           // faster fade
  slimeSpawnMode: "center",
  slimeSpawnRadiusFrac: 0.03,
  slimeDiffuse: 0.08,
  setOpacity: (v: number) => set({ opacity: Math.min(1, Math.max(0, v)) }),
}));
