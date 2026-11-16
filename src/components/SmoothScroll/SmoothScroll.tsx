"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { isCoarsePointer, isLowPower, prefersReducedMotion } from "@/lib/perf";
import { setLenis } from "@/lib/scroll";

/**
 * Lenis smooth scroll driven by GSAP's ticker, so there is exactly one rAF loop
 * and ScrollTrigger always reads the same scroll position Lenis just produced.
 *
 * It is skipped (native scrolling) on touch devices, low-power devices and when the
 * user asks for reduced motion. It also publishes `data-perf` on <html> for CSS.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const low = isLowPower();
    root.dataset.perf = low ? "low" : "high";

    if (prefersReducedMotion() || isCoarsePointer() || low) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
