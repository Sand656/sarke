import type { Metadata, Viewport } from "next";
import "@fontsource-variable/google-sans/index.css";
import "./globals.css";
import { mono, wordmark } from "./fonts";
import { BackToTop } from "@/components/BackToTop/BackToTop";
import { Footer } from "@/components/Footer/Footer";
import { Nav } from "@/components/Nav/Nav";
import { Providers } from "@/components/Providers";
import { RevealManager } from "@/components/RevealManager";
import { SITE_URL } from "@/config";
import en from "@/i18n/en";
import { SmoothScroll } from "@/lib/smooth";
import { THEME_BOOT_SCRIPT } from "@/lib/themeScript";

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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050506" },
    { media: "(prefers-color-scheme: light)", color: "#FBFBFD" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the boot script sets data-theme / .js on <html> before React hydrates
    <html
      lang="en"
      data-theme="dark"
      className={`${mono.variable} ${wordmark.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <Providers>
          <SmoothScroll />
          <RevealManager />
          <Nav />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
