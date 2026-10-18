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
  using: "using",
  tray: "tray",
  config: "config",
  hotkeys: "hotkeys",
  firewall: "firewall",
  troubleshooting: "troubleshooting",
  build: "build",
};

// The same rules the installer adds: TCP for control, video and files, UDP for finding the other PC.
const FIREWALL_CMDS = [
  'netsh advfirewall firewall add rule name="Sarke" dir=in action=allow protocol=TCP localport=50500-50502',
  'netsh advfirewall firewall add rule name="Sarke" dir=in action=allow protocol=UDP localport=50503',
];

const CONFIG_EXAMPLE = `{
  "client_side": "left",
  "host_ip": "192.168.1.20"
}`;

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
                  </div>
                </li>
              ))}
            </ol>
          </>,
        )}

        {section("using", list(d.using))}

        {section(
          "tray",
          <>
            <p className="body">{rich(d.trayIntro)}</p>
            {list(d.tray)}
          </>,
        )}

        {section(
          "config",
          <>
            <p className="body">{rich(d.configIntro)}</p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className="label">
                    {d.configHead[0]}
                  </th>
                  <th scope="col" className="label">
                    {d.configHead[1]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {d.configKeys.map(([key, meaning]) => (
                  <tr key={key}>
                    <td>
                      <code className="code-inline">{key}</code>
                    </td>
                    <td className="body">{rich(meaning)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <CodeBlock code={CONFIG_EXAMPLE} prompt={false} />
            <p className="body">{d.configNote}</p>
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
            {FIREWALL_CMDS.map((cmd) => (
              <CodeBlock key={cmd} code={cmd} />
            ))}
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
