import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <BrandMark />
          <p className="footer-note">
            Transparent geospatial evidence for Lebanon&apos;s distributed energy transition.
          </p>
        </div>
        <div>
          <p className="footer-label">Explore</p>
          <Link href="/observatory">Observatory</Link>
          <Link href="/methodology">Methodology</Link>
          <Link href="/roadmap">MVP roadmap</Link>
        </div>
        <div>
          <p className="footer-label">Open data</p>
          <Link href="/data">Data catalogue</Link>
          <a href="/openapi.json">OpenAPI</a>
          <a href="/api/v1/health">API health</a>
        </div>
        <div>
          <p className="footer-label">NuWatt ecosystem</p>
          <a href="https://www.nuwatt.co/en" target="_blank" rel="noreferrer">NuWatt website ↗</a>
          <a href="https://www.admin.nuwatt.co/login" target="_blank" rel="noreferrer">Installer portal ↗</a>
          <a href="https://portal.nuwatt.co/login/" target="_blank" rel="noreferrer">Client portal ↗</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 NuWatt</span>
        <span>Foundation release · Synthetic demonstration data</span>
      </div>
    </footer>
  );
}
