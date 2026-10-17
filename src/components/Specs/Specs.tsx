"use client";

import { useLang } from "@/i18n/LangProvider";
import { formatMB, useRelease } from "@/lib/release";
import styles from "./Specs.module.css";

export function Specs() {
  const { t } = useLang();
  const release = useRelease();
  const r = t.specs.rows;

  let size: React.ReactNode = t.specs.unavailable;
  if (release.status === "loading") size = <span className={`shimmer ${styles.skeleton}`} aria-label={t.download.loading} />;
  else if (release.status === "ok" && release.data.sizeBytes !== null) size = formatMB(release.data.sizeBytes);

  const rows: [string, React.ReactNode, string?][] = [
    [r.platform[0], r.platform[1]],
    [r.computers[0], r.computers[1]],
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
      <div className={`container ${styles.grid}`}>
        <div className={styles.head}>
          <h2 id="specs-title" className="h2" data-reveal="mask">
            {t.specs.title}
          </h2>
          <p className="lead" data-reveal>
            {t.specs.intro}
          </p>
        </div>
        <div className={`bezel ${styles.panel}`} data-reveal>
          <dl className={`bezel-core ${styles.table}`}>
            {rows.map(([k, v, cls]) => (
              <div key={k} className={styles.row}>
                <dt className={styles.key}>{k}</dt>
                <dd className={`readout ${cls ?? ""}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
