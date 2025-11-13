"use client";

import { create } from "zustand";

export type UiState = {
  isNavigating: boolean;
  setNavigating: (v: boolean) => void;
};

export const useUi = create<UiState>((set) => ({
  isNavigating: false,
  setNavigating: (v: boolean) => set({ isNavigating: v }),
}));
