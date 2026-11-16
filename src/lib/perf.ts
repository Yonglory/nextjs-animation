import { MQ } from "./motion";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(MQ.reduce).matches;
}

export function isCoarsePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia(MQ.coarsePointer).matches;
}

/**
 * Heuristic for "lower-powered" devices: few cores, little memory, or data saver.
 * Used to drop optional motion (smooth scroll, parallax, extra characters).
 */
export function isLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as NavigatorWithHints;
  return (
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true
  );
}
