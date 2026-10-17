"use client";

import { useLang } from "@/i18n/LangProvider";
import styles from "./Roadmap.module.css";

export function Roadmap() {
  const { t } = useLang();
  return (
    <section id="roadmap" className="section" aria-labelledby="roadmap-title">
      <div className="container">
        <div className="section-head">
          <h2 id="roadmap-title" className="h2" data-reveal="mask">
            {t.roadmap.title}
          </h2>
          <p className="lead" data-reveal>
            {t.roadmap.note}
          </p>
        </div>
        <ol className={styles.list}>
          {t.roadmap.items.map((item, i) => (
            <li key={i} className={styles.item} data-reveal>
              <span className={styles.tag}>{t.common.planned}</span>
              <p className={styles.title}>{item}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
