import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer production-footer">
      <div className="shell footer-grid">
        <div>
          <BrandMark />
          <p className="footer-note">Versioned geospatial evidence for Lebanon&apos;s solar transition.</p>
          <span className="footer-live-state"><i /> Public release 01 available</span>
        </div>
        <div>
          <p className="footer-label">Atlas</p>
          <Link href="/observatory">Geospatial explorer</Link>
          <Link href="/observatory#insights">Regional statistics</Link>
          <Link href="/data">Current release</Link>
        </div>
        <div>
          <p className="footer-label">Evidence</p>
          <Link href="/methodology">Methodology</Link>
          <Link href="/data">Release catalogue</Link>
          <a href="/api/v1/screening">Screening GeoJSON</a>
          <a href="/openapi.json">OpenAPI</a>
        </div>
        <div>
          <p className="footer-label">NuWatt ecosystem</p>
          <a href="https://www.nuwatt.co/en" target="_blank" rel="noreferrer">NuWatt website ↗</a>
          <a href="https://www.admin.nuwatt.co/login" target="_blank" rel="noreferrer">Admin portal ↗</a>
          <a href="https://portal.nuwatt.co/login/" target="_blank" rel="noreferrer">Installer portal ↗</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 NuWatt</span>
        <span>Satlas screening snapshot: January 2024 · LCEC benchmark: end 2023</span>
      </div>
    </footer>
  );
}
