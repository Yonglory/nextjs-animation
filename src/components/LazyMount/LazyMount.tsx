"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazyMountProps {
  children: ReactNode;
  rootMargin?: string;
  // Keeps the page tall enough to scroll to before the content is mounted.
  minHeight?: string;
}

// Renders its children the first time the placeholder gets near the viewport.
export default function LazyMount({ children, rootMargin = "25% 0px", minHeight = "100svh" }: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible && children}
    </div>
  );
}
