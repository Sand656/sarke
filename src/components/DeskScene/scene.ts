import type { gsap as Gsap } from "gsap";

export type Layout = "row" | "stack";
type Pt = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };

export type SceneGeometry = {
  width: number;
  height: number;
  monitors: (Rect & { neck: number; base: number })[];
  laptopLid: Rect;
  laptopScreen: Rect;
  laptopBase: string;
  hostLabel: Pt;
  clientLabel: Pt;
  illusLabel: Pt;
  win: Pt & { scale: number };
  mirror: Pt & { scale: number };
  hud: Rect;
  glow: { line: Rect; fade: Rect; dir: "right" | "down" };
  cursor: { start: Pt; edgeA: Pt; edgeB: Pt; onB: Pt; click: Pt };
  target: Pt;
};

// The editor window is drawn once at this size and scaled into place.
export const WIN_W = 200;
export const WIN_H = 128;
export const WIN_BAR = 18;
export const CODE_LINES = [118, 86, 148, 64, 132, 98, 56];

export const GEOMETRY: Record<Layout, SceneGeometry> = {
  row: {
    width: 1000,
    height: 380,
    monitors: [
      { x: 24, y: 40, w: 320, h: 180, neck: 32, base: 80 },
      { x: 360, y: 40, w: 320, h: 180, neck: 32, base: 80 },
    ],
    laptopLid: { x: 736, y: 76, w: 240, h: 156 },
    laptopScreen: { x: 744, y: 84, w: 224, h: 140 },
    laptopBase: "736,232 976,232 996,248 716,248",
    hostLabel: { x: 352, y: 300 },
    clientLabel: { x: 856, y: 300 },
    illusLabel: { x: 996, y: 368 },
    win: { x: 392, y: 64, scale: 1 },
    mirror: { x: 756, y: 96, scale: 0.9 },
    hud: { x: 872, y: 166, w: 90, h: 52 },
    glow: { line: { x: 744, y: 84, w: 3, h: 140 }, fade: { x: 744, y: 84, w: 24, h: 140 }, dir: "right" },
    cursor: {
      start: { x: 448, y: 168 },
      edgeA: { x: 680, y: 132 },
      edgeB: { x: 744, y: 132 },
      onB: { x: 800, y: 150 },
      click: { x: 852, y: 140 },
    },
    target: { x: 492, y: 128 },
  },
  stack: {
    width: 400,
    height: 470,
    monitors: [
      { x: 16, y: 24, w: 176, h: 99, neck: 20, base: 56 },
      { x: 208, y: 24, w: 176, h: 99, neck: 20, base: 56 },
    ],
    laptopLid: { x: 92, y: 212, w: 216, h: 141 },
    laptopScreen: { x: 100, y: 220, w: 200, h: 125 },
    laptopBase: "92,353 308,353 324,367 76,367",
    hostLabel: { x: 200, y: 180 },
    clientLabel: { x: 200, y: 400 },
    illusLabel: { x: 392, y: 458 },
    win: { x: 220, y: 34, scale: 0.6 },
    mirror: { x: 108, y: 228, scale: 0.85 },
    hud: { x: 218, y: 288, w: 78, h: 52 },
    glow: { line: { x: 100, y: 220, w: 200, h: 3 }, fade: { x: 100, y: 220, w: 200, h: 24 }, dir: "down" },
    cursor: {
      start: { x: 250, y: 60 },
      edgeA: { x: 268, y: 123 },
      edgeB: { x: 268, y: 220 },
      onB: { x: 236, y: 252 },
      click: { x: 196, y: 272 },
    },
    target: { x: 280, y: 72 },
  },
};

/** Labels in the timeline, in order. The scroll section tweens between them. */
export const STEP_LABELS = ["start", "cross", "mirror", "final"] as const;

/**
 * Builds the paused desk-scene timeline. Markup is rendered in its "final" state,
 * so playing from "final" fades it out and then loops from "start".
 */
export function buildSceneTimeline(
  gsap: typeof Gsap,
  root: Element,
  geo: SceneGeometry,
  { loop }: { loop: boolean },
) {
  const q = gsap.utils.selector(root);
  const cursor = q("[data-part=cursor]");
  const glow = q("[data-part=glow]");
  const highlight = q("[data-part=highlight]");
  const reveal = q("[data-part=reveal]");
  const hud = q("[data-part=hud]");
  const link = q("[data-part=link]");
  const pulse = q("[data-part=pulse]");
  const ripple = q("[data-part=ripple]");
  const c = geo.cursor;

  const tl = gsap.timeline({ paused: true, repeat: loop ? -1 : 0, defaults: { ease: "none" } });

  tl.set(cursor, { x: c.start.x, y: c.start.y, scale: 1, opacity: 1 })
    .set([glow, highlight, hud, link, pulse, ripple], { opacity: 0 })
    .set(reveal, { attr: { height: 0 } })
    .set(pulse, { x: c.click.x, y: c.click.y })
    .addLabel("start")
    // 1–2. cursor reaches A's edge, glow on B's edge, cursor continues on B
    .to(cursor, { x: c.edgeA.x, y: c.edgeA.y, duration: 1.1, ease: "power1.inOut" })
    .set(cursor, { x: c.edgeB.x, y: c.edgeB.y })
    .set(glow, { opacity: 1 })
    .to(cursor, { x: c.onB.x, y: c.onB.y, duration: 0.6, ease: "power1.out" })
    .to(glow, { opacity: 0, duration: 0.3 }, "+=0.3")
    .addLabel("cross")
    // 3. editor.exe highlighted on A
    .to(highlight, { opacity: 1, duration: 0.12 }, "+=0.1")
    // 4. mirror reveals on B line by line
    .to(reveal, { attr: { height: WIN_H }, duration: 0.96, ease: "steps(8)" }, "+=0.2")
    // 5. HUD appears
    .to(hud, { opacity: 1, duration: 0.12 }, "+=0.2")
    .addLabel("mirror")
    // 6. click inside the mirror; ripple travels back to A
    .to(cursor, { x: c.click.x, y: c.click.y, duration: 0.6, ease: "power1.inOut" }, "+=0.2")
    .to(cursor, { scale: 0.85, duration: 0.08, svgOrigin: `${c.click.x} ${c.click.y}` })
    .to(cursor, { scale: 1, duration: 0.08 })
    .set(ripple, { opacity: 1, attr: { r: 0 } }, "<-0.08")
    .to(ripple, { attr: { r: 16 }, opacity: 0, duration: 0.5 }, "<")
    .set([link, pulse], { opacity: 1 }, "<")
    .to(pulse, { x: geo.target.x, y: geo.target.y, duration: 0.8, ease: "power1.in" }, "<")
    .set(pulse, { opacity: 0 })
    .to(highlight, { opacity: 0.25, duration: 0.06, repeat: 1, yoyo: true })
    .addLabel("final");

  if (loop) {
    tl.to([highlight, hud, link, cursor], { opacity: 0, duration: 0.3 }, "+=1.4").set(reveal, {
      attr: { height: 0 },
    });
  }
  return tl;
}
