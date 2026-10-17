"use client";

import { useLang } from "@/i18n/LangProvider";
import { FaqList } from "./FaqList";
import styles from "./Faq.module.css";

export function Faq() {
  const { t } = useLang();
  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <div className={`container ${styles.grid}`}>
        <h2 id="faq-title" className={`h2 ${styles.title}`} data-reveal="mask">
          {t.faq.title}
        </h2>
        <div className={styles.listCol}>
          <FaqList />
        </div>
      </div>
    </section>
  );
}
