import Image from "next/image";
import Link from "next/link";

export function BrandMark() {
  return (
    <Link className="brand" href="/" aria-label="NuWatt Open Solar Observatory home">
      <Image
        className="brand-wordmark"
        src="/brand/nuwatt-wordmark.png"
        alt="NuWatt"
        width={182}
        height={20}
        priority
      />
      <span className="brand-product">Open Solar Observatory</span>
    </Link>
  );
}
