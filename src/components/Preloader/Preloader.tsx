"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { DURATION, EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/perf";
import { useGsapContext } from "@/hooks/useGsap";
import Fluffy from "@/components/Fluffy/Fluffy";
import styles from "./preloader.module.scss";

interface PreloaderProps {
  /** Fired while the curtain is still lifting, so the hero entrance overlaps it. */
  onReveal: () => void;
  /** Fired once the curtain is fully gone. */
  onDone: () => void;
}

const windowLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });

/**
 * Loading screen. Progress is eased toward 90% while real work happens (fonts + window load +
 * a minimum display time), then snaps to 100% and the curtain lifts. Slow networks simply
 * keep the loader on screen: the page behind it is not revealed until everything is ready.
 */
export default function Preloader({ onReveal, onDone }: PreloaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGsapContext(root, (ctx) => {
    const q = gsap.utils.selector(root);
    const fill = q("[data-fill]");
    const count = root.current!.querySelector<HTMLElement>("[data-count]")!;
    const reduce = prefersReducedMotion();
    const progress = { value: 0 };

    const render = () => {
      gsap.set(fill, { scaleX: progress.value });
      count.textContent = String(Math.round(progress.value * 100));
    };

    const crawl = gsap.to(progress, {
      value: 0.9,
      duration: reduce ? 0.6 : 3,
      ease: "power2.out",
      onUpdate: render,
    });

    let cancelled = false;
    let timer = 0;
    const minTime = new Promise<void>((resolve) => {
      timer = window.setTimeout(resolve, (reduce ? 0.4 : DURATION.preloaderMin) * 1000);
    });

    Promise.all([document.fonts.ready, windowLoaded(), minTime]).then(() => {
      if (cancelled) return;
      crawl.kill();

      // ctx.add keeps tweens created after an await inside this context for cleanup.
      ctx.add(() => {
        const exit = gsap.timeline({
          onComplete: () => {
            onDone();
            setGone(true);
          },
        });

        exit.to(progress, { value: 1, duration: 0.45, ease: "power2.inOut", onUpdate: render });

        if (reduce) {
          exit.call(onReveal).to(root.current, { opacity: 0, duration: 0.4, ease: "none" });
          return;
        }

        exit
          .to(q("[data-content]"), { y: -24, opacity: 0, duration: 0.45, ease: "power2.in" }, ">+0.15")
          .to(root.current, { yPercent: -120, duration: 1.15, ease: EASE.curtain }, "<+0.1")
          .call(onReveal, undefined, "-=0.65");
      });
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  });

  if (gone) return null;

  return (
    <div ref={root} className={styles.preloader} data-preloader role="status" aria-label="Loading">
      <div className={styles.content} data-content>
        <div className={styles.character}>
          <Fluffy color="butter" face="open" ears="bunny" />
        </div>
        <div className={styles.bar} aria-hidden="true">
          <div className={styles.fill} data-fill />
        </div>
        <p className={styles.count} aria-hidden="true">
          <span data-count>0</span>%
        </p>
      </div>
      <svg className={styles.curve} viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 0H100V2C80 10 60 10 50 6C38 1 20 1 0 8Z" />
      </svg>
    </div>
  );
}
