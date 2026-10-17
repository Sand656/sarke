"use client";

import { useLang } from "@/i18n/LangProvider";
import styles from "./Manifesto.module.css";

export function Manifesto() {
  const { t } = useLang();
  return (
    <section className="section" aria-label={t.manifesto.statement}>
      <div className={`container ${styles.grid}`}>
        <p className={`statement ${styles.statement}`} data-reveal>
          {t.manifesto.statement}
        </p>
        <dl className={styles.points}>
          {t.manifesto.points.map((p) => (
            <div key={p.value} className={styles.point} data-reveal>
              <dt className={styles.value}>{p.value}</dt>
              <dd className="body">{p.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
