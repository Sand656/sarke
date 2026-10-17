"use client";

import { useLang } from "@/i18n/LangProvider";
import styles from "./Features.module.css";

const canTilt = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 3D tilt + spotlight following the pointer. */
function tilt(e: React.PointerEvent<HTMLElement>) {
  if (!canTilt()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  el.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
  el.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
  el.style.setProperty("--mx", `${px * 100}%`);
  el.style.setProperty("--my", `${py * 100}%`);
}

function untilt(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
}

export function Features() {
  const { t } = useLang();
  return (
    <section id="features" className="section" aria-labelledby="features-title">
      <div className="container">
        <div className="section-head">
          <p className="label" data-reveal>
            {t.features.label}
          </p>
          <h2 id="features-title" className="h2" data-reveal="mask">
            {t.features.title}
          </h2>
        </div>
        <ul className={styles.grid}>
          {t.features.items.map((f, i) => (
            <li key={i} className={styles.card} data-reveal onPointerMove={tilt} onPointerLeave={untilt}>
              <div className={styles.top}>
                <span className="label">M-{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.status} role="img" aria-label={t.features.statusOk} />
              </div>
              <h3 className="h3">{f.title}</h3>
              <p className="body">{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
