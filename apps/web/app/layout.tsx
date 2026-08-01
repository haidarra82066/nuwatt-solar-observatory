import type { Metadata, Viewport } from "next";
import "maplibre-gl/dist/maplibre-gl.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nuwatt-solar-observatory.vercel.app"),
  title: {
    default: "NuWatt Open Solar Observatory",
    template: "%s · NuWatt Observatory",
  },
  description:
    "A versioned public atlas of model-screened solar observations and regional capacity estimates for Lebanon.",
  keywords: [
    "Lebanon solar map",
    "solar observatory",
    "photovoltaic model screening",
    "open geospatial data",
    "NuWatt",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "NuWatt Open Solar Observatory",
    description: "Versioned geospatial evidence for Lebanon's solar transition.",
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "NuWatt Open Solar Observatory",
    images: [
      {
        url: "/og-release-01.png",
        width: 1744,
        height: 910,
        alt: "NuWatt Open Solar Observatory — Lebanon Solar Evidence Atlas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NuWatt Open Solar Observatory",
    description: "Versioned geospatial evidence for Lebanon's solar transition.",
    images: ["/og-release-01.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f23",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
