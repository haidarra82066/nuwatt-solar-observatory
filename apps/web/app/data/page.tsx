import type { Metadata } from "next";

import { DemoNotice } from "@/components/demo-notice";

export const metadata: Metadata = {
  title: "Data & API",
  description: "Inspect NuWatt Observatory releases, public contracts, provenance, and machine-readable endpoints.",
};

const endpoints = [
  { method: "GET", path: "/api/v1/benchmark", copy: "Published LCEC capacity context, clearly separated from AI-detected locations." },
  { method: "GET", path: "/api/v1/summary", copy: "Release totals, uncertainty ranges, coverage, confidence, and evidence counts." },
  { method: "GET", path: "/api/v1/cells", copy: "GeoJSON evidence cells, filterable by evidence status and governorate." },
  { method: "GET", path: "/api/v1/municipalities", copy: "Municipality-level ranking with P50 capacity, generation, and confidence." },
  { method: "GET", path: "/api/v1/health", copy: "Service status, data-release identifier, and server timestamp." },
];

const contractFields = [
  ["Evidence", "status, confidence, validation source, model version"],
  ["Imagery", "provider, product, acquisition date, GSD, licence identifier"],
  ["Geometry", "public aggregate cell, restricted source geometry reference"],
  ["Capacity", "array area and P10/P50/P90 MWp"],
  ["Generation", "yield-model version and annual P10/P50/P90 GWh"],
  ["Release", "dataset version, published time, lineage, supersession state"],
];

export default function DataPage() {
  return (
    <>
      <section className="subpage-hero data-hero">
        <div className="shell subpage-hero-grid">
          <div><p className="eyebrow eyebrow-light">Open data · Contract first</p><h1>Data people can inspect, qualify, and <em>reproduce.</em></h1></div>
          <p>Each release is immutable. New imagery and models create a new version instead of silently rewriting the historical record.</p>
        </div>
      </section>

      <div className="shell notice-wrap"><DemoNotice /></div>

      <section className="section shell release-grid">
        <article className="release-card experiment-release screening-release">
          <div><span className="status-badge screening-share">Actual AI screening · caveated</span><code>lbn-satlas-screening-2024-01-v1</code></div>
          <h2>Lebanon large-installation screening</h2>
          <p>Twenty-one AI-screened solar-farm candidates aggregated into 18 privacy-safe 5 km cells. Two candidates overlap independently mapped photovoltaic generators. This is not a rooftop or capacity inventory.</p>
          <dl><div><dt>Candidates</dt><dd>21 screened</dd></div><div><dt>Corroborated</dt><dd>2 candidates</dd></div><div><dt>Sensor</dt><dd>Sentinel-2 · 10 m</dd></div></dl>
          <div className="button-row">
            <a className="button button-primary" href="/experiments/satlas-lebanon-2024">Open heatmap</a>
            <a className="button button-secondary" href="/data/experiments/lbn-satlas-screening-2024-01-v1.geojson" download>Download screening GeoJSON <span>↓</span></a>
          </div>
        </article>
        <article className="release-card experiment-release">
          <div><span className="status-badge experiment-failed">Actual AI run · no detection release</span><code>beirut-port-oam-2020-v1</code></div>
          <h2>First free open-imagery experiment</h2>
          <p>Actual tiled inference over 0.383 km² of CC BY 4.0 Beirut imagery. Human review rejected all 39 unique proposals, so zero detections—and no misleading heatmap—were published.</p>
          <dl><div><dt>Result</dt><dd>0 accepted</dd></div><div><dt>Validation</dt><dd>Needs revision</dd></div><div><dt>Imagery</dt><dd>12.1 cm · 2020</dd></div></dl>
          <div className="button-row">
            <a className="button button-primary" href="/experiments/beirut-port-2020">Inspect experiment</a>
            <a className="button button-secondary" href="/data/experiments/beirut-port-oam-2020-v1.geojson" download>Download result GeoJSON <span>↓</span></a>
          </div>
        </article>
        <article className="release-card primary-release">
          <div><span className="status-badge detected">Current</span><code>demo-2026-01</code></div>
          <h2>Synthetic foundation release</h2>
          <p>Ten generalized synthetic cells exercising the public interface. No AI-detected or measured installations are included.</p>
          <dl><div><dt>Format</dt><dd>GeoJSON</dd></div><div><dt>Licence</dt><dd>CC0 1.0</dd></div><div><dt>Schema</dt><dd>v1</dd></div></dl>
          <a className="button button-primary" href="/data/demo-grid.geojson" download>Download GeoJSON <span>↓</span></a>
        </article>
        <article className="release-card future-release">
          <span className="status-badge estimated">Planned</span>
          <h2>Pilot evidence release</h2>
          <p>Privacy-safe 250 m-or-larger aggregates from representative Lebanese environments after imagery, privacy, and model gates pass.</p>
          <ul><li>20-50 km² validated coverage</li><li>Model card and evaluation slices</li><li>Imagery and label provenance</li><li>Correction workflow</li></ul>
        </article>
      </section>

      <section className="section soft-section">
        <div className="shell api-layout">
          <div className="section-heading">
            <p className="eyebrow">Public API · v1</p>
            <h2>Useful from a browser, notebook, or planning tool.</h2>
            <p>Foundation endpoints are read-only and require no API key. Production rate limits and release caching will be added before public beta.</p>
            <a className="text-link" href="/openapi.json">Download OpenAPI definition <span>↗</span></a>
          </div>
          <div className="endpoint-list">
            {endpoints.map((endpoint) => (
              <a href={endpoint.path} key={endpoint.path}>
                <div><span>{endpoint.method}</span><code>{endpoint.path}</code></div>
                <p>{endpoint.copy}</p>
                <i aria-hidden="true">↗</i>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split-heading compact-heading">
          <div><p className="eyebrow">Minimum evidence contract</p><h2>A number without lineage is not data.</h2></div>
          <p>Every production observation must be traceable through its source asset, model run, calibration, aggregation, and release.</p>
        </div>
        <div className="contract-grid">
          {contractFields.map(([title, fields], index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><code>{fields}</code></article>
          ))}
        </div>
      </section>
    </>
  );
}
