"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, MIN_PRELOADER_SECONDS } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/perf";
import { useGsapContext } from "@/hooks/useGsap";
import Fluffy from "@/components/Fluffy/Fluffy";
import styles from "./preloader.module.scss";

interface PreloaderProps {
  onReveal: () => void;
  onDone: () => void;
}

const windowLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });

export default function Preloader({ onReveal, onDone }: PreloaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGsapContext(root, (ctx) => {
    const reduceMotion = prefersReducedMotion();
    const fill = root.current!.querySelector("[data-fill]");
    const count = root.current!.querySelector("[data-count]")!;
    const content = root.current!.querySelector("[data-content]");
    const progress = { value: 0 };

    const renderProgress = () => {
      gsap.set(fill, { scaleX: progress.value });
      count.textContent = String(Math.round(progress.value * 100));
    };

    // Progress crawls towards 90% while we wait, and only jumps to 100% when the page is really ready.
    const crawl = gsap.to(progress, {
      value: 0.9,
      duration: reduceMotion ? 0.6 : 3,
      ease: "power2.out",
      onUpdate: renderProgress,
    });

    let timer = 0;
    let cancelled = false;

    const minimumTime = new Promise<void>((resolve) => {
      timer = window.setTimeout(resolve, (reduceMotion ? 0.4 : MIN_PRELOADER_SECONDS) * 1000);
    });

    const playExit = () => {
      const exit = gsap.timeline({
        onComplete: () => {
          onDone();
          setGone(true);
        },
      });

      exit.to(progress, { value: 1, duration: 0.45, ease: "power2.inOut", onUpdate: renderProgress });

      if (reduceMotion) {
        exit.call(onReveal).to(root.current, { opacity: 0, duration: 0.4, ease: "none" });
        return;
      }

      exit
        .to(content, { y: -24, opacity: 0, duration: 0.45, ease: "power2.in" }, ">+0.15")
        .to(root.current, { yPercent: -120, duration: 1.15, ease: EASE.curtain }, "<+0.1")
        .call(onReveal, undefined, "-=0.65");
    };

    Promise.all([document.fonts.ready, windowLoaded(), minimumTime]).then(() => {
      if (cancelled) return;
      crawl.kill();
      // ctx.add keeps tweens created after an await inside this context, so they get cleaned up.
      ctx.add(playExit);
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
