"use client";

import { useLang } from "@/i18n/LangProvider";
import styles from "./Ticker.module.css";

export function Ticker() {
  const { t } = useLang();
  const row = (hidden: boolean) => (
    <ul className={styles.row} aria-hidden={hidden || undefined}>
      {t.ticker.map((item) => (
        <li key={item} className={`label ${styles.item}`}>
          {item}
          <span className={styles.sep} aria-hidden="true">
            ▪
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.ticker}>
      <div className={styles.track}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
