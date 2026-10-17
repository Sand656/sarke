"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/motion";
import styles from "./ScrollScene.module.css";

/**
 * Site-wide 3D backdrop: wireframe models floating through an endless tunnel. They drift
 * toward the viewer all the time, scrolling flies the camera faster and spins them, and a
 * warp intro plays on load and whenever you return to the top. Motion off: a still frame.
 * Plain canvas 2D, fixed behind the content.
 */

type V3 = [number, number, number];
type Model = { verts: V3[]; edges: [number, number][] };

// ---------- Model builders ----------
function box(w: number, h: number, d: number): Model {
  const x = w / 2, y = h / 2, z = d / 2;
  const verts: V3[] = [
    [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
    [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z],
  ];
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  return { verts, edges };
}

function octahedron(r: number): Model {
  const verts: V3[] = [[r, 0, 0], [-r, 0, 0], [0, r, 0], [0, -r, 0], [0, 0, r], [0, 0, -r]];
  const edges: [number, number][] = [];
  for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) if (Math.floor(a / 2) !== Math.floor(b / 2)) edges.push([a, b]);
  return { verts, edges };
}

function icosahedron(r: number): Model {
  const p = (1 + Math.sqrt(5)) / 2;
  const raw: V3[] = [
    [-1, p, 0], [1, p, 0], [-1, -p, 0], [1, -p, 0], [0, -1, p], [0, 1, p],
    [0, -1, -p], [0, 1, -p], [p, 0, -1], [p, 0, 1], [-p, 0, -1], [-p, 0, 1],
  ];
  const k = r / Math.hypot(1, p);
  const verts = raw.map(([x, y, z]) => [x * k, y * k, z * k] as V3);
  const edges: [number, number][] = [];
  for (let a = 0; a < 12; a++)
    for (let b = a + 1; b < 12; b++) {
      const d = Math.hypot(raw[a][0] - raw[b][0], raw[a][1] - raw[b][1], raw[a][2] - raw[b][2]);
      if (Math.abs(d - 2) < 0.01) edges.push([a, b]);
    }
  return { verts, edges };
}

function rings(r: number, n = 28): Model {
  const verts: V3[] = [];
  const edges: [number, number][] = [];
  for (let ring = 0; ring < 2; ring++) {
    const base = verts.length;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      verts.push(ring === 0 ? [Math.cos(a) * r, Math.sin(a) * r, 0] : [Math.cos(a) * r, 0, Math.sin(a) * r]);
      edges.push([base + i, base + ((i + 1) % n)]);
    }
  }
  return { verts, edges };
}

function monitor(w: number): Model {
  const h = w * 0.5625, x = w / 2, y = h / 2;
  const verts: V3[] = [
    [-x, -y + 0.4, 0], [x, -y + 0.4, 0], [x, y + 0.4, 0], [-x, y + 0.4, 0], // screen
    [-x * 0.9, -y * 0.8 + 0.4, 0], [x * 0.9, -y * 0.8 + 0.4, 0], [x * 0.9, y * 0.8 + 0.4, 0], [-x * 0.9, y * 0.8 + 0.4, 0], // panel
    [0, -y + 0.4, 0], [0, -y - 0.3, 0], [-0.5, -y - 0.3, 0.3], [0.5, -y - 0.3, 0.3], [0, -y - 0.3, -0.4], // stand
  ];
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [8, 9], [9, 10], [9, 11], [9, 12],
  ];
  return { verts, edges };
}

function laptop(w: number): Model {
  const d = w * 0.65, x = w / 2, lid = w * 0.62, tilt = 0.32;
  const ly = Math.cos(tilt) * lid, lz = -Math.sin(tilt) * lid - d / 2;
  const verts: V3[] = [
    [-x, 0, -d / 2], [x, 0, -d / 2], [x, 0, d / 2], [-x, 0, d / 2], // base
    [-x, ly, lz], [x, ly, lz], // lid top
    [-x * 0.6, 0, d * 0.1], [x * 0.6, 0, d * 0.1], [x * 0.6, 0, d * 0.4], [-x * 0.6, 0, d * 0.4], // keyboard
  ];
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 5], [4, 5], [6, 7], [7, 8], [8, 9], [9, 6],
  ];
  return { verts, edges };
}

