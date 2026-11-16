"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ScrollTrigger } from "@/lib/gsap";
import Hero from "@/components/Hero/Hero";
import LazyMount from "@/components/LazyMount/LazyMount";
import Preloader from "@/components/Preloader/Preloader";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";

// The collection (and its ScrollTriggers) is a separate chunk, fetched when it nears the viewport.
const Collection = dynamic(() => import("@/components/Collection/Collection"), { ssr: false });

/** Client entry: preloader -> hero -> lazy collection, plus smooth scroll. */
export default function Experience() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Always start at the top so the entrance is seen, even after a reload mid-page.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // Web fonts change text metrics, which moves ScrollTrigger start/end points.
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, []);

  const handleReveal = useCallback(() => setRevealed(true), []);
  const handleDone = useCallback(() => {
    document.documentElement.classList.remove("is-loading");
    ScrollTrigger.refresh();
  }, []);

  return (
    <>
      <SmoothScroll />
      <Preloader onReveal={handleReveal} onDone={handleDone} />
      <main>
        <Hero started={revealed} />
        <LazyMount>
          <Collection />
        </LazyMount>
      </main>
    </>
  );
}
