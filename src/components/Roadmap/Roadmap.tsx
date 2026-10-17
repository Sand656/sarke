"use client";

import { useLang } from "@/i18n/LangProvider";
import styles from "./Roadmap.module.css";

export function Roadmap() {
  const { t } = useLang();
  return (
    <section id="roadmap" className="section" aria-labelledby="roadmap-title">
      <div className="container">
        <div className="section-head">
          <p className="label">{t.roadmap.label}</p>
          <h2 id="roadmap-title" className="h2">
            {t.roadmap.title}
          </h2>
          <p className="body">{t.roadmap.note}</p>
        </div>
        <ol className={styles.timeline}>
          {t.roadmap.items.map((item, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.node} aria-hidden="true" />
              <div className={styles.box}>
                <span className={`label ${styles.tag}`}>{t.common.planned}</span>
                <p className={styles.title}>{item}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