type Body = { model: Model; pos: V3; spin: V3; scroll: V3; accent?: boolean };

// An endless tunnel: z positions loop over RANGE, so models are always floating in view.
// x/y keep to the sides and corners so the reading column stays clear.
const RANGE = 66;
const BODIES: Body[] = [
  { model: monitor(2.6), pos: [-4.6, 0.7, 0], spin: [0.05, 0.22, 0], scroll: [0.4, 2.2, 0] },
  { model: icosahedron(1.1), pos: [4.7, -0.9, 6], spin: [0.18, 0.24, 0.05], scroll: [1.5, 2.5, 0.4], accent: true },
  { model: laptop(2.4), pos: [-4.9, -1.4, 12], spin: [0.04, 0.2, 0], scroll: [0.3, 2.8, 0] },
  { model: box(1.4, 1.4, 1.4), pos: [4.4, 1.5, 18], spin: [0.2, 0.15, 0.1], scroll: [2, 1.6, 0.6] },
  { model: rings(1.2), pos: [-4.1, 1.6, 24], spin: [0.25, 0.3, 0], scroll: [1.2, 2, 0], accent: true },
  { model: monitor(3), pos: [4.9, 0.1, 30], spin: [0.05, -0.2, 0], scroll: [0.3, -2.4, 0] },
  { model: octahedron(1.2), pos: [-4.6, -1.1, 36], spin: [0.2, 0.3, 0.1], scroll: [1.6, 2.4, 0.5] },
  { model: laptop(2.6), pos: [4.6, -1.5, 42], spin: [0.04, -0.22, 0], scroll: [0.3, -2.6, 0] },
  { model: icosahedron(1.3), pos: [-4.3, 1.2, 48], spin: [0.15, 0.2, 0.08], scroll: [1.4, 2, 0.4] },
  { model: box(2, 1.1, 1.1), pos: [4.5, 0.8, 54], spin: [0.12, 0.25, 0], scroll: [1, 2.2, 0], accent: true },
  { model: rings(1.4), pos: [-4.7, -0.5, 60], spin: [0.2, 0.25, 0], scroll: [1.4, 1.8, 0] },
];
const NEAR = 1.2;
const DRIFT = 0.45; // world units per second: the idle float toward the viewer
const SCROLL_FLY = 0.006; // world units per scrolled pixel
const INTRO_MS = 2200;
const STREAKS = 28;

