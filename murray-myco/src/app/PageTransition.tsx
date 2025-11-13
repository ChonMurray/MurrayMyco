"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUi } from "@/state/useUi";
import { useEffect } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setNavigating } = useUi();
  useEffect(() => {
    console.log("[MYCO] PageTransition mounted", { pathname });
  }, []);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
       onAnimationComplete={() => setNavigating(false)}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
