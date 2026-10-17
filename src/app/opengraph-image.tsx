import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Sarke — one mouse, one more screen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/@fontsource/jetbrains-mono/files");

export default async function OpenGraphImage() {
  const [regular, bold] = await Promise.all([
    readFile(join(fontDir, "jetbrains-mono-latin-400-normal.woff")),
    readFile(join(fontDir, "jetbrains-mono-latin-700-normal.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0B0B0C",
          backgroundImage:
            "linear-gradient(to right, rgba(42,42,46,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(42,42,46,0.4) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          fontFamily: "JetBrains Mono",
          color: "#EDEDED",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, letterSpacing: 2, color: "#8A8A92" }}>
          <div style={{ width: 14, height: 14, background: "#FF5A1F" }} />
          SARKE · WINDOWS 10/11
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "flex-start", fontSize: 200, fontWeight: 700, lineHeight: 0.9, letterSpacing: -4 }}>
            SARKE
            <div style={{ width: 24, height: 144, marginTop: 18, marginLeft: 16, background: "#FF5A1F" }} />
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, textTransform: "uppercase" }}>One mouse. One more screen.</div>
        </div>

        <div style={{ display: "flex", fontSize: 22, letterSpacing: 2, color: "#8A8A92", textTransform: "uppercase" }}>
          free · open source · LAN only
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "JetBrains Mono", data: regular, weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
