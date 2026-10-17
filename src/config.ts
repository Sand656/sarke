// Single source of configuration for the site.
// TODO: set GITHUB_OWNER / GITHUB_REPO to the repository that publishes the Sarke app releases.
// They can also be set with NEXT_PUBLIC_GITHUB_OWNER / NEXT_PUBLIC_GITHUB_REPO (e.g. in Vercel).
export const GITHUB_OWNER: string = process.env.NEXT_PUBLIC_GITHUB_OWNER || "TODO";
export const GITHUB_REPO: string = process.env.NEXT_PUBLIC_GITHUB_REPO || "TODO";

export const ASSET_NAME = "sarke-windows-x64.zip";
export const CHECKSUM_ASSET = "sarke-windows-x64.zip.sha256";

export const isRepoConfigured = GITHUB_OWNER !== "TODO" && GITHUB_REPO !== "TODO";

export const REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
export const RELEASES_URL = `${REPO_URL}/releases`;
export const DOWNLOAD_URL = `${REPO_URL}/releases/latest/download/${ASSET_NAME}`;
export const RELEASE_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

// Canonical site URL used for Open Graph / sitemap. Vercel sets VERCEL_PROJECT_PRODUCTION_URL automatically.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
