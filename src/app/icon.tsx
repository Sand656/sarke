import { ImageResponse } from "next/og";

// Favicon: accent square on black, at 16 / 32 / 512.
const SIZES = [16, 32, 512];

export function generateImageMetadata() {
  return SIZES.map((s) => ({ id: String(s), size: { width: s, height: s }, contentType: "image/png" }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const size = Number(await id);
  const square = Math.round(size * 0.5);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0B0C",
        }}
      >
        <div style={{ width: square, height: square, background: "#FF5A1F" }} />
      </div>
    ),
    { width: size, height: size },
  );
}
