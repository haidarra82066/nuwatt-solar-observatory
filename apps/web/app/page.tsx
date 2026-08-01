import Link from "next/link";

import { HeroScan } from "@/components/hero-scan";
import { MetricIcon } from "@/components/metric-icon";
import { PipelineFlow } from "@/components/pipeline-flow";
import { nationalCapacityBenchmark } from "@/lib/benchmark";
import { getScreeningRelease } from "@/lib/screening-server";

const currentEvidence = [
  {
    label: "Regional benchmark",
    value: "1,081.27 MWp",
    meta: "LCEC cumulative installed-capacity estimate · end of 2023",
    className: "benchmark",
  },
  {
    label: "Model screening",
    value: "21 candidates",
    meta: "Large-installation candidates in the Satlas January 2024 snapshot",
    className: "screened",
  },
  {
    label: "Independent corroboration",
    value: "2 facilities",
    meta: "Photovoltaic generator geometry also mapped in OpenStreetMap",
    className: "corroborated",
  },
];

export default async function Home() {
  const release = await getScreeningRelease();

  return (
    <div className="production-home">
      <section className="production-hero">
        <div className="hero-ambient-grid" aria-hidden="true" />
        <div className="shell hero-grid production-hero-grid">
          <div className="hero-copy production-hero-copy">
            <div className="release-kicker light-kicker"><span className="live-pulse" /> Lebanon Solar Evidence Observatory · Public release 01</div>
            <h1>A national evidence base for <em>solar in Lebanon.</em></h1>
            <p className="hero-lede">
              The observatory integrates model-screened geospatial observations, independent
              corroboration, and published regional capacity estimates in a versioned public record.
            </p>
            <div className="button-row">
              <Link className="button button-accent" href="/observatory">Open evidence atlas <span aria-hidden="true">→</span></Link>
              <Link className="button button-ghost" href="/methodology">Review methodology</Link>
            </div>
            <div className="hero-proof production-proof">
              <span><b>{nationalCapacityBenchmark.totalCapacityMwp.toLocaleString("en-GB", { maximumFractionDigits: 2 })}</b> MWp regional estimate</span>
              <span><b>{release.metadata.candidate_count}</b> model-screened candidates</span>
              <span><b>{release.features.length}</b> published grid cells</span>
            </div>
          </div>
          <HeroScan />
        </div>
      </section>

      <section className="release-ribbon">
        <div className="shell release-ribbon-inner">
          <div><span className="live-pulse" /><strong>Current release</strong><p>Lebanon large-installation screening · January 2024 source snapshot</p></div>
          <div><span>Published records</span><strong>{release.metadata.candidate_count} candidates · {release.metadata.corroborated_candidate_count} OSM matches</strong></div>
          <Link href="/data">View release record <span>→</span></Link>
        </div>
      </section>

      <section className="section shell home-intelligence-intro">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">Current evidence base</p><h2>A national view with <em>explicit evidence classes.</em></h2></div>
          <p>
            Lebanon&apos;s distributed solar fleet is only partially documented. This release distinguishes
            regional market estimates from mapped screening observations and states the limits imposed by
            10 m satellite imagery.
          </p>
        </div>
        <div className="current-evidence-grid">
          {currentEvidence.map((item, index) => (
            <article className={`current-evidence-card ${item.className}`} key={item.label}>
              <span>0{index + 1} · {item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.meta}</p>
              <i />
            </article>
          ))}
        </div>
        <div className="evidence-separation-note">
          <span>Interpretation</span>
          <p>The regional benchmark and model-screening layer describe different populations. They are presented together for context but are never summed or treated as equivalent observations.</p>
        </div>
      </section>

      <section className="home-map-callout">
        <div className="shell home-map-callout-grid">
          <div className="home-map-orbit" aria-hidden="true">
            <ImagePanel />
          </div>
          <div className="section-heading">
            <p className="eyebrow eyebrow-light">Geospatial evidence explorer</p>
            <h2>Inspect every published screening cell and regional benchmark.</h2>
            <p>
              Switch between model screening and regional capacity context. Filter by geography or
              corroboration state, compare screening intensity, and inspect the provenance of each record.
            </p>
            <ul className="home-capability-list">
              <li><MetricIcon name="layers" /><span><strong>Separate evidence classes</strong>Screening observations and regional estimates remain analytically distinct.</span></li>
              <li><MetricIcon name="confidence" /><span><strong>Recorded provenance</strong>Source, licence, imagery date, and resolution accompany every record.</span></li>
              <li><MetricIcon name="coverage" /><span><strong>Public aggregation</strong>All 18 screening cells are published at 5 km; restricted source polygons remain withheld.</span></li>
            </ul>
            <Link className="button button-accent" href="/observatory">Open the atlas <span>→</span></Link>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split-heading compact-heading">
          <div><p className="eyebrow">Publication method</p><h2>A reproducible evidence pipeline.</h2></div>
          <p>
            Licensed imagery passes through model screening, independent review, public aggregation,
            and immutable release controls. Each stage records provenance and publication limits.
          </p>
        </div>
        <PipelineFlow />
      </section>

      <section className="home-public-value">
        <div className="shell public-value-grid">
          <div><p className="eyebrow eyebrow-light">Intended use</p><h2>Designed for analysis and public accountability.</h2></div>
          <div className="public-audience-grid">
            <article><span>01</span><h3>Policy and planning</h3><p>Assess regional context, spatial coverage, and priorities for improved observation.</p></article>
            <article><span>02</span><h3>Research</h3><p>Access versioned records, reproduce releases, and evaluate methodological assumptions.</p></article>
            <article><span>03</span><h3>Solar sector</h3><p>Review market scale and screening evidence without exposing individual households.</p></article>
            <article><span>04</span><h3>Public access</h3><p>Distinguish published observations, statistical estimates, and unresolved evidence gaps.</p></article>
          </div>
        </div>
      </section>

      <section className="cta-section production-cta">
        <div className="shell cta-inner">
          <div><p className="eyebrow eyebrow-light">Public release 01</p><h2>Access the current Lebanon evidence release.</h2></div>
          <div><p>Inspect the screening records, regional benchmark, source documentation, and machine-readable public endpoints.</p><div className="button-row"><Link className="button button-accent" href="/observatory">Open evidence atlas</Link><Link className="button button-ghost" href="/data">Data and API</Link></div></div>
        </div>
      </section>
    </div>
  );
}

function ImagePanel() {
  return (
    <div className="home-map-ui">
      <div className="home-map-ui-top"><span><i /> Screening release summary</span><small>LBN · RELEASE 01</small></div>
      <div className="home-map-ui-canvas">
        <div className="home-map-ui-grid" />
        <span className="map-ui-point point-a"><i />9</span>
        <span className="map-ui-point point-b"><i />8</span>
        <span className="map-ui-point point-c"><i />3</span>
        <span className="map-ui-point point-d corroborated"><i />2</span>
        <div className="home-map-ui-readout"><span>Published records</span><strong>21</strong><small>large-installation candidates</small></div>
      </div>
      <div className="home-map-ui-bottom"><span><i className="screened" /> Model screened</span><span><i className="corroborated" /> OSM match</span><b>5 km grid</b></div>
    </div>
  );
}
