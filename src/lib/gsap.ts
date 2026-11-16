import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });
  // Lenis and ScrollTrigger need real time, so don't let GSAP slow tweens down after a long frame.
  gsap.ticker.lagSmoothing(0);
  // The mobile URL bar showing/hiding fires resize and would refresh triggers mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger };
