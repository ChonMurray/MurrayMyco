"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  priceCents: number;
  quantity: number;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed values
  getTotalItems: () => number;
  getSubtotal: () => number;
  getItemByVariantId: (variantId: string) => CartItem | undefined;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

  addItem: (item) => {
    const existingItem = get().items.find((i) => i.variantId === item.variantId);
    const quantity = item.quantity ?? 1;

    if (existingItem) {
      // Update quantity if item already exists
      const newQuantity = Math.min(existingItem.quantity + quantity, existingItem.maxStock);
      set((state) => ({
        items: state.items.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i
        ),
      }));
    } else {
      // Add new item
      const newQuantity = Math.min(quantity, item.maxStock);
      set((state) => ({
        items: [...state.items, { ...item, quantity: newQuantity }],
      }));
    }

    // Auto-open cart when item is added
    get().openCart();
  },

  removeItem: (variantId) => {
    set((state) => ({
      items: state.items.filter((item) => item.variantId !== variantId),
    }));
  },

  updateQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(variantId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) => {
        if (item.variantId === variantId) {
          const newQuantity = Math.min(quantity, item.maxStock);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  openCart: () => {
    set({ isOpen: true });
  },

  closeCart: () => {
    set({ isOpen: false });
  },

  toggleCart: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
  },

  getItemByVariantId: (variantId) => {
    return get().items.find((item) => item.variantId === variantId);
  },
    }),
    {
      name: "murray-myco-cart",
      storage: createJSONStorage(() => localStorage),
      // Only persist cart items, not UI state like isOpen
      partialize: (state) => ({ items: state.items }),
    }
  )
);
