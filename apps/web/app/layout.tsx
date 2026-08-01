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
    "Explore Lebanon's open solar evidence map, real AI-screened large-installation candidates, and published regional market research.",
  keywords: [
    "Lebanon solar map",
    "solar observatory",
    "photovoltaic AI",
    "open geospatial data",
    "NuWatt",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "NuWatt Open Solar Observatory",
    description: "Lebanon solar intelligence, layer by layer.",
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "NuWatt Open Solar Observatory",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "NuWatt Open Solar Observatory — Lebanon solar intelligence, layer by layer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NuWatt Open Solar Observatory",
    description: "Lebanon solar intelligence, layer by layer.",
    images: ["/og.png"],
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
