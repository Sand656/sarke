"use client";

import { useEffect, useRef, useState } from "react";
import { SHOWCASE_VIDEO } from "@/config";
import { useLang } from "@/i18n/LangProvider";
import styles from "./Showcase.module.css";

/** The product video, edge to edge: muted, looping, nothing on top of it. */
export function Showcase() {
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  // React sets `muted` as a property, not an attribute, so mute and start the loop here. It plays
  // only while the section is (almost) on screen, so it doesn't download or decode up front.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (video.readyState >= 2) setReady(true);

    // Changes can arrive batched (e.g. a reload that restores the scroll position): the last one counts.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[entries.length - 1].isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.showcase} aria-label={t.showcase.label}>
      <video
        ref={videoRef}
        className={styles.video}
        data-ready={ready}
        src={SHOWCASE_VIDEO}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setReady(true)}
      />
    </section>
  );
}
