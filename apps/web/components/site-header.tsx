import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

const navigation = [
  { href: "/observatory", label: "Observatory" },
  { href: "/experiments", label: "Experiments" },
  { href: "/methodology", label: "Methodology" },
  { href: "/data", label: "Data & API" },
  { href: "/roadmap", label: "Roadmap" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <a className="desktop-nuwatt-link" href="https://www.nuwatt.co/en" target="_blank" rel="noreferrer">
          NuWatt.com <span aria-hidden="true">↗</span>
        </a>
        <Link className="button button-small button-brand desktop-cta" href="/observatory">
          Open the map
          <span aria-hidden="true">→</span>
        </Link>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <a href="https://www.nuwatt.co/en" target="_blank" rel="noreferrer">NuWatt.com ↗</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
