"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLang } from "@/i18n/LangProvider";
import { loadGsap } from "@/lib/gsap";

/**
 * Scroll reveals for every [data-reveal] element on the page.
 *   data-reveal         fade + rise
 *   data-reveal="mask"  wipe up from a clip (headings)
 * Only elements below the fold are hidden, so nothing visible on load ever flickers.
 */
export function RevealManager() {
  const pathname = usePathname();
  const { lang } = useLang();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        const fold = innerHeight * 0.92;
        const pending = gsap.utils
          .toArray<HTMLElement>("[data-reveal]")
          .filter((el) => el.getBoundingClientRect().top > fold);

        for (const el of pending) {
          gsap.set(el, el.dataset.reveal === "mask" ? { clipPath: "inset(0% 0% 100% 0%)", y: 24 } : { autoAlpha: 0, y: 40 });
        }

        ScrollTrigger.batch(pending, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1,
              ease: "power3.out",
              stagger: 0.08,
              overwrite: true,
              clearProps: "transform,clipPath",
            }),
        });
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [pathname]);

  // Text length changes with the language — recompute trigger positions.
  useEffect(() => {
    loadGsap().then(({ ScrollTrigger }) => requestAnimationFrame(() => ScrollTrigger.refresh()));
  }, [lang]);

  return null;
}
