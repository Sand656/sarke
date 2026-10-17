"use client";

import { useLang } from "@/i18n/LangProvider";
import { setMotion, useReducedMotion } from "@/lib/motion";
import styles from "./MotionToggle.module.css";

/** Animations on/off. Starts from the OS setting; the choice is remembered. */
export function MotionToggle() {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const label = reduced ? t.nav.motionTurnOn : t.nav.motionTurnOff;

  return (
    <button
      type="button"
      className={styles.toggle}
      data-motion-state={reduced ? "reduced" : "full"}
      aria-pressed={!reduced}
      aria-label={t.nav.motion}
      title={label}
      onClick={() => setMotion(reduced ? "full" : "reduced")}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path className={styles.wave} d="M2 12c2.5-5 5-5 7.5 0s5 5 7.5 0 3.5-3 5-2" pathLength={1} />
        <path className={styles.flat} d="M2 12h20" pathLength={1} />
      </svg>
    </button>
  );
}
