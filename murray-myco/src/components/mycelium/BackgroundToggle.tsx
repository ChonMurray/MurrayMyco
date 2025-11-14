"use client";

import { useMyceliumSettings } from "@/state/useMyceliumSettings";
import BackgroundMycelium2D from "./BackgroundMycelium2D";
import BackgroundSlimeGPU from "./BackgroundSlimeGPU";

export default function BackgroundToggle() {
  const { algorithm } = useMyceliumSettings();
  return algorithm === "slime" ? <BackgroundSlimeGPU /> : <BackgroundMycelium2D />;
}


