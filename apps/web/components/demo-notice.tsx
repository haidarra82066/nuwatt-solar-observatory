import type { DataMode } from "@/lib/types";

export function DemoNotice({
  compact = false,
  dataMode = "synthetic-demo",
}: {
  compact?: boolean;
  dataMode?: DataMode;
}) {
  const isModelRelease = dataMode === "model-detections";
  return (
    <aside className={compact ? "demo-notice demo-notice-compact" : "demo-notice"} aria-label="Data notice">
      <span className="notice-dot" aria-hidden="true" />
      <div>
        <strong>{isModelRelease ? "AI detection release" : "Demonstration release — not AI detections"}</strong>
        <span>
          {isModelRelease
            ? "Panel detections are aggregated to privacy-safe cells. Capacity and technical yield remain imagery-derived estimates."
            : "Synthetic pilot values prove the product and API. They are not measured or detected Lebanese solar data."}
        </span>
      </div>
    </aside>
  );
}
