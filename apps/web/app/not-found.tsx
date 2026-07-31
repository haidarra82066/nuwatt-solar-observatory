import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-shell shell narrow-page">
      <p className="eyebrow">404 · Outside coverage</p>
      <h1>This location is not on the map.</h1>
      <p>Return to the observatory or inspect the methodology behind its coverage.</p>
      <div className="button-row">
        <Link className="button button-primary" href="/observatory">Open observatory</Link>
        <Link className="button button-secondary" href="/methodology">Read methodology</Link>
      </div>
    </section>
  );
}
