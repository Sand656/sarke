import localFont from "next/font/local";

// Self-hosted @fontsource files, served via next/font for preload + fallback metrics.
export const mono = localFont({
  src: [
    { path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "Consolas", "monospace"],
});

// Only downloaded when Georgian glyphs are on the page.
export const georgian = localFont({
  src: [
    { path: "../../node_modules/@fontsource/noto-sans-georgian/files/noto-sans-georgian-georgian-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/noto-sans-georgian/files/noto-sans-georgian-georgian-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-georgian",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0589, U+10A0-10FF, U+1C90-1CBF, U+2D00-2D2F" }],
});
