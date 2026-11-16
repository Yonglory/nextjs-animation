import { MQ } from "./motion";

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export function prefersReducedMotion() {
  return window.matchMedia(MQ.reduce).matches;
}

export function isCoarsePointer() {
  return window.matchMedia(MQ.coarsePointer).matches;
}

// Rough guess based on cores, memory and the data-saver flag.
// Browsers that don't expose these hints are treated as capable.
export function isLowPower() {
  const nav = navigator as NavigatorWithHints;
  return (
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true
  );
}
