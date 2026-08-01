"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  MapSelection,
  MapTheme,
  ObservatoryView,
  ScreeningMetric,
} from "@/components/observatory-map";
import { formatDate, formatNumber } from "@/lib/format";
import {
  screeningRegionOrder,
  summarizeScreeningRegions,
} from "@/lib/screening";
import type {
  ScreeningEvidenceStatus,
  ScreeningFeatureCollection,
} from "@/lib/screening";
import type { NationalCapacityBenchmark } from "@/lib/types";

const ObservatoryMap = dynamic(() => import("@/components/observatory-map"), {
  ssr: false,
  loading: () => (
    <div className="production-map production-map-loading">
      <span className="ai-loader" />
      <strong>Loading geospatial evidence</strong>
    </div>
  ),
});

const views: Array<{ value: ObservatoryView; label: string; description: string }> = [
  { value: "ai", label: "Screening", description: "21 mapped candidates" },
  { value: "combined", label: "Combined", description: "Screening + benchmark" },
  { value: "research", label: "Benchmark", description: "LCEC regional capacity" },
];

const sourceRegionLabels: Record<string, string> = {
  "Beirut and Mount Lebanon": "Beirut & Mount Lebanon",
};

function statusLabel(status: ScreeningEvidenceStatus) {
  return status === "corroborated" ? "OSM corroborated" : "Model screened";
}

function footprint(value: number) {
  return `${Math.round(value).toLocaleString("en-GB")} m²`;
}

