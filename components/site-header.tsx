"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { PizzaMark } from "./pizza-art";

// Slim top branding bar. Navigation lives in the bottom tab bar (CustomerTabBar).
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  return (
    <header
      className={`sticky top-0 z-20 border-b transition-all duration-300 ${
        scrolled
          ? "border-border bg-surface/80 shadow-warm-sm backdrop-blur-lg"
          : "border-transparent bg-surface/40 backdrop-blur-sm"
      }`}
    >
      <div
        className={`mx-auto flex max-w-3xl items-center justify-center px-4 transition-all duration-300 ${
          scrolled ? "py-2.5" : "py-3.5"
        }`}
      >
        <Link href="/" className="group flex items-center gap-2">
          <motion.span whileHover={{ rotate: -12, scale: 1.08 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
            <PizzaMark size={scrolled ? 24 : 28} />
          </motion.span>
          <span className="text-lg font-extrabold tracking-tight text-brand">SliceMatic</span>
        </Link>
      </div>
    </header>
  );
}
