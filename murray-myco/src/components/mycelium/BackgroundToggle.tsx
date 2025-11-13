"use client";

import { useMyceliumSettings } from "@/state/useMyceliumSettings";
import BackgroundMyceliumGPU from "./BackgroundMyceliumGPU";
import BackgroundSlimeGPU from "./BackgroundSlimeGPU";

export default function BackgroundToggle() {
  const { algorithm } = useMyceliumSettings();
  return algorithm === "slime" ? <BackgroundSlimeGPU /> : <BackgroundMyceliumGPU />;
}


