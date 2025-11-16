"use client";

import { useCart } from "@/state/useCart";
import { formatPrice } from "@/lib/products";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalItems,
    getSubtotal,
  } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;
  const subtotal = mounted ? getSubtotal() : 0;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ease-out"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md border-l border-white/10 z-[70] transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full backdrop-blur-[2px] bg-background/50">
          {/* Header */}
          <div className="h-14 border-b border-white/10">
            <div className="flex items-center justify-between h-full px-6">
              <span className="font-semibold tracking-wide">
                Cart {totalItems > 0 && `(${totalItems})`}
              </span>
              <button
                onClick={closeCart}
                className="hover:opacity-60 transition-opacity bg-transparent border-0"
                style={{ background: 'transparent', border: 'none', padding: 0 }}
                aria-label="Close cart"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          {!mounted || items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <ShoppingCart className="w-16 h-16 text-foreground/20 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-foreground/60 text-sm mb-6">
                Add some products to get started!
              </p>
              <Button
                onClick={closeCart}
                variant="secondary"
                className="px-6 py-2"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/fresh-mushrooms/${item.productSlug}`}
                        onClick={closeCart}
                        className="font-medium hover:text-foreground/80 transition-colors line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-foreground/60 mt-1">
                        {item.variantName}
                      </p>
                      <p className="text-sm font-semibold mt-2">
                        {formatPrice(item.priceCents)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-foreground/40 hover:text-foreground/80 transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2 bg-white/10 rounded-md border border-white/10">
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="p-1 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          className="p-1 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={item.quantity >= item.maxStock}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {item.quantity >= item.maxStock && (
                        <span className="text-xs text-yellow-500">
                          Max stock
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-6 space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                <p className="text-sm text-foreground/60">
                  Shipping and taxes calculated at checkout
                </p>

                <Button
                  href="/checkout"
                  onClick={closeCart}
                  fullWidth
                >
                  Checkout
                </Button>

                <Button
                  onClick={closeCart}
                  variant="secondary"
                  fullWidth
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
