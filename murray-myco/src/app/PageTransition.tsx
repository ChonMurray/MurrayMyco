"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useUi } from "@/state/useUi";
import { useEffect, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setNavigating } = useUi();
  const [displayContent, setDisplayContent] = useState(false);

  useEffect(() => {
    console.log("[MYCO] PageTransition mounted", { pathname });
    // Small delay to ensure we start from opacity 0
    const timer = setTimeout(() => setDisplayContent(true), 10);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!displayContent) {
    return <div style={{ opacity: 0, height: "100vh" }} />;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onAnimationComplete={() => setNavigating(false)}
    >
      {children}
    </motion.div>
  );
}
