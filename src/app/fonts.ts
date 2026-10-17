import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";

// Text: Google Sans (variable, OFL) — one family for both English and Georgian, imported as
// CSS in the root layout so each script's subset loads only when it's on the page.
// Code and commands: Geist Mono.
export const mono = GeistMono;

// The footer wordmark keeps its original Geist letterforms; loaded on demand, not preloaded.
export const wordmark = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.woff2",
  weight: "600",
  variable: "--font-wordmark",
  display: "swap",
  preload: false,
});
