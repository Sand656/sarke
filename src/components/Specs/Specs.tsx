"use client";

import { useLang } from "@/i18n/LangProvider";
import { formatMB, useRelease } from "@/lib/release";
import styles from "./Specs.module.css";

export function Specs() {
  const { t } = useLang();
  const release = useRelease();
  const r = t.specs.rows;

  let size: React.ReactNode = t.specs.unavailable;
  if (release.status === "loading") size = <span className={styles.skeleton} aria-label={t.download.loading} />;
  else if (release.status === "ok" && release.data.sizeBytes !== null) size = formatMB(release.data.sizeBytes);

  const rows: [string, React.ReactNode, string?][] = [
    [r.platform[0], r.platform[1]],
    [r.network[0], r.network[1]],
    [r.capture[0], r.capture[1]],
    [r.codec[0], r.codec[1]],
    [r.install[0], r.install[1]],
    [r.language[0], r.language[1]],
    [r.size[0], size],
    [r.encryption[0], r.encryption[1], styles.warn],
  ];

  return (
    <section id="specs" className="section" aria-labelledby="specs-title">
      <div className="container">
        <div className="section-head">
          <p className="label">{t.specs.label}</p>
          <h2 id="specs-title" className="h2">
            {t.specs.title}
          </h2>
        </div>
        <dl className={styles.table}>
          {rows.map(([k, v, cls]) => (
            <div key={k} className={styles.row}>
              <dt className="label">{k}</dt>
              <dd className={`readout ${cls ?? ""}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
