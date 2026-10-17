"use client";

import { useSyncExternalStore } from "react";
import { CodeBlock } from "@/components/CodeBlock/CodeBlock";
import { CopyButton } from "@/components/CopyButton/CopyButton";
import { DOWNLOAD_URL, RELEASES_URL, isRepoConfigured } from "@/config";
import { useLang } from "@/i18n/LangProvider";
import { formatMB, useRelease, type ReleaseInfo } from "@/lib/release";
import { rich } from "@/lib/rich";
import styles from "./Download.module.css";

const COMMANDS: Record<number, string> = {
  2: "sarke_host.exe",
  3: "sarke_client.exe --host <A's IP>",
};

function detectWindows() {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? nav.userAgent;
  return /win/i.test(platform);
}

const noopSubscribe = () => () => {};

function Readouts({ data }: { data: ReleaseInfo }) {
  const { t } = useLang();
  const sha = data.sha256;
  return (
    <dl className={styles.readouts}>
      <div className={styles.readoutRow}>
        <dt className="label">{t.download.version}</dt>
        <dd className="readout">{data.version}</dd>
      </div>
      <div className={styles.readoutRow}>
        <dt className="label">{t.download.released}</dt>
        <dd className="readout">{data.date}</dd>
      </div>
      {data.sizeBytes !== null && (
        <div className={styles.readoutRow}>
          <dt className="label">{t.download.size}</dt>
          <dd className="readout">{formatMB(data.sizeBytes)}</dd>
        </div>
      )}
      {data.downloads !== null && (
        <div className={styles.readoutRow}>
          <dt className="label">{t.download.downloads}</dt>
          <dd className="readout">{data.downloads.toLocaleString("en-US")}</dd>
        </div>
      )}
      {sha && (
        <div className={styles.readoutRow}>
          <dt className="label">{t.download.sha}</dt>
          <dd className={styles.shaCell}>
            <code className={`readout ${styles.sha}`} title={sha}>
              {sha.slice(0, 12)}…{sha.slice(-8)}
            </code>
            <CopyButton value={sha} label={t.download.copySha} />
          </dd>
        </div>
      )}
    </dl>
  );
}

function Skeleton() {
  const { t } = useLang();
  return (
    <div className={styles.readouts} role="status" aria-label={t.download.loading}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.readoutRow} aria-hidden="true">
          <span className={`shimmer ${styles.bar}`} style={{ width: 72 }} />
          <span className={`shimmer ${styles.bar}`} style={{ width: i === 4 ? 200 : 112 }} />
        </div>
      ))}
    </div>
  );
}

export function Download() {
  const { t } = useLang();
  const release = useRelease();
  const isWindows = useSyncExternalStore(noopSubscribe, detectWindows, () => true);

  return (
    <section id="download" className="section" aria-labelledby="download-title">
      <div className="container">
        <div className={`bezel ${styles.shell}`} data-reveal>
        <div className={`bezel-core ${styles.panel}`}>
          <div className={styles.left}>
            <h2 id="download-title" className="h2">
              {t.download.title}
            </h2>
            <p className="lead">{t.download.intro}</p>

            {release.status === "loading" && <Skeleton />}
            {release.status === "ok" && <Readouts data={release.data} />}
            {release.status === "error" && <p className="small">{t.download.unavailable}</p>}

            {!isWindows && <p className={`body ${styles.warnNote}`}>{t.download.notWindows}</p>}

            {/* No GitHub links until the release repo is set (src/config.ts), so nothing 404s */}
            <div className={styles.buttons}>
              {isRepoConfigured ? (
                <>
                  <a href={DOWNLOAD_URL} className="btn btn-primary">
                    {t.download.button}
                  </a>
                  <a href={RELEASES_URL} className="btn btn-secondary">
                    {t.download.all}
                  </a>
                </>
              ) : (
                <span className={`btn btn-primary ${styles.soon}`} aria-disabled="true">
                  {t.download.soon}
                </span>
              )}
            </div>
          </div>

          <div className={styles.right}>
            <h3 className="h3">{t.download.quickTitle}</h3>
            <ol className={styles.steps}>
              {t.download.steps.map((step, i) => (
                <li key={i} className={styles.step}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  <div className={styles.stepBody}>
                    <p className="body">{rich(step)}</p>
                    {COMMANDS[i] && <CodeBlock code={COMMANDS[i]} />}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        </div>

        <div className={styles.notices}>
          <div className="notice" data-reveal>
            <p className="h3">{t.download.smartscreenTitle}</p>
            <p className="body">{t.download.smartscreen}</p>
          </div>
          <div className="notice" data-reveal>
            <p className="h3">{t.download.securityTitle}</p>
            <p className="body">{t.download.security}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
