import type Lenis from "lenis";
import { prefersReducedMotion } from "./perf";

// Lenis is optional (it is disabled on touch, low-power and reduced-motion),
// so anything that scrolls programmatically goes through this helper.
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function scrollToTarget(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;

  if (instance) {
    instance.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}
