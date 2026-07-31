"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { DemoNotice } from "@/components/demo-notice";
import { MetricIcon } from "@/components/metric-icon";
import { TrendChart } from "@/components/trend-chart";
import { formatDate, formatNumber, formatPercent, titleCase } from "@/lib/format";
import {
  getMunicipalities,
  getSummary,
  toFeatureCollection,
  toPointFeatureCollection,
} from "@/lib/observatory";
import type { EvidenceStatus, MapMetric, ObservationCell } from "@/lib/types";

const ObservatoryMap = dynamic(() => import("@/components/observatory-map"), {
  ssr: false,
  loading: () => <div className="observatory-map map-loading">Loading the evidence layer…</div>,
});

const statusOptions: EvidenceStatus[] = ["verified", "detected", "estimated"];
const metricOptions: Array<{ value: MapMetric; label: string }> = [
  { value: "capacity", label: "Capacity" },
  { value: "installations", label: "Installations" },
  { value: "confidence", label: "Confidence" },
];

export function ObservatoryClient({ cells }: { cells: ObservationCell[] }) {
  const [metric, setMetric] = useState<MapMetric>("capacity");
  const [statuses, setStatuses] = useState<EvidenceStatus[]>(statusOptions);
  const [selectedId, setSelectedId] = useState<string | null>(cells[0]?.id ?? null);

  const visibleCells = useMemo(() => cells.filter((cell) => statuses.includes(cell.status)), [cells, statuses]);
  const summary = useMemo(() => getSummary(visibleCells), [visibleCells]);
  const municipalities = useMemo(() => getMunicipalities(visibleCells), [visibleCells]);
  const featureCollection = useMemo(() => toFeatureCollection(cells), [cells]);
  const pointFeatureCollection = useMemo(() => toPointFeatureCollection(cells), [cells]);
  const selectedCell = cells.find((cell) => cell.id === selectedId) ?? null;

  function toggleStatus(status: EvidenceStatus) {
    setStatuses((current) => {
      if (current.includes(status)) {
        return current.length === 1 ? current : current.filter((item) => item !== status);
      }
      return [...current, status];
    });
  }

  const cards = [
    { label: "Candidate installations", value: formatNumber(summary.installations, 0), meta: `${visibleCells.length} visible pilot cells`, icon: "panels" as const },
    { label: "Estimated capacity", value: `${formatNumber(summary.capacityMwp.p50, 2)} MWp`, meta: `P10 ${summary.capacityMwp.p10} · P90 ${summary.capacityMwp.p90}`, icon: "capacity" as const },
    { label: "Technical generation", value: `${formatNumber(summary.generationGwh.p50, 1)} GWh`, meta: `Annual P50 estimate`, icon: "generation" as const },
    { label: "Mapped pilot coverage", value: `${formatNumber(summary.coverageKm2, 1)} km²`, meta: `Mean confidence ${formatPercent(summary.meanConfidence)}`, icon: "coverage" as const },
  ];

  return (
    <div className="dashboard-shell">
      <div className="shell dashboard-intro">
        <div>
          <p className="eyebrow">Observatory · {summary.release}</p>
          <h1>Lebanon solar evidence map</h1>
          <p>Explore synthetic pilot cells through the same contracts intended for the validated MVP.</p>
        </div>
        <DemoNotice compact />
      </div>

      <div className="shell dashboard-controls" aria-label="Map controls">
        <div className="control-group">
          <span>Map metric</span>
          <div className="segmented-control">
            {metricOptions.map((option) => (
              <button
                className={metric === option.value ? "active" : ""}
                type="button"
                onClick={() => setMetric(option.value)}
                key={option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="control-group status-control">
          <span>Evidence</span>
          <div className="chip-control">
            {statusOptions.map((status) => (
              <button
                className={statuses.includes(status) ? `active ${status}` : ""}
                type="button"
                aria-pressed={statuses.includes(status)}
                onClick={() => toggleStatus(status)}
                key={status}
              >
                <i /> {titleCase(status)}
              </button>
            ))}
          </div>
        </div>
        <div className="release-meta">
          <span>Latest imagery</span>
          <strong>{formatDate(summary.lastImageryDate)}</strong>
        </div>
      </div>

      <div className="shell kpi-grid">
        {cards.map((card) => (
          <article className="kpi-card" key={card.label}>
            <MetricIcon name={card.icon} />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.meta}</small>
          </article>
        ))}
      </div>

      <div className="shell map-layout">
        <section className="map-panel">
          <div className="map-toolbar">
            <div>
              <span>Candidate density heatmap</span>
              <strong>{metricOptions.find((option) => option.value === metric)?.label}</strong>
            </div>
            <div className={`metric-legend legend-${metric}`}>
              <span>Lower</span><i /><i /><i /><span>Higher</span>
            </div>
          </div>
          <ObservatoryMap
            data={featureCollection}
            points={pointFeatureCollection}
            metric={metric}
            statuses={statuses}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <div className="map-footnote">
            <span>Heatmap and clusters are generalized synthetic pilot evidence</span>
            <span>Basemap © OpenStreetMap contributors</span>
          </div>
        </section>

        <aside className="selection-panel">
          {selectedCell ? (
            <>
              <div className="selection-head">
                <span className={`status-badge ${selectedCell.status}`}>{titleCase(selectedCell.status)}</span>
                <small>{selectedCell.id}</small>
                <h2>{selectedCell.municipality}</h2>
                <p>{selectedCell.district} · {selectedCell.governorate}</p>
              </div>
              <dl className="selection-metrics">
                <div><dt>Candidate installations</dt><dd>{formatNumber(selectedCell.installations, 0)}</dd></div>
                <div><dt>Capacity P50</dt><dd>{selectedCell.capacityMwp.p50} MWp</dd></div>
                <div><dt>Technical yield P50</dt><dd>{selectedCell.generationGwh.p50} GWh</dd></div>
                <div><dt>Confidence</dt><dd>{formatPercent(selectedCell.confidence)}</dd></div>
              </dl>
              <div className="range-block">
                <div><span>Capacity range</span><strong>P10-P90</strong></div>
                <div className="range-track"><i style={{ left: "18%", right: "14%" }} /></div>
                <div><small>{selectedCell.capacityMwp.p10} MWp</small><b>{selectedCell.capacityMwp.p50}</b><small>{selectedCell.capacityMwp.p90} MWp</small></div>
              </div>
              <div className="source-block">
                <span>Evidence source</span>
                <p>{selectedCell.imageryResolutionM < 1 ? "High-resolution imagery" : "Low-resolution screening"}</p>
                <small>{formatDate(selectedCell.imageryDate)} · {selectedCell.imageryResolutionM} m/pixel</small>
              </div>
            </>
          ) : (
            <p>Select a map cell to inspect its evidence record.</p>
          )}
        </aside>
      </div>

      <div className="shell dashboard-lower-grid">
        <section className="data-panel municipality-panel">
          <div className="panel-heading">
            <div><span>Municipality view</span><strong>Visible pilot ranking</strong></div>
            <a href="/api/v1/municipalities">JSON ↗</a>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Municipality</th><th>Evidence</th><th>Installations</th><th>Capacity P50</th><th>Confidence</th></tr></thead>
              <tbody>
                {municipalities.slice(0, 7).map((item) => (
                  <tr key={item.municipality} onClick={() => setSelectedId(cells.find((cell) => cell.municipality === item.municipality)?.id ?? null)}>
                    <td><strong>{item.municipality}</strong><small>{item.governorate}</small></td>
                    <td><span className={`table-status ${item.statuses[0]}`}>{titleCase(item.statuses[0])}</span></td>
                    <td>{item.installations}</td>
                    <td>{item.capacityMwpP50} MWp</td>
                    <td>{formatPercent(item.meanConfidence)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="data-panel"><TrendChart /></section>
      </div>
    </div>
  );
}
