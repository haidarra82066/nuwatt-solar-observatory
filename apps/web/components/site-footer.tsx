import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer production-footer">
      <div className="shell footer-grid">
        <div>
          <BrandMark />
          <p className="footer-note">Open, source-aware solar intelligence for Lebanon&apos;s energy transition.</p>
          <span className="footer-live-state"><i /> Public screening release online</span>
        </div>
        <div>
          <p className="footer-label">Observatory</p>
          <Link href="/observatory">Interactive map</Link>
          <Link href="/observatory#insights">Regional insights</Link>
          <Link href="/experiments">Experiment log</Link>
        </div>
        <div>
          <p className="footer-label">Evidence</p>
          <Link href="/methodology">Methodology</Link>
          <Link href="/data">Data catalogue</Link>
          <a href="/data/experiments/lbn-satlas-screening-2024-01-v1.geojson">Screening GeoJSON</a>
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
        <span>Satlas screening snapshot January 2024 · LCEC benchmark end 2023</span>
      </div>
    </footer>
  );
}
