"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useUi } from "@/state/useUi";
import { useEffect } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setNavigating } = useUi();

  useEffect(() => {
    console.log("[MYCO] PageTransition mounted", { pathname });
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onAnimationComplete={() => setNavigating(false)}
    >
      {children}
    </motion.div>
  );
}
