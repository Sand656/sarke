"use client";

import { useRef, useState } from "react";
import { DeskScene } from "@/components/DeskScene/DeskScene";
import { GEOMETRY, STEP_LABELS, buildSceneTimeline } from "@/components/DeskScene/scene";
import { useLang } from "@/i18n/LangProvider";
import { useGsapEffect } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import styles from "./HowItWorks.module.css";

export function HowItWorks() {
  const { t } = useLang();
  const wide = useMediaQuery("(min-width: 960px)");
  const stacked = useMediaQuery("(max-width: 639px)");
  const reduced = useReducedMotion();
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
        const pin = pinRef.current;
        const svg = pin?.querySelector("svg");
        const stage = pin?.querySelector<HTMLElement>("[data-stage]");
        const frame = pin?.querySelector<HTMLElement>("[data-frame]");
        if (!pin || !svg || !stage || !frame) return;
        const tl = buildSceneTimeline(gsap, svg, GEOMETRY.row, { loop: false });
        tl.seek("start");
        ScrollTrigger.create({
          trigger: section.querySelector("[data-grid]"),
          start: "top top+=64",
          end: "bottom bottom",
          pin,
          pinSpacing: false,
        });

        if (reduced) {
          // Motion off: each step shows its finished state, no in-between movement.
          steps.forEach((step, i) =>
            ScrollTrigger.create({
              trigger: step,
              start: "top 60%",
              end: "bottom 60%",
              onToggle: (self) => {
                if (!self.isActive) return;
                setActive(i);
                tl.seek(STEP_LABELS[i + 1]);
              },
              onLeaveBack: () => i === 0 && tl.seek("start"),
            }),
          );
          return;
        }

        // Full motion: the scene plays continuously with the scroll (smoothed scrub),
        // while the frame's 3D tilt sweeps across and the whole stage floats gently.
        const span = tl.labels.final - tl.labels.start;
        const scrubbed = gsap.timeline({
          scrollTrigger: {
            trigger: section.querySelector("[data-steps]"),
            start: "top 65%",
            end: "bottom 65%",
            scrub: 1.2,
            onUpdate: (self) => setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
          },
        });
        scrubbed.add(tl.tweenFromTo("start", "final", { ease: "none" }), 0);
        scrubbed.fromTo(
          frame,
          { rotationY: 11, rotationX: 7, transformPerspective: 1800 },
          { rotationY: -11, rotationX: 5, duration: span, ease: "sine.inOut" },
          0,
        );
        gsap.to(stage, { y: -10, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
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
                <div className={styles.stage} data-stage>
                  <div className={styles.frame} data-frame>
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

          <ol className={styles.steps} data-steps>
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
