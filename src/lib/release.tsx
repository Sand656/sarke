"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ASSET_NAME, CHECKSUM_ASSET, GITHUB_OWNER, GITHUB_REPO, RELEASE_API_URL, isRepoConfigured } from "@/config";

export type ReleaseInfo = {
  version: string;
  date: string; // YYYY-MM-DD
  sizeBytes: number | null;
  downloads: number | null;
  sha256: string | null;
};

export type ReleaseState =
  | { status: "loading" }
  | { status: "ok"; data: ReleaseInfo }
  | { status: "error" };

type GhAsset = {
  id: number;
  name: string;
  size: number;
  download_count: number;
  digest?: string | null;
};

type GhRelease = { tag_name: string; published_at: string | null; created_at: string; assets: GhAsset[] };

const ReleaseContext = createContext<ReleaseState>({ status: "loading" });

const SHA_RE = /\b[a-f0-9]{64}\b/i;

async function fetchChecksum(release: GhRelease, zip: GhAsset | undefined): Promise<string | null> {
  // GitHub publishes a sha256 digest for every uploaded asset.
  const digest = zip?.digest;
  if (digest?.startsWith("sha256:")) return digest.slice(7).toLowerCase();

  // Fall back to the .sha256 asset. The API asset endpoint is CORS-enabled; the github.com download URL is not.
  const shaAsset = release.assets.find((a) => a.name === CHECKSUM_ASSET);
  if (!shaAsset) return null;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/assets/${shaAsset.id}`,
      { headers: { Accept: "application/octet-stream" } },
    );
    if (!res.ok) return null;
    const match = (await res.text()).match(SHA_RE);
    return match ? match[0].toLowerCase() : null;
  } catch {
    return null;
  }
}

async function loadRelease(signal: AbortSignal): Promise<ReleaseInfo> {
  const res = await fetch(RELEASE_API_URL, {
    headers: { Accept: "application/vnd.github+json" },
    signal,
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const release = (await res.json()) as GhRelease;
  const zip = release.assets.find((a) => a.name === ASSET_NAME);
  const sha256 = await fetchChecksum(release, zip);
  return {
    version: release.tag_name.replace(/^v/i, ""),
    date: (release.published_at ?? release.created_at).slice(0, 10),
    sizeBytes: zip ? zip.size : null,
    downloads: zip ? zip.download_count : null,
    sha256,
  };
}

export function ReleaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ReleaseState>(isRepoConfigured ? { status: "loading" } : { status: "error" });

  useEffect(() => {
    if (!isRepoConfigured) return;
    const controller = new AbortController();
    loadRelease(controller.signal)
      .then((data) => setState({ status: "ok", data }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  return <ReleaseContext.Provider value={state}>{children}</ReleaseContext.Provider>;
}

export function useRelease() {
  return useContext(ReleaseContext);
}

export function formatMB(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
