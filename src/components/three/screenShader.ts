import * as THREE from "three";
import { SCREEN_H, SCREEN_W, edgeGlow, type StageState } from "./choreo";
import { EXPLORER, getSprites, type Sprite } from "./screens";

/**
 * GPU compositor for the moving parts of each screen. The sprites are uploaded once; per
 * frame only their rectangles and opacities change (uniforms). Each screen's overlay is
 * clipped by its own edges, so a window crossing from one machine to the next really is
 * split across both screens — exactly what the merged desktop does.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tWin, tWinShadow, tFile, tFileLabeled, tFileShadow, tCursor, tToast;
  uniform vec4 rWin, rWinShadow, rFile, rFileLabeled, rFileShadow, rCursor, rToast, rDropped, rHover;
  uniform float aWin, aWinShadow, aOutline, aFile, aFileLabeled, aFileShadow, aCursor, aPress, aToast, aDropped, aHover;
  uniform vec2 cursorTip;
  uniform float glowL, glowR;
  uniform vec2 screenSize;

  vec4 sampleRect(sampler2D t, vec4 r, vec2 p) {
    vec2 uv = (p - r.xy) / r.zw;
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);
    return texture2D(t, vec2(uv.x, 1.0 - uv.y));
  }

  // Premultiplied "over"
  vec4 over(vec4 dst, vec4 src, float a) {
    float sa = src.a * a;
    return vec4(src.rgb * sa + dst.rgb * (1.0 - sa), sa + dst.a * (1.0 - sa));
  }

  float rectOutline(vec4 r, vec2 p, float w) {
    vec2 d = abs(p - (r.xy + r.zw * 0.5)) - r.zw * 0.5;
    float outside = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    return 1.0 - smoothstep(0.0, 1.2, abs(outside) - w * 0.5);
  }

  void main() {
    vec2 p = vec2(vUv.x * screenSize.x, (1.0 - vUv.y) * screenSize.y);
    vec4 c = vec4(0.0);
    vec3 blue = vec3(0.161, 0.592, 1.0);

    c = over(c, vec4(blue, rectOutline(rHover, p, 2.0)), aHover);
    c = over(c, sampleRect(tFileLabeled, rDropped, p), aDropped);
    c = over(c, sampleRect(tFileShadow, rFileShadow, p), aFileShadow);
    c = over(c, sampleRect(tFileLabeled, rFileLabeled, p), aFileLabeled);
    c = over(c, sampleRect(tFile, rFile, p), aFile);
    c = over(c, sampleRect(tWinShadow, rWinShadow, p), aWinShadow);
    c = over(c, sampleRect(tWin, rWin, p), aWin);
    c = over(c, vec4(blue, rectOutline(rWin, p, 2.0)), aOutline);
    c = over(c, sampleRect(tToast, rToast, p), aToast);

    // Edge glow where the cursor crosses between machines
    c = over(c, vec4(blue, 0.85 * (1.0 - smoothstep(0.0, 60.0, p.x))), glowL);
    c = over(c, vec4(blue, 0.85 * smoothstep(screenSize.x - 60.0, screenSize.x, p.x)), glowR);

    // Press ring, then the cursor on top of everything
    float ring = 1.0 - smoothstep(0.0, 1.4, abs(distance(p, cursorTip) - (14.0 + (1.0 - aPress) * 10.0)) - 1.0);
    c = over(c, vec4(blue, ring), aPress * 0.7 * step(0.05, aPress));
    c = over(c, sampleRect(tCursor, rCursor, p), aCursor);

    gl_FragColor = c;
  }
`;

const tex = (s: Sprite) => {
  const t = new THREE.CanvasTexture(s.canvas);
  t.anisotropy = 8;
  return t;
};

/** One overlay material per screen; textures are shared. */
export function createScreenMaterials() {
  const sp = getSprites();
  const shared = {
    tWin: { value: tex(sp.win) },
    tWinShadow: { value: tex(sp.winShadow) },
    tFile: { value: tex(sp.file) },
    tFileLabeled: { value: tex(sp.fileLabeled) },
    tFileShadow: { value: tex(sp.fileShadow) },
    tCursor: { value: tex(sp.cursor) },
    tToast: { value: tex(sp.toast) },
  };
  return [0, 1, 2].map(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        toneMapped: false,
        uniforms: {
          ...shared,
          screenSize: { value: new THREE.Vector2(SCREEN_W, SCREEN_H) },
          rWin: { value: new THREE.Vector4() },
          rWinShadow: { value: new THREE.Vector4() },
          rFile: { value: new THREE.Vector4() },
          rFileLabeled: { value: new THREE.Vector4() },
          rFileShadow: { value: new THREE.Vector4() },
          rCursor: { value: new THREE.Vector4() },
          rToast: { value: new THREE.Vector4() },
          rDropped: { value: new THREE.Vector4() },
          rHover: { value: new THREE.Vector4() },
          aWin: { value: 1 },
          aWinShadow: { value: 0 },
          aOutline: { value: 0 },
          aFile: { value: 0 },
          aFileLabeled: { value: 0 },
          aFileShadow: { value: 0 },
          aCursor: { value: 0 },
          aPress: { value: 0 },
          aToast: { value: 0 },
          aDropped: { value: 0 },
          aHover: { value: 0 },
          cursorTip: { value: new THREE.Vector2() },
          glowL: { value: 0 },
          glowR: { value: 0 },
        },
      }),
  );
}

