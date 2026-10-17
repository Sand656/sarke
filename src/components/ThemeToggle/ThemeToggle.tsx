"use client";

import { useId } from "react";
import { useLang } from "@/i18n/LangProvider";
import { switchTheme, useTheme } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { t } = useLang();
  const theme = useTheme();
  const maskId = useId();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={styles.toggle}
      data-theme-state={theme}
      aria-label={next === "light" ? t.nav.themeLight : t.nav.themeDark}
      title={next === "light" ? t.nav.themeLight : t.nav.themeDark}
      onClick={() => switchTheme(next)}
    >
      {/* Sun and moon share one hairline drawing; CSS morphs between them */}
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className={styles.icon}>
        <mask id={maskId}>
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle className={styles.maskCircle} cx="24" cy="4" r="8" fill="black" />
        </mask>
        <circle className={styles.core} cx="12" cy="12" r="5" mask={`url(#${maskId})`} />
        <g className={styles.rays}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="1.5" x2="12" y2="4" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
