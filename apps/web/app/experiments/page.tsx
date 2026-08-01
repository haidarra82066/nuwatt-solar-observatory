import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Experiments",
  description: "Versioned NuWatt solar-observatory experiments and their validation outcomes.",
};

export default function ExperimentsPage() {
  return (
    <>
      <section className="subpage-hero experiment-index-hero">
        <div className="shell subpage-hero-grid">
          <div><p className="eyebrow eyebrow-light">Open experiment log</p><h1>Publish the failures. Qualify the <em>progress.</em></h1></div>
          <p>Every experiment keeps its source, licence, model, review, limits, and publication decision visible. A plausible map is never enough.</p>
        </div>
      </section>
      <section className="section shell experiment-index-grid">
        <article className="experiment-index-card current">
          <div><span>02</span><small>Share with caveats</small></div>
          <h2>Lebanon open national screening</h2>
          <p>21 large solar-installation candidates from an open Sentinel-2 deep-learning dataset; two independently corroborated.</p>
          <dl><div><dt>Scope</dt><dd>Nationwide</dd></div><div><dt>Resolution</dt><dd>10 m</dd></div><div><dt>Public cells</dt><dd>18</dd></div></dl>
          <Link className="button button-primary" href="/experiments/satlas-lebanon-2024">Open Experiment 02</Link>
        </article>
        <article className="experiment-index-card failed">
          <div><span>01</span><small>Needs revision</small></div>
          <h2>Beirut Port open imagery</h2>
          <p>39 unique model proposals reviewed; all rejected as debris, containers, vehicles, or other hard negatives.</p>
          <dl><div><dt>Scope</dt><dd>0.383 km²</dd></div><div><dt>Resolution</dt><dd>12.1 cm</dd></div><div><dt>Accepted</dt><dd>0</dd></div></dl>
          <Link className="button button-secondary" href="/experiments/beirut-port-2020">Open Experiment 01</Link>
        </article>
      </section>
    </>
  );
}
