import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Sarke — every desktop, one cursor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");

export default async function OpenGraphImage() {
  const [regular, semibold] = await Promise.all([
    readFile(join(fontDir, "Geist-Regular.ttf")),
    readFile(join(fontDir, "Geist-SemiBold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#050506",
          backgroundImage: "radial-gradient(900px 420px at 50% -8%, rgba(90,110,150,0.32), transparent 70%)",
          fontFamily: "Geist",
          color: "#f5f5f7",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 34, fontWeight: 600 }}>
          <div style={{ display: "flex", position: "relative", width: 30, height: 30 }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 20, height: 20, borderRadius: 5, background: "#f5f5f7" }} />
            <div style={{ position: "absolute", right: 0, bottom: 0, width: 20, height: 20, borderRadius: 5, border: "3px solid #f5f5f7", background: "#050506" }} />
          </div>
          Sarke
        </div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 600, letterSpacing: -3, lineHeight: 1.04 }}>
          Every desktop. One cursor.
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#86868b" }}>
          Merge two or more Windows PCs into one workspace.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
