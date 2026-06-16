"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      // Jeśli użytkownik włączył reduced-motion, y wynosi 0 (brak ruchu), zostaje samo opacity
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "tween",
        ease: [0.16, 1, 0.3, 1],
        duration: shouldReduceMotion ? 0.15 : 0.35 // krótszy fade-in dla reduced-motion
      }}
      className="flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}