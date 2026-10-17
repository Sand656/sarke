"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLang, type Lang } from "@/i18n/LangProvider";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "/#how", key: "how" },
  { href: "/#features", key: "features" },
  { href: "/#specs", key: "specs" },
  { href: "/#download", key: "download" },
  { href: "/docs", key: "docs" },
] as const;

export function Nav() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Full-screen menu: lock scroll, close on Escape, keep focus inside.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const toggle = toggleRef.current;
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !menuRef.current) return;
      const items = [toggle, ...menuRef.current.querySelectorAll<HTMLElement>("a, button")].filter(
        (el): el is HTMLElement => !!el,
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const langToggle = (
    <div className={styles.lang} role="group" aria-label={t.nav.language}>
      {(["en", "ka"] as Lang[]).map((code, i) => (
        <span key={code} className={styles.langItem}>
          {i > 0 && (
            <span className={styles.langSep} aria-hidden="true">
              /
            </span>
          )}
          <button
            type="button"
            lang={code}
            className={styles.langBtn}
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
          >
            {code.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );

  return (
    <header className={styles.nav}>
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label={t.nav.home}>
          <span className={styles.square} aria-hidden="true" />
          SARKE
        </Link>

        <nav className={styles.links} aria-label={t.nav.primary}>
          {LINKS.map((l) => (
            <Link key={l.key} href={l.href} className={`label ${styles.link}`}>
              {t.nav[l.key]}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {langToggle}
          <Link href="/#download" className={`btn btn-primary ${styles.cta}`}>
            {t.nav.download}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.bars} data-open={open} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={menuRef} className={styles.menu} hidden={!open}>
        <nav className="container" aria-label={t.nav.primary}>
          <ul className={styles.menuList}>
            {LINKS.map((l) => (
              <li key={l.key}>
                <Link href={l.href} className={`h2 ${styles.menuLink}`} onClick={() => setOpen(false)}>
                  {t.nav[l.key]}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.menuFoot}>{langToggle}</div>
        </nav>
      </div>
    </header>
  );
}
