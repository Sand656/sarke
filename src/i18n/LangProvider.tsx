"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en, { type Dict } from "./en";
import ka from "./ka";

export type Lang = "en" | "ka";

const dicts: Record<Lang, Dict> = { en, ka };
const STORAGE_KEY = "sarke-lang";

type LangContextValue = { lang: Lang; t: Dict; setLang: (lang: Lang) => void };

const LangContext = createContext<LangContextValue>({ lang: "en", t: en, setLang: () => {} });

function readStoredLang(): Lang | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "en" || value === "ka" ? value : null;
  } catch {
    return null;
  }
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore the remembered choice after hydration (server always renders English).
  useEffect(() => {
    const stored = readStoredLang();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable on the client
    if (stored && stored !== "en") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — choice lasts for this page view only */
    }
  }, []);

  const value = useMemo(() => ({ lang, t: dicts[lang], setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
