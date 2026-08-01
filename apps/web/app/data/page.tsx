import type { Metadata } from "next";
import Link from "next/link";

import { nationalCapacityBenchmark } from "@/lib/benchmark";
import { getScreeningRelease } from "@/lib/screening-server";

export const metadata: Metadata = {
  title: "Data & API",
  description:
    "Versioned NuWatt Observatory releases, provenance records, and machine-readable public endpoints.",
};

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/screening",
    copy: "Current model-screening release with 5 km public cells and provenance metadata.",
    current: true,
  },
  {
    method: "GET",
    path: "/api/v1/benchmark",
    copy: "Published LCEC capacity context, kept separate from model-screened locations.",
    current: true,
  },
  {
    method: "GET",
    path: "/api/v1/health",
    copy: "Service status plus current public and legacy contract release identifiers.",
    current: true,
  },
];

const contractFields = [
  ["Evidence", "state, corroboration, source and allowed claim"],
  ["Imagery", "product, acquisition date, GSD and licence"],
  ["Geometry", "public aggregate cell and restricted source reference"],
  ["Capacity", "P10/P50/P90 only when the estimation gate passes"],
  ["Yield", "technical yield only; never actual delivered generation"],
  ["Release", "immutable version, lineage and publication decision"],
];

export default async function DataPage() {
  const release = await getScreeningRelease();

  return (
    <>
      <section className="subpage-hero data-hero">
        <div className="shell subpage-hero-grid">
          <div><p className="eyebrow eyebrow-light">Public releases · Data and API</p><h1>Versioned evidence with <em>documented provenance.</em></h1></div>
          <p>Published releases are immutable. New source imagery, model versions, or validation decisions produce a new release rather than altering the historical record.</p>
        </div>
      </section>

      <div className="shell notice-wrap">
        <aside className="demo-notice public-release-notice" aria-label="Current public release">
          <span className="notice-dot" aria-hidden="true" />
          <div><strong>Current screening release available</strong><span>The atlas and `/api/v1/screening` publish the licensed Satlas screening layer. The regional benchmark is maintained as a separate evidence class.</span></div>
        </aside>
      </div>

      <section className="section shell release-grid">
        <article className="release-card primary-release screening-release">
          <div><span className="status-badge screening-share">Model-screening release · qualified</span><code>{release.metadata.release}</code></div>
          <h2>Lebanon large-installation screening release</h2>
          <p>{release.metadata.candidate_count} model-screened candidates are aggregated into {release.features.length} public 5 km cells. {release.metadata.corroborated_candidate_count} candidates intersect independently mapped photovoltaic generators. The release is not a rooftop or capacity inventory.</p>
          <dl><div><dt>Candidates</dt><dd>{release.metadata.candidate_count} screened</dd></div><div><dt>Corroborated</dt><dd>{release.metadata.corroborated_candidate_count} facilities</dd></div><div><dt>Sensor</dt><dd>Sentinel-2 · 10 m</dd></div></dl>
          <div className="button-row">
            <Link className="button button-primary" href="/observatory">Open evidence atlas</Link>
            <a className="button button-secondary" href="/api/v1/screening">Open API ↗</a>
            <a className="button button-secondary" href="/api/v1/screening">Open GeoJSON ↗</a>
          </div>
        </article>

        <article className="release-card primary-release">
          <div><span className="status-badge benchmark">Published regional benchmark</span><code>lcec-solar-pv-status-2023</code></div>
          <h2>Lebanon regional capacity benchmark</h2>
          <p>{nationalCapacityBenchmark.totalCapacityMwp.toLocaleString("en-GB", { maximumFractionDigits: 2 })} MWp cumulative installed-capacity estimate across {nationalCapacityBenchmark.regions.length} governorates at the end of 2023. This layer provides regional context and does not locate individual systems.</p>
          <dl><div><dt>Total estimate</dt><dd>{nationalCapacityBenchmark.totalCapacityMwp.toLocaleString("en-GB", { maximumFractionDigits: 2 })} MWp</dd></div><div><dt>Regions</dt><dd>{nationalCapacityBenchmark.regions.length}</dd></div><div><dt>Source</dt><dd>LCEC</dd></div></dl>
          <div className="button-row"><Link className="button button-primary" href="/observatory">Compare on map</Link><a className="button button-secondary" href="/api/v1/benchmark">Open API ↗</a></div>
        </article>

        <article className="release-card future-release">
          <span className="status-badge estimated">Next observation class</span>
          <h2>Higher-resolution rooftop detection</h2>
          <p>A rooftop-detection release requires legally licensed imagery at 0.5 m/pixel or better, locally representative labels, an independent Lebanon holdout set, calibrated thresholds, and privacy-preserving aggregation.</p>
          <ul><li>Representative urban coverage</li><li>Model card and evaluation slices</li><li>Imagery and label provenance</li><li>Correction workflow</li></ul>
        </article>
      </section>

      <section className="section soft-section">
        <div className="shell api-layout">
          <div className="section-heading">
            <p className="eyebrow">Public API · Version 1</p>
            <h2>Read-only endpoints for analysis and integration.</h2>
            <p>Public endpoints require no API key. Each response identifies its release, evidence class, source period, and publication constraints.</p>
            <a className="text-link" href="/openapi.json">Download OpenAPI definition <span>↗</span></a>
          </div>
          <div className="endpoint-list">
            {endpoints.map((endpoint) => (
              <a href={endpoint.path} key={endpoint.path}>
                <div><span>{endpoint.method}</span><code>{endpoint.path}</code>{endpoint.current && <b>PUBLIC</b>}</div>
                <p>{endpoint.copy}</p><i aria-hidden="true">↗</i>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split-heading compact-heading">
          <div><p className="eyebrow">Publication metadata</p><h2>Required fields for every observation.</h2></div>
          <p>Each production observation must be traceable through its source asset, model run, validation, aggregation, and release decision.</p>
        </div>
        <div className="contract-grid">
          {contractFields.map(([title, fields], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><code>{fields}</code></article>)}
        </div>
      </section>
    </>
  );
}
