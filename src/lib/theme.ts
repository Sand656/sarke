"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./themeScript";

export type Theme = "dark" | "light";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const read = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "dark");
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage unavailable — theme lasts for this page view */
  }
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

/**
 * Switches theme with a slow (~0.9s) crossfade of the whole page via the View Transitions API
 * (styles in globals.css). Browsers without it transition every color instead.
 */
export function switchTheme(next: Theme) {
  const doc = document as ViewTransitionDoc;
  const root = document.documentElement;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyTheme(next);
    return;
  }
  if (doc.startViewTransition) {
    doc.startViewTransition(() => applyTheme(next));
    return;
  }
  root.classList.add("theme-fade");
  applyTheme(next);
  window.setTimeout(() => root.classList.remove("theme-fade"), 900);
}