export function ObservatoryClient({
  release,
  benchmark,
}: {
  release: ScreeningFeatureCollection;
  benchmark: NationalCapacityBenchmark;
}) {
  const defaultCell =
    release.features.find((feature) => feature.properties.evidence_status === "corroborated") ??
    release.features[0];
  const [view, setView] = useState<ObservatoryView>("ai");
  const [metric, setMetric] = useState<ScreeningMetric>("candidates");
  const [theme, setTheme] = useState<MapTheme>("dark");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState<"all" | ScreeningEvidenceStatus>("all");
  const [selected, setSelected] = useState<MapSelection | null>(
    defaultCell ? { kind: "screening", id: defaultCell.id } : null,
  );
  const [resetKey, setResetKey] = useState(0);

  const regionSummaries = useMemo(() => summarizeScreeningRegions(release), [release]);
  const filteredRelease = useMemo(
    () => ({
      ...release,
      features: release.features.filter((feature) => {
        const regionMatch = region === "all" || feature.properties.region_groups.includes(region);
        const statusMatch = status === "all" || feature.properties.evidence_status === status;
        return regionMatch && statusMatch;
      }),
    }),
    [region, release, status],
  );
  const visibleCandidates = filteredRelease.features.reduce(
    (sum, feature) => sum + feature.properties.candidate_count,
    0,
  );
  const selectedCell =
    selected?.kind === "screening"
      ? release.features.find((feature) => feature.id === selected.id) ?? null
      : null;
  const selectedBenchmark =
    selected?.kind === "benchmark"
      ? benchmark.regions.find((item) => item.region === selected.id) ?? null
      : null;
  const maximumBenchmark = Math.max(...benchmark.regions.map((item) => item.capacityMwp));
  const maximumCandidates = Math.max(...regionSummaries.map((item) => item.candidateCount));

  function chooseView(nextView: ObservatoryView) {
    setView(nextView);
    if (nextView === "research") {
      setSelected({ kind: "benchmark", id: benchmark.regions[0].region });
    } else if (selected?.kind !== "screening" && defaultCell) {
      setSelected({ kind: "screening", id: defaultCell.id });
    }
  }

  function resetMap() {
    setRegion("all");
    setStatus("all");
    setResetKey((current) => current + 1);
  }

  function chooseRegion(nextRegion: string) {
    setRegion(nextRegion);
    const next = release.features.find((feature) => {
      const regionMatch =
        nextRegion === "all" || feature.properties.region_groups.includes(nextRegion);
      const statusMatch = status === "all" || feature.properties.evidence_status === status;
      return regionMatch && statusMatch;
    });
    if (next) setSelected({ kind: "screening", id: next.id });
  }

  function chooseStatus(nextStatus: "all" | ScreeningEvidenceStatus) {
    setStatus(nextStatus);
    const next = release.features.find((feature) => {
      const regionMatch = region === "all" || feature.properties.region_groups.includes(region);
      const statusMatch =
        nextStatus === "all" || feature.properties.evidence_status === nextStatus;
      return regionMatch && statusMatch;
    });
    if (next) setSelected({ kind: "screening", id: next.id });
  }

  return (
    <div className="production-observatory">
      <section className="observatory-command-hero">
        <div className="shell observatory-command-grid">
          <div className="observatory-command-copy">
            <div className="release-kicker">
              <span className="live-pulse" /> Public release 01 · Updated 1 August 2026
            </div>
            <h1>Lebanon Solar <em>Evidence Atlas.</em></h1>
            <p>
              A geospatial record of model-screened large solar installations, independent
              corroboration, and published regional capacity estimates for Lebanon.
            </p>
          </div>
          <div className="observatory-command-mark">
            <Image src="/brand/nuwatt-symbol.webp" alt="" width={54} height={54} priority />
            <div><span>NuWatt evidence programme</span><strong>Release 01 · Lebanon</strong></div>
          </div>
        </div>
        <div className="shell evidence-kpi-rail" aria-label="Latest solar evidence summary">
          <article><span>Regional capacity estimate</span><strong>{formatNumber(benchmark.totalCapacityMwp, 2)} <small>MWp</small></strong><p>LCEC · cumulative to end 2023</p></article>
          <article><span>Model-screened candidates</span><strong>{release.metadata.candidate_count}</strong><p>Large installations · Jan 2024</p></article>
          <article><span>OSM corroboration</span><strong>{release.metadata.corroborated_candidate_count}</strong><p>Spatial matches within 30 m</p></article>
          <article><span>Published grid cells</span><strong>{release.features.length}</strong><p>{release.metadata.grid_size_m / 1000} km public aggregation</p></article>
        </div>
      </section>

      <section className="shell observatory-workspace" aria-labelledby="map-title">
        <header className="workspace-heading">
          <div>
            <p className="eyebrow">Geospatial evidence explorer</p>
            <h2 id="map-title">Screening observations and regional benchmarks.</h2>
          </div>
          <p>
            Screening cells indicate mapped model outputs. LCEC markers represent regional totals,
            not installation coordinates. Select a marker to inspect its evidence record.
          </p>
        </header>

        <div className="evidence-console">
          <aside className="evidence-controls" aria-label="Evidence map controls">
            <div className="console-brandline">
              <Image src="/brand/nuwatt-symbol.webp" alt="" width={30} height={30} />
              <div><span>Map controls</span><strong>{visibleCandidates} candidates in view</strong></div>
            </div>

            <fieldset className="console-fieldset">
              <legend>Evidence layer</legend>
              <div className="layer-view-list">
                {views.map((option) => (
                  <button
                    type="button"
                    className={view === option.value ? "active" : ""}
                    aria-pressed={view === option.value}
                    onClick={() => chooseView(option.value)}
                    key={option.value}
                  >
                    <i />
                    <span><strong>{option.label}</strong><small>{option.description}</small></span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="console-fieldset" disabled={view === "research"}>
              <legend>Screening intensity</legend>
              <div className="console-segmented">
                <button type="button" className={metric === "candidates" ? "active" : ""} onClick={() => setMetric("candidates")}>Candidates</button>
                <button type="button" className={metric === "footprint" ? "active" : ""} onClick={() => setMetric("footprint")}>Footprint</button>
              </div>
            </fieldset>

            <fieldset className="console-fieldset" disabled={view === "research"}>
              <legend>Screening filters</legend>
              <label className="console-select">
                <span>Region</span>
                <select value={region} onChange={(event) => chooseRegion(event.target.value)}>
                  <option value="all">All regions</option>
                  {screeningRegionOrder.map((item) => {
                    const sourceValue = item === "Beirut & Mount Lebanon" ? "Beirut and Mount Lebanon" : item;
                    return <option value={sourceValue} key={item}>{item}</option>;
                  })}
                </select>
              </label>
              <div className="evidence-filter-buttons">
                <button type="button" className={status === "all" ? "active" : ""} onClick={() => chooseStatus("all")}>All</button>
                <button type="button" className={status === "screened" ? "active" : ""} onClick={() => chooseStatus("screened")}><i className="screened" /> Model only</button>
                <button type="button" className={status === "corroborated" ? "active" : ""} onClick={() => chooseStatus("corroborated")}><i className="corroborated" /> OSM match</button>
              </div>
            </fieldset>

            <fieldset className="console-fieldset console-map-style">
              <legend>Basemap</legend>
              <div className="console-segmented">
                <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>Dark</button>
                <button type="button" className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>Light</button>
              </div>
            </fieldset>

            <button type="button" className="console-reset" onClick={resetMap}>Reset national extent <span>↗</span></button>
          </aside>

          <div className="evidence-map-stage">
            <div className="map-stage-topline">
              <div><span className="live-pulse" /> Geospatial evidence surface</div>
              <span>LBN · WGS84 · EPSG:4326</span>
            </div>
            <ObservatoryMap
              data={filteredRelease}
              benchmarkRegions={benchmark.regions}
              view={view}
              metric={metric}
              theme={theme}
              selected={selected}
              onSelect={setSelected}
              resetKey={resetKey}
            />
            <div className="map-stage-footline">
              <span>Basemap © OpenStreetMap contributors</span>
              <span>Restricted source polygons · public geometry aggregated to 5 km</span>
            </div>
          </div>

          <aside className="evidence-inspector" aria-live="polite">
            {selectedCell ? (
              <>
                <div className="inspector-head">
                  <span className={`status-badge ${selectedCell.properties.evidence_status}`}>{statusLabel(selectedCell.properties.evidence_status)}</span>
                  <small>{selectedCell.id.replace("lbn-satlas-", "")}</small>
                  <h3>{selectedCell.properties.region_groups.map((item) => sourceRegionLabels[item] ?? item).join(", ")}</h3>
                  <p>{selectedCell.properties.governorates.join(", ")}</p>
                </div>
                <dl className="inspector-metrics">
                  <div><dt>Model-screened candidates</dt><dd>{selectedCell.properties.candidate_count}</dd></div>
                  <div><dt>OSM corroborated</dt><dd>{selectedCell.properties.corroborated_candidate_count}</dd></div>
                  <div><dt>Facility footprint</dt><dd>{footprint(selectedCell.properties.candidate_footprint_area_m2)}</dd></div>
                  <div><dt>Public cell</dt><dd>{selectedCell.properties.grid_size_m / 1000} × {selectedCell.properties.grid_size_m / 1000} km</dd></div>
                </dl>
                <div className="inspector-evidence-block">
                  <span>Source imagery</span>
                  <strong>Sentinel-2 · {selectedCell.properties.review_imagery_resolution_m} m/pixel</strong>
                  <small>Reviewed {formatDate(selectedCell.properties.review_imagery_date)} · source snapshot {selectedCell.properties.source_snapshot}</small>
                </div>
                <div className="inspector-withheld">
                  <span>Capacity</span><strong>Not estimated</strong>
                  <p>The source footprint includes spacing and access areas; it does not support a defensible MWp estimate.</p>
                </div>
              </>
            ) : selectedBenchmark ? (
              <>
                <div className="inspector-head benchmark-record">
                  <span className="status-badge benchmark">Regional benchmark</span>
                  <small>END 2023 · LCEC</small>
                  <h3>{selectedBenchmark.region}</h3>
                  <p>Regional installed-capacity estimate</p>
                </div>
                <div className="benchmark-inspector-value">
                  <strong>{formatNumber(selectedBenchmark.capacityMwp, 2)}</strong><span>MWp</span>
                  <p>{selectedBenchmark.sharePercent}% of the national estimate</p>
                </div>
                <div className="inspector-evidence-block">
                  <span>Method</span>
                  <strong>Market and implementation assessment</strong>
                  <small>Company surveys, customs and import data, stock, and implementation assumptions.</small>
                </div>
                <div className="inspector-withheld research-note">
                  <span>Spatial interpretation</span><strong>Regional context only</strong>
                  <p>The marker is a regional label anchor and does not indicate an installation location.</p>
                </div>
              </>
            ) : (
              <div className="inspector-empty"><span>Select a record</span><p>Choose a screening cell or benchmark marker to inspect its provenance and publication limits.</p></div>
            )}
          </aside>
        </div>
      </section>

      <section className="observatory-intelligence-section" id="insights">
        <div className="shell">
          <header className="workspace-heading intelligence-heading">
            <div><p className="eyebrow eyebrow-light">Regional comparison</p><h2>Installed-capacity context and mapped screening observations.</h2></div>
            <p>The two series use different units and observation populations. They are shown in parallel and are not combined.</p>
          </header>
          <div className="intelligence-grid">
            <article className="evidence-chart research-chart">
              <header><div><span>Published benchmark</span><h3>Regional installed-capacity estimate</h3></div><strong>{formatNumber(benchmark.totalCapacityMwp, 2)} MWp</strong></header>
              <p className="chart-subtitle">LCEC estimate by governorate · cumulative capacity at end of 2023</p>
              <div className="horizontal-bars">
                {benchmark.regions.map((item) => (
                  <button type="button" onClick={() => { setView("research"); setSelected({ kind: "benchmark", id: item.region }); }} key={item.region}>
                    <span>{item.region}</span>
                    <i><b style={{ width: `${(item.capacityMwp / maximumBenchmark) * 100}%` }} /></i>
                    <strong>{formatNumber(item.capacityMwp, 2)} MWp</strong>
                  </button>
                ))}
              </div>
              <footer>Source: LCEC Solar PV Status Report 2023 · regional market estimate, not mapped detection</footer>
            </article>

            <article className="evidence-chart ai-chart">
              <header><div><span>Model screening release</span><h3>Large-installation candidates by region</h3></div><strong>{release.metadata.candidate_count} candidates</strong></header>
              <p className="chart-subtitle">Satlas January 2024 source snapshot · 18 public grid cells</p>
              <div className="horizontal-bars">
                {regionSummaries.map((item) => (
                  <button type="button" onClick={() => {
                    const sourceValue = item.region === "Beirut & Mount Lebanon" ? "Beirut and Mount Lebanon" : item.region;
                    const firstCell = release.features.find((feature) => feature.properties.region_groups.includes(sourceValue));
                    setView("ai");
                    setRegion(sourceValue);
                    if (firstCell) setSelected({ kind: "screening", id: firstCell.id });
                  }} key={item.region}>
                    <span>{item.region}</span>
                    <i><b style={{ width: `${(item.candidateCount / maximumCandidates) * 100}%` }} /></i>
                    <strong>{item.candidateCount} · {footprint(item.footprintM2)}</strong>
                  </button>
                ))}
              </div>
              <div className="chart-evidence-key"><span><i className="screened" /> {release.metadata.candidate_count - release.metadata.corroborated_candidate_count} model-only</span><span><i className="corroborated" /> {release.metadata.corroborated_candidate_count} OSM-matched</span></div>
              <footer>Source: Satlas model screening · Sentinel-2 at 10 m · large installations only</footer>
            </article>
          </div>
        </div>
      </section>

      <section className="shell evidence-ledger-section">
        <header className="workspace-heading ledger-heading">
          <div><p className="eyebrow">Release documentation</p><h2>Sources, licences, and publication limits.</h2></div>
          <p>Each published layer records its acquisition period, spatial resolution, licence, validation state, and permitted interpretation.</p>
        </header>
        <div className="evidence-ledger-grid">
          <article><span>01 · Screening source</span><h3>Satlas renewable infrastructure</h3><dl><div><dt>Snapshot</dt><dd>January 2024</dd></div><div><dt>Sensor</dt><dd>Sentinel-2 · 10 m</dd></div><div><dt>Licence</dt><dd>ODC-BY 1.0</dd></div><div><dt>Claim</dt><dd>Screened candidates</dd></div></dl></article>
          <article><span>02 · Independent check</span><h3>OpenStreetMap solar features</h3><dl><div><dt>Matched facilities</dt><dd>2 of 21</dd></div><div><dt>Distance</dt><dd>Within 30 m</dd></div><div><dt>Licence</dt><dd>ODbL 1.0</dd></div><div><dt>Missing match</dt><dd>Not negative evidence</dd></div></dl></article>
          <article><span>03 · Market context</span><h3>LCEC Solar PV Status 2023</h3><dl><div><dt>National estimate</dt><dd>1,081.27 MWp</dd></div><div><dt>Regions</dt><dd>8 governorates</dd></div><div><dt>Method</dt><dd>Market assessment</dd></div><div><dt>Claim</dt><dd>Regional context</dd></div></dl></article>
        </div>
        <div className="observatory-download-row">
          <div><span>Data access</span><strong>Inspect the versioned public release and its machine-readable records.</strong></div>
          <div className="button-row">
            <a className="button button-primary" href="/api/v1/screening">Open GeoJSON ↓</a>
            <Link className="button button-secondary" href="/methodology">Read methodology</Link>
            <Link className="button button-secondary" href="/data">Data & API</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
