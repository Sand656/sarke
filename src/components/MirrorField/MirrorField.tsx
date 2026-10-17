"use client";

import { useEffect, useRef } from "react";
import styles from "./MirrorField.module.css";

/**
 * 3D hero background ("sarke" = mirror): a wireframe floor receding to the horizon,
 * its reflection on the ceiling, and floating screens reflected in the floor.
 * Plain canvas 2D with a hand-rolled perspective projection — no WebGL dependency.
 */

type Screen = { x: number; y: number; z: number; w: number; h: number; spin: number; phase: number; accent: boolean };

const SCREENS: Screen[] = [
  { x: 3.2, y: 0.2, z: 9, w: 2.4, h: 1.35, spin: 0.18, phase: 0, accent: false },
  { x: 6.2, y: -0.15, z: 14, w: 3.2, h: 1.8, spin: -0.12, phase: 1.7, accent: true },
  { x: -1.2, y: 0.55, z: 19, w: 2.2, h: 1.24, spin: 0.1, phase: 3.1, accent: false },
  { x: 1.2, y: 0.9, z: 22, w: 2.8, h: 1.58, spin: -0.08, phase: 4.4, accent: false },
];

const CAM_H = 1.6; // camera height above the floor
const FAR = 40;
const SPACING = 1.6;

function readColors(el: Element) {
  const cs = getComputedStyle(el);
  return {
    line: cs.getPropertyValue("--text-lo").trim() || "#8a8a92",
    strong: cs.getPropertyValue("--text-mid").trim() || "#b4b4ba",
    accent: cs.getPropertyValue("--accent").trim() || "#ff5a1f",
  };
}

export function MirrorField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let colors = readColors(canvas);
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let visible = true;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const start = performance.now();

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(t: number) {
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      ctx!.clearRect(0, 0, w, h);
      // Idle drift: the camera sways slowly even when nothing else moves
      const swayX = Math.sin(t * 0.21) * 0.7 + Math.sin(t * 0.07) * 0.4;
      const swayY = Math.sin(t * 0.17) * 10;
      // Scroll parallax: the horizon sinks as the hero scrolls away
      const scrolled = Math.min(window.scrollY, h);
      const f = Math.min(w, h * 1.6) * 0.9; // focal length
      const cx = w * 0.62 + pointer.x * 40 + swayX * 18;
      const horizon = h * 0.52 + pointer.y * 24 + swayY + scrolled * 0.35;
      const camX = pointer.x * 1.2 + swayX;
      const travel = (t * 0.9 + scrolled * 0.004) % SPACING;

      const project = (x: number, y: number, z: number) => ({
        x: cx + ((x - camX) / z) * f,
        y: horizon - (y / z) * f,
      });
      const depthAlpha = (z: number) => Math.max(0, 1 - z / FAR) ** 1.6;

      ctx!.lineWidth = 1;

      // Floor (y = -CAM_H) and its mirror on the ceiling (y = +CAM_H)
      for (const mirror of [1, -1]) {
        const y = -CAM_H * mirror;
        const fade = mirror === 1 ? 0.55 : 0.28;

        // Lines running toward the horizon
        const grad = ctx!.createLinearGradient(0, horizon, 0, mirror === 1 ? h : 0);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, colors.line);
        ctx!.strokeStyle = grad;
        ctx!.globalAlpha = fade;
        ctx!.beginPath();
        for (let i = -14; i <= 14; i++) {
          const x = i * SPACING;
          const a = project(x, y, 0.6);
          const b = project(x, y, FAR);
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
        }
        ctx!.stroke();

        // Cross lines drifting toward the camera
        ctx!.strokeStyle = colors.line;
        for (let z = SPACING - travel; z < FAR; z += SPACING) {
          if (z < 0.6) continue;
          ctx!.globalAlpha = fade * depthAlpha(z);
          const a = project(-14 * SPACING, y, z);
          const b = project(14 * SPACING, y, z);
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      // Horizon line
      ctx!.globalAlpha = 0.35;
      ctx!.strokeStyle = colors.strong;
      ctx!.beginPath();
      ctx!.moveTo(0, horizon);
      ctx!.lineTo(w, horizon);
      ctx!.stroke();

      // Floating screens + reflections
      for (const s of SCREENS) {
        const angle = Math.sin(t * s.spin * 2 + s.phase) * 0.7 + scrolled * 0.0015;
        const bob = Math.sin(t * 0.8 + s.phase) * 0.18;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const corners = [
          [-s.w / 2, -s.h / 2],
          [s.w / 2, -s.h / 2],
          [s.w / 2, s.h / 2],
          [-s.w / 2, s.h / 2],
        ].map(([dx, dy]) => ({ x: s.x + dx * cos, y: s.y + bob + dy, z: s.z + dx * sin }));

        for (const reflect of [false, true]) {
          const pts = corners.map((c) => project(c.x, reflect ? -2 * CAM_H - c.y : c.y, c.z));
          const alpha = depthAlpha(s.z) * (reflect ? 0.22 : 0.9);
          ctx!.globalAlpha = alpha;
          ctx!.strokeStyle = s.accent ? colors.accent : colors.strong;
          ctx!.beginPath();
          pts.forEach((p, i) => (i ? ctx!.lineTo(p.x, p.y) : ctx!.moveTo(p.x, p.y)));
          ctx!.closePath();
          ctx!.stroke();
          if (!reflect) {
            // Title bar + a few "code" lines
            const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, k: number) => ({
              x: a.x + (b.x - a.x) * k,
              y: a.y + (b.y - a.y) * k,
            });
            ctx!.globalAlpha = alpha * 0.6;
            ctx!.beginPath();
            const l = lerp(pts[3], pts[0], 0.86);
            const r = lerp(pts[2], pts[1], 0.86);
            ctx!.moveTo(l.x, l.y);
            ctx!.lineTo(r.x, r.y);
            for (let k = 0; k < 4; k++) {
              const row = 0.66 - k * 0.15;
              const a = lerp(lerp(pts[3], pts[0], row), lerp(pts[2], pts[1], row), 0.1);
              const b = lerp(lerp(pts[3], pts[0], row), lerp(pts[2], pts[1], row), 0.35 + ((k * 37) % 40) / 100);
              ctx!.moveTo(a.x, a.y);
              ctx!.lineTo(b.x, b.y);
            }
            ctx!.stroke();
          }
        }
      }
      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      draw((now - start) / 1000);
      raf = running ? requestAnimationFrame(loop) : 0;
    }
    function play() {
      if (reduced || running || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function pause() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    draw(4);
    play();

    const ro = new ResizeObserver(() => {
      resize();
      draw((performance.now() - start) / 1000);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVisibility);

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Recolor when the theme changes
    const mo = new MutationObserver(() => {
      colors = readColors(canvas);
      if (!running) draw((performance.now() - start) / 1000);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      pause();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
