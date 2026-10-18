// Single source of configuration for the site.

/* ---------- Download (Supabase storage) ---------- */
// The Windows installer. Can be overridden with NEXT_PUBLIC_DOWNLOAD_URL (e.g. in Vercel).
export const DOWNLOAD_URL: string =
  process.env.NEXT_PUBLIC_DOWNLOAD_URL ||
  "https://exsxvdpgiftmwwjwwnze.supabase.co/storage/v1/object/public/releases/SarkeSetup.exe";
export const DOWNLOAD_FILE = "SarkeSetup.exe";
// Supabase's ?download= makes the browser save the file under this name.
export const DOWNLOAD_HREF = `${DOWNLOAD_URL}?download=${DOWNLOAD_FILE}`;

/**
 * Published SHA-256 of the installer, pinned to the uploaded file's size and upload time
 * (headers a browser may read cross-origin; the bucket doesn't expose ETag). The site only
 * shows the checksum while the live file still matches, so a stale checksum is never
 * displayed. After uploading a new build, update all three values:
 *   sha256:       certutil -hashfile SarkeSetup.exe SHA256   (or sha256sum)
 *   size:         Content-Length of the upload                (curl -I <DOWNLOAD_URL>)
 *   lastModified: Last-Modified of the upload, as an ISO date (curl -I <DOWNLOAD_URL>)
 */
export const SETUP_CHECKSUM = {
  sha256: "84c5575a5ee2a2c51899764e0669528f90515eac247874351b40ef636fc6d1ad",
  size: 4593075,
  lastModified: "2026-10-18T03:24:10.000Z",
};

/* ---------- Source code (GitHub) ---------- */
// TODO: set GITHUB_OWNER / GITHUB_REPO to the app's source repository (or NEXT_PUBLIC_GITHUB_* in
// Vercel). GitHub links stay hidden until then, so nothing points at a 404.
export const GITHUB_OWNER: string = process.env.NEXT_PUBLIC_GITHUB_OWNER || "TODO";
export const GITHUB_REPO: string = process.env.NEXT_PUBLIC_GITHUB_REPO || "TODO";
export const isRepoConfigured = GITHUB_OWNER !== "TODO" && GITHUB_REPO !== "TODO";
export const REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
export const RELEASES_URL = `${REPO_URL}/releases`;

// Canonical site URL used for Open Graph / sitemap. Vercel sets VERCEL_PROJECT_PRODUCTION_URL automatically.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
