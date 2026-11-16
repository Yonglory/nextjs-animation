"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE, MAX_TIER, MQ } from "@/lib/motion";
import { isLowPower, prefersReducedMotion } from "@/lib/perf";
import { useGsapContext, useGsapMedia } from "@/hooks/useGsap";
import Button from "@/components/Button/Button";
import Fluffy from "@/components/Fluffy/Fluffy";
import SocialLinks from "@/components/SocialLinks/SocialLinks";
import { HERO_LAYERS } from "./characters";
import styles from "./hero.module.scss";

interface HeroProps {
  /** Flips to true when the preloader curtain starts lifting. */
  started: boolean;
}

/**
 * DOM layers per character (each owns ONE kind of transform, so tweens never fight):
 *   [data-layer]  mouse parallax (x/y) + scroll parallax (yPercent)
 *   .slot         static position (left/top + CSS `translate`)
 *   [data-pop]    entrance + hover hop (scale/y/opacity)
 *   [data-float]  idle bobbing (y/rotation)
 * Chrome elements follow the same rule: GSAP animates the wrapper, CSS hover animates the child.
 */
export default function Hero({ started }: HeroProps) {
  const root = useRef<HTMLElement>(null);
  const entered = useRef(false);

  // 1. Initial (hidden) state, applied before first paint. The preloader covers the page.
  useGsapContext(root, () => {
    gsap.set("[data-pop]", { opacity: 0, scale: 0.3, y: 80 });
    gsap.set("[data-line]", { yPercent: 115 });
    gsap.set("[data-chrome], [data-fade]", { opacity: 0, y: 18 });
  });

  // 2. Entrance reveal, played once the preloader hands over.
  useEffect(() => {
    if (!started) return;
    const reduce = prefersReducedMotion();
    const low = isLowPower();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: EASE.out },
        onComplete: () => {
          entered.current = true;
        },
      });

      if (reduce) {
        gsap.set("[data-pop], [data-line], [data-chrome], [data-fade]", { scale: 1, y: 0, yPercent: 0 });
        tl.to("[data-pop], [data-line], [data-chrome], [data-fade]", { opacity: 1, duration: 0.6, ease: "none" });
        return;
      }

      tl.to(
        "[data-pop]",
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: low ? 0.7 : 1.1,
          ease: EASE.pop,
          stagger: { each: low ? 0.04 : 0.07, from: "random" },
        },
        0,
      )
        .to("[data-line]", { yPercent: 0, duration: 1.1, ease: EASE.outStrong, stagger: 0.12 }, 0.15)
        .to("[data-fade]", { opacity: 1, y: 0, duration: 0.8 }, 0.55)
        .to("[data-chrome]", { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.7);
    }, root);

    return () => ctx.revert();
  }, [started]);

  // 3. Everything that depends on breakpoint / input capability / user preferences.
  useGsapMedia(
    root,
    { mobile: MQ.mobile, tablet: MQ.tablet, desktop: MQ.desktop, reduce: MQ.reduce, fine: MQ.finePointer },
    ({ mobile, tablet, reduce, fine }) => {
      const low = isLowPower();
      const maxTier = mobile ? MAX_TIER.mobile : tablet ? MAX_TIER.tablet : MAX_TIER.desktop;
      const tier = low ? Math.max(1, maxTier - 1) : maxTier;

      const hero = root.current!;
      const stage = hero.querySelector<HTMLElement>("[data-stage]")!;
      const layers = gsap.utils.toArray<HTMLElement>("[data-layer]", hero);
      const slots = gsap.utils
        .toArray<HTMLElement>("[data-slot]", hero)
        .filter((el) => Number(el.dataset.tier) <= tier);

      if (reduce) return;

      // Idle floating: transform-only yoyo tweens, grouped so they can be paused off-screen.
      const idle = gsap.timeline();
      slots.forEach((slot) => {
        idle.to(
          slot.querySelector("[data-float]"),
          {
            y: gsap.utils.random(-22, -10),
            rotation: low ? 0 : gsap.utils.random(-4, 4),
            duration: gsap.utils.random(2.2, 3.6),
            ease: EASE.idle,
            repeat: -1,
            yoyo: true,
          },
          gsap.utils.random(0, 1.5),
        );
      });

      let visible = true;
      ScrollTrigger.create({
        trigger: hero,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          visible = self.isActive;
          idle.paused(!visible);
        },
      });

      // Scroll: the stage recedes while the next section slides over it; layers drift at different speeds.
      gsap.to(stage, {
        scale: 0.93,
        opacity: 0.35,
        transformOrigin: "50% 100%",
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      });

      if (!low) {
        layers.forEach((layer) => {
          gsap.to(layer, {
            yPercent: Number(layer.dataset.depth) * 10,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
          });
        });
      }

      // Pointer: layered parallax (fine pointers only) and a squishy hop when touching a character.
      const cleanups: (() => void)[] = [];

      if (fine && !low) {
        const movers = layers.map((layer) => ({
          depth: Number(layer.dataset.depth),
          x: gsap.quickTo(layer, "x", { duration: 1, ease: "power3" }),
          y: gsap.quickTo(layer, "y", { duration: 1, ease: "power3" }),
        }));
        const onMove = (e: PointerEvent) => {
          if (!visible) return;
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          movers.forEach((m) => {
            m.x(-nx * 60 * m.depth);
            m.y(-ny * 40 * m.depth);
          });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        cleanups.push(() => window.removeEventListener("pointermove", onMove));
      }

      const onOver = (e: PointerEvent) => {
        if (!entered.current) return;
        const pop = (e.target as Element).closest<HTMLElement>("[data-pop]");
        if (!pop || gsap.isTweening(pop)) return;
        gsap
          .timeline()
          .to(pop, { scaleX: 1.14, scaleY: 0.86, duration: 0.12, ease: "power2.out" })
          .to(pop, { scaleX: 1, scaleY: 1, y: -26, duration: 0.25, ease: "power2.out" })
          .to(pop, { y: 0, duration: 0.9, ease: EASE.elastic });
      };
      stage.addEventListener("pointerover", onOver);
      cleanups.push(() => stage.removeEventListener("pointerover", onOver));

      return () => cleanups.forEach((fn) => fn());
    },
  );

  return (
    <section ref={root} id="hero" className={styles.hero} aria-label="Fluffy Hugs">
      <div className={styles.stage} data-stage>
        {HERO_LAYERS.map((layer) => (
          <div key={layer.depth} className={styles.layer} data-layer data-depth={layer.depth}>
            {layer.characters.map((c) => (
              <div
                key={c.id}
                className={styles.slot}
                data-slot
                data-tier={c.tier}
                style={
                  {
                    "--x": `${c.x}%`,
                    "--y": `${c.y}%`,
                    "--mx": `${c.mx ?? c.x}%`,
                    "--my": `${c.my ?? c.y}%`,
                    "--s": c.size,
                  } as CSSProperties
                }
              >
                <div className={styles.pop} data-pop>
                  <div className={styles.float} data-float>
                    <Fluffy color={c.color} face={c.face} ears={c.ears} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className={styles.copy}>
          <h1 className={styles.title}>
            <span className={styles.line}>
              <span className={styles.lineInner} data-line>
                Fluffy Hugs
              </span>
            </span>
            <span className={styles.line}>
              <span className={`${styles.lineInner} ${styles.accent}`} data-line>
                float together
              </span>
            </span>
          </h1>
          <p className={styles.sub} data-fade>
            A crowd of soft little friends, drifting and bobbing just for you.
          </p>
        </div>
      </div>

      <header className={styles.header}>
        <a href="#hero" className={styles.logo} aria-label="Fluffy Hugs, back to top" data-chrome>
          <span className={styles.logoMark}>
            <Fluffy color="coral" face="smile" ears="none" bumps={10} />
          </span>
          <span className={styles.logoText}>Fluffy Hugs</span>
        </a>
      </header>

      <footer className={styles.footer}>
        <SocialLinks />
        <div className={styles.cta} data-chrome>
          <Button href="#collection">View collection</Button>
        </div>
      </footer>
    </section>
  );
}
