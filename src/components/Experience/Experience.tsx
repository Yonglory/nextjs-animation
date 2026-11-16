"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ScrollTrigger } from "@/lib/gsap";
import Hero from "@/components/Hero/Hero";
import LazyMount from "@/components/LazyMount/LazyMount";
import Preloader from "@/components/Preloader/Preloader";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";

// Separate chunk: only downloaded when the collection is about to be scrolled into view.
const Collection = dynamic(() => import("@/components/Collection/Collection"), { ssr: false });

export default function Experience() {
  const [heroStarted, setHeroStarted] = useState(false);

  useEffect(() => {
    // Start at the top after a reload so the entrance is always seen.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // Font swaps change text height, so trigger positions need re-measuring.
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, []);

  const startHero = useCallback(() => setHeroStarted(true), []);

  const unlockScroll = useCallback(() => {
    document.documentElement.classList.remove("is-loading");
    ScrollTrigger.refresh();
  }, []);

  return (
    <>
      <SmoothScroll />
      <Preloader onReveal={startHero} onDone={unlockScroll} />
      <main>
        <Hero started={heroStarted} />
        <LazyMount>
          <Collection />
        </LazyMount>
      </main>
    </>
  );
}
