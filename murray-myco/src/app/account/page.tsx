import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/products";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/account");
  }

  // Fetch user's orders
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch user's saved addresses
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-2">My Account</h1>
      <p className="text-foreground/70 mb-12">
        Welcome back, {session.user.name?.split(' ')[0]}!
      </p>

      {/* Account Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-foreground/60 mb-1">Email</h3>
          <p className="text-foreground">{session.user.email}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-foreground/60 mb-1">Total Orders</h3>
          <p className="text-2xl font-semibold">{orders.length}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-foreground/60 mb-1">Saved Addresses</h3>
          <p className="text-2xl font-semibold">{addresses.length}</p>
        </GlassCard>
      </div>

      {/* Order History */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Order History</h2>
        {orders.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-foreground/60 mb-4">No orders yet</p>
            <Button href="/fresh-mushrooms">
              Start Shopping
            </Button>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <GlassCard
                key={order.id}
                className="p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-foreground/60">
                      Order placed {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">
                      Order #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatPrice(order.totalCents)}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-500/20 text-green-500"
                          : order.status === "shipped"
                          ? "bg-blue-500/20 text-blue-500"
                          : order.status === "processing"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-gray-500/20 text-gray-500"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-foreground/80">
                        {item.quantity}x {item.productName} - {item.variantName}
                      </span>
                      <span className="text-foreground/60">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 text-sm text-foreground/60">
                  <p>Shipping to: {order.shippingName}</p>
                  <p>{order.shippingLine1}{order.shippingLine2 && `, ${order.shippingLine2}`}</p>
                  <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Saved Addresses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Saved Addresses</h2>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-md text-sm font-medium transition-colors">
            Add New Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-foreground/60">No saved addresses yet</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <GlassCard
                key={address.id}
                className="p-6"
              >
                {address.isDefault && (
                  <span className="inline-block mb-2 px-2 py-1 bg-white/10 text-xs font-medium rounded">
                    Default
                  </span>
                )}
                <p className="font-medium">{address.name}</p>
                <p className="text-sm text-foreground/70 mt-2">
                  {address.line1}
                  {address.line2 && <>, {address.line2}</>}
                </p>
                <p className="text-sm text-foreground/70">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-sm text-foreground/70">{address.country}</p>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
