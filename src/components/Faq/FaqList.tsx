"use client";

import { useLang } from "@/i18n/LangProvider";
import { rich } from "@/lib/rich";
import styles from "./Faq.module.css";

/** FAQ items as native <details>. `open` expands every item (used on /docs). */
export function FaqList({ open = false }: { open?: boolean }) {
  const { t } = useLang();
  return (
    <div className={styles.list}>
      {t.faq.items.map((item, i) => (
        <details key={i} className={styles.item} open={open || undefined} data-reveal>
          <summary className={styles.summary}>
            <span className={`readout ${styles.num}`}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.q}>{item.q}</span>
            <span className={styles.icon} aria-hidden="true" />
          </summary>
          <p className={`body ${styles.a}`}>{rich(item.a)}</p>
        </details>
      ))}
    </div>
  );
}
