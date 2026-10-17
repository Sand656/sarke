"use client";

import { useEffect, type DependencyList, type RefObject } from "react";

type GsapModule = typeof import("gsap").gsap;
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger").ScrollTrigger;
export type GsapKit = { gsap: GsapModule; ScrollTrigger: ScrollTriggerModule };

let kit: Promise<GsapKit> | null = null;

/** GSAP is loaded lazily so it stays out of the initial bundle. */
export function loadGsap(): Promise<GsapKit> {
  kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
  });
  return kit;
}

/**
 * Runs `setup` inside a gsap.context once GSAP has loaded. Everything it creates
 * (tweens, timelines, ScrollTriggers) is reverted when deps change or on unmount.
 */
export function useGsapEffect(setup: (kit: GsapKit) => void, deps: DependencyList, scope?: RefObject<Element | null>) {
  useEffect(() => {
    let cancelled = false;
    let revert: (() => void) | undefined;
    loadGsap().then((k) => {
      if (cancelled) return;
      const ctx = k.gsap.context(() => setup(k), scope?.current ?? undefined);
      revert = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps);
}
