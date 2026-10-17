"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { useGsapEffect } from "@/lib/gsap";
import { rich } from "@/lib/rich";
import styles from "./HowItWorks.module.css";

const DeskStage = dynamic(() => import("@/components/three/DeskStage"), {
  ssr: false,
  loading: () => <div className={styles.loading} aria-hidden="true" />,
});

export function HowItWorks() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const chapters = t.how.chapters;

  // The chapter list drives the 3D stage: its scroll progress is the stage's timeline.
  useGsapEffect(
    ({ ScrollTrigger }) => {
      const list = sectionRef.current?.querySelector("[data-chapters]");
      if (!list) return;
      ScrollTrigger.create({
        trigger: list,
        start: "top 70%",
        end: "bottom 70%",
        onUpdate: (self) => {
          progress.current = self.progress;
          setActive(Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length)));
        },
      });
    },
    [chapters.length],
    sectionRef,
  );

  return (
    <section id="how" ref={sectionRef} className="section" aria-labelledby="how-title">
      <div className="container">
        <div className="section-head">
          <h2 id="how-title" className="h2" data-reveal="mask">
            {t.how.title}
          </h2>
          <p className="lead" data-reveal>
            {t.how.intro}
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.stageCol}>
            <div className={`bezel ${styles.stageShell}`}>
              <div className={`bezel-core ${styles.stageCore}`} role="img" aria-label={t.how.stageLabel}>
                <DeskStage mode="scrub" progressRef={progress} className={styles.canvas} />
                <div className={styles.hud} aria-hidden="true">
                  <span className={styles.hudTitle}>{chapters[active].title}</span>
                  <span className={styles.rail}>
                    {chapters.map((c, i) => (
                      <span key={c.title} data-on={i <= active} />
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <ol className={styles.chapters} data-chapters>
            {chapters.map((c, i) => (
              <li key={c.title} className={styles.chapter} data-current={i === active}>
                <h3 className={`h3 ${styles.chapterTitle}`}>{c.title}</h3>
                <p className="body">{rich(c.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
