import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MVP Roadmap",
  description: "The phase-gated plan to deliver a validated NuWatt Open Solar Observatory MVP.",
};

const phases = [
  {
    number: "00", duration: "2 weeks", title: "Foundation", status: "Built in this repository",
    goal: "Fix product claims, architecture, evidence states, contracts, and delivery gates.",
    deliverables: ["Runnable public platform", "Synthetic data and API", "PostGIS schema", "Pipeline scaffold", "CI and governance"],
    gate: "Repository builds cleanly and every demo value is visibly non-production.",
  },
  {
    number: "01", duration: "2-3 weeks", title: "Free-data feasibility", status: "In progress · two experiments complete",
    goal: "Test free nationwide inputs and identify legal high-resolution pilot sources.",
    deliverables: ["Lebanon AOI and building inventory", "Sentinel-2 time-series pipeline", "Imagery licence registry", "Candidate baseline", "Pilot-area scorecard"],
    gate: "Four representative 5-12 km² areas have legal imagery and sufficient ground truth.",
  },
  {
    number: "02", duration: "4-6 weeks", title: "Local training set", status: "Planned",
    goal: "Create a representative, quality-controlled Lebanese PV dataset.",
    deliverables: ["PV and hard-negative labels", "Roof/ground/canopy classes", "Double-review protocol", "Stratified train/validation/test split", "Dataset card"],
    gate: "Inter-annotator agreement and class coverage meet the annotation protocol.",
  },
  {
    number: "03", duration: "6-8 weeks", title: "Detection and estimation", status: "Planned",
    goal: "Benchmark high-resolution segmentation and low-resolution candidate ranking.",
    deliverables: ["Model baselines", "Regional error slices", "Calibration curves", "Capacity quantile model", "Solar-yield integration"],
    gate: "High-resolution model meets release thresholds; low-resolution model beats contextual baseline or is narrowed in scope.",
  },
  {
    number: "04", duration: "4-6 weeks", title: "Public MVP", status: "Planned",
    goal: "Publish a useful, safe, and reproducible 20-50 km² pilot release.",
    deliverables: ["Validated evidence map", "Municipal/grid aggregates", "Release downloads and API", "Model and methodology cards", "Correction workflow"],
    gate: "Privacy, licence, performance, accessibility, and operational-readiness reviews pass.",
  },
  {
    number: "05", duration: "6-12 months", title: "Selective national scaling", status: "Conditional",
    goal: "Prioritize better imagery where expected information gain is highest.",
    deliverables: ["National screening layer", "Active-learning loop", "Selective VHR acquisition", "Versioned national releases", "Partnership validation network"],
    gate: "Coverage expansion is funded and each region retains a defensible evidence class.",
  },
];

const mvpDefinition = [
  "20-50 km² across dense urban, suburban, rural/agricultural, and mixed commercial settings",
  "Detected, AI-estimated, and verified evidence remain separately filterable",
  "P10/P50/P90 capacity and technical-yield estimates are calibrated against local records",
  "Precision, recall, IoU, calibration, and performance by region/system size are published",
  "Aggregated public data, stable API, release downloads, provenance, and correction workflow",
  "No restricted imagery, household profiles, or unsupported national completeness claims",
];

export default function RoadmapPage() {
  return (
    <>
      <section className="subpage-hero roadmap-hero">
        <div className="shell subpage-hero-grid">
          <div><p className="eyebrow eyebrow-light">Delivery plan · Phase gated</p><h1>A fully working MVP without skipping the <em>hard experiment.</em></h1></div>
          <p>The estimated path from repository foundation to validated public pilot is 18-25 weeks, with national scaling conditional on model and imagery evidence.</p>
        </div>
      </section>

      <section className="section shell roadmap-summary">
        <div><span>Target pilot</span><strong>20-50 km²</strong><small>Four environments</small></div>
        <div><span>MVP path</span><strong>18-25 weeks</strong><small>After data access begins</small></div>
        <div><span>Core team</span><strong>5-7 people</strong><small>Plus local validators</small></div>
        <div><span>Release model</span><strong>Versioned</strong><small>Never silently overwritten</small></div>
      </section>

      <section className="section shell roadmap-list">
        <div className="section-heading centered-heading"><p className="eyebrow">Critical path</p><h2>Build, test, earn the right to scale.</h2></div>
        {phases.map((phase) => (
          <article className="phase-card" key={phase.number}>
            <div className="phase-number">{phase.number}</div>
            <div className="phase-main">
              <div className="phase-title"><div><span>{phase.duration}</span><h2>{phase.title}</h2></div><small>{phase.status}</small></div>
              <p>{phase.goal}</p>
              <div className="phase-details">
                <div><h3>Deliverables</h3><ul>{phase.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div className="gate-box"><span>Exit gate</span><p>{phase.gate}</p></div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="section dark-section">
        <div className="shell mvp-definition">
          <div className="section-heading"><p className="eyebrow eyebrow-light">Definition of done</p><h2>The MVP is a validated release, not merely a map.</h2><p>These six conditions must all be true before the product is described as a working public MVP.</p></div>
          <ol>{mvpDefinition.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}</ol>
        </div>
      </section>

      <section className="section shell team-section">
        <div className="section-heading split-heading compact-heading">
          <div><p className="eyebrow">Minimum delivery team</p><h2>Small, cross-functional, locally grounded.</h2></div>
          <p>AI can accelerate implementation and labelling, but sensor limits, licences, validation, and publication decisions remain human responsibilities.</p>
        </div>
        <div className="role-grid">
          {["Product & partnerships", "Geospatial/data engineering", "ML/computer vision", "Full-stack platform", "Solar modelling", "Annotation & field validation", "Privacy/legal review"].map((role) => <span key={role}>{role}</span>)}
        </div>
      </section>

      <section className="inline-cta shell">
        <div><p className="eyebrow">Foundation is live</p><h2>Explore the product contract now.</h2></div>
        <div className="button-row"><Link className="button button-primary" href="/observatory">Open observatory</Link><Link className="button button-secondary" href="/methodology">Review methodology</Link></div>
      </section>
    </>
  );
}
