import Image from "next/image";

const signals = [
  { x: 52, y: 18, value: "3", label: "North" },
  { x: 63, y: 48, value: "9", label: "Beqaa" },
  { x: 40, y: 33, value: "1", label: "Beirut + ML" },
  { x: 38, y: 74, value: "8", label: "South" },
];

export function HeroScan() {
  return (
    <div
      className="hero-scan live-hero-scan"
      aria-label="Summary of the January 2024 model-screening release by Lebanon region"
    >
      <div className="scan-topline">
        <span className="scan-brand">
          <Image src="/brand/nuwatt-symbol.webp" alt="" width={28} height={28} />
          <span><i /> Public evidence release</span>
        </span>
        <code>SATLAS · 2024-01 · V1</code>
      </div>
      <div className="scan-canvas">
        <div className="map-grid" aria-hidden="true" />
        <svg className="lebanon-shape" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id="country-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#17384e" />
              <stop offset="1" stopColor="#102938" />
            </linearGradient>
          </defs>
          <path
            d="M57 3 69 11 67 23 73 35 66 46 68 57 59 68 61 82 49 96 39 88 40 74 32 62 37 50 31 39 39 27 42 14Z"
            fill="url(#country-fill)"
            stroke="#52bcdd"
            strokeWidth="1"
          />
          <path d="M42 15 64 22M36 39l31 8M36 62l25 7M40 75l20 7" stroke="#52bcdd" strokeOpacity=".22" />
        </svg>
        {signals.map((signal, index) => (
          <span
            className={`signal signal-${index + 1}`}
            style={{ left: `${signal.x}%`, top: `${signal.y}%` }}
            key={signal.label}
          >
            <i />
            <b>{signal.value}</b>
            <small>{signal.label}</small>
          </span>
        ))}
        <div className="scan-beam" aria-hidden="true" />
        <div className="map-readout">
          <span>Model-screened candidates</span>
          <strong>21</strong>
          <small>Large installations · 18 public cells</small>
        </div>
      </div>
      <div className="scan-legend">
        <span><i className="dot detected" /> Model screened</span>
        <span><i className="dot verified" /> 2 OSM matches</span>
        <span><i className="dot estimated" /> Sentinel-2 · 10 m</span>
      </div>
    </div>
  );
}
