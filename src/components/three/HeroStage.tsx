"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { easeInOut, track, type Key } from "./choreo";
import { aluminium, glass, makeKeyboard, makeShadow } from "./materials";

/**
 * The hero: a display and a laptop floating side by side, turned toward each other like an open
 * book. Sarke's story plays with real 3D objects: the cursor leaves one screen and flies across the
 * gap, carries a window over to the laptop, then brings a file back. (How it works tells the same
 * story on the desk, driven by scroll; this one loops, with its own staging.)
 *
 * Same budget as DeskStage: one draw pass, everything painted once, adaptive resolution, and no
 * rendering while the stage is off screen.
 */

const LOOP = 12; // seconds

// The two screens' glass, in world units: display (0) and laptop (1)
const SCREENS = [
  { w: 3.22, h: 1.81 },
  { w: 2.8, h: 1.575 },
];

/* ---------- Choreography ---------- */

type Anchor = { s: 0 | 1; u: number; v: number }; // a point on a screen, u/v from its top-left
type Seg = [t0: number, t1: number, from: Anchor, to: Anchor];
type At = { from: Anchor; to: Anchor; k: number };

const REST: Anchor = { s: 0, u: 0.66, v: 0.68 };
const WIN_A: Anchor = { s: 0, u: 0.3, v: 0.28 }; // the window's title bar, at home on the display
const WIN_B: Anchor = { s: 1, u: 0.36, v: 0.3 };
const FILE_B: Anchor = { s: 1, u: 0.86, v: 0.74 };
const FILE_A: Anchor = { s: 0, u: 0.22, v: 0.74 };

// The window flies over to the laptop, the file flies back, then both quietly go home.
const CURSOR: Seg[] = [
  [0.8, 1.6, REST, WIN_A],
  [1.9, 4.4, WIN_A, WIN_B],
  [4.8, 5.6, WIN_B, FILE_B],
  [5.9, 8.2, FILE_B, FILE_A],
  [8.6, 9.8, FILE_A, REST],
];
const WINDOW: Seg[] = [
  [1.9, 4.4, WIN_A, WIN_B],
  [11, 11, WIN_B, WIN_A],
];
const FILE: Seg[] = [
  [5.9, 8.2, FILE_B, FILE_A],
  [11, 11, FILE_A, FILE_B],
];
const PRESS: Key[] = [[1.6, 0], [1.8, 1], [4.4, 1], [4.6, 0], [5.6, 0], [5.8, 1], [8.2, 1], [8.4, 0]];
const WIN_LIFT: Key[] = [[1.6, 0], [2, 1], [4.2, 1], [4.6, 0]];
const FILE_LIFT: Key[] = [[5.6, 0], [6, 1], [8, 1], [8.4, 0]];
const RESET: Key[] = [[10.4, 1], [11, 0], [11.6, 1]]; // opacity while window and file go home

/** Where a moving thing is along its segments at time t, holding still between them. */
function along(segs: Seg[], t: number): At {
  let last = segs[0][2];
  for (const [t0, t1, from, to] of segs) {
    if (t < t0) break;
    if (t <= t1 && t1 > t0) return { from, to, k: easeInOut((t - t0) / (t1 - t0)) };
    last = to;
  }
  return { from: last, to: last, k: 0 };
}

const ARC = new THREE.Vector3(0, 0.45, 1.6); // flights bow up and toward the camera
const X_AXIS = new THREE.Vector3(1, 0, 0);
const NO_TURN = new THREE.Quaternion();
const _p0 = new THREE.Vector3();
const _p2 = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _qa = new THREE.Quaternion();
const _qb = new THREE.Quaternion();

function onScreen(screens: THREE.Object3D[], s: 0 | 1, u: number, v: number, off: number, out: THREE.Vector3) {
  const { w, h } = SCREENS[s];
  return screens[s].localToWorld(out.set((u - 0.5) * w, (0.5 - v) * h, off));
}

/**
 * World position and orientation at `at`, `off` in front of the glass. Between screens it follows
 * an arc through the air; returns how far into such a flight it is (0 → 1 → 0).
 */
