"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { isCoarsePointer, isLowPower, prefersReducedMotion } from "@/lib/perf";
import { setLenis } from "@/lib/scroll";

// Lenis smooth scroll, driven by GSAP's ticker so there is a single animation loop
// and ScrollTrigger always sees the same scroll position Lenis just produced.
// Skipped (native scroll) for touch, low-power devices and reduced motion.
export default function SmoothScroll() {
  useEffect(() => {
    const lowPower = isLowPower();
    document.documentElement.dataset.perf = lowPower ? "low" : "high";

    if (prefersReducedMotion() || isCoarsePointer() || lowPower) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);

    return () => {
      gsap.ticker.remove(update);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
