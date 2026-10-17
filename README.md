# sarke-web

Website for **Sarke** (სარკე, "mirror"): a free Windows app that connects two PCs on the same LAN for edge crossing and window mirroring.

Next.js (App Router) · TypeScript · CSS Modules + CSS custom properties · GSAP + ScrollTrigger · self-hosted JetBrains Mono / Noto Sans Georgian.

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

## Structure

- `src/app`: routes (`/`, `/docs`), metadata, OG image, favicons, sitemap, robots
- `src/components`: one folder per section, each with its own CSS module
- `src/components/DeskScene`: the hero/how-it-works SVG illustration and its GSAP timeline
- `src/i18n`: all copy (`en.ts` source of truth, `ka.ts` Georgian). The EN/KA choice is stored in `localStorage`
- `src/app/globals.css`: design tokens. Values match the app exactly; don't change them

## Deploy (Vercel)

Import the repo in Vercel. The framework preset is detected automatically and no settings are needed. Optionally set `NEXT_PUBLIC_SITE_URL` (canonical URL for Open Graph) and the two `NEXT_PUBLIC_GITHUB_*` variables.
