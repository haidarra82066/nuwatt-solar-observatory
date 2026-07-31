import Link from "next/link";

import { DemoNotice } from "@/components/demo-notice";
import { HeroScan } from "@/components/hero-scan";
import { MetricIcon } from "@/components/metric-icon";
import { PipelineFlow } from "@/components/pipeline-flow";

const evidence = [
  {
    status: "Detected",
    className: "detected",
    description: "PV is visible in sufficiently detailed imagery and passes model-quality thresholds.",
  },
  {
    status: "AI-estimated",
    className: "estimated",
    description: "Lower-resolution and contextual evidence indicates likely PV presence.",
  },
  {
    status: "Verified",
    className: "verified",
    description: "An installer, field record, or operational source confirms the installation.",
  },
];

const questions = [
  ["Where is solar concentrated?", "Compare installation and capacity density across municipalities and pilot cells."],
  ["How certain is the evidence?", "Inspect model confidence, imagery resolution, acquisition date, and validation status."],
  ["What could the fleet generate?", "Explore P10, P50, and P90 technical yield—not a claim about delivered energy."],
];

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow eyebrow-light"><span /> Lebanon · Open energy intelligence</p>
            <h1>Make Lebanon&apos;s solar transition <em>visible.</em></h1>
            <p className="hero-lede">
              An open geospatial observatory mapping where photovoltaic systems are likely installed,
              how much capacity they represent, and how strong the evidence really is.
            </p>
            <div className="button-row">
              <Link className="button button-accent" href="/observatory">
                Explore the observatory <span aria-hidden="true">→</span>
              </Link>
              <Link className="button button-ghost" href="/methodology">See how it works</Link>
            </div>
            <div className="hero-proof">
              <span><b>Open</b> Versioned releases</span>
              <span><b>Honest</b> Visible uncertainty</span>
              <span><b>Safe</b> Aggregated public data</span>
            </div>
          </div>
          <HeroScan />
        </div>
      </section>

      <div className="shell notice-wrap"><DemoNotice compact /></div>

      <section className="section shell">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">The missing layer</p>
            <h2>National estimates tell us how much. The map reveals <em>where.</em></h2>
          </div>
          <p>
            Lebanon&apos;s solar growth is real, but current evidence is fragmented. The observatory connects imagery,
            machine learning, solar-performance models, and local validation in one transparent system.
          </p>
        </div>
        <div className="question-grid">
          {questions.map(([title, copy], index) => (
            <article className="question-card" key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section evidence-section">
        <div className="shell evidence-grid">
          <div className="section-heading">
            <p className="eyebrow eyebrow-light">Evidence, not false precision</p>
            <h2>Every mark on the map says what we <em>know.</em></h2>
            <p>
              Low-resolution AI inference and high-resolution physical detection are different claims. The platform
              keeps them visibly separate from field-verified records.
            </p>
            <Link className="text-link light-link" href="/methodology">Read the evidence framework <span>→</span></Link>
          </div>
          <div className="evidence-stack">
            {evidence.map((item) => (
              <article className="evidence-card" key={item.status}>
                <span className={`evidence-symbol ${item.className}`}><i /></span>
                <div>
                  <h3>{item.status}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split-heading compact-heading">
          <div>
            <p className="eyebrow">From pixels to public value</p>
            <h2>A provider-independent evidence pipeline.</h2>
          </div>
          <p>
            Each stage has a quality gate. If free imagery cannot support rooftop inference, it remains a screening
            layer—not a substitute for high-resolution evidence.
          </p>
        </div>
        <PipelineFlow />
      </section>

      <section className="section shell public-value-section">
        <div className="value-visual">
          <span className="value-orbit orbit-one" />
          <span className="value-orbit orbit-two" />
          <div className="value-center">
            <MetricIcon name="layers" />
            <small>National solar evidence</small>
          </div>
          <span className="value-node node-one">Planning</span>
          <span className="value-node node-two">Research</span>
          <span className="value-node node-three">Markets</span>
          <span className="value-node node-four">Public</span>
        </div>
        <div className="section-heading">
          <p className="eyebrow">Built as public infrastructure</p>
          <h2>One evidence base. Many decisions.</h2>
          <p>
            Municipal planners can compare adoption. Researchers can reproduce releases. Installers can identify
            underserved markets. The public can see both progress and uncertainty.
          </p>
          <div className="value-list">
            <span><MetricIcon name="coverage" /> Coverage and imagery-age maps</span>
            <span><MetricIcon name="capacity" /> Capacity and technical-yield ranges</span>
            <span><MetricIcon name="confidence" /> Confidence and validation status</span>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="shell cta-inner">
          <div>
            <p className="eyebrow eyebrow-light">Start with a credible pilot</p>
            <h2>20-50 km². Four environments. One decisive experiment.</h2>
          </div>
          <div>
            <p>
              Prove the imagery, model, uncertainty, and publication workflow before scaling national claims.
            </p>
            <div className="button-row">
              <Link className="button button-accent" href="/roadmap">View the MVP plan</Link>
              <Link className="button button-ghost" href="/data">Inspect the data model</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
