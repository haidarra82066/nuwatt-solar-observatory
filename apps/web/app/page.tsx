import Link from "next/link";

import { HeroScan } from "@/components/hero-scan";
import { MetricIcon } from "@/components/metric-icon";
import { PipelineFlow } from "@/components/pipeline-flow";
import { nationalCapacityBenchmark } from "@/lib/benchmark";
import { getScreeningRelease } from "@/lib/screening-server";

const currentEvidence = [
  {
    label: "Research benchmark",
    value: "1,081.27 MWp",
    meta: "LCEC cumulative installed-capacity estimate · end of 2023",
    className: "benchmark",
  },
  {
    label: "AI screened",
    value: "21 candidates",
    meta: "Large solar installations in the Satlas January 2024 snapshot",
    className: "screened",
  },
  {
    label: "Independently corroborated",
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
            <div className="release-kicker light-kicker"><span className="live-pulse" /> Lebanon public beta · Real AI screening layer live</div>
            <h1>Make every solar signal <em>visible.</em></h1>
            <p className="hero-lede">
              NuWatt&apos;s open observatory combines Lebanon&apos;s published market research with
              transparent AI screening evidence—on one interactive national map.
            </p>
            <div className="button-row">
              <Link className="button button-accent" href="/observatory">Open the live map <span aria-hidden="true">→</span></Link>
              <Link className="button button-ghost" href="/methodology">How the evidence works</Link>
            </div>
            <div className="hero-proof production-proof">
              <span><b>{nationalCapacityBenchmark.totalCapacityMwp.toLocaleString("en-GB", { maximumFractionDigits: 2 })}</b> MWp research context</span>
              <span><b>{release.metadata.candidate_count}</b> AI-screened candidates</span>
              <span><b>{release.features.length}</b> public evidence cells</span>
            </div>
          </div>
          <HeroScan />
        </div>
      </section>

      <section className="release-ribbon">
        <div className="shell release-ribbon-inner">
          <div><span className="live-pulse" /><strong>Latest release</strong><p>Nationwide large-solar AI screening · January 2024 source snapshot</p></div>
          <div><span>Result</span><strong>{release.metadata.candidate_count} candidates · {release.metadata.corroborated_candidate_count} corroborated</strong></div>
          <Link href="/data">View release record <span>→</span></Link>
        </div>
      </section>

      <section className="section shell home-intelligence-intro">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">Solar intelligence for the public</p><h2>From national totals to <em>visible evidence.</em></h2></div>
          <p>
            Lebanon&apos;s solar market is large, fast-moving, and poorly mapped. The observatory gives
            researchers, planners, industry, and citizens a shared view—without pretending that
            coarse imagery can see every rooftop.
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
          <span>Important</span>
          <p>The market benchmark and AI candidate layer describe different populations. The platform displays both, but never adds them together or treats regional totals as mapped systems.</p>
        </div>
      </section>

      <section className="home-map-callout">
        <div className="shell home-map-callout-grid">
          <div className="home-map-orbit" aria-hidden="true">
            <ImagePanel />
          </div>
          <div className="section-heading">
            <p className="eyebrow eyebrow-light">An evidence map, not a marketing map</p>
            <h2>Zoom from the national picture to every public AI cell.</h2>
            <p>
              Switch between AI screening, research context, and a combined view. Filter by region
              or evidence state, change the heat metric, and inspect the source record behind every mark.
            </p>
            <ul className="home-capability-list">
              <li><MetricIcon name="layers" /><span><strong>Two honest layers</strong>AI screening and regional research stay visibly distinct.</span></li>
              <li><MetricIcon name="confidence" /><span><strong>Evidence provenance</strong>Source, licence, imagery date, and resolution follow every record.</span></li>
              <li><MetricIcon name="coverage" /><span><strong>Privacy-safe detail</strong>All 18 public 5 km cells are visible; exact source polygons remain withheld.</span></li>
            </ul>
            <Link className="button button-accent" href="/observatory">Explore Lebanon now <span>→</span></Link>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split-heading compact-heading">
          <div><p className="eyebrow">The evidence engine</p><h2>Open inputs. Explicit quality gates.</h2></div>
          <p>
            The pipeline moves from licensed imagery to candidate screening, independent review,
            privacy-safe aggregation, and immutable publication. A failed gate stays visible.
          </p>
        </div>
        <PipelineFlow />
      </section>

      <section className="home-public-value">
        <div className="shell public-value-grid">
          <div><p className="eyebrow eyebrow-light">Built for shared decisions</p><h2>One calm layer above fragmented evidence.</h2></div>
          <div className="public-audience-grid">
            <article><span>01</span><h3>Policy & planning</h3><p>See regional context, coverage gaps, and where better evidence is needed.</p></article>
            <article><span>02</span><h3>Research</h3><p>Download versioned data, reproduce releases, and challenge assumptions.</p></article>
            <article><span>03</span><h3>Solar industry</h3><p>Understand market scale without exposing households or overstating precision.</p></article>
            <article><span>04</span><h3>Public</h3><p>Explore what is known, what is inferred, and what still cannot be seen.</p></article>
          </div>
        </div>
      </section>

      <section className="cta-section production-cta">
        <div className="shell cta-inner">
          <div><p className="eyebrow eyebrow-light">Open solar intelligence</p><h2>Lebanon&apos;s evidence map is live.</h2></div>
          <div><p>Start with the real screening release, then follow the evidence as higher-resolution imagery and local validation expand coverage.</p><div className="button-row"><Link className="button button-accent" href="/observatory">Open the observatory</Link><Link className="button button-ghost" href="/data">Download open data</Link></div></div>
        </div>
      </section>
    </div>
  );
}

function ImagePanel() {
  return (
    <div className="home-map-ui">
      <div className="home-map-ui-top"><span><i /> AI evidence surface</span><small>LEBANON · PUBLIC V1</small></div>
      <div className="home-map-ui-canvas">
        <div className="home-map-ui-grid" />
        <span className="map-ui-point point-a"><i />9</span>
        <span className="map-ui-point point-b"><i />8</span>
        <span className="map-ui-point point-c"><i />3</span>
        <span className="map-ui-point point-d corroborated"><i />2</span>
        <div className="home-map-ui-readout"><span>Visible now</span><strong>21</strong><small>large-solar candidates</small></div>
      </div>
      <div className="home-map-ui-bottom"><span><i className="screened" /> Screened</span><span><i className="corroborated" /> Corroborated</span><b>5 km grid</b></div>
    </div>
  );
}
