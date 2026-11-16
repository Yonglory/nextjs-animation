"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazyMountProps {
  children: ReactNode;
  /** Mount when the placeholder gets this close to the viewport. */
  rootMargin?: string;
  /** Reserves space so the scrollbar and anchors behave before the content mounts. */
  minHeight?: string;
}

/** Renders children only once the placeholder approaches the viewport. */
export default function LazyMount({ children, rootMargin = "25% 0px", minHeight = "100svh" }: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}
