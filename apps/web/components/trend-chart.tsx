const history = [
  { year: "2021", value: 14 },
  { year: "2022", value: 24 },
  { year: "2023", value: 39 },
  { year: "2024", value: 55 },
  { year: "2025", value: 73 },
  { year: "2026", value: 88 },
];

export function TrendChart() {
  const points = history.map((item, index) => `${24 + index * 56},${118 - item.value}`).join(" ");
  const area = `24,118 ${points} 304,118`;

  return (
    <div className="trend-chart">
      <div className="panel-heading">
        <div>
          <span>Illustrative expansion index</span>
          <strong>2021-2026</strong>
        </div>
        <small>Synthetic series</small>
      </div>
      <svg viewBox="0 0 328 142" role="img" aria-label="Illustrative rising solar expansion index from 2021 to 2026">
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#52bcdd" stopOpacity=".32" />
            <stop offset="1" stopColor="#52bcdd" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[38, 78, 118].map((y) => <line x1="24" y1={y} x2="304" y2={y} key={y} />)}
        <polygon points={area} fill="url(#trend-fill)" />
        <polyline points={points} className="trend-line" />
        {history.map((item, index) => (
          <g key={item.year}>
            <circle cx={24 + index * 56} cy={118 - item.value} r="3.5" />
            <text x={24 + index * 56} y="137" textAnchor="middle">{item.year}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
