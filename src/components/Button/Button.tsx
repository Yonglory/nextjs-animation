"use client";

import type { MouseEvent, ReactNode } from "react";
import { scrollToTarget } from "@/lib/scroll";
import styles from "./button.module.scss";

interface ButtonProps {
  // In-page anchor such as "#collection".
  href: string;
  children: ReactNode;
}

export default function Button({ href, children }: ButtonProps) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToTarget(href);
  };

  return (
    <a href={href} className={styles.button} onClick={onClick}>
      <svg className={styles.blob} viewBox="0 0 255 222" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M30 62C52 8 150-8 206 22c46 25 58 98 30 146-28 48-112 62-160 36C14 172-8 116 30 62Z" />
      </svg>
      <span className={styles.label}>{children}</span>
      <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
