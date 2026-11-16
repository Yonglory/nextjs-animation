import type Lenis from "lenis";
import { prefersReducedMotion } from "./perf";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

// Lenis only exists on desktop-class devices, so fall back to the browser's own smooth scroll.
export function scrollToTarget(selector: string) {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;

  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
}
