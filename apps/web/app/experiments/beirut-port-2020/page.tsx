import type { Metadata } from "next";
import Link from "next/link";

import { ExperimentCoverageMap } from "@/components/experiment-coverage-map";

export const metadata: Metadata = {
  title: "Beirut Port Open-Imagery Experiment",
  description:
    "The validated result of NuWatt's first free Lebanon solar-panel inference experiment.",
  robots: { index: false, follow: false },
};

const resultMetrics = [
  ["0.383 km²", "valid imagery reviewed"],
  ["25", "inference tiles"],
  ["39", "unique proposals reviewed"],
  ["0", "accepted panel detections"],
];

export default function BeirutPortExperimentPage() {
  return (
    <>
      <section className="subpage-hero experiment-hero">
        <div className="shell subpage-hero-grid">
          <div>
            <p className="eyebrow eyebrow-light">Experiment 01 · completed 1 August 2026</p>
            <h1>
              The free pipeline worked. The imagery <em>did not.</em>
            </h1>
          </div>
          <p>
            A legally open Beirut orthomosaic went through tiled AI inference and complete human
            review. Every proposal was rejected, so the platform published no false panel heatmap.
          </p>
        </div>
      </section>

      <section className="section shell experiment-summary">
        <div className="experiment-disposition">
          <span>Validation disposition</span>
          <strong>Needs revision</strong>
          <p>
            The CC BY 4.0 source passed its licence gate, but the post-explosion port scene failed
            the fit-for-purpose and model-transfer gates.
          </p>
        </div>
        <div className="experiment-metrics">
          {resultMetrics.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="shell experiment-map-section">
        <div className="experiment-map-heading">
          <div>
            <p className="eyebrow">Observed coverage · actual run</p>
            <h2>Historical Beirut Port footprint</h2>
          </div>
          <p>
            The outline is the source acquisition extent. A heat layer is intentionally absent:
            zero candidates passed manual validation.
          </p>
        </div>
        <ExperimentCoverageMap />
        <div className="experiment-map-footnote">
          <span>Imagery date: 4 August 2020 · 0.12124 m/pixel · not current inventory evidence</span>
          <span>Basemap © OpenStreetMap contributors</span>
        </div>
      </section>

      <section className="section shell experiment-detail-grid">
        <article>
          <span>01 · Source</span>
          <h2>Legally reusable, operationally unsuitable.</h2>
          <p>
            OpenAerialMap asset <code>5f2bd318b0052e00067dbaef</code> is licensed CC BY
            4.0. Its 12.1 cm detail is excellent, but it records a tiny industrial disaster scene
            immediately after the Beirut Port explosion—not representative intact rooftops.
          </p>
          <a href="https://map.openaerialmap.org/" target="_blank" rel="noreferrer">
            OpenAerialMap ↗
          </a>
        </article>
        <article>
          <span>02 · Inference</span>
          <h2>Recall-first model pass.</h2>
          <p>
            The open photovoltaic segmenter ran at its 0.2 m training scale across 25 overlapping
            960-pixel tiles. A permissive 0.03 confidence threshold produced 64 raw proposals and
            39 unique candidates after overlap removal.
          </p>
          <a
            href="https://huggingface.co/agademer/yolo-remote-sensing-photovoltaic"
            target="_blank"
            rel="noreferrer"
          >
            Model card ↗
          </a>
        </article>
        <article>
          <span>03 · Review</span>
          <h2>All candidates rejected.</h2>
          <p>
            Human review found blast debris, containers, vehicles, damaged structures, and image
            edge artifacts. No object met the platform&apos;s detected evidence standard. Confidence
            alone was never treated as proof.
          </p>
        </article>
        <article>
          <span>04 · Publication</span>
          <h2>No detections means no heatmap.</h2>
          <p>
            Proposal geometries and source pixels remain outside the public repository. Only the
            aggregate result, coverage footprint, lineage, hashes, and failure rationale are
            published.
          </p>
          <a href="/data/experiments/beirut-port-oam-2020-v1.geojson" download>
            Download result GeoJSON ↓
          </a>
        </article>
      </section>

      <section className="section dark-section">
        <div className="shell experiment-next">
          <div>
            <p className="eyebrow eyebrow-light">Next experiment</p>
            <h2>A positive layer needs a better legal scene—not a lower standard.</h2>
          </div>
          <div>
            <p>
              The next free pass will limit Sentinel-2 to large-installation screening while NuWatt
              seeks intact urban or agricultural high-resolution imagery with explicit inference
              and derived-publication rights.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/roadmap">
                See the delivery plan
              </Link>
              <a
                className="button button-secondary button-on-dark"
                href="https://github.com/haidarra82066/nuwatt-solar-observatory/blob/main/docs/experiments/BEIRUT_PORT_OAM_2020_V1.md"
                target="_blank"
                rel="noreferrer"
              >
                Read the run report ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
