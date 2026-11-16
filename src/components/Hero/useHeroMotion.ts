import type { RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE, MAX_TIER, MQ } from "@/lib/motion";
import { isLowPower } from "@/lib/perf";
import { useGsapMedia } from "@/hooks/useGsap";

const toArray = <T extends HTMLElement>(selector: string, scope: HTMLElement) =>
  gsap.utils.toArray<T>(selector, scope);

// Everything in the hero that depends on screen size, input type or user preferences.
// It is rebuilt automatically when one of those changes.
export function useHeroMotion(root: RefObject<HTMLElement | null>, entranceFinished: RefObject<boolean>) {
  useGsapMedia(
    root,
    { mobile: MQ.mobile, tablet: MQ.tablet, reduce: MQ.reduce, finePointer: MQ.finePointer },
    ({ mobile, tablet, reduce, finePointer }) => {
      if (reduce) return;

      const hero = root.current!;
      const lowPower = isLowPower();
      const stage = hero.querySelector<HTMLElement>("[data-stage]")!;
      const layers = toArray("[data-layer]", hero);

      const maxTier = mobile ? MAX_TIER.mobile : tablet ? MAX_TIER.tablet : MAX_TIER.desktop;
      const tier = lowPower ? Math.max(1, maxTier - 1) : maxTier;
      const characters = toArray("[data-slot]", hero).filter((slot) => Number(slot.dataset.tier) <= tier);

      const idle = floatCharacters(characters, lowPower);

      const heroInView = ScrollTrigger.create({
        trigger: hero,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => idle.paused(!self.isActive),
      });

      recedeOnScroll(hero, stage);
      if (!lowPower) driftLayersOnScroll(hero, layers);

      const cleanups = [hopOnTouch(stage, entranceFinished)];
      if (finePointer && !lowPower) cleanups.push(parallaxOnPointer(layers, heroInView));

      return () => cleanups.forEach((cleanup) => cleanup());
    },
  );
}

// Each character bobs up and down forever. One timeline, so it can be paused as a whole.
function floatCharacters(slots: HTMLElement[], lowPower: boolean) {
  const idle = gsap.timeline();

  slots.forEach((slot) => {
    idle.to(
      slot.querySelector("[data-float]"),
      {
        y: gsap.utils.random(-22, -10),
        rotation: lowPower ? 0 : gsap.utils.random(-4, 4),
        duration: gsap.utils.random(2.2, 3.6),
        ease: EASE.idle,
        repeat: -1,
        yoyo: true,
      },
      gsap.utils.random(0, 1.5),
    );
  });

  return idle;
}

// While the hero scrolls away it shrinks and fades, as if the next section slides over it.
function recedeOnScroll(hero: HTMLElement, stage: HTMLElement) {
  gsap.to(stage, {
    scale: 0.93,
    opacity: 0.35,
    transformOrigin: "50% 100%",
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
  });
}

// Layers with a higher depth lag further behind the page scroll.
function driftLayersOnScroll(hero: HTMLElement, layers: HTMLElement[]) {
  layers.forEach((layer) => {
    gsap.to(layer, {
      yPercent: Number(layer.dataset.depth) * 10,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
    });
  });
}

// Layers move against the pointer, deeper layers move more.
function parallaxOnPointer(layers: HTMLElement[], heroInView: ScrollTrigger) {
  const movers = layers.map((layer) => ({
    depth: Number(layer.dataset.depth),
    moveX: gsap.quickTo(layer, "x", { duration: 1, ease: "power3" }),
    moveY: gsap.quickTo(layer, "y", { duration: 1, ease: "power3" }),
  }));

  const onPointerMove = (event: PointerEvent) => {
    if (!heroInView.isActive) return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    movers.forEach(({ depth, moveX, moveY }) => {
      moveX(-x * 60 * depth);
      moveY(-y * 40 * depth);
    });
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  return () => window.removeEventListener("pointermove", onPointerMove);
}

// Squash and hop when a character is hovered or tapped. Uses event delegation on the stage.
function hopOnTouch(stage: HTMLElement, entranceFinished: RefObject<boolean>) {
  const onPointerOver = (event: PointerEvent) => {
    if (!entranceFinished.current) return;

    const pop = (event.target as Element).closest<HTMLElement>("[data-pop]");
    if (!pop || gsap.isTweening(pop)) return;

    gsap
      .timeline()
      .to(pop, { scaleX: 1.14, scaleY: 0.86, duration: 0.12, ease: "power2.out" })
      .to(pop, { scaleX: 1, scaleY: 1, y: -26, duration: 0.25, ease: "power2.out" })
      .to(pop, { y: 0, duration: 0.9, ease: EASE.elastic });
  };

  stage.addEventListener("pointerover", onPointerOver);
  return () => stage.removeEventListener("pointerover", onPointerOver);
}
