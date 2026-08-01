import type { Metadata } from "next";
import Link from "next/link";

import { nationalCapacityBenchmark } from "@/lib/benchmark";
import { getScreeningRelease } from "@/lib/screening-server";

export const metadata: Metadata = {
  title: "Data & API",
  description:
    "Inspect NuWatt Observatory releases, public contracts, provenance, and machine-readable endpoints.",
};

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/screening",
    copy: "Current real AI screening release with 5 km cells and complete provenance metadata.",
    current: true,
  },
  {
    method: "GET",
    path: "/api/v1/benchmark",
    copy: "Published LCEC capacity context, kept separate from AI-screened locations.",
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
          <div><p className="eyebrow eyebrow-light">Open data · Contract first</p><h1>Data people can inspect, qualify, and <em>reproduce.</em></h1></div>
          <p>Each release is immutable. New imagery and models create a new version instead of silently rewriting the historical record.</p>
        </div>
      </section>

      <div className="shell notice-wrap">
        <aside className="demo-notice public-release-notice" aria-label="Current public release">
          <span className="notice-dot" aria-hidden="true" />
          <div><strong>Real public screening data is available</strong><span>The live map and `/api/v1/screening` use the licensed Satlas release. The regional benchmark is published separately and is never presented as mapped installations.</span></div>
        </aside>
      </div>

      <section className="section shell release-grid">
        <article className="release-card primary-release screening-release">
          <div><span className="status-badge screening-share">Current public map · caveated</span><code>{release.metadata.release}</code></div>
          <h2>Lebanon large-installation screening</h2>
          <p>{release.metadata.candidate_count} AI-screened candidates aggregated into {release.features.length} privacy-safe 5 km cells. {release.metadata.corroborated_candidate_count} candidates overlap independently mapped photovoltaic generators. This is not a rooftop or capacity inventory.</p>
          <dl><div><dt>Candidates</dt><dd>{release.metadata.candidate_count} screened</dd></div><div><dt>Corroborated</dt><dd>{release.metadata.corroborated_candidate_count} facilities</dd></div><div><dt>Sensor</dt><dd>Sentinel-2 · 10 m</dd></div></dl>
          <div className="button-row">
            <Link className="button button-primary" href="/observatory">Open live map</Link>
            <a className="button button-secondary" href="/api/v1/screening">Open API ↗</a>
            <a className="button button-secondary" href="/api/v1/screening">Open GeoJSON ↗</a>
          </div>
        </article>

        <article className="release-card primary-release">
          <div><span className="status-badge benchmark">Published research context</span><code>lcec-solar-pv-status-2023</code></div>
          <h2>Lebanon regional capacity benchmark</h2>
          <p>{nationalCapacityBenchmark.totalCapacityMwp.toLocaleString("en-GB", { maximumFractionDigits: 2 })} MWp cumulative installed-capacity estimate across {nationalCapacityBenchmark.regions.length} governorates at the end of 2023. This layer provides regional context and does not locate individual systems.</p>
          <dl><div><dt>Total estimate</dt><dd>{nationalCapacityBenchmark.totalCapacityMwp.toLocaleString("en-GB", { maximumFractionDigits: 2 })} MWp</dd></div><div><dt>Regions</dt><dd>{nationalCapacityBenchmark.regions.length}</dd></div><div><dt>Source</dt><dd>LCEC</dd></div></dl>
          <div className="button-row"><Link className="button button-primary" href="/observatory">Compare on map</Link><a className="button button-secondary" href="/api/v1/benchmark">Open API ↗</a></div>
        </article>

        <article className="release-card future-release">
          <span className="status-badge estimated">Coverage roadmap</span>
          <h2>Higher-resolution rooftop coverage</h2>
          <p>A future detection release requires legally licensed imagery at 0.5 m/pixel or better, local labels, a Lebanon holdout set, calibrated thresholds, and privacy-safe aggregation.</p>
          <ul><li>Representative urban coverage</li><li>Model card and evaluation slices</li><li>Imagery and label provenance</li><li>Correction workflow</li></ul>
        </article>
      </section>

      <section className="section soft-section">
        <div className="shell api-layout">
          <div className="section-heading">
            <p className="eyebrow">Public API · v1</p>
            <h2>Useful from a browser, notebook, or planning tool.</h2>
            <p>Public endpoints are read-only and require no API key. Current and legacy data modes are named explicitly in their responses.</p>
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
          <div><p className="eyebrow">Minimum evidence contract</p><h2>A number without lineage is not data.</h2></div>
          <p>Every production observation must be traceable through its source asset, model run, validation, aggregation, and release decision.</p>
        </div>
        <div className="contract-grid">
          {contractFields.map(([title, fields], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><code>{fields}</code></article>)}
        </div>
      </section>
    </>
  );
}
