import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

const navigation = [
  { href: "/observatory", label: "Evidence atlas" },
  { href: "/observatory#insights", label: "Regional statistics" },
  { href: "/methodology", label: "Methods" },
  { href: "/data", label: "Data & API" },
];

export function SiteHeader() {
  return (
    <header className="site-header production-header">
      <div className="shell header-inner">
        <BrandMark />
        <span className="header-release-status"><i /> Public release</span>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>
        <a className="desktop-nuwatt-link" href="https://www.nuwatt.co/en" target="_blank" rel="noreferrer">
          NuWatt.com <span aria-hidden="true">↗</span>
        </a>
        <Link className="button button-small button-brand desktop-cta" href="/observatory">
          Open atlas <span aria-hidden="true">→</span>
        </Link>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
            <a href="https://www.nuwatt.co/en" target="_blank" rel="noreferrer">NuWatt.com ↗</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
