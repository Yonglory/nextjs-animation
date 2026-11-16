"use client";

import { useRef } from "react";
import Fluffy from "@/components/Fluffy/Fluffy";
import { CREW } from "./data";
import { useCollectionMotion } from "./useCollectionMotion";
import styles from "./collection.module.scss";

// Same rule as the hero: the grid cell gets the parallax, the card gets the scroll reveal
// and the button inside gets the CSS hover, so no two animations share a transform.
export default function Collection() {
  const root = useRef<HTMLElement>(null);
  useCollectionMotion(root);

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
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
        <p>Fluffy Hugs, a motion study. No cookies, just fluff.</p>
      </footer>
    </section>
  );
}
