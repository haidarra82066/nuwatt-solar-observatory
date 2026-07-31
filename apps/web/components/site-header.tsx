import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

const navigation = [
  { href: "/observatory", label: "Observatory" },
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
        <Link className="button button-small button-light desktop-cta" href="/observatory">
          Explore the demo
          <span aria-hidden="true">↗</span>
        </Link>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
