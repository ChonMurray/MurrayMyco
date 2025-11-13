"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUi } from "@/state/useUi";
import { motion } from "framer-motion";

export type NavLinkProps = React.ComponentProps<typeof Link>;

export default function NavLink({ children, className, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const { setNavigating } = useUi();
  const isActive = typeof props.href === "string" && pathname === props.href;

  return (
    <motion.span whileTap={{ scale: 0.98 }} onMouseDown={() => setNavigating(true)}>
      <Link {...props} className={isActive ? ["underline", className].filter(Boolean).join(" ") : className} onClick={() => setNavigating(true)}>
        {children}
      </Link>
    </motion.span>
  );
}