function place(screens: THREE.Object3D[], at: At, off: number, pos: THREE.Vector3, quat: THREE.Quaternion) {
  const { from, to, k } = at;
  if (from.s === to.s) {
    onScreen(screens, from.s, THREE.MathUtils.lerp(from.u, to.u, k), THREE.MathUtils.lerp(from.v, to.v, k), off, pos);
    screens[from.s].getWorldQuaternion(quat);
    return 0;
  }
  onScreen(screens, from.s, from.u, from.v, off, _p0);
  onScreen(screens, to.s, to.u, to.v, off, _p2);
  _mid.addVectors(_p0, _p2).multiplyScalar(0.5).add(ARC);
  const a = (1 - k) * (1 - k);
  const b = 2 * (1 - k) * k;
  const c = k * k;
  pos.set(0, 0, 0).addScaledVector(_p0, a).addScaledVector(_mid, b).addScaledVector(_p2, c);
  quat.slerpQuaternions(screens[from.s].getWorldQuaternion(_qa), screens[to.s].getWorldQuaternion(_qb), k);
  return Math.sin(k * Math.PI);
}

/* ---------- Art, painted once ---------- */

const RES = 2;
const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

function paint(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w * RES;
  c.height = h * RES;
  const g = c.getContext("2d")!;
  g.scale(RES, RES);
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
}

// Wallpapers from the same family as the desk's screens
const WALLS = [
  { top: "#3d5a9e", bottom: "#0d1222", glow: "#6f8fd8", name: "DESKTOP-A" },
  { top: "#2f6f86", bottom: "#0a161d", glow: "#5fa9c2", name: "LAPTOP" },
];

function paintScreen(i: number) {
  const { top, bottom, glow, name } = WALLS[i];
  return paint(1024, 576, (g) => {
    const lg = g.createLinearGradient(0, 0, 0, 576);
    lg.addColorStop(0, top);
    lg.addColorStop(1, bottom);
    g.fillStyle = lg;
    g.fillRect(0, 0, 1024, 576);
    const rg = g.createRadialGradient(300, 110, 0, 300, 110, 560);
    rg.addColorStop(0, `${glow}99`);
    rg.addColorStop(1, `${glow}00`);
    g.fillStyle = rg;
    g.fillRect(0, 0, 1024, 576);
    g.fillStyle = "rgba(255,255,255,0.5)";
    g.font = "600 13px ui-monospace, 'Cascadia Mono', Consolas, monospace";
    g.fillText(name, 26, 34);
    // Dock
    const n = 5;
    const size = 26;
    const gap = 10;
    const dw = n * size + (n - 1) * gap + 24;
    const dx = (1024 - dw) / 2;
    const dy = 576 - 58;
    g.fillStyle = "rgba(10,12,20,0.45)";
    g.beginPath();
    g.roundRect(dx, dy, dw, size + 20, 14);
    g.fill();
    for (let k = 0; k < n; k++) {
      g.fillStyle = k === 0 ? "#2997ff" : "rgba(255,255,255,0.78)";
      g.beginPath();
      g.roundRect(dx + 12 + k * (size + gap), dy + 10, size, size, 7);
      g.fill();
    }
  });
}

const CARD = { w: 1.25, h: 0.78 }; // the window, in world units (500 × 312 px of art)
const GRAB = new THREE.Vector3(0.42, -0.31, -0.012); // card centre from where the cursor holds it

