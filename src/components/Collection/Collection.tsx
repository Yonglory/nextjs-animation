"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE, MQ } from "@/lib/motion";
import { isLowPower } from "@/lib/perf";
import { useGsapMedia } from "@/hooks/useGsap";
import Fluffy from "@/components/Fluffy/Fluffy";
import { CREW } from "./data";
import styles from "./collection.module.scss";

/** Column speeds for the grid parallax (percent of card height). Mobile = single column, none. */
const COLUMN_SPEED = { desktop: [6, 14, 6], tablet: [6, 12] } as const;

export default function Collection() {
  const root = useRef<HTMLElement>(null);

  useGsapMedia(
    root,
    { mobile: MQ.mobile, tablet: MQ.tablet, desktop: MQ.desktop, reduce: MQ.reduce },
    ({ tablet, desktop, reduce }) => {
      const low = isLowPower();
      const el = root.current!;
      const q = <T extends HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector, el);

      // --- Intro: masked heading lines + fading copy -------------------------------------------
      const introTrigger = { trigger: "[data-intro]", start: "top 80%", once: true };
      if (reduce) {
        gsap.from("[data-line], [data-reveal]", { opacity: 0, duration: 0.6, ease: "none", scrollTrigger: introTrigger });
      } else {
        gsap.from("[data-line]", {
          yPercent: 115,
          duration: 1.1,
          ease: EASE.outStrong,
          stagger: 0.12,
          scrollTrigger: introTrigger,
        });
        gsap.from("[data-reveal]", {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.12,
          delay: 0.1,
          scrollTrigger: introTrigger,
        });
      }

      // --- Cards: staggered reveal + per-column parallax --------------------------------------
      const cols = desktop ? 3 : tablet ? 2 : 1;
      const speeds = desktop ? COLUMN_SPEED.desktop : tablet ? COLUMN_SPEED.tablet : null;

      q("[data-cell]").forEach((cell, i) => {
        const card = cell.querySelector("[data-card]");
        const char = cell.querySelector("[data-char]");
        const col = i % cols;

        const tl = gsap.timeline({
          delay: reduce ? 0 : col * 0.08,
          scrollTrigger: { trigger: cell, start: "top 88%", once: true },
        });
        if (reduce) {
          tl.from(card, { opacity: 0, duration: 0.6, ease: "none" });
        } else {
          tl.from(card, { opacity: 0, y: 60, scale: 0.92, duration: 0.9 }).from(
            char,
            { opacity: 0, scale: 0.5, rotation: -12, duration: 0.9, ease: EASE.pop },
            0.15,
          );
        }

        if (!reduce && !low && speeds) {
          const s = speeds[col];
          gsap.fromTo(
            cell,
            { yPercent: s },
            {
              yPercent: -s,
              ease: "none",
              scrollTrigger: { trigger: cell, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        }
      });

      // --- Featured strip: pinned on tablet/desktop, light scrub on mobile ----------------------
      const featured = q("[data-featured]")[0];
      const big = q("[data-big]")[0];

      if (reduce) return;

      if (desktop || tablet) {
        const words = q("[data-word]");
        gsap.set(words, { opacity: 0.15, x: -28 });

        const tl = gsap.timeline({
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
        tl.fromTo(big, { scale: 0.6, rotation: -12 }, { scale: 1.1, rotation: 10, duration: 3 }, 0)
          .to("[data-meter]", { scaleX: 1, duration: 3 }, 0);
        words.forEach((word, i) => tl.to(word, { opacity: 1, x: 0, duration: 0.6 }, i * 1));
      } else if (!low) {
        gsap.fromTo(
          big,
          { scale: 0.75, rotation: -8 },
          {
            scale: 1,
            rotation: 6,
            ease: "none",
            scrollTrigger: { trigger: featured, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }

      // Content height changed when this chunk mounted: re-measure once layout has settled.
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(raf);
    },
  );

  return (
    <section ref={root} id="collection" className={styles.collection} aria-labelledby="collection-title">
      <div className={styles.intro} data-intro>
        <p className={styles.eyebrow} data-reveal>
          The collection
        </p>
        <h2 id="collection-title" className={styles.heading}>
          <span className={styles.line}>
            <span className={styles.lineInner} data-line>
              Meet the
            </span>
          </span>
          <span className={styles.line}>
            <span className={`${styles.lineInner} ${styles.accent}`} data-line>
              fluffy crew
            </span>
          </span>
        </h2>
        <p className={styles.lead} data-reveal>
          Six friends, endlessly cuddly. Hover or tap one to say hello.
        </p>
      </div>

      <ul className={styles.grid}>
        {CREW.map((member) => (
          <li key={member.id} className={styles.cell} data-cell>
            <article className={styles.card} data-card>
              <button type="button" className={`${styles.tile} ${styles[`tone-${member.color}`]}`}>
                <span className={styles.number}>#{member.id}</span>
                <span className={styles.stage} data-char>
                  <span className={styles.character}>
                    <Fluffy color={member.color} face={member.face} ears={member.ears} />
                  </span>
                </span>
                <span className={styles.meta}>
                  <span className={styles.name}>{member.name}</span>
                  <span className={styles.trait}>{member.trait}</span>
                </span>
                <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </article>
          </li>
        ))}
      </ul>

      <section className={styles.featured} data-featured aria-label="Why we love them">
        <div className={styles.featuredInner}>
          <div className={styles.bigWrap}>
            <div className={styles.big} data-big>
              <Fluffy color="coral" face="open" ears="bunny" />
            </div>
          </div>
          <ul className={styles.words}>
            <li data-word>Soft.</li>
            <li data-word>Squishy.</li>
            <li data-word>Yours.</li>
          </ul>
          <div className={styles.meter} aria-hidden="true">
            <div className={styles.meterFill} data-meter />
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Fluffy Hugs &mdash; a motion study. No cookies, just fluff.</p>
      </footer>
    </section>
  );
}
