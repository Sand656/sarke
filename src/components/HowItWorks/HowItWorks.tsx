"use client";

import { useRef, useState } from "react";
import { DeskScene } from "@/components/DeskScene/DeskScene";
import { GEOMETRY, STEP_LABELS, buildSceneTimeline } from "@/components/DeskScene/scene";
import { useLang } from "@/i18n/LangProvider";
import { useGsapEffect } from "@/lib/gsap";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/useMediaQuery";
import styles from "./HowItWorks.module.css";

export function HowItWorks() {
  const { t } = useLang();
  const wide = useMediaQuery("(min-width: 960px)");
  const stacked = useMediaQuery("(max-width: 639px)");
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const layout = stacked ? "stack" : "row";

  useGsapEffect(
    ({ gsap, ScrollTrigger }) => {
      const section = sectionRef.current;
      if (!section) return;
      const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-step]"));

      if (wide) {
        // One pinned diagram; each step tweens it to that step's label.
        const svg = pinRef.current?.querySelector("svg");
        if (!svg) return;
        const tl = buildSceneTimeline(gsap, svg, GEOMETRY.row, { loop: false });
        tl.seek("start");
        const goTo = (i: number) => {
          setActive(i);
          const label = STEP_LABELS[i + 1];
          if (reduced) tl.seek(label);
          else tl.tweenTo(label, { duration: Math.min(1.8, Math.abs(tl.labels[label] - tl.time()) || 0.1), ease: "power2.inOut" });
        };
        ScrollTrigger.create({
          trigger: section.querySelector("[data-grid]"),
          start: "top top+=64",
          end: "bottom bottom",
          pin: pinRef.current,
          pinSpacing: false,
        });
        steps.forEach((step, i) =>
          ScrollTrigger.create({
            trigger: step,
            start: "top 60%",
            end: "bottom 60%",
            onToggle: (self) => self.isActive && goTo(i),
            onLeaveBack: () => {
              if (i !== 0) return;
              setActive(0);
              if (reduced) tl.seek("start");
              else tl.tweenTo("start");
            },
          }),
        );
        return;
      }

      // Narrow: a diagram above each step, showing that step's state.
      steps.forEach((step, i) => {
        const svg = step.querySelector("svg");
        if (!svg) return;
        const tl = buildSceneTimeline(gsap, svg, GEOMETRY[layout], { loop: false });
        const from = STEP_LABELS[i];
        const to = STEP_LABELS[i + 1];
        tl.seek(reduced ? to : from);
        if (!reduced) {
          ScrollTrigger.create({ trigger: step, start: "top 70%", once: true, onEnter: () => tl.tweenFromTo(from, to) });
        }
      });
    },
    [wide, layout, reduced],
    sectionRef,
  );

  const current = t.how.steps[active];

  return (
    <section id="how" ref={sectionRef} className="section" aria-labelledby="how-title">
      <div className="container">
        <div className="section-head">
          <p className="label" data-reveal>
            {t.how.label}
          </p>
          <h2 id="how-title" className="h2" data-reveal="mask">
            {t.how.title}
          </h2>
        </div>

        <div className={styles.grid} data-grid>
          {wide && (
            <div className={styles.diagramCol}>
              <div ref={pinRef} className={styles.pin}>
                <div className={styles.stage} data-active={active}>
                  <div className={styles.frame}>
                    <div className={styles.frameBar}>
                      <p className="label">
                        {t.how.stepLabel}{" "}
                        <span className={`readout ${styles.num}`}>{current.num}</span>
                        <span className={styles.slash}> / 0{t.how.steps.length} · </span>
                        <span className={styles.frameTitle}>{current.title}</span>
                      </p>
                      <div className={styles.progress} aria-hidden="true">
                        {t.how.steps.map((s, i) => (
                          <span key={s.num} data-on={i <= active} />
                        ))}
                      </div>
                    </div>
                    <DeskScene layout="row" decorative />
                  </div>
                </div>
              </div>
            </div>
          )}

          <ol className={styles.steps}>
            {t.how.steps.map((s, i) => (
              <li key={s.num} className={styles.step} data-step data-reveal data-current={wide ? i === active : undefined}>
                {!wide && (
                  <div className={styles.frame}>
                    <DeskScene layout={layout} decorative />
                  </div>
                )}
                <p className={`readout ${styles.num}`}>
                  {s.num} <span className={styles.slash}>/</span>
                </p>
                <h3 className="h3">{s.title}</h3>
                <p className="body">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
