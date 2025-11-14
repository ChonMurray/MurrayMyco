"use client";

import NavLink from "@/components/common/NavLink";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname === "/dla") return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/50 border-b border-black/5 dark:border-white/10">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 w-full">
          <NavLink href="/" className="font-semibold tracking-wide">Murray Myco</NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 text-sm">
            <NavLink href="/consumer" className="hover:underline">Culinary</NavLink>
            <NavLink href="/consumer" className="hover:underline">Medicinal</NavLink>
            <NavLink href="/lab" className="hover:underline">Cultures</NavLink>
            <NavLink href="/about" className="hover:underline">About Us</NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden ml-auto p-2 touch-manipulation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#16161d]/98 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            <NavLink
              href="/consumer"
              className="block py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Culinary
            </NavLink>
            <NavLink
              href="/consumer"
              className="block py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Medicinal
            </NavLink>
            <NavLink
              href="/lab"
              className="block py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cultures
            </NavLink>
            <NavLink
              href="/about"
              className="block py-3 px-3 hover:bg-white/10 rounded-md transition-colors touch-manipulation text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
