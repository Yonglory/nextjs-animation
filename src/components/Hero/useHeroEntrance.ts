import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/motion";
import { isLowPower, prefersReducedMotion } from "@/lib/perf";
import { useGsapContext } from "@/hooks/useGsap";

const ALL_REVEALED = "[data-pop], [data-line], [data-chrome], [data-fade]";

// Hides everything before first paint, then plays the entrance once `started` is true.
// Returns a ref that flips to true when the entrance has finished (used to enable hover effects).
export function useHeroEntrance(root: RefObject<HTMLElement | null>, started: boolean) {
  const finished = useRef(false);

  useGsapContext(root, () => {
    gsap.set("[data-pop]", { opacity: 0, scale: 0.3, y: 80 });
    gsap.set("[data-line]", { yPercent: 115 });
    gsap.set("[data-chrome], [data-fade]", { opacity: 0, y: 18 });
  });

  useEffect(() => {
    if (!started) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: EASE.out },
        onComplete: () => {
          finished.current = true;
        },
      });

      if (prefersReducedMotion()) {
        gsap.set(ALL_REVEALED, { scale: 1, y: 0, yPercent: 0 });
        timeline.to(ALL_REVEALED, { opacity: 1, duration: 0.6, ease: "none" });
        return;
      }

      const lowPower = isLowPower();

      timeline
        .to(
          "[data-pop]",
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: lowPower ? 0.7 : 1.1,
            ease: EASE.pop,
            stagger: { each: lowPower ? 0.04 : 0.07, from: "random" },
          },
          0,
        )
        .to("[data-line]", { yPercent: 0, duration: 1.1, ease: EASE.outStrong, stagger: 0.12 }, 0.15)
        .to("[data-fade]", { opacity: 1, y: 0, duration: 0.8 }, 0.55)
        .to("[data-chrome]", { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.7);
    }, root);

    return () => ctx.revert();
  }, [root, started]);

  return finished;
}
