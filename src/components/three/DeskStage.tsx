"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { LOOP, stateAt, stateScrub, type StageState } from "./choreo";
import { aluminium, glass, makeKeyboard, makeShadow } from "./materials";
import { createScreenMaterials, updateScreen } from "./screenShader";
import { getSprites } from "./screens";

/**
 * The merged-desktop stage: two displays and a laptop, joined by a LAN link.
 * mode "loop" plays the hero story forever; mode "scrub" follows progressRef (0–1).
 *
 * Performance budget (it has to hold 60 fps on integrated GPUs):
 *  - one draw pass: no reflections, no post-processing; shadows are baked sprites;
 *  - screen art is uploaded once; moving parts are composited by a shader (uniforms only);
 *  - resolution adapts: up to 2× on strong GPUs, down to 1× when frames drop;
 *  - nothing renders while the stage is off screen.
 */

type Props = {
  mode: "loop" | "scrub";
  progressRef?: MutableRefObject<number>;
  className?: string;
};

const DESK_Y = -1.45;

/** Static screen art, uploaded once. */
function makeScreenTextures() {
  return getSprites().layers.map((c) => {
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16; // clamped to the GPU's maximum by three.js
    return texture;
  });
}

function Shadow({ texture, w, d, z = 0 }: { texture: THREE.Texture; w: number; d: number; z?: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, DESK_Y + 0.002, z]}>
      <planeGeometry args={[w, d]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

function Display({ texture, overlay, shadow }: { texture: THREE.Texture; overlay: THREE.Material; shadow: THREE.Texture }) {
  return (
    <group>
      <RoundedBox args={[3.4, 2, 0.09]} radius={0.04} smoothness={8}>
        <meshStandardMaterial {...aluminium} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0455]}>
        <planeGeometry args={[3.34, 1.94]} />
        <meshStandardMaterial {...glass} />
      </mesh>
      <mesh position={[0, 0.01, 0.046]}>
        <planeGeometry args={[3.22, 1.81]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.01, 0.0466]} material={overlay} renderOrder={2}>
        <planeGeometry args={[3.22, 1.81]} />
      </mesh>
      {/* Tilt stand: one bent aluminium sheet */}
      <RoundedBox args={[0.82, 1.36, 0.05]} radius={0.02} position={[0, -0.86, -0.3]} rotation-x={0.2}>
        <meshStandardMaterial {...aluminium} />
      </RoundedBox>
      <RoundedBox args={[0.98, 0.04, 0.78]} radius={0.02} position={[0, DESK_Y + 0.02, -0.38]}>
        <meshStandardMaterial {...aluminium} />
      </RoundedBox>
      <Shadow texture={shadow} w={3.6} d={1.5} z={-0.3} />
    </group>
  );
}

function Laptop({
  texture,
  overlay,
  keyboard,
  shadow,
}: {
  texture: THREE.Texture;
  overlay: THREE.Material;
  keyboard: THREE.Texture;
  shadow: THREE.Texture;
}) {
  return (
    <group position={[0, DESK_Y, 0]}>
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
        <mesh position={[0, 0.99, 0.001]}>
          <planeGeometry args={[2.8, 1.575]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.99, 0.0016]} material={overlay} renderOrder={2}>
          <planeGeometry args={[2.8, 1.575]} />
        </mesh>
      </group>
      <Shadow texture={shadow} w={3.8} d={2.8} z={-0.1} />
    </group>
  );
}

/** The LAN link: a fine line with light running along it. */
function Link({ from, to, strength }: { from: THREE.Vector3; to: THREE.Vector3; strength: MutableRefObject<number> }) {
  const curve = useMemo(() => {
    const mid = from.clone().lerp(to, 0.5);
    mid.y += 0.5;
    mid.z -= 1.3;
    return new THREE.CatmullRomCurve3([from, mid, to]);
  }, [from, to]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.008, 6, false), [curve]);
  const line = useRef<THREE.MeshBasicMaterial>(null);
  const dots = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const k = strength.current;
    if (line.current) line.current.opacity = 0.32 * k;
    dots.current.forEach((m, i) => {
      if (!m) return;
      const u = (clock.elapsedTime * 0.28 + i / 2) % 1;
      m.position.copy(curve.getPointAt(u));
      m.scale.setScalar(k * Math.sin(u * Math.PI));
    });
  });

  return (
    <group>
      <mesh geometry={tube}>
        <meshBasicMaterial ref={line} color="#2997ff" transparent opacity={0.32} toneMapped={false} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} ref={(m) => void (m && (dots.current[i] = m))}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#7cc0ff" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// Device placement; "apart" is where they wait before the Connect chapter.
const PLACES = [
  { pos: new THREE.Vector3(-3.75, 0, 0.7), rotY: 0.28, apart: new THREE.Vector3(-6.2, -0.4, -1.4) },
  { pos: new THREE.Vector3(0, 0.05, 0), rotY: 0, apart: new THREE.Vector3(0, -0.7, -2.6) },
  { pos: new THREE.Vector3(3.8, 0, 0.8), rotY: -0.3, apart: new THREE.Vector3(6.4, -0.4, -1.2) },
];