function paintWindow() {
  return paint(500, 312, (g) => {
    g.fillStyle = "#16171c";
    g.beginPath();
    g.roundRect(0, 0, 500, 312, 14);
    g.fill();
    g.fillStyle = "#1f2027";
    g.beginPath();
    g.roundRect(0, 0, 500, 34, [14, 14, 0, 0]);
    g.fill();
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      g.fillStyle = c;
      g.beginPath();
      g.arc(18 + i * 18, 17, 5, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = "rgba(255,255,255,0.72)";
    g.font = `600 13px ${FONT}`;
    g.textAlign = "center";
    g.fillText("Studio · poster.png", 250, 22);
    // The artwork
    const art = g.createLinearGradient(16, 48, 316, 296);
    art.addColorStop(0, "#7d8ff0");
    art.addColorStop(1, "#3b3f9c");
    g.fillStyle = art;
    g.beginPath();
    g.roundRect(16, 48, 300, 248, 10);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.92)";
    g.beginPath();
    g.arc(110, 140, 42, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.beginPath();
    g.roundRect(170, 200, 110, 50, 10);
    g.fill();
    // Side panel
    for (let r = 0; r < 4; r++) {
      g.fillStyle = r === 0 ? "#2997ff" : "#2c2d33";
      g.beginPath();
      g.roundRect(332, 52 + r * 36, 24, 24, 6);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.16)";
      g.beginPath();
      g.roundRect(366, 60 + r * 36, 70 + ((r * 37) % 50), 8, 4);
      g.fill();
    }
    for (let r = 0; r < 4; r++) {
      g.fillStyle = r === 1 ? "rgba(41,151,255,0.7)" : "rgba(255,255,255,0.14)";
      g.beginPath();
      g.roundRect(332, 210 + r * 20, 90 + ((r * 41) % 60), 7, 3.5);
      g.fill();
    }
  });
}

const FILE_SIZE = 0.26;

/** White document glyph and name, laid over the file's blue tile. */
function paintFile() {
  return paint(128, 128, (g) => {
    const x = 40;
    const y = 22;
    const w = 48;
    const h = 62;
    const fold = 14;
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + w - fold, y);
    g.lineTo(x + w, y + fold);
    g.lineTo(x + w, y + h);
    g.lineTo(x, y + h);
    g.closePath();
    g.fill();
    g.fillStyle = "#2b7de9";
    for (let r = 0; r < 3; r++) g.fillRect(x + 9, y + 26 + r * 10, r === 2 ? 18 : 30, 4);
    g.fillStyle = "rgba(255,255,255,0.95)";
    g.font = `700 13px ${FONT}`;
    g.textAlign = "center";
    g.fillText("deck.pdf", 64, 108);
  });
}

function paintGlow(rgb: string, alpha: number) {
  return paint(128, 128, (g) => {
    const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    rg.addColorStop(0, `rgba(${rgb},${alpha})`);
    rg.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = rg;
    g.fillRect(0, 0, 128, 128);
  });
}

/** The pointer: an extruded arrow, tip at the origin. Its bevel reads as the dark outline. */
function makeCursorGeometry() {
  const s = 0.23;
  const outline: [number, number][] = [[0, 0], [0, 0.82], [0.2, 0.64], [0.34, 0.95], [0.47, 0.89], [0.33, 0.59], [0.6, 0.59]];
  const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x * s, -y * s)));
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.01,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.006,
    bevelSegments: 2,
    curveSegments: 1,
  });
}

/* ---------- Devices ---------- */

type ScreenProps = {
  wall: THREE.Texture;
  screenRef: (m: THREE.Mesh | null) => void;
  edgeRef: (m: THREE.MeshBasicMaterial | null) => void;
};

