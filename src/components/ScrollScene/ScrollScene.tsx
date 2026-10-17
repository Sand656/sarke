"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollScene.module.css";

/**
 * Site-wide 3D backdrop: wireframe models placed along a path the camera flies through
 * as the page scrolls. Rotation is a mix of time (idle drift) and scroll (scroll-triggered).
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

// Placed along the flight path; x alternates sides so the reading column stays clear.
const BODIES: Body[] = [
  { model: monitor(2.6), pos: [-4.4, 0.6, 8], spin: [0.05, 0.22, 0], scroll: [0.4, 2.2, 0] },
  { model: icosahedron(1.1), pos: [4.6, -0.8, 13], spin: [0.18, 0.24, 0.05], scroll: [1.5, 2.5, 0.4], accent: true },
  { model: laptop(2.4), pos: [-4.8, -1.2, 19], spin: [0.04, 0.2, 0], scroll: [0.3, 2.8, 0] },
  { model: box(1.4, 1.4, 1.4), pos: [4.4, 1.2, 25], spin: [0.2, 0.15, 0.1], scroll: [2, 1.6, 0.6] },
  { model: rings(1.2), pos: [-4.2, 1.0, 31], spin: [0.25, 0.3, 0], scroll: [1.2, 2, 0], accent: true },
  { model: monitor(3), pos: [4.8, 0.2, 37], spin: [0.05, -0.2, 0], scroll: [0.3, -2.4, 0] },
  { model: octahedron(1.2), pos: [-4.6, -0.9, 43], spin: [0.2, 0.3, 0.1], scroll: [1.6, 2.4, 0.5] },
  { model: laptop(2.6), pos: [4.5, -1.3, 49], spin: [0.04, -0.22, 0], scroll: [0.3, -2.6, 0] },
  { model: icosahedron(1.3), pos: [-4.3, 0.9, 55], spin: [0.15, 0.2, 0.08], scroll: [1.4, 2, 0.4] },
  { model: box(2, 1.1, 1.1), pos: [4.4, 0.6, 61], spin: [0.12, 0.25, 0], scroll: [1, 2.2, 0], accent: true },
  { model: rings(1.4), pos: [-4.6, -0.4, 67], spin: [0.2, 0.25, 0], scroll: [1.4, 1.8, 0] },
];
const PATH_START = 4;
const PATH_END = 64;

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

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function ScrollScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let w = 0, h = 0, raf = 0;
    let camZ = PATH_START;
    let lastScroll = window.scrollY;
    let velocity = 0;
    let spinBoost = 0;
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

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const t = (now - start) / 1000;
      const max = Math.max(1, document.documentElement.scrollHeight - h);
      const progress = Math.min(1, window.scrollY / max);

      // Camera glides toward its scroll position (extra smoothing on top of Lenis)
      camZ += (PATH_START + progress * (PATH_END - PATH_START) - camZ) * 0.08;
      velocity += (window.scrollY - lastScroll - velocity) * 0.1;
      lastScroll = window.scrollY;
      spinBoost += velocity * 0.0004;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      // Fade in once the hero (which has its own field) is mostly scrolled past
      canvas!.style.opacity = String(smoothstep(h * 0.25, h * 0.8, window.scrollY));

      ctx!.clearRect(0, 0, w, h);
      const f = Math.min(w * 0.9, h * 1.1);
      const cx = w / 2 + pointer.x * 30;
      const cy = h / 2 + pointer.y * 20;
      const camX = pointer.x * 0.5 + Math.sin(t * 0.13) * 0.25;
      const camY = -pointer.y * 0.3 + Math.sin(t * 0.11) * 0.15;
      // Narrow screens: push models further out so they frame the content
      const spread = w < 640 ? 0.75 : 1;

      ctx!.lineWidth = 1;
      for (const b of BODIES) {
        const rz = b.pos[2] - camZ;
        if (rz < 0.6 || rz > 26) continue;
        const alpha = smoothstep(0.6, 3, rz) * (1 - smoothstep(14, 26, rz));
        if (alpha <= 0.01) continue;
        const angle: V3 = [
          t * b.spin[0] + progress * b.scroll[0] + spinBoost * 0.3,
          t * b.spin[1] + progress * b.scroll[1] + spinBoost,
          t * b.spin[2] + progress * b.scroll[2],
        ];
        const bob = Math.sin(t * 0.6 + b.pos[2]) * 0.15;
        const pts = b.model.verts.map((v) => {
          const [x, y, z] = rotate(v, angle);
          const Z = rz + z;
          return Z <= 0.2
            ? null
            : { x: cx + ((x + b.pos[0] * spread - camX) / Z) * f, y: cy - ((y + b.pos[1] + bob - camY) / Z) * f };
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

        // Vertex dots
        ctx!.fillStyle = b.accent ? colors.accent : colors.line;
        ctx!.globalAlpha = alpha * 0.7;
        for (const p of pts) if (p) ctx!.fillRect(p.x - 1, p.y - 1, 2, 2);
      }
      ctx!.globalAlpha = 1;
    }

    readColors();
    resize();
    raf = requestAnimationFrame(frame);

    const onResize = () => resize();
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / innerHeight) * 2 - 1;
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    addEventListener("resize", onResize);
    addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
