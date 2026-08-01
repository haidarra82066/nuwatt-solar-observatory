import type { Metadata } from "next";
import Link from "next/link";

import { MetricIcon } from "@/components/metric-icon";
import { PipelineFlow } from "@/components/pipeline-flow";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How the NuWatt Observatory turns licensed imagery into transparent, uncertainty-aware public evidence.",
};

const resolutionRows = [
  ["10 m", "National screening", "Large farms, regional change, candidate ranking", "Normal residential rooftop arrays"],
  ["3-4 m", "Large-system screening", "Some large commercial or agricultural systems", "Small arrays and accurate footprint area"],
  ["1-2 m", "Building probability", "Medium and large installation likelihood", "Module counting and small-array completeness"],
  ["0.5-1 m", "Detection", "Many rooftop arrays and approximate footprint", "Guaranteed small-array coverage"],
  ["0.25-0.5 m", "Segmentation", "Strong array boundaries and useful area estimates", "Exact wattage or actual production"],
];

const gates = [
  { icon: "coverage" as const, title: "Imagery gate", copy: "Licence, acquisition date, resolution, cloud, shadow, compression, and usable coverage are recorded before inference." },
  { icon: "panels" as const, title: "Model-performance gate", copy: "Precision, recall, IoU, calibration, region, roof type, and installation-size performance must meet release thresholds." },
  { icon: "capacity" as const, title: "Estimation gate", copy: "Packing, projected area, tilt, and module-power density propagate into P10, P50, and P90 capacity ranges." },
  { icon: "confidence" as const, title: "Publication gate", copy: "Sensitive locations are aggregated and every public record carries source, model, evidence, and uncertainty metadata." },
];

export default function MethodologyPage() {
  return (
    <>
      <section className="subpage-hero methodology-hero">
        <div className="shell subpage-hero-grid">
          <div>
            <p className="eyebrow eyebrow-light">Methods · Versioned release framework</p>
            <h1>Methods for <em>geospatial solar evidence.</em></h1>
          </div>
          <p>
            The publication framework distinguishes source observations, model outputs, statistical estimates,
            and independently verified records. Each class has separate validation and disclosure requirements.
          </p>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split-heading compact-heading">
          <div><p className="eyebrow">Processing chain</p><h2>Five auditable publication stages.</h2></div>
          <p>Data providers may change without altering the evidence contract. Every input retains its own licence, acquisition, and provenance record.</p>
        </div>
        <PipelineFlow />
      </section>

      <section className="section soft-section">
        <div className="shell">
          <div className="section-heading centered-heading">
            <p className="eyebrow">Spatial resolution</p>
            <h2>Sensor resolution defines the observable claim.</h2>
            <p>Model inference cannot substitute for spatial information that was not captured by the source imagery.</p>
          </div>
          <div className="resolution-table table-wrap">
            <table>
              <thead><tr><th>Ground resolution</th><th>Platform role</th><th>Can support</th><th>Must not claim</th></tr></thead>
              <tbody>
                {resolutionRows.map((row) => (
                  <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 0 ? <strong>{cell}</strong> : cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section shell formula-section">
        <div className="formula-copy">
          <p className="eyebrow">Capacity estimation</p>
          <h2>Probabilistic capacity estimation.</h2>
          <p>
            Visible plan-view area is corrected for packing and tilt, then combined with a locally calibrated module
            power-density distribution. Monte Carlo or quantile methods propagate these uncertainties to the release.
          </p>
          <div className="formula-card">
            <code>P<sub>DC</sub> = A<sub>detected</sub> × f<sub>packing</sub> × f<sub>tilt</sub> × ρ<sub>module</sub></code>
            <span>Output: P10 · P50 · P90</span>
          </div>
        </div>
        <div className="method-distinction">
          <article><span>01</span><div><h3>Presence</h3><p>This building or cell probably contains PV.</p></div></article>
          <article><span>02</span><div><h3>Physical detection</h3><p>These pixels are likely part of an array boundary.</p></div></article>
          <article><span>03</span><div><h3>Capacity estimate</h3><p>The observed area supports a probabilistic kWp range.</p></div></article>
          <article><span>04</span><div><h3>Technical yield</h3><p>The system could generate this range under modelled conditions—not actual delivered energy.</p></div></article>
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell">
          <div className="section-heading split-heading compact-heading">
            <div><p className="eyebrow eyebrow-light">Publication criteria</p><h2>Evidence requirements for every release.</h2></div>
            <p>A dataset is published only when its imagery, model performance, estimation method, privacy controls, and licences satisfy the stated release criteria.</p>
          </div>
          <div className="gate-grid">
            {gates.map((gate) => (
              <article key={gate.title}><MetricIcon name={gate.icon} /><h3>{gate.title}</h3><p>{gate.copy}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell safeguards-grid">
        <div className="section-heading">
          <p className="eyebrow">Privacy and security</p>
          <h2>Privacy-preserving public aggregation.</h2>
          <p>
            Public releases default to grid or municipal aggregation. Exact polygons remain restricted where they can
            expose households, critical infrastructure, or commercial assets.
          </p>
        </div>
        <div className="safeguard-list">
          <span>No resident names or contact details</span>
          <span>Generalized or aggregated public locations</span>
          <span>Correction and opt-out workflow</span>
          <span>Separate licences for code, data, and imagery</span>
          <span>Restricted validation workspace</span>
        </div>
      </section>

      <section className="inline-cta shell">
        <div><p className="eyebrow">Technical resources</p><h2>Review the current data contract and release.</h2></div>
        <div className="button-row"><Link className="button button-primary" href="/data">Data and API</Link><Link className="button button-secondary" href="/observatory">Open evidence atlas</Link></div>
      </section>
    </>
  );
}
