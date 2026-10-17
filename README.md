# sarke-web

Website for **Sarke** (სარკე, "mirror"): a free Windows app that merges two or more PCs on the same LAN into one workspace — one cursor, and windows and files dragged between machines.

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

`src/config.ts` holds the GitHub repo that publishes the **app releases** (it feeds the download button and the live version/size/SHA-256 readouts):

- `GITHUB_OWNER`, `GITHUB_REPO`: currently `TODO`. Edit the file, or set `NEXT_PUBLIC_GITHUB_OWNER` / `NEXT_PUBLIC_GITHUB_REPO` in Vercel.
- `ASSET_NAME = "sarke-windows-x64.zip"`, `CHECKSUM_ASSET = "sarke-windows-x64.zip.sha256"`.

Until the repo is set, the download section shows `release info unavailable` and never shows invented numbers.

## Open TODOs

- Release repo owner/name (`src/config.ts`)
- `config.json` key reference and CMake build commands for `/docs` (from the Sarke C++ repo's `config.json` and `CLAUDE.md`)
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
