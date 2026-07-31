import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://observatory.nuwatt.energy"),
  title: {
    default: "NuWatt Open Solar Observatory",
    template: "%s · NuWatt Observatory",
  },
  description:
    "An open, uncertainty-aware geospatial observatory for Lebanon's distributed solar fleet.",
  openGraph: {
    title: "NuWatt Open Solar Observatory",
    description: "See where solar is growing, how strong the evidence is, and what it could generate.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