/** A display panel, floating without its stand. */
function Display({ wall, screenRef, edgeRef }: ScreenProps) {
  const { w, h } = SCREENS[0];
  return (
    <group>
      <RoundedBox args={[3.4, 2, 0.09]} radius={0.04} smoothness={8}>
        <meshStandardMaterial {...aluminium} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0455]}>
        <planeGeometry args={[3.34, 1.94]} />
        <meshStandardMaterial {...glass} />
      </mesh>
      <mesh ref={screenRef} position={[0, 0.01, 0.046]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={wall} toneMapped={false} />
      </mesh>
      {/* The edge facing the laptop, lit while something crosses */}
      <mesh position={[w / 2 - 0.012, 0.01, 0.047]}>
        <planeGeometry args={[0.024, h]} />
        <meshBasicMaterial ref={edgeRef} color="#2997ff" transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Laptop({ wall, keyboard, screenRef, edgeRef }: ScreenProps & { keyboard: THREE.Texture }) {
  const { w, h } = SCREENS[1];
  return (
    <group>
      <RoundedBox args={[3, 0.06, 2.05]} radius={0.028} smoothness={8} position={[0, 0.03, 0]}>
        <meshStandardMaterial {...aluminium} />
      </RoundedBox>
      <mesh position={[0, 0.0605, 0.02]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.9, 1.59]} />
        <meshStandardMaterial map={keyboard} metalness={0.4} roughness={0.55} />
      </mesh>
      {/* Lid, hinged at the back edge */}
      <group position={[0, 0.06, -1.0]} rotation-x={-0.26}>
        <RoundedBox args={[3, 1.92, 0.04]} radius={0.025} smoothness={8} position={[0, 0.96, -0.02]}>
          <meshStandardMaterial {...aluminium} />
        </RoundedBox>
        <mesh position={[0, 0.96, 0.0005]}>
          <planeGeometry args={[2.94, 1.86]} />
          <meshStandardMaterial {...glass} />
        </mesh>
        <mesh ref={screenRef} position={[0, 0.99, 0.001]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={wall} toneMapped={false} />
        </mesh>
        <mesh position={[-w / 2 + 0.012, 0.99, 0.0016]}>
          <planeGeometry args={[0.024, h]} />
          <meshBasicMaterial ref={edgeRef} color="#2997ff" transparent opacity={0} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Fade a carried object; its glow (named "glow") only shows while it's lifted. */
function fade(group: THREE.Object3D, opacity: number, lift: number) {
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) (o.material as THREE.Material).opacity = o.name === "glow" ? opacity * lift * 0.85 : opacity;
  });
}

const TRAIL = 22;

