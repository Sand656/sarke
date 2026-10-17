"use client";

import { useRef } from "react";
import { DeskScene } from "@/components/DeskScene/DeskScene";
import { GEOMETRY, buildSceneTimeline } from "@/components/DeskScene/scene";
import { useLang } from "@/i18n/LangProvider";
import { useGsapEffect } from "@/lib/gsap";
import { useRelease } from "@/lib/release";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/useMediaQuery";
import styles from "./Hero.module.css";

export function Hero() {
  const { t } = useLang();
  const release = useRelease();
  const stacked = useMediaQuery("(max-width: 639px)");
  const reduced = usePrefersReducedMotion();
  const sceneRef = useRef<SVGSVGElement>(null);
  const layout = stacked ? "stack" : "row";

  useGsapEffect(
    ({ gsap }) => {
      // Markup is the final frame, which is also the reduced-motion state.
      if (!sceneRef.current || reduced) return;
      // Start from "final": fade out, then loop from the beginning.
      buildSceneTimeline(gsap, sceneRef.current, GEOMETRY[layout], { loop: true }).play("final");
    },
    [layout, reduced],
  );

  const version = release.status === "ok" ? `v${release.data.version}` : null;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          <p className="label">
            SARKE{version && <> · {version}</>} · {t.hero.label}
          </p>
          <h1 id="hero-title" className={`wordmark ${styles.wordmark}`}>
            SARKE
            <span className={styles.caret} aria-hidden="true" />
          </h1>
        </div>

        <div className={styles.copy}>
          <p className={`h2 ${styles.tagline}`}>{t.hero.tagline}</p>
          <p className={`body ${styles.sub}`}>{t.hero.sub}</p>
          <div className={styles.ctas}>
            <a href="#download" className="btn btn-primary">
              {t.hero.ctaDownload}
            </a>
            <a href="#how" className="btn btn-secondary">
              {t.hero.ctaHow}
            </a>
          </div>
          <p className="label">{t.hero.small}</p>
        </div>

        <div className={styles.scene}>
          <DeskScene ref={sceneRef} layout={layout} />
        </div>
      </div>
    </section>
  );
}
