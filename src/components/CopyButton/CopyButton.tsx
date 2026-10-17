"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import styles from "./CopyButton.module.css";

type Props = { value: string; label?: string };

export function CopyButton({ value, label }: Props) {
  const { t } = useLang();
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1600);
  }

  const text = state === "copied" ? t.common.copied : state === "failed" ? t.common.copyFailed : t.common.copy;

  return (
    <button
      type="button"
      className={styles.button}
      data-state={state}
      onClick={copy}
      aria-label={state === "idle" ? (label ?? t.common.copy) : text}
    >
      {text}
      <span className="sr-only" aria-live="polite">
        {state === "idle" ? "" : text}
      </span>
    </button>
  );
}
