"use client";

import { useCart } from "@/state/useCart";
import { formatPrice } from "@/lib/products";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GlassCard from "@/components/ui/GlassCard";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, getSubtotal } = useCart();
  const [mounted, setMounted] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  useEffect(() => {
    setMounted(true);
    // Pre-fill email if user is logged in
    if (session?.user?.email) {
      setShippingInfo(prev => ({ ...prev, email: session.user.email || "" }));
    }
  }, [session]);

  const subtotal = mounted ? getSubtotal() : 0;

  // Placeholder shipping calculation
  const shippingCost = 0; // TODO: Calculate with Shippo
  const tax = 0; // TODO: Calculate tax
  const total = subtotal + shippingCost + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Stripe payment processing
    alert("Payment processing not yet implemented. This will integrate with Stripe.");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  if (!mounted) {
    return null;
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16">
        <GlassCard className="p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
          <p className="text-foreground/60 mb-6">
            Add some products before checking out.
          </p>
          <Button href="/fresh-mushrooms" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Button>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to shopping
        </Link>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  type="text"
                  required
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                />
                <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  required
                  value={shippingInfo.email}
                  onChange={handleInputChange}
                />
              </div>

              <Input
                id="address"
                name="address"
                label="Street Address"
                type="text"
                required
                value={shippingInfo.address}
                onChange={handleInputChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  id="city"
                  name="city"
                  label="City"
                  type="text"
                  required
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                />
                <Input
                  id="state"
                  name="state"
                  label="State"
                  type="text"
                  required
                  value={shippingInfo.state}
                  onChange={handleInputChange}
                />
                <Input
                  id="zipCode"
                  name="zipCode"
                  label="ZIP Code"
                  type="text"
                  required
                  value={shippingInfo.zipCode}
                  onChange={handleInputChange}
                />
              </div>
            </form>
          </GlassCard>

          {/* Payment Information */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="bg-white/5 border border-white/10 rounded-md p-4 text-center text-foreground/60">
              <p>Payment processing will be implemented with Stripe</p>
              <p className="text-sm mt-2">Credit card, debit card, and other payment methods</p>
            </div>
          </GlassCard>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-foreground/60 text-xs">
                      {item.variantName} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.priceCents * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Shipping</span>
                <span className="text-foreground/60">Calculated at next step</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/60">Tax</span>
                <span className="text-foreground/60">Calculated at next step</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={handleSubmit}
              fullWidth
            >
              Place Order
            </Button>

            <p className="text-xs text-foreground/50 text-center mt-4">
              By placing your order, you agree to our terms and conditions.
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
