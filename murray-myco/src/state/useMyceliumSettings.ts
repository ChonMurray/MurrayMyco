"use client";

import { create } from "zustand";

// Detect mobile device for performance optimization
const isMobile = typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

export type MyceliumSettings = {
  algorithm: "dla" | "slime";
  opacity: number;
  // DLA settings
  devicePixelRatioCap: number;
  gridAlign: number;
  walkers: number;
  stepsPerFrame: number;
  // Slime mold settings
  gridSize: number;
  workgroupSize: number;
  slimeSensorAngleMilliRad: number;
  slimeSensorDistance: number;
  slimeTurnAngleMilliRad: number;
  slimeMoveSpeedMilliPx: number;
  slimeDepositMilli: number;
  slimeDecayMilli: number;
  slimeSpawnMode: "uniform" | "center";
  slimeSpawnRadiusFrac: number;
  slimeDiffuse: number;
};

export const useMyceliumSettings = create<
  MyceliumSettings & {
    setOpacity: (v: number) => void;
  }
>((set) => ({
  algorithm: "dla",
  opacity: 1,
  // DLA settings
  devicePixelRatioCap: isMobile ? 0.35 : 0.5,
  gridAlign: 32,
  walkers: isMobile ? 100 : 200,
  stepsPerFrame: isMobile ? 2 : 4,
  // Slime mold settings
  gridSize: isMobile ? 128 : 256,
  workgroupSize: 64,
  slimeSensorAngleMilliRad: 785,
  slimeSensorDistance: isMobile ? 15 : 20,
  slimeTurnAngleMilliRad: 600,
  slimeMoveSpeedMilliPx: 100,
  slimeDepositMilli: isMobile ? 150 : 120,
  slimeDecayMilli: isMobile ? 15 : 20,
  slimeSpawnMode: "center",
  slimeSpawnRadiusFrac: 0.03,
  slimeDiffuse: 0.08,
  setOpacity: (v: number) => set({ opacity: Math.min(1, Math.max(0, v)) }),
}));
