import { SCREEN_H, SCREEN_W } from "./choreo";

/**
 * Screen art for the 3D stage, painted once:
 *  - a static layer per screen (wallpaper, resident windows, taskbar);
 *  - sprites for everything that moves (window, file, cursor, toast).
 * The moving sprites are composited over the static layer by a shader (screenShader.ts),
 * so no texture is ever re-uploaded while the animation runs.
 * Coordinates are in the shared virtual desktop (3 × 1024 px); canvases are drawn at RES×.
 */

export const RES = 2; // texture px per virtual px → 2048 × 1152 per screen (uploaded once)

type Palette = { top: string; bottom: string; glow: string; name: string };

// Quiet, cool wallpapers in one family (Apple-like restraint, still alive on screen)
const PALETTES: Palette[] = [
  { top: "#3d5a9e", bottom: "#0d1222", glow: "#6f8fd8", name: "DESKTOP-A" },
  { top: "#2f6f86", bottom: "#0a161d", glow: "#5fa9c2", name: "DESKTOP-B" },
  { top: "#4b4f8f", bottom: "#100f1f", glow: "#8c8fd6", name: "LAPTOP-C" },
];

const INK = "rgba(255,255,255,0.92)";
const BLUE = "#2997ff";
const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * RES);
  c.height = Math.ceil(h * RES);
  const ctx = c.getContext("2d")!;
  ctx.scale(RES, RES);
  return { c, ctx };
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** A soft shadow sprite: blur is paid once, here, never per frame. */
function shadowSprite(w: number, h: number, r: number, blur: number) {
  const pad = blur * 2;
  const { c, ctx } = canvas(w + pad * 2, h + pad * 2);
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = blur * RES;
  ctx.shadowOffsetY = blur * 0.35 * RES;
  ctx.fillStyle = "#000";
  rr(ctx, pad, pad, w, h, r);
  ctx.fill();
  return { c, pad };
}

