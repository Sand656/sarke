"use client";

import { useSyncExternalStore } from "react";
import { MOTION_KEY } from "./themeScript";

export type Motion = "full" | "reduced";

/**
 * Motion preference lives on <html data-motion>. It starts from the OS "reduce motion"
 * setting (boot script) and can be overridden with the header toggle (remembered).
 */
export function isReducedMotion() {
  return document.documentElement.dataset.motion === "reduced";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  return () => observer.disconnect();
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, isReducedMotion, () => false);
}

export function setMotion(motion: Motion) {
  document.documentElement.dataset.motion = motion;
  try {
    localStorage.setItem(MOTION_KEY, motion);
  } catch {
    /* storage unavailable — preference lasts for this page view */
  }
}
