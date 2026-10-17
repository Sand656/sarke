"use client";

import { useLang } from "@/i18n/LangProvider";
import { isReducedMotion } from "@/lib/motion";
import styles from "./Features.module.css";

const canTilt = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches && !isReducedMotion();

/**
 * Spotlight + border glow sit exactly under the pointer (in px, so they track precisely).
 * The glow is light, not motion, so it follows the cursor in every motion mode; the 3D tilt
 * only runs with full motion.
 */
function tilt(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  el.style.setProperty("--mx", `${x}px`);
  el.style.setProperty("--my", `${y}px`);
  if (!canTilt()) return;
  el.style.setProperty("--rx", `${(0.5 - y / r.height) * 8}deg`);
  el.style.setProperty("--ry", `${(x / r.width - 0.5) * 10}deg`);
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