function rotate([x, y, z]: V3, [ax, ay, az]: V3): V3 {
  let cy = Math.cos(ax), sy = Math.sin(ax);
  [y, z] = [y * cy - z * sy, y * sy + z * cy];
  cy = Math.cos(ay);
  sy = Math.sin(ay);
  [x, z] = [x * cy + z * sy, -x * sy + z * cy];
  cy = Math.cos(az);
  sy = Math.sin(az);
  [x, y] = [x * cy - y * sy, x * sy + y * cy];
  return [x, y, z];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function ScrollScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0, h = 0, raf = 0;
    let camZ = 0;
    let lastScroll = window.scrollY;
    let velocity = 0;
    let spinBoost = 0;
    let introStart = performance.now();
    let wasAway = window.scrollY > innerHeight * 0.6;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let colors = { line: "#8a8a92", accent: "#ff5a1f" };
    const start = performance.now();

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors = { line: cs.getPropertyValue("--text-lo").trim(), accent: cs.getPropertyValue("--accent").trim() };
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    function draw(now: number, still: boolean) {
      const t = (now - start) / 1000;
      const scrollY = window.scrollY;

      if (!still) {
        // Back at the top after being away: replay the warp intro
        if (scrollY > h * 0.6) wasAway = true;
        else if (wasAway && scrollY < 8) {
          wasAway = false;
          introStart = now;
        }
        const target = t * DRIFT + scrollY * SCROLL_FLY;
        camZ += (target - camZ) * 0.08; // extra glide on top of Lenis
        velocity += (scrollY - lastScroll - velocity) * 0.1;
        spinBoost += velocity * 0.0004;
        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;
      } else {
        camZ = scrollY * SCROLL_FLY;
      }
      lastScroll = scrollY;

      const introRaw = still ? 1 : clamp01((now - introStart) / INTRO_MS);
      const progress = Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - h));
      // Quieter behind the hero, which has its own 3D field
      const zoneAlpha = 0.6 + 0.4 * smoothstep(0, h * 0.7, scrollY);

      ctx!.clearRect(0, 0, w, h);
      const f = Math.min(w * 0.9, h * 1.1);
      const cx = w / 2 + pointer.x * 30;
      const cy = h / 2 + pointer.y * 20;
      const camX = pointer.x * 0.5 + (still ? 0 : Math.sin(t * 0.13) * 0.25);
      const camY = -pointer.y * 0.3 + (still ? 0 : Math.sin(t * 0.11) * 0.15);
      const spread = w < 640 ? 0.75 : 1;

      // Warp streaks radiating from the vanishing point during the intro
      if (introRaw < 1) {
        const k = 1 - easeOutExpo(introRaw);
        ctx!.strokeStyle = colors.line;
        ctx!.globalAlpha = 0.35 * k;
        ctx!.beginPath();
        for (let i = 0; i < STREAKS; i++) {
          const a = (i / STREAKS) * Math.PI * 2 + i * 0.37;
          const r0 = (60 + ((i * 53) % 90)) * (1 + introRaw * 6);
          const r1 = r0 + 120 + ((i * 31) % 160);
          ctx!.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          ctx!.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        }
        ctx!.stroke();
      }

      ctx!.lineWidth = 1;
      BODIES.forEach((b, index) => {
        // Staggered burst out of the vanishing point
        const intro = still ? 1 : easeOutExpo(clamp01((now - introStart - index * 70) / (INTRO_MS - 600)));

        const rel = (((b.pos[2] - camZ) % RANGE) + RANGE) % RANGE;
        const rz = rel + NEAR + (1 - intro) * 10;
        const alpha = smoothstep(NEAR, NEAR + 2.5, rz) * (1 - smoothstep(26, 40, rz)) * intro * zoneAlpha;
        if (alpha <= 0.01) return;

        const angle: V3 = [
          t * b.spin[0] + progress * b.scroll[0] + spinBoost * 0.3 + (1 - intro) * 2.5,
          t * b.spin[1] + progress * b.scroll[1] + spinBoost + (1 - intro) * 4,
          t * b.spin[2] + progress * b.scroll[2],
        ];
        const bob = still ? 0 : Math.sin(t * 0.6 + b.pos[2]) * 0.18;
        const px = b.pos[0] * spread * intro;
        const py = (b.pos[1] + bob) * intro;
        const pts = b.model.verts.map((v) => {
          const [x, y, z] = rotate(v, angle);
          const Z = rz + z;
          return Z <= 0.2 ? null : { x: cx + ((x + px - camX) / Z) * f, y: cy - ((y + py - camY) / Z) * f };
        });

        ctx!.strokeStyle = b.accent ? colors.accent : colors.line;
        ctx!.globalAlpha = alpha * (b.accent ? 0.55 : 0.5);
        ctx!.beginPath();
        for (const [i, j] of b.model.edges) {
          const p = pts[i], q = pts[j];
          if (!p || !q) continue;
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(q.x, q.y);
        }
        ctx!.stroke();

        ctx!.fillStyle = b.accent ? colors.accent : colors.line;
        ctx!.globalAlpha = alpha * 0.7;
        for (const p of pts) if (p) ctx!.fillRect(p.x - 1, p.y - 1, 2, 2);
      });
      ctx!.globalAlpha = 1;
    }

    const loop = (now: number) => {
      draw(now, false);
      raf = requestAnimationFrame(loop);
    };
    const drawStill = () => draw(performance.now(), true);

    readColors();
    resize();
    if (reduced) drawStill();
    else raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      if (reduced) drawStill();
    };
    const onScroll = () => reduced && drawStill();
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / innerHeight) * 2 - 1;
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };
    const mo = new MutationObserver(() => {
      readColors();
      if (reduced) drawStill();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    addEventListener("resize", onResize);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
