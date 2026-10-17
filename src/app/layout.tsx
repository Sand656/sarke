import type { Metadata, Viewport } from "next";
import "./globals.css";
import { georgian, mono } from "./fonts";
import { Footer } from "@/components/Footer/Footer";
import { Nav } from "@/components/Nav/Nav";
import { Providers } from "@/components/Providers";
import { SITE_URL } from "@/config";
import en from "@/i18n/en";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: en.meta.title,
  description: en.meta.description,
  applicationName: "Sarke",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Sarke",
    title: en.meta.title,
    description: en.meta.description,
    url: "/",
    locale: "en_US",
    alternateLocale: ["ka_GE"],
  },
  twitter: {
    card: "summary_large_image",
    title: en.meta.title,
    description: en.meta.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${georgian.variable}`}>
      <body>
        <Providers>
          <Nav />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
