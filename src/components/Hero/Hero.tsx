"use client";

import { useRef, type CSSProperties } from "react";
import Button from "@/components/Button/Button";
import Fluffy from "@/components/Fluffy/Fluffy";
import SocialLinks from "@/components/SocialLinks/SocialLinks";
import { HERO_LAYERS } from "./characters";
import { useHeroEntrance } from "./useHeroEntrance";
import { useHeroMotion } from "./useHeroMotion";
import styles from "./hero.module.scss";

interface HeroProps {
  started: boolean;
}

export default function Hero({ started }: HeroProps) {
  const root = useRef<HTMLElement>(null);

  const entranceFinished = useHeroEntrance(root, started);
  useHeroMotion(root, entranceFinished);

  return (
    <section ref={root} id="hero" className={styles.hero} aria-label="Fluffy Hugs">
      <div className={styles.stage} data-stage>
        {HERO_LAYERS.map((layer) => (
          <div key={layer.depth} className={styles.layer} data-layer data-depth={layer.depth}>
            {layer.characters.map((character) => (
              <div
                key={character.id}
                className={styles.slot}
                data-slot
                data-tier={character.tier}
                style={
                  {
                    "--x": `${character.x}%`,
                    "--y": `${character.y}%`,
                    "--mx": `${character.mx ?? character.x}%`,
                    "--my": `${character.my ?? character.y}%`,
                    "--size": character.size,
                  } as CSSProperties
                }
              >
                <div className={styles.pop} data-pop>
                  <div className={styles.float} data-float>
                    <Fluffy color={character.color} face={character.face} ears={character.ears} />
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
          <p className={styles.subtitle} data-fade>
            A crowd of soft little friends, drifting and bobbing just for you.
          </p>
        </div>
      </div>

      <header className={styles.header}>
        <a href="#hero" className={styles.logo} aria-label="Fluffy Hugs, back to top" data-chrome>
          <span className={styles.logoMark}>
            <Fluffy color="coral" bumps={10} />
          </span>
          <span>Fluffy Hugs</span>
        </a>
      </header>

      <footer className={styles.footer}>
        <SocialLinks />
        <div data-chrome>
          <Button href="#collection">View collection</Button>
        </div>
      </footer>
    </section>
  );
}
