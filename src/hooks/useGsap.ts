import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Cleanup = void | (() => void);

/**
 * `gsap.context` scoped to a ref. Everything created in `setup` (tweens, ScrollTriggers,
 * quickTo setters) is reverted on unmount, so React strict mode and HMR stay clean.
 * `setup` may return an extra cleanup (event listeners, timers).
 */
export function useGsapContext(
  scope: RefObject<HTMLElement | null>,
  setup: (ctx: gsap.Context) => Cleanup,
  deps: DependencyList = [],
) {
  useIsoLayoutEffect(() => {
    let cleanup: Cleanup;
    const ctx = gsap.context((self) => {
      cleanup = setup(self);
    }, scope);
    return () => {
      if (cleanup) cleanup();
      ctx.revert();
    };
  }, deps);
}

/**
 * `gsap.matchMedia` scoped to a ref. `setup` re-runs (after reverting the previous run)
 * whenever one of the named media queries flips, which is how animations adapt on resize.
 */
export function useGsapMedia(
  scope: RefObject<HTMLElement | null>,
  queries: Record<string, string>,
  setup: (conditions: Record<string, boolean>) => Cleanup,
  deps: DependencyList = [],
) {
  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia(scope.current ?? undefined);
    mm.add(queries, (ctx) => setup(ctx.conditions as Record<string, boolean>));
    return () => mm.revert();
  }, deps);
}
