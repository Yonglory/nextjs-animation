// Same breakpoints as styles/abstracts/_breakpoints.scss, so CSS and GSAP agree.
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
  curtain: "expo.inOut",
  pop: "back.out(1.7)",
  elastic: "elastic.out(1, 0.35)",
  idle: "sine.inOut",
} as const;

export const MIN_PRELOADER_SECONDS = 1.4;

// Hero characters have a tier (see Hero/characters.ts). Smaller screens show fewer tiers.
export const MAX_TIER = { mobile: 1, tablet: 2, desktop: 3 } as const;
