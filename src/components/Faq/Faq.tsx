"use client";

import { useLang } from "@/i18n/LangProvider";
import { FaqList } from "./FaqList";

export function Faq() {
  const { t } = useLang();
  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <div className="container">
        <div className="section-head">
          <p className="label">{t.faq.label}</p>
          <h2 id="faq-title" className="h2">
            {t.faq.title}
          </h2>
        </div>
        <FaqList />
      </div>
    </section>
  );
}
