import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins exactly once, on the client only.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });
  // Don't slow tweens down after a long frame; keeps scroll-linked motion honest with Lenis.
  gsap.ticker.lagSmoothing(0);
  // Mobile URL-bar show/hide fires resize; refreshing on it causes jumps.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger };
