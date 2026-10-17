"use client";

import { LangProvider } from "@/i18n/LangProvider";
import { ReleaseProvider } from "@/lib/release";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <ReleaseProvider>{children}</ReleaseProvider>
    </LangProvider>
  );
}
