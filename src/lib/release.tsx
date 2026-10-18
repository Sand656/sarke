"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DOWNLOAD_URL, SETUP_CHECKSUM } from "@/config";

/**
 * Live facts about the installer, read with a HEAD request to the storage bucket
 * (CORS is open on Supabase public storage). Nothing is invented: if the request fails,
 * the site shows "unavailable" and the download button still works.
 */
export type ReleaseInfo = {
  date: string | null; // ISO timestamp of the upload
  sizeBytes: number | null;
  sha256: string | null; // only when the live file matches the published checksum
};

export type ReleaseState = { status: "loading" } | { status: "ok"; data: ReleaseInfo } | { status: "error" };

const ReleaseContext = createContext<ReleaseState>({ status: "loading" });

async function loadRelease(signal: AbortSignal): Promise<ReleaseInfo> {
  const res = await fetch(DOWNLOAD_URL, { method: "HEAD", cache: "no-store", signal });
  if (!res.ok) throw new Error(`Download HEAD ${res.status}`);
  const length = Number(res.headers.get("content-length"));
  const modified = res.headers.get("last-modified");
  const date = modified ? new Date(modified).toISOString() : null;
  const size = Number.isFinite(length) && length > 0 ? length : null;
  const matchesPublished = size === SETUP_CHECKSUM.size && date === SETUP_CHECKSUM.lastModified;
  return { date, sizeBytes: size, sha256: matchesPublished ? SETUP_CHECKSUM.sha256 : null };
}

export function ReleaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ReleaseState>({ status: "loading" });

  useEffect(() => {
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

// Spelled out here: not every browser ships Georgian date data.
const KA_MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Dates in words, no dashes: "October 18, 2026" / "18 ოქტომბერი, 2026". */
export function formatDate(iso: string, lang: "en" | "ka") {
  const d = new Date(iso);
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return lang === "ka" ? `${day} ${KA_MONTHS[d.getUTCMonth()]}, ${year}` : `${EN_MONTHS[d.getUTCMonth()]} ${day}, ${year}`;
}

export function formatMB(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
