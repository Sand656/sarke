# sarke-web

Website for **Sarke** (სარკე, "mirror"): a free Windows app that links two PCs on the same LAN into one workspace — one cursor, a shared clipboard, and windows and files moved between machines.

Next.js (App Router) · TypeScript · CSS Modules + CSS custom properties · React Three Fiber (3D product stage) · GSAP + Lenis · Google Sans (Latin + Georgian, OFL) and Geist Mono.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the build
npm run lint
npm run typecheck
```

## Configure

Everything lives in `src/config.ts`:

- **Download:** `DOWNLOAD_URL` points at the installer in Supabase storage (`releases/SarkeSetup.exe`). Override with `NEXT_PUBLIC_DOWNLOAD_URL` in Vercel. The download section reads the file's size and upload date live, so they update by themselves.
- **Checksum:** `SETUP_CHECKSUM` holds the published SHA-256, pinned to the file's size and upload time. When you upload a new `SarkeSetup.exe`, update all three values (instructions are in the file). Until you do, the site hides the checksum rather than show a stale one.
- **Source code link:** `GITHUB_OWNER` / `GITHUB_REPO` (or `NEXT_PUBLIC_GITHUB_*`). GitHub links stay hidden until set, so nothing points at a 404.

## Open TODOs

- Source repo owner/name (`src/config.ts`)
- CMake build commands for `/docs` (from the Sarke C++ repo's `CLAUDE.md`)
- Team credits and license (footer, `src/i18n/en.ts` + `ka.ts`)

## 3D performance

The device stage (src/components/three) is built to hold 60 fps on integrated GPUs:

- one render pass: no reflections or post-processing; contact shadows are baked sprites;
- screen art is painted once at 2× resolution; the moving window, file, cursor and toast are composited by a shader (screenShader.ts), so no texture is re-uploaded per frame;
- render resolution adapts (2× → 1×) via drei PerformanceMonitor; nothing renders while the stage is off screen.

## Structure

- `src/app`: routes (`/`, `/docs`), metadata, OG image, favicons, sitemap, robots
- `src/components`: one folder per section, each with its own CSS module
- `src/components/three`: the 3D stage — devices, choreography (choreo.ts), screen art (screens.ts) and the GPU compositor (screenShader.ts)
- `src/i18n`: all copy (`en.ts` source of truth, `ka.ts` Georgian). The EN/KA choice is stored in `localStorage`
- `src/app/globals.css`: design tokens (Apple-like neutral palette, one blue accent), type scale, Georgian typography rules

## Deploy (Vercel)

Import the repo in Vercel. The framework preset is detected automatically and no settings are needed. Optionally set `NEXT_PUBLIC_SITE_URL` (canonical URL for Open Graph) and the two `NEXT_PUBLIC_GITHUB_*` variables.
