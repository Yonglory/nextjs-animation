import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Cleanup = void | (() => void);

// Runs `setup` inside a gsap.context scoped to `scope`. Everything created in it
// (tweens, ScrollTriggers, quickTo) is reverted on unmount. `setup` can return an extra cleanup.
export function useGsapContext(
  scope: RefObject<HTMLElement | null>,
  setup: (ctx: gsap.Context) => Cleanup,
  deps: DependencyList = [],
) {
  useIsomorphicLayoutEffect(() => {
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

// Same idea with gsap.matchMedia: `setup` re-runs (after reverting) whenever one of the
// queries flips, which is how the animations adapt when the window is resized.
export function useGsapMedia(
  scope: RefObject<HTMLElement | null>,
  queries: Record<string, string>,
  setup: (matches: Record<string, boolean>) => Cleanup,
  deps: DependencyList = [],
) {
  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia(scope.current ?? undefined);
    mm.add(queries, (ctx) => setup(ctx.conditions as Record<string, boolean>));
    return () => mm.revert();
  }, deps);
}