// Camera per chapter of How it works: [progress, position, look-at]
const SHOTS: [number, THREE.Vector3, THREE.Vector3][] = [
  [0, new THREE.Vector3(0, 2.6, 15), new THREE.Vector3(0, -0.2, 0)],
  [0.22, new THREE.Vector3(0, 1.3, 12), new THREE.Vector3(0, -0.15, 0)],
  [0.45, new THREE.Vector3(0.4, 0.9, 11.4), new THREE.Vector3(0.3, -0.15, 0)],
  [0.62, new THREE.Vector3(-1.9, 0.6, 8.2), new THREE.Vector3(-1.7, -0.05, 0)],
  [0.85, new THREE.Vector3(2.4, 0.5, 8.2), new THREE.Vector3(2.1, -0.3, 0)],
  [1, new THREE.Vector3(0.3, 1.2, 11.6), new THREE.Vector3(0.3, -0.2, 0)],
];

function shotAt(p: number, pos: THREE.Vector3, look: THREE.Vector3) {
  let i = 0;
  while (i < SHOTS.length - 2 && p > SHOTS[i + 1][0]) i++;
  const [p0, a0, l0] = SHOTS[i];
  const [p1, a1, l1] = SHOTS[i + 1];
  const k = THREE.MathUtils.smoothstep(p, p0, p1);
  pos.copy(a0).lerp(a1, k);
  look.copy(l0).lerp(l1, k);
}

function Scene({ mode, progressRef }: Props) {
  const [screens] = useState(makeScreenTextures);
  const [overlays] = useState(createScreenMaterials);
  const [keyboard] = useState(makeKeyboard);
  const [shadow] = useState(makeShadow);
  const devices = useRef<(THREE.Group | null)[]>([]);
  const link = useRef(1);
  const pointer = useRef({ x: 0, y: 0 });
  const cam = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), cur: new THREE.Vector3(0, -0.2, 0) });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      screens.forEach((t) => t.dispose());
      overlays.forEach((m) => m.dispose());
    };
  }, [screens, overlays]);

  useFrame((three, delta) => {
    const t = three.clock.elapsedTime;
    const p = progressRef?.current ?? 0;
    const state: StageState = mode === "loop" ? stateAt(t + LOOP * 0.02) : stateScrub(p);

    // Moving parts of each screen: uniforms only, no texture uploads
    overlays.forEach((m, i) => updateScreen(m, state, i));

    PLACES.forEach((place, i) => {
      const g = devices.current[i];
      if (!g) return;
      const a = state.assemble;
      g.position.copy(place.apart).lerp(place.pos, a);
      g.rotation.y = place.rotY + (1 - a) * (i - 1) * 0.55;
    });
    link.current = state.beams;

    const c = cam.current;
    const aspect = three.size.width / three.size.height;
    const narrow = aspect < 1.25;
    // Phones: once the devices are on the desk, follow the cursor from machine to machine
    // at close range so the screens stay big and readable.
    const follow = narrow && (mode === "loop" || p > 0.22);
    if (follow) {
      const screen = Math.min(2, Math.max(0, Math.floor(state.cursor.x / 1024)));
      const target = PLACES[screen].pos;
      c.pos.set(target.x * 0.92 + Math.sin(t * 0.3) * 0.12, 0.65, 7.2 * Math.max(1, 1.1 / aspect));
      c.look.set(target.x * 0.92, -0.3, 0);
    } else if (mode === "scrub") {
      shotAt(p, c.pos, c.look);
      // Back off for narrow frames so the chapter's devices stay in view
      c.pos.z *= Math.max(1, 1.85 / aspect);
    } else {
      // Desktop: the whole setup, framed in the upper middle of the stage
      c.pos.set(pointer.current.x * 0.8 + Math.sin(t * 0.12) * 0.35, 1.0 - pointer.current.y * 0.3, 12.4 * Math.max(1, 1.85 / aspect));
      c.look.set(0, -0.6, 0);
    }
    const damp = 1 - Math.exp(-delta * 3);
    three.camera.position.lerp(c.pos, damp);
    c.cur.lerp(c.look, damp);
    three.camera.lookAt(c.cur);
  });

  const a = useMemo(() => new THREE.Vector3(-2.3, 0.6, -0.2), []);
  const b = useMemo(() => new THREE.Vector3(0, 0.9, -0.3), []);
  const c = useMemo(() => new THREE.Vector3(2.4, -0.2, 0), []);

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

      <group ref={(g) => void (devices.current[0] = g)}>
        <Display texture={screens[0]} overlay={overlays[0]} shadow={shadow} />
      </group>
      <group ref={(g) => void (devices.current[1] = g)}>
        <Display texture={screens[1]} overlay={overlays[1]} shadow={shadow} />
      </group>
      <group ref={(g) => void (devices.current[2] = g)}>
        <Laptop texture={screens[2]} overlay={overlays[2]} keyboard={keyboard} shadow={shadow} />
      </group>

      <Link from={a} to={b} strength={link} />
      <Link from={b} to={c} strength={link} />
    </>
  );
}

export default function DeskStage({ mode, progressRef, className }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  // Supersampled for sharp edges: 2× on 1× displays, up to 2.5× on high-DPI phones.
  // When the GPU falls behind it steps down — but never below 1.5× on high-DPI screens,
  // where 1× looks soft.
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [deviceDpr] = useState(() => (typeof window === "undefined" ? 1 : window.devicePixelRatio || 1));
  const dpr = quality === "high" ? Math.min(2.5, Math.max(2, deviceDpr)) : deviceDpr > 1.5 ? 1.5 : 1;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={dpr}
        camera={{ fov: 30, position: [0, 1.4, 13], near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <PerformanceMonitor
          bounds={() => [50, 58]}
          onIncline={() => setQuality("high")}
          onDecline={() => setQuality("low")}
          flipflops={3}
          onFallback={() => setQuality("low")}
        />
        <Scene mode={mode} progressRef={progressRef} />
      </Canvas>
    </div>
  );
}
