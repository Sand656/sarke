/**
 * Choreography of the merged desktop. Three screens share ONE virtual desktop that is
 * 3 × 1024 px wide (A: 0–1024, B: 1024–2048, C: 2048–3072), so a window or the cursor
 * crossing x = 1024 really is half on one machine and half on the next.
 * Everything is a pure function of time, so the hero can loop it and How it works can
 * scrub it with the scroll.
 */

export const SCREEN_W = 1024;
export const SCREEN_H = 576;
export const LOOP = 14; // seconds

export type StageState = {
  cursor: { x: number; y: number; press: number; visible: number };
  win: { x: number; y: number; lift: number };
  file: { x: number; y: number; lift: number; visible: number };
  dropped: number; // file has landed in C's folder
  toast: number;
  assemble: number; // devices gathered on the desk (0 = apart)
  beams: number; // LAN links lit
};

type Key = [time: number, value: number];

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Piecewise track with eased segments; holds the first/last value outside the keys. */
function track(keys: Key[], t: number) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const k = t1 === t0 ? 1 : easeInOut((t - t0) / (t1 - t0));
      return v0 + (v1 - v0) * k;
    }
  }
  return keys[keys.length - 1][1];
}

// Grab offsets: where the cursor holds the window's title bar / the file icon.
const WIN_GRAB = { x: 96, y: 20 };
const WIN_HOME = { x: 120, y: 96 };
const WIN_AWAY = { x: SCREEN_W + 330, y: 120 };
const FILE_HOME = { x: SCREEN_W + 860, y: 392 };
const FOLDER = { x: 2 * SCREEN_W + 470, y: 286 };

const CURSOR_X: Key[] = [
  [0, 560], [1.2, WIN_HOME.x + WIN_GRAB.x], [1.4, WIN_HOME.x + WIN_GRAB.x],
  [4.2, WIN_AWAY.x + WIN_GRAB.x], [4.4, WIN_AWAY.x + WIN_GRAB.x],
  [5.6, FILE_HOME.x + 24], [5.8, FILE_HOME.x + 24],
  [8.2, FOLDER.x], [8.4, FOLDER.x],
  [9.8, WIN_AWAY.x + WIN_GRAB.x], [10, WIN_AWAY.x + WIN_GRAB.x],
  [12.6, WIN_HOME.x + WIN_GRAB.x], [12.8, WIN_HOME.x + WIN_GRAB.x],
  [14, 560],
];
const CURSOR_Y: Key[] = [
  [0, 400], [1.2, WIN_HOME.y + WIN_GRAB.y], [1.4, WIN_HOME.y + WIN_GRAB.y],
  [2.8, WIN_HOME.y + WIN_GRAB.y - 36], [4.2, WIN_AWAY.y + WIN_GRAB.y], [4.4, WIN_AWAY.y + WIN_GRAB.y],
  [5.6, FILE_HOME.y + 24], [5.8, FILE_HOME.y + 24],
  [7, FILE_HOME.y - 40], [8.2, FOLDER.y], [8.4, FOLDER.y],
  [9.8, WIN_AWAY.y + WIN_GRAB.y], [10, WIN_AWAY.y + WIN_GRAB.y],
  [11.3, WIN_AWAY.y + WIN_GRAB.y - 30], [12.6, WIN_HOME.y + WIN_GRAB.y], [12.8, WIN_HOME.y + WIN_GRAB.y],
  [14, 400],
];
const PRESS: Key[] = [
  [1.2, 0], [1.4, 1], [4.2, 1], [4.4, 0],
  [5.6, 0], [5.8, 1], [8.2, 1], [8.4, 0],
  [9.8, 0], [10, 1], [12.6, 1], [12.8, 0],
];

/** The hero's endless story: window A→B, file B→C, window back B→A. */
export function stateAt(time: number): StageState {
  const t = ((time % LOOP) + LOOP) % LOOP;
  const cx = track(CURSOR_X, t);
  const cy = track(CURSOR_Y, t);
  const press = track(PRESS, t);

  const draggingWin = (t >= 1.4 && t <= 4.2) || (t >= 10 && t <= 12.6);
  const winAway = t > 4.2 && t < 10;
  const win = draggingWin
    ? { x: cx - WIN_GRAB.x, y: cy - WIN_GRAB.y }
    : winAway
      ? WIN_AWAY
      : WIN_HOME;
  const winLift = track([[1.2, 0], [1.4, 1], [4.2, 1], [4.4, 0], [9.8, 0], [10, 1], [12.6, 1], [12.8, 0]], t);

  const draggingFile = t >= 5.8 && t <= 8.2;
  const file = draggingFile ? { x: cx - 24, y: cy - 24 } : FILE_HOME;
  const fileVisible = t < 8.3 ? 1 : track([[8.3, 0], [12.9, 0], [13.6, 1]], t);
  const dropped = track([[8.2, 0], [8.5, 1], [12.4, 1], [12.9, 0]], t);

  return {
    cursor: { x: cx, y: cy, press, visible: 1 },
    win: { ...win, lift: winLift },
    file: { ...file, lift: track([[5.6, 0], [5.8, 1], [8.2, 1], [8.4, 0]], t), visible: fileVisible },
    dropped,
    toast: track([[8.4, 0], [8.9, 1], [11.4, 1], [12, 0]], t),
    assemble: 1,
    beams: 1,
  };
}

/**
 * How it works, driven by scroll progress p (0–1), in four chapters:
 * connect (devices gather, links light) · one cursor (tour across all three) ·
 * drag a window A→B · drop a file B→C.
 */
export function stateScrub(p: number): StageState {
  const assemble = easeInOut(clamp01(p / 0.2));
  const beams = clamp01((p - 0.1) / 0.14);

  if (p < 0.5) {
    // Chapter 1–2: the cursor appears, then tours A → B → C → back to A.
    const tour = clamp01((p - 0.25) / 0.25);
    const tx: Key[] = [[0, 560], [0.35, 1536], [0.7, 2560], [1, 560 + 40]];
    const ty: Key[] = [[0, 400], [0.35, 250], [0.7, 330], [1, 400]];
    const base = stateAt(0);
    return {
      ...base,
      cursor: { x: track(tx, tour), y: track(ty, tour), press: 0, visible: clamp01((p - 0.16) / 0.08) },
      toast: 0,
      dropped: 0,
      assemble,
      beams,
    };
  }
  // Chapter 3 → loop time 0–4.4 (grab and carry the window); chapter 4 → 4.4–11 (the file).
  const t = p < 0.75 ? ((p - 0.5) / 0.25) * 4.4 : 4.4 + ((p - 0.75) / 0.25) * 6.6;
  return { ...stateAt(t), assemble, beams };
}

/** Boundary glow when the cursor is near a screen edge (A|B at 1024, B|C at 2048). */
export function edgeGlow(s: StageState, boundary: number) {
  return s.cursor.visible * clamp01(1 - Math.abs(s.cursor.x - boundary) / 70);
}
