import type { RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE, MQ } from "@/lib/motion";
import { isLowPower } from "@/lib/perf";
import { useGsapMedia } from "@/hooks/useGsap";

// How far each grid column drifts, in percent of the card height.
const COLUMN_SPEEDS = { desktop: [6, 14, 6], tablet: [6, 12] };

export function useCollectionMotion(root: RefObject<HTMLElement | null>) {
  useGsapMedia(
    root,
    { tablet: MQ.tablet, desktop: MQ.desktop, reduce: MQ.reduce },
    ({ tablet, desktop, reduce }) => {
      const section = root.current!;
      const lowPower = isLowPower();

      revealIntro(reduce);

      const columns = desktop ? 3 : tablet ? 2 : 1;
      const speeds = desktop ? COLUMN_SPEEDS.desktop : tablet ? COLUMN_SPEEDS.tablet : [];
      gsap.utils.toArray<HTMLElement>("[data-cell]", section).forEach((cell, index) => {
        const column = index % columns;
        revealCard(cell, column, reduce);
        if (!reduce && !lowPower && speeds.length) parallaxCard(cell, speeds[column]);
      });

      if (reduce) return;

      const featured = section.querySelector<HTMLElement>("[data-featured]")!;
      const character = section.querySelector<HTMLElement>("[data-big]")!;

      if (desktop || tablet) {
        pinFeatured(section, featured, character);
      } else if (!lowPower) {
        scaleFeaturedCharacter(featured, character);
      }

      // The section was mounted after load, so the page got taller. Re-measure once it settles.
      const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(frame);
    },
  );
}

function revealIntro(reduce: boolean) {
  const scrollTrigger = { trigger: "[data-intro]", start: "top 80%", once: true };

  if (reduce) {
    gsap.from("[data-line], [data-reveal]", { opacity: 0, duration: 0.6, ease: "none", scrollTrigger });
    return;
  }

  gsap.from("[data-line]", { yPercent: 115, duration: 1.1, ease: EASE.outStrong, stagger: 0.12, scrollTrigger });
  gsap.from("[data-reveal]", { opacity: 0, y: 20, duration: 0.8, stagger: 0.12, delay: 0.1, scrollTrigger });
}

// Cards in later columns start a little later, which gives a left-to-right stagger.
function revealCard(cell: HTMLElement, column: number, reduce: boolean) {
  const card = cell.querySelector("[data-card]");
  const character = cell.querySelector("[data-char]");

  const timeline = gsap.timeline({
    delay: reduce ? 0 : column * 0.08,
    scrollTrigger: { trigger: cell, start: "top 88%", once: true },
  });

  if (reduce) {
    timeline.from(card, { opacity: 0, duration: 0.6, ease: "none" });
    return;
  }

  timeline
    .from(card, { opacity: 0, y: 60, scale: 0.92, duration: 0.9 })
    .from(character, { opacity: 0, scale: 0.5, rotation: -12, duration: 0.9, ease: EASE.pop }, 0.15);
}

// Moves the cell from +speed to -speed while it crosses the viewport.
function parallaxCard(cell: HTMLElement, speed: number) {
  gsap.fromTo(
    cell,
    { yPercent: speed },
    {
      yPercent: -speed,
      ease: "none",
      scrollTrigger: { trigger: cell, start: "top bottom", end: "bottom top", scrub: true },
    },
  );
}

// The section stays fixed for 1.5 screens of scrolling while the words light up one by one.
function pinFeatured(section: HTMLElement, featured: HTMLElement, character: HTMLElement) {
  const words = gsap.utils.toArray<HTMLElement>("[data-word]", section);
  gsap.set(words, { opacity: 0.15, x: -28 });

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: featured,
      start: "top top",
      end: "+=150%",
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
    },
  });

  timeline
    .fromTo(character, { scale: 0.6, rotation: -12 }, { scale: 1.1, rotation: 10, duration: 3 }, 0)
    .to("[data-meter]", { scaleX: 1, duration: 3 }, 0);

  words.forEach((word, index) => timeline.to(word, { opacity: 1, x: 0, duration: 0.6 }, index));
}

// Mobile version: no pinning, the character just grows a little as the section scrolls by.
function scaleFeaturedCharacter(featured: HTMLElement, character: HTMLElement) {
  gsap.fromTo(
    character,
    { scale: 0.75, rotation: -8 },
    {
      scale: 1,
      rotation: 6,
      ease: "none",
      scrollTrigger: { trigger: featured, start: "top bottom", end: "bottom top", scrub: true },
    },
  );
}
