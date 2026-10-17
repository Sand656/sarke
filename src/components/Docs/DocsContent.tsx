"use client";

import { useEffect, useState } from "react";
import { CodeBlock } from "@/components/CodeBlock/CodeBlock";
import { FaqList } from "@/components/Faq/FaqList";
import { useLang } from "@/i18n/LangProvider";
import type { Dict } from "@/i18n/en";
import { rich } from "@/lib/rich";
import styles from "./Docs.module.css";

type SectionKey = keyof Dict["docs"]["sections"];

const SECTION_IDS: Record<SectionKey, string> = {
  requirements: "requirements",
  install: "install",
  firstRun: "first-run",
  config: "config",
  hotkeys: "hotkeys",
  firewall: "firewall",
  troubleshooting: "troubleshooting",
  build: "build",
};

const FIREWALL_CMD =
  'netsh advfirewall firewall add rule name="Sarke host" dir=in action=allow program="C:\\Sarke\\kvm_host.exe" enable=yes profile=private';

function Todo({ children }: { children: React.ReactNode }) {
  return (
    <div className={`notice ${styles.todo}`}>
      <p className="body">{children}</p>
    </div>
  );
}

export function DocsContent() {
  const { t } = useLang();
  const d = t.docs;
  const keys = Object.keys(SECTION_IDS) as SectionKey[];
  const [active, setActive] = useState<string>(SECTION_IDS.requirements);

  // Highlight the TOC entry for the section in view.
  useEffect(() => {
    const els = Object.values(SECTION_IDS)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const section = (key: SectionKey, children: React.ReactNode) => (
    <section data-reveal id={SECTION_IDS[key]} className={styles.section} aria-labelledby={`${SECTION_IDS[key]}-h`}>
      <h2 id={`${SECTION_IDS[key]}-h`} className={`h3 ${styles.h}`}>
        {d.sections[key]}
      </h2>
      {children}
    </section>
  );

  const list = (items: string[]) => (
    <ul className={styles.list}>
      {items.map((item, i) => (
        <li key={i} className="body">
          {rich(item)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`container ${styles.layout}`}>
      <header className={styles.head}>
        <p className="label intro-up">{d.label}</p>
        <h1 className="h2 intro-up" style={{ "--d": "80ms" } as React.CSSProperties}>
          {d.title}
        </h1>
      </header>

      <nav className={styles.toc} aria-label={d.toc}>
        <p className="label">{d.toc}</p>
        <ol>
          {keys.map((k, i) => (
            <li key={k}>
              <a
                href={`#${SECTION_IDS[k]}`}
                className={styles.tocLink}
                aria-current={active === SECTION_IDS[k] ? "location" : undefined}
              >
                <span className={styles.tocNum}>{String(i + 1).padStart(2, "0")}</span>
                {d.sections[k]}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className={styles.content}>
        {section("requirements", list(d.requirements))}

        {section("install", list(d.install))}

        {section(
          "firstRun",
          <>
            <p className="body">{d.firstRunIntro}</p>
            <ol className={styles.steps}>
              {d.firstRun.map((step, i) => (
                <li key={i}>
                  <span className={`readout ${styles.stepNum}`}>{String(i + 1).padStart(2, "0")}</span>
                  <div className={styles.stepBody}>
                    <p className="body">{rich(step)}</p>
                    {i === 0 && <CodeBlock code="ipconfig" />}
                    {i === 1 && <CodeBlock code="kvm_host.exe" />}
                    {i === 2 && <CodeBlock code="kvm_client.exe --host <A's IP>" />}
                  </div>
                </li>
              ))}
            </ol>
          </>,
        )}

        {section(
          "config",
          <>
            <p className="body">{rich(d.configIntro)}</p>
            {/* TODO: real config.json keys from the Sarke C++ repo */}
            <Todo>{d.configTodo}</Todo>
          </>,
        )}

        {section(
          "hotkeys",
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className="label">
                  {d.hotkeysHead[0]}
                </th>
                <th scope="col" className="label">
                  {d.hotkeysHead[1]}
                </th>
              </tr>
            </thead>
            <tbody>
              {d.hotkeys.map(([keysText, action]) => (
                <tr key={keysText}>
                  <td>
                    <kbd className="kbd">{keysText}</kbd>
                  </td>
                  <td className="body">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>,
        )}

        {section(
          "firewall",
          <>
            {list(d.firewall)}
            <CodeBlock code={FIREWALL_CMD} />
          </>,
        )}

        {section(
          "troubleshooting",
          <>
            <p className="body">{d.troubleshootingIntro}</p>
            <FaqList open />
          </>,
        )}

        {section(
          "build",
          <>
            <p className="body">{d.buildIntro}</p>
            {/* TODO: CMake preset commands from the Sarke C++ repo's CLAUDE.md */}
            <Todo>{d.buildTodo}</Todo>
          </>,
        )}
      </article>
    </div>
  );
}
