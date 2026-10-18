import * as THREE from "three";

/** Shared look of the 3D devices (DeskStage and HeroStage). */

export const aluminium = { color: "#cfd2d7", metalness: 0.88, roughness: 0.3 };
export const glass = { color: "#060607", metalness: 0.2, roughness: 0.12 };

export function makeKeyboard() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 560;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c8cbd0";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#1b1c1f";
  g.beginPath();
  g.roundRect(30, 20, 964, 300, 14);
  g.fill();
  g.fillStyle = "#2b2c30";
  [14, 14, 13, 12, 10].forEach((n, r) => {
    const w = 940 / n;
    for (let i = 0; i < n; i++) {
      g.beginPath();
      g.roundRect(42 + i * w, 30 + r * 57, w - 8, 49, 7);
      g.fill();
    }
  });
  g.fillStyle = "#bfc2c7";
  g.beginPath();
  g.roundRect(330, 350, 364, 190, 16);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
}

/** Soft contact shadow, painted once. */
export function makeShadow() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  rg.addColorStop(0, "rgba(0,0,0,0.55)");
  rg.addColorStop(0.55, "rgba(0,0,0,0.22)");
  rg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
