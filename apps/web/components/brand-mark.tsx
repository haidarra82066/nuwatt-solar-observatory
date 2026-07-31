import Link from "next/link";

export function BrandMark() {
  return (
    <Link className="brand" href="/" aria-label="NuWatt Open Solar Observatory home">
      <span className="brand-orbit" aria-hidden="true">
        <span />
        <span />
      </span>
      <span className="brand-copy">
        <strong>NuWatt</strong>
        <small>Open Solar Observatory</small>
      </span>
    </Link>
  );
}
