"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import { useLang, type Lang } from "@/i18n/LangProvider";
import { setScrollLocked, smoothScrollTo } from "@/lib/smooth";
import styles from "./Nav.module.css";

const SPY_SECTIONS = ["how", "features", "specs", "download"] as const;

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
  // Keeps the menu mounted while its exit animation plays
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const closeMenu = useCallback(() => {
    if (!open) return;
    setOpen(false);
    setClosing(true);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setClosing(false), 260);
  }, [open]);

  function openMenu() {
    window.clearTimeout(closeTimer.current);
    setClosing(false);
    setOpen(true);
  }
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Dynamic header: transparent at the top, frosted once you scroll,
  // slides away while scrolling down and comes back as soon as you scroll up.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      header.dataset.scrolled = String(y > 8);
      if (Math.abs(delta) > 4) {
        const keep = header.matches(":focus-within") || header.querySelector("[aria-expanded='true']");
        header.dataset.hidden = String(delta > 0 && y > 360 && !keep);
        last = y;
      }
      if (y < 8) header.dataset.hidden = "false";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
    };
  }, []);

  // Scroll spy: underline the nav link of the section in view.
  useEffect(() => {
    if (pathname !== "/") return;
    const els = SPY_SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
          else setActiveSection((cur) => (cur === entry.target.id ? null : cur));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  const isActive = (key: string) => (key === "docs" ? pathname.startsWith("/docs") : pathname === "/" && activeSection === key);

  // Full-screen menu: lock scroll, close on Escape, keep focus inside.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    setScrollLocked(true);
    const toggle = toggleRef.current;
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
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
      setScrollLocked(false);
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open, closeMenu]);

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
    <header ref={headerRef} className={styles.nav} data-scrolled="false" data-hidden="false" data-open={open || undefined}>
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>
      <div className={`container ${styles.wrap}`}>
        <div className={styles.bar}>
        <Link
          href="/"
          className={styles.brand}
          aria-label={t.nav.home}
          onClick={(e) => {
            // Already on the home page: glide back to the top instead of navigating.
            if (pathname !== "/") return;
            e.preventDefault();
            closeMenu();
            smoothScrollTo(0);
            history.replaceState(null, "", "/");
          }}
        >
          <span className={styles.mark} aria-hidden="true" />
          Sarke
        </Link>

        <nav className={styles.links} aria-label={t.nav.primary}>
          {LINKS.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={`u-link ${styles.link}`}
              aria-current={isActive(l.key) ? (l.key === "docs" ? "page" : "location") : undefined}
            >
              {t.nav[l.key]}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {langToggle}
          <ThemeToggle />
          <Link href="/#download" className={styles.cta}>
            {t.nav.download}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
            onClick={() => (open ? closeMenu() : openMenu())}
          >
            <span className={styles.bars} data-open={open} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={styles.menu}
        data-state={open ? "open" : closing ? "closing" : "closed"}
        hidden={!open && !closing}
      >
        <nav className="container" aria-label={t.nav.primary}>
          <ul className={styles.menuList}>
            {LINKS.map((l) => (
              <li key={l.key}>
                <Link
                  href={l.href}
                  className={`h2 ${styles.menuLink}`}
                  aria-current={isActive(l.key) ? (l.key === "docs" ? "page" : "location") : undefined}
                  onClick={closeMenu}
                >
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
