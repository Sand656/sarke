"use client";

import { forwardRef, useId } from "react";
import { useLang } from "@/i18n/LangProvider";
import { CODE_LINES, GEOMETRY, WIN_BAR, WIN_H, WIN_W, type Layout } from "./scene";
import styles from "./DeskScene.module.css";

type Props = { layout: Layout; decorative?: boolean; className?: string };

/** Hairline desk scene. Rendered in its final frame; timelines animate it via data-part hooks. */
export const DeskScene = forwardRef<SVGSVGElement, Props>(function DeskScene(
  { layout, decorative = false, className },
  ref,
) {
  const { t, lang } = useLang();
  const uid = useId().replace(/:/g, "");
  const g = GEOMETRY[layout];
  const clipId = `reveal-${uid}`;
  const glowId = `glow-${uid}`;
  const titleId = `title-${uid}`;
  const descId = `desc-${uid}`;

  const windowBody = (accentBar: boolean) => (
    <>
      <rect className={styles.window} x={0} y={0} width={WIN_W} height={WIN_H} />
      <line className={styles.stroke} x1={0} y1={WIN_BAR} x2={WIN_W} y2={WIN_BAR} />
      <rect className={accentBar ? styles.accentFill : styles.dot} x={8} y={7} width={4} height={4} />
      <text className={styles.winTitle} x={18} y={12.5}>
        editor.exe
      </text>
      {CODE_LINES.map((w, i) => (
        <line
          key={i}
          className={i === 2 ? styles.codeHi : styles.code}
          x1={14 + (i % 3 === 1 ? 12 : 0)}
          x2={14 + (i % 3 === 1 ? 12 : 0) + w * 0.9}
          y1={WIN_BAR + 16 + i * 14}
          y2={WIN_BAR + 16 + i * 14}
        />
      ))}
    </>
  );

  return (
    <svg
      ref={ref}
      className={`${styles.scene} ${className ?? ""}`}
      data-layout={layout}
      viewBox={`0 0 ${g.width} ${g.height}`}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-labelledby={decorative ? undefined : `${titleId} ${descId}`}
      focusable="false"
    >
      {!decorative && (
        <>
          <title id={titleId}>{t.hero.sceneTitle}</title>
          <desc id={descId}>{t.hero.sceneDesc}</desc>
        </>
      )}
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <rect data-part="reveal" x={0} y={0} width={WIN_W} height={WIN_H} />
        </clipPath>
        <linearGradient
          id={glowId}
          x1="0"
          y1="0"
          x2={g.glow.dir === "right" ? "1" : "0"}
          y2={g.glow.dir === "down" ? "1" : "0"}
        >
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* PC A — two monitors */}
      {g.monitors.map((m, i) => {
        const cx = m.x + m.w / 2;
        const bottom = m.y + m.h;
        return (
          <g key={i}>
            <rect className={styles.screen} x={m.x} y={m.y} width={m.w} height={m.h} />
            <line className={styles.stroke} x1={cx} y1={bottom} x2={cx} y2={bottom + m.neck} />
            <line
              className={styles.stroke}
              x1={cx - m.base / 2}
              y1={bottom + m.neck}
              x2={cx + m.base / 2}
              y2={bottom + m.neck}
            />
          </g>
        );
      })}
      <text className={styles.label} x={g.hostLabel.x} y={g.hostLabel.y} textAnchor="middle">
        {t.hero.host}
      </text>

      {/* PC B — laptop */}
      <rect className={styles.stroke} x={g.laptopLid.x} y={g.laptopLid.y} width={g.laptopLid.w} height={g.laptopLid.h} />
      <rect
        className={styles.screen}
        x={g.laptopScreen.x}
        y={g.laptopScreen.y}
        width={g.laptopScreen.w}
        height={g.laptopScreen.h}
      />
      <polygon className={styles.stroke} points={g.laptopBase} />
      <text className={styles.label} x={g.clientLabel.x} y={g.clientLabel.y} textAnchor="middle">
        {t.hero.client}
      </text>

      {/* editor.exe on A + its accent highlight */}
      <g transform={`translate(${g.win.x} ${g.win.y}) scale(${g.win.scale})`}>
        {windowBody(false)}
        <rect data-part="highlight" className={styles.highlight} x={-3} y={-3} width={WIN_W + 6} height={WIN_H + 6} />
      </g>

      {/* Mirror on B, revealed in 8 steps */}
      <g transform={`translate(${g.mirror.x} ${g.mirror.y}) scale(${g.mirror.scale})`}>
        <g clipPath={`url(#${clipId})`}>{windowBody(true)}</g>
      </g>

      {/* Edge glow on B */}
      <g data-part="glow" opacity={0}>
        <rect x={g.glow.fade.x} y={g.glow.fade.y} width={g.glow.fade.w} height={g.glow.fade.h} fill={`url(#${glowId})`} />
        <rect className={styles.accentFill} x={g.glow.line.x} y={g.glow.line.y} width={g.glow.line.w} height={g.glow.line.h} />
      </g>

      {/* HUD (illustration only: values are dashes) */}
      <g data-part="hud">
        <rect className={styles.hud} x={g.hud.x} y={g.hud.y} width={g.hud.w} height={g.hud.h} />
        {["RTT", "FPS", "LAT"].map((k, i) => (
          <g key={k}>
            <text className={styles.hudKey} x={g.hud.x + 8} y={g.hud.y + 16 + i * 14}>
              {k}
            </text>
            <text className={styles.hudVal} x={g.hud.x + g.hud.w - 8} y={g.hud.y + 16 + i * 14} textAnchor="end">
              --
            </text>
          </g>
        ))}
      </g>

      {/* Input return: dashed path back to A */}
      <line
        data-part="link"
        className={styles.link}
        x1={g.cursor.click.x}
        y1={g.cursor.click.y}
        x2={g.target.x}
        y2={g.target.y}
      />
      <circle data-part="ripple" className={styles.ripple} cx={g.cursor.click.x} cy={g.cursor.click.y} r={16} opacity={0} />
      <rect
        data-part="pulse"
        className={styles.accentFill}
        x={-3}
        y={-3}
        width={6}
        height={6}
        opacity={0}
        transform={`translate(${g.target.x} ${g.target.y})`}
      />

      {/* Cursor (tip at local 0,0) */}
      <g data-part="cursor" transform={`translate(${g.cursor.click.x} ${g.cursor.click.y})`}>
        <path className={styles.cursor} d="M0 0 L0 17 L4.6 12.8 L7.6 19.6 L10.4 18.4 L7.4 11.6 L13 11.6 Z" />
      </g>

      <text className={styles.illus} x={g.illusLabel.x} y={g.illusLabel.y} textAnchor="end">
        {lang === "ka" ? t.hero.illustration : t.hero.illustration.toUpperCase()}
      </text>
    </svg>
  );
});
