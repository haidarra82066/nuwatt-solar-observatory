import type { Metadata } from "next";
import Link from "next/link";

import { ScreeningExperimentMap } from "@/components/screening-experiment-map";

export const metadata: Metadata = {
  title: "Lebanon AI Solar Screening Experiment",
  description:
    "A privacy-safe map of large solar-installation candidates screened from open Sentinel-2 imagery.",
  robots: { index: false, follow: false },
};

const regions = [
  ["Beqaa", "9", "34,292 m²"],
  ["South", "8", "21,424 m²"],
  ["North", "3", "10,627 m²"],
  ["Beirut & Mount Lebanon", "1", "7,000 m²"],
];

export default function SatlasLebanonExperimentPage() {
  return (
    <>
      <section className="subpage-hero screening-hero">
        <div className="shell subpage-hero-grid">
          <div>
            <p className="eyebrow eyebrow-light">Experiment 02 · open national screening</p>
            <h1>
              Real AI candidates. <em>Narrow evidence.</em>
            </h1>
          </div>
          <p>
            An open deep-learning dataset identifies 21 large solar-farm candidates in Lebanon.
            Two overlap independently mapped photovoltaic generators. This is a screening layer,
            not a rooftop inventory.
          </p>
        </div>
      </section>

      <section className="section shell screening-summary-grid">
        <div className="screening-disposition">
          <span>Validation disposition</span>
          <strong>Share with caveats</strong>
          <p>
            The data and licences pass the experiment gate. The 10 m sensor does not pass the
            panel-level detection or national-capacity gates.
          </p>
        </div>
        <div className="experiment-metrics screening-metrics">
          <div><strong>21</strong><span>AI-screened candidates</span></div>
          <div><strong>18</strong><span>coarse public cells</span></div>
          <div><strong>2</strong><span>OSM-corroborated candidates</span></div>
          <div><strong>73,342 m²</strong><span>candidate footprint</span></div>
        </div>
      </section>

      <section className="shell experiment-map-section screening-map-section">
        <div className="experiment-map-heading">
          <div>
            <p className="eyebrow">AI screening density · January 2024</p>
            <h2>Lebanon large-installation candidate heatmap</h2>
          </div>
          <p>
            Heat represents candidate density and footprint, not installed MWp. Zoom in to inspect
            privacy-safe 5 km cells; exact source polygons are withheld.
          </p>
        </div>
        <div className="experiment-map-frame">
          <ScreeningExperimentMap />
          <div className="screening-map-legend">
            <span><i className="screened" /> AI screened</span>
            <span><i className="corroborated" /> OSM corroborated</span>
          </div>
        </div>
        <div className="experiment-map-footnote">
          <span>Satlas snapshot 2024-01 · Sentinel-2 review 2024-03-30 · 5 km public grid</span>
          <span>Satlas ODC-BY · © OpenStreetMap contributors · basemap © OpenStreetMap contributors</span>
        </div>
      </section>

      <section className="section shell screening-analysis-grid">
        <div className="screening-region-panel">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Regional distribution</p>
            <h2>Candidate count and footprint</h2>
            <p>Footprint is modelled facility area. It is not panel surface or capacity.</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Region group</th><th>Candidates</th><th>Footprint</th></tr></thead>
              <tbody>
                {regions.map(([region, candidates, area]) => (
                  <tr key={region}><td><strong>{region}</strong></td><td>{candidates}</td><td>{area}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside className="screening-benchmark-note">
          <span>Why this is much smaller than LCEC capacity</span>
          <h2>Different population. Different sensor.</h2>
          <p>
            LCEC&apos;s 2023 benchmark includes Lebanon&apos;s distributed rooftop market. Satlas uses 10 m
            Sentinel-2 imagery and targets solar farms large enough to create a multi-pixel signal.
            These 21 historical candidates are a narrow subset, not a denominator for Lebanon&apos;s
            installed fleet.
          </p>
        </aside>
      </section>

      <section className="section soft-section">
        <div className="shell screening-evidence-grid">
          <article>
            <span>AI-screened · 21</span>
            <h2>Model evidence</h2>
            <p>
              Satlas applies deep-learning models to multi-temporal Sentinel-2 imagery. Its
              published Asia reference is 97% precision and 77.9% recall, but those continental
              metrics are not per-feature confidence and are not Lebanon-specific.
            </p>
          </article>
          <article>
            <span>Corroborated · 2</span>
            <h2>Independent mapped overlap</h2>
            <p>
              Two candidate facilities overlap photovoltaic generator geometries in OpenStreetMap.
              The other 19 remain screened—not rejected—because voluntary mapping is incomplete.
            </p>
          </article>
          <article>
            <span>Sensor limit · 10 m</span>
            <h2>No panel-level claim</h2>
            <p>
              Every candidate received cloud-free Sentinel-2 context review. The pixels are still
              too coarse to count modules, resolve normal rooftops, or certify individual arrays.
            </p>
          </article>
          <article>
            <span>Estimation gate · withheld</span>
            <h2>No capacity or yield</h2>
            <p>
              Facility-footprint polygons may include access lanes and gaps. Applying module power
              density to them would create false precision, so P10/P50/P90 capacity is omitted.
            </p>
          </article>
        </div>
      </section>

      <section className="section shell screening-sources">
        <div className="section-heading split-heading compact-heading">
          <div><p className="eyebrow">Sources and reproducibility</p><h2>Open inputs, explicit limits.</h2></div>
          <p>The immutable run manifest records hashes, source snapshots, scene IDs, licences, quality checks, and aggregation decisions.</p>
        </div>
        <div className="button-row">
          <a className="button button-primary" href="/data/experiments/lbn-satlas-screening-2024-01-v1.geojson" download>Download screening GeoJSON ↓</a>
          <a className="button button-secondary" href="https://github.com/haidarra82066/nuwatt-solar-observatory/blob/main/docs/experiments/SATLAS_LEBANON_2024_V1.md" target="_blank" rel="noreferrer">Read experiment report ↗</a>
          <a className="button button-secondary" href="https://satlas.allen.ai/data" target="_blank" rel="noreferrer">Satlas source ↗</a>
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell experiment-next">
          <div><p className="eyebrow eyebrow-light">Next evidence upgrade</p><h2>Move from screened farms to detected rooftops.</h2></div>
          <div>
            <p>Experiment 03 needs legally licensed imagery at 0.5 m/pixel or better over an intact urban pilot, local labels, and independent validation.</p>
            <div className="button-row">
              <Link className="button button-light" href="/experiments">All experiments</Link>
              <Link className="button button-secondary button-on-dark" href="/roadmap">MVP roadmap</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
