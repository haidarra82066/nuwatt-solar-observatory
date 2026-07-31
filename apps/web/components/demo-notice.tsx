export function DemoNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={compact ? "demo-notice demo-notice-compact" : "demo-notice"} aria-label="Data notice">
      <span className="notice-dot" aria-hidden="true" />
      <div>
        <strong>Demonstration release</strong>
        <span>
          Synthetic pilot values are used to prove the product and API. They are not measured national statistics.
        </span>
      </div>
    </aside>
  );
}