function windowChrome(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, title: string) {
  ctx.fillStyle = "#16171c";
  rr(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.fillStyle = "#1f2027";
  rr(ctx, x, y, w, 34, 12);
  ctx.fill();
  ctx.fillRect(x, y + 22, w, 12);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + 18 + i * 18, y + 17, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = `600 13px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(title, x + w / 2, y + 22);
  ctx.textAlign = "left";
}

function lines(ctx: CanvasRenderingContext2D, x: number, y: number, rows: number, color = "rgba(255,255,255,0.16)") {
  for (let i = 0; i < rows; i++) {
    const indent = [0, 1, 2, 2, 1, 2, 3, 2, 1, 0][i % 10] * 18;
    ctx.fillStyle = i % 4 === 1 ? "rgba(41,151,255,0.7)" : color;
    rr(ctx, x + indent, y + i * 21, 70 + ((i * 53) % 170), 7, 3.5);
    ctx.fill();
  }
}

function fileGlyph(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#f5f5f7";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 36, y);
  ctx.lineTo(x + 50, y + 14);
  ctx.lineTo(x + 50, y + 62);
  ctx.lineTo(x, y + 62);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d9d9de";
  ctx.beginPath();
  ctx.moveTo(x + 36, y);
  ctx.lineTo(x + 50, y + 14);
  ctx.lineTo(x + 36, y + 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#86868b";
  ctx.font = `700 10px ${FONT}`;
  ctx.fillText("PDF", x + 14, y + 48);
}

function folderGlyph(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#5aa9f0";
  rr(ctx, x, y, 30, 14, 4);
  ctx.fill();
  ctx.fillStyle = "#6cb6f7";
  rr(ctx, x, y + 8, 64, 46, 7);
  ctx.fill();
}

/* ---------- Cached static layers (one per screen) ---------- */

const EXPLORER = { x: 2 * SCREEN_W + 400, y: 70, w: 520, h: 330 };

function paintStatic(i: number) {
  const { c, ctx } = canvas(SCREEN_W, SCREEN_H);
  const p = PALETTES[i];
  const g = ctx.createLinearGradient(0, 0, 0, SCREEN_H);
  g.addColorStop(0, p.top);
  g.addColorStop(1, p.bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  const rg = ctx.createRadialGradient(SCREEN_W * 0.7, SCREEN_H * 0.25, 0, SCREEN_W * 0.7, SCREEN_H * 0.25, 620);
  rg.addColorStop(0, p.glow + "aa");
  rg.addColorStop(1, "transparent");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Resident windows
  ctx.save();
  ctx.translate(-i * SCREEN_W, 0);
  const shadowed = (x: number, y: number, w: number, h: number) => {
    const s = shadowSprite(w, h, 12, 22);
    ctx.drawImage(s.c, x - s.pad, y - s.pad, w + s.pad * 2, h + s.pad * 2);
  };
  if (i === 0) {
    shadowed(560, 64, 380, 290);
    windowChrome(ctx, 560, 64, 380, 290, "main.cpp");
    lines(ctx, 582, 120, 10);
  }
  if (i === 1) {
    shadowed(SCREEN_W + 80, 300, 400, 230);
    windowChrome(ctx, SCREEN_W + 80, 300, 400, 230, "Release notes");
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    rr(ctx, SCREEN_W + 96, 346, 368, 80, 10);
    ctx.fill();
    lines(ctx, SCREEN_W + 100, 446, 3);
  }
  if (i === 2) {
    shadowed(EXPLORER.x, EXPLORER.y, EXPLORER.w, EXPLORER.h);
    windowChrome(ctx, EXPLORER.x, EXPLORER.y, EXPLORER.w, EXPLORER.h, "Projects");
    ["Assets", "Builds", "Docs", "Renders", "Notes", "Archive"].forEach((name, k) => {
      const fx = EXPLORER.x + 34 + (k % 3) * 160;
      const fy = EXPLORER.y + 62 + Math.floor(k / 3) * 112;
      folderGlyph(ctx, fx, fy);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = `500 13px ${FONT}`;
      ctx.fillText(name, fx, fy + 76);
    });
  }
  ctx.restore();

  // Taskbar
  ctx.fillStyle = "rgba(20,20,24,0.55)";
  rr(ctx, SCREEN_W / 2 - 150, SCREEN_H - 50, 300, 40, 14);
  ctx.fill();
  for (let k = 0; k < 5; k++) {
    ctx.fillStyle = k === 0 ? BLUE : "rgba(255,255,255,0.55)";
    rr(ctx, SCREEN_W / 2 - 118 + k * 50, SCREEN_H - 41, 22, 22, 6);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `600 13px ${FONT}`;
  ctx.fillText(p.name, 20, 28);
  ctx.textAlign = "right";
  ctx.fillText(`09:4${i + 1}`, SCREEN_W - 20, 28);
  ctx.textAlign = "left";
  return c;
}

/* ---------- Sprites for things that move (painted once, composited on the GPU) ---------- */

export type Sprite = { canvas: HTMLCanvasElement; w: number; h: number; pad: number };

export type Sprites = {
  layers: HTMLCanvasElement[];
  win: Sprite;
  winShadow: Sprite;
  file: Sprite;
  fileLabeled: Sprite;
  fileShadow: Sprite;
  cursor: Sprite;
  toast: Sprite;
};

let sprites: Sprites | null = null;

const sprite = (c: HTMLCanvasElement, w: number, h: number, pad = 0): Sprite => ({ canvas: c, w, h, pad });

function buildSprites(): Sprites {
  const win = canvas(420, 270);
  windowChrome(win.ctx, 0, 0, 420, 270, "Studio — poster.png");
  const art = win.ctx.createLinearGradient(16, 50, 300, 250);
  art.addColorStop(0, "#3d5a9e");
  art.addColorStop(1, "#8c8fd6");
  win.ctx.fillStyle = art;
  rr(win.ctx, 16, 48, 290, 206, 10);
  win.ctx.fill();
  win.ctx.fillStyle = "rgba(255,255,255,0.9)";
  win.ctx.beginPath();
  win.ctx.arc(110, 140, 38, 0, Math.PI * 2);
  win.ctx.fill();
  win.ctx.fillStyle = "rgba(0,0,0,0.25)";
  rr(win.ctx, 170, 172, 110, 54, 8);
  win.ctx.fill();
  for (let k = 0; k < 4; k++) {
    win.ctx.fillStyle = "#24252d";
    rr(win.ctx, 318, 48 + k * 52, 88, 42, 8);
    win.ctx.fill();
    win.ctx.fillStyle = k === 0 ? BLUE : "rgba(255,255,255,0.35)";
    rr(win.ctx, 328, 59 + k * 52, 20, 20, 5);
    win.ctx.fill();
  }

  const file = canvas(52, 64);
  fileGlyph(file.ctx, 1, 1);

  const labeled = canvas(80, 90);
  fileGlyph(labeled.ctx, 15, 1);
  labeled.ctx.fillStyle = INK;
  labeled.ctx.font = `600 13px ${FONT}`;
  labeled.ctx.textAlign = "center";
  labeled.ctx.fillText("deck.pdf", 40, 84);

  const cursor = canvas(26, 34);
  cursor.ctx.translate(3, 2);
  cursor.ctx.scale(1.5, 1.5);
  cursor.ctx.shadowColor = "rgba(0,0,0,0.45)";
  cursor.ctx.shadowBlur = 4 * RES;
  cursor.ctx.shadowOffsetY = 1 * RES;
  cursor.ctx.beginPath();
  cursor.ctx.moveTo(0, 0);
  cursor.ctx.lineTo(0, 18);
  cursor.ctx.lineTo(5, 13.5);
  cursor.ctx.lineTo(8.5, 21);
  cursor.ctx.lineTo(11.5, 19.6);
  cursor.ctx.lineTo(8.2, 12.4);
  cursor.ctx.lineTo(14.4, 12.4);
  cursor.ctx.closePath();
  cursor.ctx.fillStyle = "#fff";
  cursor.ctx.fill();
  cursor.ctx.shadowColor = "transparent";
  cursor.ctx.lineWidth = 1.1;
  cursor.ctx.strokeStyle = "#111";
  cursor.ctx.stroke();

  const toast = canvas(320, 72);
  toast.ctx.fillStyle = "rgba(30,30,34,0.96)";
  rr(toast.ctx, 0, 0, 320, 72, 16);
  toast.ctx.fill();
  toast.ctx.fillStyle = "#30d158";
  toast.ctx.beginPath();
  toast.ctx.arc(34, 36, 14, 0, Math.PI * 2);
  toast.ctx.fill();
  toast.ctx.strokeStyle = "#fff";
  toast.ctx.lineWidth = 3;
  toast.ctx.beginPath();
  toast.ctx.moveTo(27, 36);
  toast.ctx.lineTo(32, 42);
  toast.ctx.lineTo(42, 30);
  toast.ctx.stroke();
  toast.ctx.fillStyle = INK;
  toast.ctx.font = `600 15px ${FONT}`;
  toast.ctx.fillText("deck.pdf moved here", 60, 31);
  toast.ctx.fillStyle = "rgba(255,255,255,0.55)";
  toast.ctx.font = `500 13px ${FONT}`;
  toast.ctx.fillText("from DESKTOP-B · over your LAN", 60, 53);

  const winShadow = shadowSprite(420, 270, 12, 34);
  const fileShadow = shadowSprite(50, 62, 4, 12);

  return {
    layers: [0, 1, 2].map(paintStatic),
    win: sprite(win.c, 420, 270),
    winShadow: sprite(winShadow.c, 420 + winShadow.pad * 2, 270 + winShadow.pad * 2, winShadow.pad),
    file: sprite(file.c, 52, 64),
    fileLabeled: sprite(labeled.c, 80, 90),
    fileShadow: sprite(fileShadow.c, 50 + fileShadow.pad * 2, 62 + fileShadow.pad * 2, fileShadow.pad),
    cursor: sprite(cursor.c, 26, 34),
    toast: sprite(toast.c, 320, 72),
  };
}

/** Painted once per page; shared by every stage. */
export function getSprites() {
  sprites ??= buildSprites();
  return sprites;
}

export { EXPLORER };