/** Push the current story state into screen `i`'s uniforms (cheap: numbers only). */
export function updateScreen(mat: THREE.ShaderMaterial, s: StageState, i: number) {
  const sp = getSprites();
  const u = mat.uniforms;
  const ox = i * SCREEN_W;
  const set = (name: string, x: number, y: number, w: number, h: number) => (u[name].value as THREE.Vector4).set(x - ox, y, w, h);

  set("rWin", s.win.x, s.win.y, sp.win.w, sp.win.h);
  set("rWinShadow", s.win.x - sp.winShadow.pad, s.win.y - sp.winShadow.pad + s.win.lift * 14, sp.winShadow.w, sp.winShadow.h);
  u.aWinShadow.value = 0.45 + s.win.lift * 0.4;
  u.aOutline.value = s.win.lift;

  set("rFile", s.file.x, s.file.y, sp.file.w, sp.file.h);
  set("rFileLabeled", s.file.x - 15, s.file.y - 1, sp.fileLabeled.w, sp.fileLabeled.h);
  set("rFileShadow", s.file.x - sp.fileShadow.pad, s.file.y - sp.fileShadow.pad + s.file.lift * 8, sp.fileShadow.w, sp.fileShadow.h);
  u.aFile.value = s.file.visible * s.file.lift;
  u.aFileLabeled.value = s.file.visible * (1 - s.file.lift);
  u.aFileShadow.value = s.file.visible * (0.35 + s.file.lift * 0.5);

  set("rCursor", s.cursor.x - 3, s.cursor.y - 2, sp.cursor.w * (1 - s.cursor.press * 0.12), sp.cursor.h * (1 - s.cursor.press * 0.12));
  (u.cursorTip.value as THREE.Vector2).set(s.cursor.x - ox, s.cursor.y);
  u.aCursor.value = s.cursor.visible;
  u.aPress.value = s.cursor.press;

  // Screen C only: the drop target, the landed file and the toast
  const isC = i === 2;
  const hover = s.file.lift * Math.max(0, 1 - Math.hypot(s.file.x - (EXPLORER.x + 70), s.file.y - (EXPLORER.y + 216)) / 260);
  set("rHover", EXPLORER.x + 12, EXPLORER.y + 46, EXPLORER.w - 24, EXPLORER.h - 58);
  u.aHover.value = isC ? hover : 0;
  set("rDropped", EXPLORER.x + 365, EXPLORER.y + 227, sp.fileLabeled.w, sp.fileLabeled.h);
  u.aDropped.value = isC ? s.dropped : 0;
  (u.rToast.value as THREE.Vector4).set(SCREEN_W - 344, SCREEN_H - 136 + (1 - s.toast) * 16, sp.toast.w, sp.toast.h);
  u.aToast.value = isC ? s.toast : 0;

  const g1 = edgeGlow(s, SCREEN_W);
  const g2 = edgeGlow(s, 2 * SCREEN_W);
  u.glowL.value = i === 1 ? g1 : i === 2 ? g2 : 0;
  u.glowR.value = i === 0 ? g1 : i === 1 ? g2 : 0;
}
