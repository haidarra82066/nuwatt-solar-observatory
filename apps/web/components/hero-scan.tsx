const signals = [
  { x: 52, y: 17, value: "0.82" },
  { x: 39, y: 35, value: "0.91" },
  { x: 64, y: 48, value: "0.68" },
  { x: 34, y: 66, value: "0.84" },
  { x: 57, y: 79, value: "0.77" },
];

export function HeroScan() {
  return (
    <div className="hero-scan" aria-label="Conceptual visualization of solar observations across Lebanon">
      <div className="scan-topline">
        <span><i /> Live evidence layer</span>
        <code>33.8547° N · 35.8623° E</code>
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
            key={`${signal.x}-${signal.y}`}
          >
            <i />
            <b>{signal.value}</b>
          </span>
        ))}
        <div className="scan-beam" aria-hidden="true" />
        <div className="map-readout">
          <span>Model confidence</span>
          <strong>79%</strong>
          <small>Synthetic pilot mean</small>
        </div>
      </div>
      <div className="scan-legend">
        <span><i className="dot verified" /> Verified</span>
        <span><i className="dot detected" /> Detected</span>
        <span><i className="dot estimated" /> AI-estimated</span>
      </div>
    </div>
  );
}
