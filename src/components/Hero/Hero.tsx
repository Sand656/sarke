"use client";

import dynamic from "next/dynamic";
import { ChevronRight } from "@/components/Icon";
import { useLang } from "@/i18n/LangProvider";
import styles from "./Hero.module.css";

const HeroStage = dynamic(() => import("@/components/three/HeroStage"), {
  ssr: false,
  loading: () => <div className={styles.stageLoading} aria-hidden="true" />,
});

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export function Hero() {
  const { t } = useLang();

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.copy}`}>
        <p className={`intro-up ${styles.eyebrow}`} style={delay(0)}>
          Sarke
        </p>
        <h1 id="hero-title" className={`display ${styles.title}`}>
          <span className={styles.line}>
            <span className={styles.lineInner} style={delay(80)}>
              {t.hero.titleA}
            </span>
          </span>{" "}
          <span className={styles.line}>
            <span className={styles.lineInner} style={delay(180)}>
              {t.hero.titleB}
            </span>
          </span>
        </h1>
        <p className={`lead intro-up ${styles.sub}`} style={delay(360)}>
          {t.hero.sub}
        </p>
        <div className={`intro-up ${styles.ctas}`} style={delay(480)}>
          <a href="#download" className="btn btn-primary">
            {t.hero.ctaDownload}
          </a>
          <a href="#how" className="link-more">
            {t.hero.ctaHow}
            <ChevronRight />
          </a>
        </div>
      </div>

      <div className={`intro-up ${styles.stage}`} style={delay(560)} role="img" aria-label={t.hero.stageLabel}>
        <HeroStage className={styles.canvas} />
      </div>

      <p className={`small container ${styles.meta}`}>{t.hero.meta}</p>
    </section>
  );
}
