"use client";

import { useRef } from "react";
import { DeskScene } from "@/components/DeskScene/DeskScene";
import { GEOMETRY, buildSceneTimeline } from "@/components/DeskScene/scene";
import { useLang } from "@/i18n/LangProvider";
import { useGsapEffect } from "@/lib/gsap";
import { useRelease } from "@/lib/release";
import { useReducedMotion } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { MirrorField } from "@/components/MirrorField/MirrorField";
import styles from "./Hero.module.css";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export function Hero() {
  const { t } = useLang();
  const release = useRelease();
  const stacked = useMediaQuery("(max-width: 639px)");
  const reduced = useReducedMotion();
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
      <MirrorField />
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          <p className="label intro-up" style={delay(0)}>
            SARKE{version && <> · {version}</>} · {t.hero.label}
          </p>
          <h1 id="hero-title" className={`wordmark ${styles.wordmark}`} aria-label="SARKE">
            {"SARKE".split("").map((ch, i) => (
              <span key={i} className={styles.charMask} aria-hidden="true">
                <span className={styles.char} style={delay(120 + i * 70)}>
                  {ch}
                </span>
              </span>
            ))}
            <span className={styles.caret} aria-hidden="true" />
          </h1>
        </div>

        <div className={styles.copy}>
          <p className={`h2 intro-up ${styles.tagline}`} style={delay(480)}>
            {t.hero.tagline}
          </p>
          <p className={`body intro-up ${styles.sub}`} style={delay(580)}>
            {t.hero.sub}
          </p>
          <div className={`intro-up ${styles.ctas}`} style={delay(680)}>
            <a href="#download" className="btn btn-primary">
              {t.hero.ctaDownload}
            </a>
            <a href="#how" className="btn btn-secondary">
              {t.hero.ctaHow}
            </a>
          </div>
          <p className="label intro-up" style={delay(780)}>
            {t.hero.small}
          </p>
        </div>

        <div className={`intro-up ${styles.scene}`} style={delay(600)}>
          <DeskScene ref={sceneRef} layout={layout} />
        </div>
      </div>
    </section>
  );
}
