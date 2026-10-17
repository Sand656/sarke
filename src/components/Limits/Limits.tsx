"use client";

import { useLang } from "@/i18n/LangProvider";
import { rich } from "@/lib/rich";
import styles from "./Limits.module.css";

export function Limits() {
  const { t } = useLang();
  return (
    <section id="limits" className="section" aria-labelledby="limits-title">
      <div className="container">
        <div className="section-head">
          <p className="label" data-reveal>
            {t.limits.label}
          </p>
          <h2 id="limits-title" className="h2" data-reveal="mask">
            {t.limits.title}
          </h2>
        </div>
        <ul className={styles.list}>
          {t.limits.items.map((item, i) => (
            <li key={i} className={styles.item} data-reveal>
              <span className={styles.mark} aria-hidden="true" />
              <p className="body">{rich(item)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
