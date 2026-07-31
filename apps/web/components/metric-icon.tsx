type IconName = "panels" | "capacity" | "generation" | "coverage" | "confidence" | "layers";

const paths: Record<IconName, React.ReactNode> = {
  panels: <><rect x="4" y="5" width="16" height="11" rx="1" /><path d="M8 5v11m8-11v11M4 10.5h16M12 16v3m-4 0h8" /></>,
  capacity: <><path d="M13 2 5 13h6l-1 9 8-12h-6l1-8Z" /></>,
  generation: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
  coverage: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15m6-12v15" /></>,
  confidence: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>,
};

export function MetricIcon({ name }: { name: IconName }) {
  return (
    <svg className="metric-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
