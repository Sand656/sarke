"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { loadGsap } from "@/lib/gsap";

let lenis: Lenis | null = null;

/** Pauses smooth scrolling (e.g. while a full-screen menu is open). */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
}

/** Smoothly scrolls to a y position or element; falls back to native scrolling. */
export function smoothScrollTo(target: number | HTMLElement) {
  // Sections carry scroll-margin-top for the sticky nav; both paths below respect it.
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.2, force: true });
    return;
  }
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  if (typeof target === "number") window.scrollTo({ top: target, behavior });
  else target.scrollIntoView({ behavior, block: "start" });
}

/** Mounts Lenis smooth scrolling (skipped for reduced motion) and smooth in-page anchor links. */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let stopTicker: (() => void) | undefined;

    if (!reduced) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
      // Drive Lenis from GSAP's ticker so ScrollTrigger pins stay in sync.
      loadGsap().then(({ gsap, ScrollTrigger }) => {
        if (cancelled || !lenis) return;
        const instance = lenis;
        instance.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => instance.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        stopTicker = () => gsap.ticker.remove(tick);
      });
    }

    // Same-page anchors (#id or /#id while on "/") scroll smoothly under the sticky nav.
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!link) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      history.pushState(null, "", url.hash);
      smoothScrollTo(el);
      if (el.id === "main") el.focus({ preventScroll: true });
    }
    document.addEventListener("click", onClick, true);

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick, true);
      stopTicker?.();
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
