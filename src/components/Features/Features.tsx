"use client";

import { useLang } from "@/i18n/LangProvider";
import styles from "./Features.module.css";

/** A soft light sits exactly under the pointer. */
function track(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/* ---------- Small animated scenes, one per tile ---------- */

const Merge = () => (
  <div className={styles.vMerge} aria-hidden="true">
    {["a", "b", "c"].map((k) => (
      <span key={k} className={`${styles.screen} ${styles[`wall_${k}`]}`} />
    ))}
    <span className={styles.mergeWindow} />
    <span className={styles.mergeCursor} />
  </div>
);

const Carry = () => (
  <div className={styles.vCarry} aria-hidden="true">
    <span className={`${styles.screen} ${styles.wall_a}`} />
    <span className={`${styles.screen} ${styles.wall_b}`} />
    <span className={styles.carryWindow} />
  </div>
);

const Files = () => (
  <div className={styles.vFiles} aria-hidden="true">
    <span className={styles.folder} />
    <span className={styles.file} />
  </div>
);

const Cursor = () => (
  <div className={styles.vCursor} aria-hidden="true">
    <span className={`${styles.screen} ${styles.wall_b}`} />
    <span className={`${styles.screen} ${styles.wall_c}`} />
    <span className={styles.edge} />
    <span className={styles.arrow} />
  </div>
);

const Hud = () => (
  <dl className={styles.vHud} aria-hidden="true">
    {["RTT", "FPS", "LAT", "BITRATE"].map((k, i) => (
      <div key={k} className={styles.meter}>
        <dt>{k}</dt>
        <dd>--</dd>
        <span className={styles.bar} style={{ "--i": i } as React.CSSProperties} />
      </div>
    ))}
  </dl>
);

const Keys = () => (
  <div className={styles.vKeys} aria-hidden="true">
    {["Ctrl", "Alt", "Shift", "Q"].map((k, i) => (
      <kbd key={k} className={styles.key} style={{ "--i": i } as React.CSSProperties}>
        {k}
      </kbd>
    ))}
  </div>
);

const Portable = () => (
  <div className={styles.vPortable} aria-hidden="true">
    {["kvm_host.exe", "kvm_client.exe", "config.json"].map((f) => (
      <code key={f} className={styles.chip}>
        {f}
      </code>
    ))}
  </div>
);

const VISUALS = [Merge, Carry, Files, Cursor, Hud, Keys, Portable];

export function Features() {
  const { t } = useLang();
  return (
    <section id="features" className="section" aria-labelledby="features-title">
      <div className="container">
        <div className="section-head">
          <h2 id="features-title" className="h2" data-reveal="mask">
            {t.features.title}
          </h2>
          <p className="lead" data-reveal>
            {t.features.intro}
          </p>
        </div>
        <ul className={styles.grid}>
          {t.features.items.map((f, i) => {
            const Visual = VISUALS[i];
            return (
              <li key={i} className={`${styles.tile} ${styles[`t${i}`]}`} data-reveal onPointerMove={track}>
                <div className={styles.core}>
                  {Visual && <Visual />}
                  <div className={styles.text}>
                    <h3 className="h3">{f.title}</h3>
                    <p className="body">{f.text}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
