// Shared motion constants. Breakpoints mirror src/styles/abstracts/_breakpoints.scss.

export const MQ = {
  mobile: "(max-width: 47.99rem)",
  tablet: "(min-width: 48rem) and (max-width: 79.99rem)",
  desktop: "(min-width: 80rem)",
  reduce: "(prefers-reduced-motion: reduce)",
  finePointer: "(hover: hover) and (pointer: fine)",
  coarsePointer: "(pointer: coarse)",
} as const;

export const EASE = {
  out: "power3.out",
  outStrong: "expo.out",
  inOut: "power3.inOut",
  curtain: "expo.inOut",
  pop: "back.out(1.7)",
  elastic: "elastic.out(1, 0.35)",
  idle: "sine.inOut",
} as const;

export const DURATION = {
  /** Minimum time the preloader stays up so the reveal never flashes. */
  preloaderMin: 1.4,
  reveal: 0.9,
} as const;

/** How many hero character tiers (see Hero/characters.ts) each breakpoint shows. */
export const MAX_TIER = { mobile: 1, tablet: 2, desktop: 3 } as const;
