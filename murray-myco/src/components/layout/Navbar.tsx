"use client";

import NavLink from "@/components/common/NavLink";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  if (pathname === "/dla") return null;
  return (
    <header className="fixed top-0 left-0 right-0 z-10 backdrop-blur-sm bg-background/50 border-b border-black/5 dark:border-white/10">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <NavLink href="/" className="font-semibold tracking-wide">Murray Myco</NavLink>
          <div className="hidden md:flex items-center gap-3 text-sm">
            <NavLink href="/consumer" className="hover:underline">Culinary</NavLink>
            <NavLink href="/consumer" className="hover:underline">Medicinal</NavLink>
            <NavLink href="/lab" className="hover:underline">Cultures</NavLink>
            <NavLink href="/about" className="hover:underline">About Us</NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
