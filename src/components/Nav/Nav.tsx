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

/**
 * Dynamic-Island header: a black pill floating at the top centre.
 *  - at the top of the page (or on hover / keyboard focus) it expands to show the links;
 *  - once you scroll it compacts to the logo + the section you're reading;
 *  - on phones the menu button grows the island into a rounded panel.
 * Expand/compact is pure CSS (grid 0fr → 1fr), so the island resizes smoothly.
 */
export function Nav() {
  const { t, lang, setLang } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof SPY_SECTIONS)[number] | null>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setOpen(false), []);

  // Expanded while at the very top of the page
  useEffect(() => {
    const island = islandRef.current;
    if (!island) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      island.dataset.top = String(window.scrollY < 60);
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

  // Scroll spy: the compact island shows the section in view
  useEffect(() => {
    if (pathname !== "/") return;
    const els = SPY_SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as (typeof SPY_SECTIONS)[number];
          if (entry.isIntersecting) setActiveSection(id);
          else setActiveSection((cur) => (cur === id ? null : cur));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  const isActive = (key: string) => (key === "docs" ? pathname.startsWith("/docs") : pathname === "/" && activeSection === key);
  const status = pathname.startsWith("/docs") ? t.nav.docs : activeSection ? t.nav[activeSection] : null;

  // Phone panel: lock scroll, close on Escape or outside tap, keep focus inside
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    setScrollLocked(true);
    const toggle = toggleRef.current;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !islandRef.current) return;
      const items = [...islandRef.current.querySelectorAll<HTMLElement>("a, button")].filter((el) => el.offsetParent !== null);
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
    function onPointer(e: PointerEvent) {
      if (!islandRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.body.style.overflow = overflow;
      setScrollLocked(false);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      toggle?.focus();
    };
  }, [open]);

  const langToggle = (
    <div className={styles.lang} role="group" aria-label={t.nav.language}>
      {(["en", "ka"] as Lang[]).map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          className={styles.langBtn}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <header className={styles.header}>
      <a href="#main" className="skip-link">
        {t.nav.skip}
      </a>
      <div ref={islandRef} className={styles.island} data-top="true" data-open={open} data-status={!!status}>
        <div className={styles.row}>
          <Link
            href="/"
            className={styles.brand}
            aria-label={t.nav.home}
            onClick={(e) => {
              // Already on the home page: glide back to the top instead of navigating
              if (pathname !== "/") return;
              e.preventDefault();
              closeMenu();
              smoothScrollTo(0);
              history.replaceState(null, "", "/");
            }}
          >
            <span className={styles.mark} aria-hidden="true" />
            <span className={styles.brandName}>Sarke</span>
          </Link>

          {/* Compact state: the section you're reading */}
          <div className={styles.status} aria-hidden="true">
            <div className={styles.statusInner}>
              <span className={styles.pulse} />
              {status}
            </div>
          </div>

          {/* Expanded state: links, language, theme */}
          <div className={styles.expand}>
            <div className={styles.expandInner}>
              <nav className={styles.links} aria-label={t.nav.primary}>
                {LINKS.map((l) => (
                  <Link
                    key={l.key}
                    href={l.href}
                    className={styles.link}
                    aria-current={isActive(l.key) ? (l.key === "docs" ? "page" : "location") : undefined}
                  >
                    {t.nav[l.key]}
                  </Link>
                ))}
              </nav>
              {langToggle}
              <ThemeToggle />
            </div>
          </div>

          <Link href="/#download" className={styles.cta}>
            {t.nav.download}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="island-menu"
            aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.bars} data-open={open} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>

        {/* Phones: the island grows into a menu panel */}
        <div id="island-menu" ref={panelRef} className={styles.panel} inert={!open}>
          <div className={styles.panelInner}>
            <ul className={styles.panelLinks}>
              {LINKS.map((l) => (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    className={styles.panelLink}
                    aria-current={isActive(l.key) ? (l.key === "docs" ? "page" : "location") : undefined}
                    onClick={closeMenu}
                  >
                    {t.nav[l.key]}
                  </Link>
                </li>
              ))}
            </ul>
            <div className={styles.panelFoot}>
              {langToggle}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
