"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/i18n/LangProvider";
import { smoothScrollTo } from "@/lib/smooth";
import styles from "./BackToTop.module.css";

const SHOW_AFTER = 600;
const PERIMETER = 4 * 46; // square progress path around the 48px button

export function BackToTop() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const progressRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(1, scrollY / max) : 0;
      progressRef.current?.style.setProperty("stroke-dashoffset", String(PERIMETER * (1 - progress)));
      setVisible(scrollY > SHOW_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      className={styles.button}
      data-visible={visible}
      aria-label={t.nav.backToTop}
      title={t.nav.backToTop}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => {
        smoothScrollTo(0);
        history.replaceState(null, "", location.pathname);
      }}
    >
      <svg className={styles.ring} viewBox="0 0 48 48" aria-hidden="true">
        <rect
          ref={progressRef}
          x="1"
          y="1"
          width="46"
          height="46"
          rx="9"
          pathLength={PERIMETER}
          strokeDasharray={PERIMETER}
          strokeDashoffset={PERIMETER}
        />
      </svg>
      <svg className={styles.arrow} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
      </svg>
    </button>
  );
}
