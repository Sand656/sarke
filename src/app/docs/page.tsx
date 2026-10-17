import type { Metadata } from "next";
import { DocsContent } from "@/components/Docs/DocsContent";
import en from "@/i18n/en";

export const metadata: Metadata = {
  title: en.meta.docsTitle,
  description: en.meta.description,
  alternates: { canonical: "/docs" },
  openGraph: { title: en.meta.docsTitle, url: "/docs" },
};

export default function DocsPage() {
  return <DocsContent />;
}
