"use client";

import { useSyncExternalStore } from "react";

// Server snapshot is `false`, so SSR renders the desktop / full-motion layout.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const usePrefersReducedMotion = () => useMediaQuery(REDUCED_MOTION);