function Scene() {
  const [art] = useState(() => ({
    walls: [paintScreen(0), paintScreen(1)],
    window: paintWindow(),
    file: paintFile(),
    glow: paintGlow("41,151,255", 0.55),
    halo: paintGlow("70,110,200", 0.28),
    keyboard: makeKeyboard(),
    shadow: makeShadow(),
  }));
  const [cursorGeometry] = useState(makeCursorGeometry);
  // Extrusion groups: 0 = the faces (white), 1 = the sides and bevel (the dark outline)
  const [cursorMaterials] = useState(() => [
    new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.5, roughness: 0.35 }),
    new THREE.MeshStandardMaterial({ color: "#0b0b0d", roughness: 0.5 }),
  ]);

  const display = useRef<THREE.Group>(null);
  const laptop = useRef<THREE.Group>(null);
  const screens = useRef<THREE.Mesh[]>([]);
  const edges = useRef<THREE.MeshBasicMaterial[]>([]);
  const cursor = useRef<THREE.Group>(null);
  const card = useRef<THREE.Group>(null);
  const file = useRef<THREE.Group>(null);
  const trail = useRef<THREE.InstancedMesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const cam = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), cur: new THREE.Vector3(0, -0.1, 0) });
  const history = useMemo(() => Array.from({ length: TRAIL * 2 }, () => new THREE.Vector3()), []);
  const head = useRef(0);
  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      off: new THREE.Vector3(),
      tilt: new THREE.Quaternion(),
      scale: new THREE.Vector3(),
      matrix: new THREE.Matrix4(),
    }),
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      [...art.walls, art.window, art.file, art.glow, art.halo, art.keyboard, art.shadow].forEach((t) => t.dispose());
      cursorGeometry.dispose();
      cursorMaterials.forEach((m) => m.dispose());
    };
  }, [art, cursorGeometry, cursorMaterials]);

  useFrame((three, delta) => {
    const d = display.current;
    const l = laptop.current;
    if (!d || !l || !cursor.current || !card.current || !file.current) return;
    const time = three.clock.elapsedTime;
    const t = time % LOOP;

    // The two machines float gently, out of step with each other
    d.position.set(-1.95, 0.32 + Math.sin(time * 0.8) * 0.05, 0);
    d.rotation.set(-0.03, 0.5 + Math.sin(time * 0.35) * 0.02, 0);
    l.position.set(2.05, -0.78 + Math.sin(time * 0.8 + 1.7) * 0.05, 0.35);
    l.rotation.set(0.1, -0.54 + Math.sin(time * 0.35 + 1) * 0.02, 0);
    d.updateMatrixWorld(true);
    l.updateMatrixWorld(true);
    const scr = screens.current;
    const reset = track(RESET, t);

    // The window, held by its title bar
    const winLift = track(WIN_LIFT, t);
    place(scr, along(WINDOW, t), 0.012 + winLift * 0.2, tmp.pos, tmp.quat);
    card.current.position.copy(tmp.pos).add(tmp.off.copy(GRAB).applyQuaternion(tmp.quat));
    card.current.quaternion.copy(tmp.quat).multiply(tmp.tilt.setFromAxisAngle(X_AXIS, -0.12 * winLift));
    card.current.scale.setScalar((1 + 0.05 * winLift) * (0.92 + 0.08 * reset));
    fade(card.current, reset, winLift);

    // The file, which turns a little in flight
    const fileLift = track(FILE_LIFT, t);
    const spin = place(scr, along(FILE, t), 0.02 + fileLift * 0.2, tmp.pos, tmp.quat);
    file.current.position.copy(tmp.pos).add(tmp.off.set(0.02, -0.05, -0.012).applyQuaternion(tmp.quat));
    file.current.quaternion.copy(tmp.quat);
    file.current.rotateZ(spin * 0.35);
    file.current.scale.setScalar((1 + 0.12 * fileLift) * (0.9 + 0.1 * reset));
    fade(file.current, reset, fileLift);

    // The cursor, always just in front of what it carries
    const press = track(PRESS, t);
    const flight = place(scr, along(CURSOR, t), 0.035 + Math.max(winLift, fileLift) * 0.22, tmp.pos, tmp.quat);
    cursor.current.position.copy(tmp.pos);
    cursor.current.quaternion.copy(tmp.quat);
    cursor.current.scale.setScalar(1 - 0.15 * press);

    // Light trail behind it while it flies
    head.current = (head.current + 1) % history.length;
    history[head.current].copy(tmp.pos);
    const tr = trail.current;
    if (tr) {
      for (let i = 0; i < TRAIL; i++) {
        const p = history[(head.current - i * 2 + history.length * 2) % history.length];
        tmp.matrix.compose(p, NO_TURN, tmp.scale.setScalar(flight * (1 - i / TRAIL)));
        tr.setMatrixAt(i, tmp.matrix);
      }
      tr.instanceMatrix.needsUpdate = true;
    }

    // The facing edges light up while something crosses
    edges.current.forEach((m) => void (m.opacity = flight * 0.9));

    // Camera: a slow drift, nudged by the pointer; narrow frames back off to keep both in view
    const aspect = three.size.width / three.size.height;
    const c = cam.current;
    c.pos.set(
      Math.sin(time * 0.14) * 1.4 + pointer.current.x * 0.6,
      0.6 + Math.sin(time * 0.11) * 0.2 - pointer.current.y * 0.3,
      Math.max(10.5, 4.7 / (Math.tan(THREE.MathUtils.degToRad(15)) * aspect)),
    );
    c.look.set(0.15, -0.1, -0.2);
    const damp = 1 - Math.exp(-delta * 3);
    three.camera.position.lerp(c.pos, damp);
    c.cur.lerp(c.look, damp);
    three.camera.lookAt(c.cur);
  });

  const screenRef = (i: number) => (m: THREE.Mesh | null) => void (m && (screens.current[i] = m));
  const edgeRef = (i: number) => (m: THREE.MeshBasicMaterial | null) => void (m && (edges.current[i] = m));

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 6, 6]} intensity={1.1} />
      {/* Neutral studio: soft white boxes, computed once */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 6, 2]} scale={[12, 3, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[-7, 1, 3]} scale={[3, 7, 1]} rotation-y={Math.PI / 2.4} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[7, 1, 3]} scale={[3, 7, 1]} rotation-y={-Math.PI / 2.4} />
        <Lightformer form="rect" intensity={0.5} color="#9aa0aa" position={[0, -2, 8]} scale={[16, 4, 1]} />
      </Environment>

      {/* A soft blue halo behind the pair, and their shadows on an unseen floor */}
      {/* Smaller than the frame, so it fades out before the canvas edges */}
      <mesh position={[0.1, -0.1, -3]}>
        <planeGeometry args={[12, 5.6]} />
        <meshBasicMaterial map={art.halo} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {[
        [-1.95, 0, 3.8, 1.3],
        [2.25, 0.1, 3.8, 2.4],
      ].map(([x, z, w, dd]) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, -2.1, z]}>
          <planeGeometry args={[w, dd]} />
          <meshBasicMaterial map={art.shadow} transparent opacity={0.7} depthWrite={false} />
        </mesh>
      ))}

      <group ref={display}>
        <Display wall={art.walls[0]} screenRef={screenRef(0)} edgeRef={edgeRef(0)} />
      </group>
      <group ref={laptop}>
        <Laptop wall={art.walls[1]} keyboard={art.keyboard} screenRef={screenRef(1)} edgeRef={edgeRef(1)} />
      </group>

      <group ref={card}>
        <mesh name="glow" position={[0, 0, -0.03]}>
          <planeGeometry args={[CARD.w * 1.9, CARD.h * 2.1]} />
          <meshBasicMaterial map={art.glow} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <RoundedBox args={[CARD.w, CARD.h, 0.02]} radius={0.028} smoothness={4}>
          <meshStandardMaterial color="#16171c" metalness={0.3} roughness={0.4} transparent />
        </RoundedBox>
        <mesh position={[0, 0, 0.0105]}>
          <planeGeometry args={[CARD.w, CARD.h]} />
          <meshBasicMaterial map={art.window} transparent toneMapped={false} />
        </mesh>
      </group>

      <group ref={file}>
        <mesh name="glow" position={[0, 0, -0.03]}>
          <planeGeometry args={[FILE_SIZE * 3, FILE_SIZE * 3]} />
          <meshBasicMaterial map={art.glow} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <RoundedBox args={[FILE_SIZE, FILE_SIZE, 0.03]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#2b7de9" emissive="#1d5fd0" emissiveIntensity={0.35} metalness={0.2} roughness={0.35} transparent />
        </RoundedBox>
        <mesh position={[0, 0, 0.0155]}>
          <planeGeometry args={[FILE_SIZE, FILE_SIZE]} />
          <meshBasicMaterial map={art.file} transparent toneMapped={false} />
        </mesh>
      </group>

      <group ref={cursor}>
        <mesh position={[0.06, -0.1, -0.015]}>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial map={art.glow} transparent opacity={0.7} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh geometry={cursorGeometry} material={cursorMaterials} />
      </group>

      <instancedMesh ref={trail} args={[undefined, undefined, TRAIL]} frustumCulled={false}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshBasicMaterial color="#7cc0ff" toneMapped={false} />
      </instancedMesh>
    </>
  );
}

export default function HeroStage({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const active = useOnScreen(wrap);
  // Supersampled like DeskStage: 2× (up to 2.5× on high-DPI phones), stepping down when frames drop.
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [deviceDpr] = useState(() => (typeof window === "undefined" ? 1 : window.devicePixelRatio || 1));
  const dpr = quality === "high" ? Math.min(2.5, Math.max(2, deviceDpr)) : deviceDpr > 1.5 ? 1.5 : 1;

  return (
    <div ref={wrap} className={className}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={dpr}
        camera={{ fov: 30, position: [0, 0.75, 11], near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <PerformanceMonitor
          bounds={() => [50, 58]}
          onIncline={() => setQuality("high")}
          onDecline={() => setQuality("low")}
          flipflops={3}
          onFallback={() => setQuality("low")}
        />
        <Scene />
      </Canvas>
    </div>
  );
}

function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setOn(entries[entries.length - 1].isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}
