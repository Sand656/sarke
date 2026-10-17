"use client";

import { useLang } from "@/i18n/LangProvider";
import styles from "./Features.module.css";

export function Features() {
  const { t } = useLang();
  return (
    <section id="features" className="section" aria-labelledby="features-title">
      <div className="container">
        <div className="section-head">
          <p className="label">{t.features.label}</p>
          <h2 id="features-title" className="h2">
            {t.features.title}
          </h2>
        </div>
        <ul className={styles.grid}>
          {t.features.items.map((f, i) => (
            <li key={i} className={styles.card}>
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
