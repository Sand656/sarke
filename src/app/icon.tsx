import { ImageResponse } from "next/og";

// Favicon: the Sarke mark (one desktop mirrored into the next), at 16 / 32 / 512.
const SIZES = [16, 32, 512];

export function generateImageMetadata() {
  return SIZES.map((s) => ({ id: String(s), size: { width: s, height: s }, contentType: "image/png" }));
}

export function Mark({ size }: { size: number }) {
  const sq = Math.round(size * 0.44);
  const r = Math.max(2, Math.round(size * 0.1));
  const line = Math.max(1, Math.round(size * 0.07));
  const inset = Math.round(size * 0.17);
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#050506", borderRadius: Math.round(size * 0.22) }}>
      <div style={{ position: "absolute", left: inset, top: inset, width: sq, height: sq, borderRadius: r, background: "#f5f5f7" }} />
      <div
        style={{
          position: "absolute",
          right: inset,
          bottom: inset,
          width: sq,
          height: sq,
          borderRadius: r,
          border: `${line}px solid #f5f5f7`,
          background: "#050506",
        }}
      />
    </div>
  );
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const size = Number(await id);
  return new ImageResponse(<Mark size={size} />, { width: size, height: size });
}
