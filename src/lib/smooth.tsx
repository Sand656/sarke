"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { loadGsap } from "@/lib/gsap";

let lenis: Lenis | null = null;
let glideFrame = 0;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Quick but readable: ~0.45s for short hops, capped at 0.9s for long trips. */
const glideDuration = (distance: number) => Math.min(900, 450 + Math.abs(distance) * 0.04);

/** Pauses smooth scrolling (e.g. while a full-screen menu is open). */
export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
}

function resolveTop(target: number | HTMLElement) {
  if (typeof target === "number") return target;
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  return target.getBoundingClientRect().top + window.scrollY - margin;
}

/**
 * User-initiated scroll (back to top, logo, anchor links): a short eased glide that never
 * jumps. Uses Lenis when it's running, otherwise a rAF animation.
 */
export function smoothScrollTo(target: number | HTMLElement) {
  const top = Math.max(0, resolveTop(target));
  const distance = top - window.scrollY;
  const duration = glideDuration(distance);

  if (lenis) {
    lenis.scrollTo(top, { duration: duration / 1000, easing: easeInOutCubic, force: true });
    return;
  }

  cancelAnimationFrame(glideFrame);
  const from = window.scrollY;
  const start = performance.now();
  const cancel = () => cancelAnimationFrame(glideFrame);
  // The user taking over the wheel/touch stops the glide
  addEventListener("wheel", cancel, { once: true, passive: true });
  addEventListener("touchstart", cancel, { once: true, passive: true });
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    window.scrollTo({ top: from + distance * easeInOutCubic(p), behavior: "instant" });
    if (p < 1) glideFrame = requestAnimationFrame(step);
  };
  glideFrame = requestAnimationFrame(step);
}

/** Mounts Lenis inertia scrolling and smooth in-page anchor links. */
export function SmoothScroll() {
  useEffect(() => {
    let cancelled = false;
    let stopTicker: (() => void) | undefined;

    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, smoothWheel: true, autoRaf: false });
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

    // Same-page anchors (#id or /#id while on "/") glide under the sticky nav.
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
