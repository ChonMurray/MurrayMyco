"use client";

import NavLink from "@/components/common/NavLink";
import { useState, useEffect } from "react";
import { useCart } from "@/state/useCart";
import { ShoppingCart, Menu, X, User, LogOut, Package, Settings } from "lucide-react";
import CartDrawer from "@/components/cart/CartDrawer";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toggleCart, getTotalItems } = useCart();
  const totalItems = mounted ? getTotalItems() : 0;
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[2px] bg-background/50 border-b border-black/5 dark:border-white/10">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo - Left aligned */}
        <NavLink href="/" className="font-semibold tracking-wide" style={{ textDecoration: 'none' }}>Murray Myco</NavLink>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-6 text-sm absolute left-1/2 transform -translate-x-1/2">
          <NavLink href="/fresh-mushrooms" className="hover:underline">Fresh Mushrooms</NavLink>
          <NavLink href="/grow-kits" className="hover:underline">Grow Kits</NavLink>
          <NavLink href="/liquid-cultures" className="hover:underline">Liquid Cultures</NavLink>
          <NavLink href="/learning-center" className="hover:underline">Learning Center</NavLink>
          <NavLink href="/about" className="hover:underline">About</NavLink>
        </div>

        {/* Desktop Right Side - Cart & Auth */}
        <div className="hidden md:flex items-center gap-4">
          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className="relative border-0 bg-none p-0 m-0 text-foreground"
            style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
            aria-label="Shopping cart"
          >
            <ShoppingCart className="w-5 h-5 text-foreground" strokeWidth={2} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Auth Section */}
          {status === "loading" ? (
            <div className="w-8 h-8" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-md transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">{session.user.name?.split(' ')[0] || 'Account'}</span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-[#16161d] border border-white/10 rounded-lg shadow-lg z-50">
                    <div className="p-2 space-y-1">
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <Link
                        href="/account/settings"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      {session.user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm text-yellow-500"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <hr className="border-white/10 my-1" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm hover:underline"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 bg-transparent hover:bg-white/10 rounded-md transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#16161d]/98 backdrop-blur-[2px]">
          <div className="px-4 py-3 space-y-1">
            <NavLink
              href="/fresh-mushrooms"
              className="block py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fresh Mushrooms
            </NavLink>
            <NavLink
              href="/grow-kits"
              className="block py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Grow Kits
            </NavLink>
            <NavLink
              href="/liquid-cultures"
              className="block py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Liquid Cultures
            </NavLink>
            <NavLink
              href="/learning-center"
              className="block py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Learning Center
            </NavLink>
            <NavLink
              href="/about"
              className="block py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </NavLink>

            {/* Cart Button - Mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                toggleCart();
              }}
              className="flex items-center justify-between w-full py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart
              </span>
              {totalItems > 0 && (
                <span className="bg-white text-black text-xs font-bold rounded-full px-2 py-1">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth Section - Mobile */}
            {session ? (
              <>
                <div className="pt-2 mt-2 border-t border-white/10">
                  <div className="px-3 py-2 text-sm text-foreground/70">
                    {session.user.email}
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="w-5 h-5" />
                    My Orders
                  </Link>
                  <Link
                    href="/account/settings"
                    className="flex items-center gap-2 py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  {session.user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-yellow-500"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-2 w-full py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 mt-2 border-t border-white/10">
                <Button
                  href="/auth/signin"
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>

    {/* Cart Drawer */}
    <CartDrawer />
    </>
  );
}

export default Navbar;
