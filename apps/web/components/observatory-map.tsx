"use client";

import { useEffect, useMemo, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapLayerMouseEvent,
  StyleSpecification,
} from "maplibre-gl";

import { screeningPolygonCenter } from "@/lib/screening";
import type { ScreeningFeatureCollection } from "@/lib/screening";
import type { RegionalCapacityBenchmark } from "@/lib/types";

export type ObservatoryView = "combined" | "ai" | "research";
export type ScreeningMetric = "candidates" | "footprint";
export type MapTheme = "dark" | "light";
export type MapSelection =
  | { kind: "screening"; id: string }
  | { kind: "benchmark"; id: string };

interface ObservatoryMapProps {
  data: ScreeningFeatureCollection;
  benchmarkRegions: RegionalCapacityBenchmark[];
  view: ObservatoryView;
  metric: ScreeningMetric;
  theme: MapTheme;
  selected: MapSelection | null;
  onSelect: (selection: MapSelection) => void;
  resetKey: number;
}

const benchmarkCoordinates: Record<string, [number, number]> = {
  "Mount Lebanon": [35.67, 33.96],
  Beqaa: [35.91, 33.84],
  "South Lebanon": [35.34, 33.55],
  "North Lebanon": [35.84, 34.43],
  Nabatiyeh: [35.49, 33.38],
  "Baalbek-Hermel": [36.2, 34.07],
  Beirut: [35.5, 33.89],
  Aakkar: [36.04, 34.55],
};

const screeningLayerIds = [
  "screening-heat",
  "screening-fill",
  "screening-outline",
  "screening-halo",
  "screening-points",
];
const benchmarkLayerIds = ["benchmark-halo", "benchmark-points"];

function toPointCollection(data: ScreeningFeatureCollection) {
  return {
    type: "FeatureCollection" as const,
    features: data.features.map((feature) => ({
      type: "Feature" as const,
      id: feature.id,
      geometry: {
        type: "Point" as const,
        coordinates: screeningPolygonCenter(feature),
      },
      properties: feature.properties,
    })),
  };
}

function toBenchmarkCollection(regions: RegionalCapacityBenchmark[]) {
  return {
    type: "FeatureCollection" as const,
    features: regions.map((region) => ({
      type: "Feature" as const,
      id: region.region,
      geometry: {
        type: "Point" as const,
        coordinates: benchmarkCoordinates[region.region],
      },
      properties: {
        id: region.region,
        region: region.region,
        capacity_mwp: region.capacityMwp,
        share_percent: region.sharePercent,
        evidence: "LCEC regional research benchmark",
      },
    })),
  };
}

function appendText(container: HTMLElement, tag: "span" | "strong" | "p", value: string) {
  const element = document.createElement(tag);
  element.textContent = value;
  container.append(element);
}

function screeningPopup(properties: Record<string, unknown>) {
  const container = document.createElement("div");
  container.className = "map-popup production-popup";
  const regionGroups = Array.isArray(properties.region_groups)
    ? properties.region_groups.join(", ")
    : String(properties.region_groups ?? "Lebanon");
  appendText(container, "span", `${String(properties.evidence_status).toUpperCase()} · AI SCREENING CELL`);
  appendText(container, "strong", regionGroups);
  appendText(
    container,
    "p",
    `${properties.candidate_count} candidate${Number(properties.candidate_count) === 1 ? "" : "s"} · ${Number(properties.corroborated_candidate_count)} corroborated · ${Math.round(Number(properties.candidate_footprint_area_m2)).toLocaleString()} m² footprint`,
  );
  return container;
}

function benchmarkPopup(properties: Record<string, unknown>) {
  const container = document.createElement("div");
  container.className = "map-popup production-popup benchmark-popup";
  appendText(container, "span", "RESEARCH BENCHMARK · END OF 2023");
  appendText(container, "strong", String(properties.region));
  appendText(
    container,
    "p",
    `${Number(properties.capacity_mwp).toLocaleString(undefined, { maximumFractionDigits: 2 })} MWp · ${properties.share_percent}% of national estimate. Regional context, not mapped sites.`,
  );
  return container;
}

function setLayerGroupVisibility(map: MapLibreMap, ids: string[], visible: boolean) {
  for (const id of ids) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
    }
  }
}

function fitLebanon(map: MapLibreMap) {
  map.fitBounds(
    [
      [35.03, 33.05],
      [36.63, 34.7],
    ],
    { padding: { top: 68, right: 68, bottom: 68, left: 68 }, duration: 700 },
  );
}

export default function ObservatoryMap({
  data,
  benchmarkRegions,
  view,
  metric,
  theme,
  selected,
  onSelect,
  resetKey,
}: ObservatoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  const previousSelectionRef = useRef<MapSelection | null>(selected);
  const points = useMemo(() => toPointCollection(data), [data]);
  const benchmarkPoints = useMemo(
    () => toBenchmarkCollection(benchmarkRegions),
    [benchmarkRegions],
  );
  const initialDataRef = useRef(data);
  const initialPointsRef = useRef(points);
  const initialBenchmarkPointsRef = useRef(benchmarkPoints);
  const initialViewRef = useRef(view);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const tileUrl =
      process.env.NEXT_PUBLIC_MAP_TILE_URL ??
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attribution =
      process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? "© OpenStreetMap contributors";
    const style: StyleSpecification = {
      version: 8,
      sources: {
        osm: { type: "raster", tiles: [tileUrl], tileSize: 256, attribution },
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm",
          paint: {
            "raster-saturation": -0.78,
            "raster-contrast": 0.28,
            "raster-brightness-min": 0.04,
            "raster-brightness-max": 0.42,
          },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [35.78, 33.88],
      zoom: 7.1,
      minZoom: 6.4,
      maxZoom: 15,
      maxBounds: [
        [34.65, 32.75],
        [36.95, 34.95],
      ],
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource("screening-grid", { type: "geojson", data: initialDataRef.current });
      map.addSource("screening-points", { type: "geojson", data: initialPointsRef.current });
      map.addSource("benchmark-points", {
        type: "geojson",
        data: initialBenchmarkPointsRef.current,
      });

      map.addLayer({
        id: "screening-heat",
        type: "heatmap",
        source: "screening-points",
        maxzoom: 12,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "candidate_count"],
            1,
            0.28,
            3,
            1,
          ],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 6, 0.9, 10, 1.55],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 6, 25, 10, 54],
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.92, 12, 0.18],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(82,188,221,0)",
            0.22,
            "rgba(82,188,221,.42)",
            0.52,
            "rgba(82,188,221,.78)",
            0.78,
            "rgba(244,193,158,.9)",
            1,
            "rgba(255,246,205,1)",
          ],
        },
      });
      map.addLayer({
        id: "screening-fill",
        type: "fill",
        source: "screening-grid",
        minzoom: 7.6,
        paint: {
          "fill-color": [
            "case",
            ["==", ["get", "evidence_status"], "corroborated"],
            "#f4c19e",
            "#52bcdd",
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            0.52,
            0.2,
          ],
        },
      });
      map.addLayer({
        id: "screening-outline",
        type: "line",
        source: "screening-grid",
        minzoom: 7.6,
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "evidence_status"], "corroborated"],
            "#ffe1cb",
            "#8ce6f6",
          ],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            3.2,
            1.4,
          ],
          "line-opacity": 0.95,
        },
      });
      map.addLayer({
        id: "screening-halo",
        type: "circle",
        source: "screening-points",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "candidate_count"], 1, 9, 3, 14],
          "circle-color": "rgba(255,255,255,.2)",
          "circle-blur": 0.35,
        },
      });
      map.addLayer({
        id: "screening-points",
        type: "circle",
        source: "screening-points",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "candidate_count"], 1, 5, 3, 9],
          "circle-color": [
            "case",
            ["==", ["get", "evidence_status"], "corroborated"],
            "#f4c19e",
            "#52bcdd",
          ],
          "circle-stroke-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#ffffff",
            "rgba(255,255,255,.78)",
          ],
          "circle-stroke-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            3,
            1.5,
          ],
        },
      });

      map.addLayer({
        id: "benchmark-halo",
        type: "circle",
        source: "benchmark-points",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "capacity_mwp"], 50, 14, 400, 37],
          "circle-color": "rgba(244,193,158,.14)",
          "circle-stroke-color": "rgba(244,193,158,.26)",
          "circle-stroke-width": 8,
        },
      });
      map.addLayer({
        id: "benchmark-points",
        type: "circle",
        source: "benchmark-points",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "capacity_mwp"], 50, 7, 400, 22],
          "circle-color": "rgba(244,193,158,.3)",
          "circle-stroke-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#ffffff",
            "#f4c19e",
          ],
          "circle-stroke-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            3,
            1.5,
          ],
        },
      });
      const selectScreening = (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature?.properties) return;
        const id = String(feature.properties.id);
        onSelectRef.current({ kind: "screening", id });
        new maplibregl.Popup({ offset: 16, closeButton: false })
          .setLngLat(event.lngLat)
          .setDOMContent(screeningPopup(feature.properties))
          .addTo(map);
      };
      const selectBenchmark = (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature?.properties) return;
        const id = String(feature.properties.id);
        onSelectRef.current({ kind: "benchmark", id });
        new maplibregl.Popup({ offset: 18, closeButton: false })
          .setLngLat(event.lngLat)
          .setDOMContent(benchmarkPopup(feature.properties))
          .addTo(map);
      };

      map.on("click", "screening-points", selectScreening);
      map.on("click", "screening-fill", selectScreening);
      map.on("click", "benchmark-points", selectBenchmark);
      for (const layer of ["screening-points", "screening-fill", "benchmark-points"]) {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      }

      setLayerGroupVisibility(map, screeningLayerIds, initialViewRef.current !== "research");
      setLayerGroupVisibility(map, benchmarkLayerIds, initialViewRef.current !== "ai");
      fitLebanon(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    setLayerGroupVisibility(map, screeningLayerIds, view !== "research");
    setLayerGroupVisibility(map, benchmarkLayerIds, view !== "ai");
  }, [view]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const source = map.getSource("screening-grid") as GeoJSONSource | undefined;
    const pointSource = map.getSource("screening-points") as GeoJSONSource | undefined;
    source?.setData(data);
    pointSource?.setData(points);
  }, [data, points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getLayer("screening-heat")) return;
    const property = metric === "candidates" ? "candidate_count" : "candidate_footprint_area_m2";
    const low = metric === "candidates" ? 1 : 1_200;
    const high = metric === "candidates" ? 3 : 10_500;
    map.setPaintProperty("screening-heat", "heatmap-weight", [
      "interpolate",
      ["linear"],
      ["get", property],
      low,
      0.28,
      high,
      1,
    ] as never);
  }, [metric]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getLayer("osm")) return;
    const isDark = theme === "dark";
    map.setPaintProperty("osm", "raster-saturation", isDark ? -0.78 : -0.32);
    map.setPaintProperty("osm", "raster-contrast", isDark ? 0.28 : 0.08);
    map.setPaintProperty("osm", "raster-brightness-min", isDark ? 0.04 : 0.18);
    map.setPaintProperty("osm", "raster-brightness-max", isDark ? 0.42 : 0.94);
    containerRef.current?.classList.toggle("map-theme-light", !isDark);
  }, [theme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const previous = previousSelectionRef.current;
    if (previous) {
      map.setFeatureState(
        {
          source: previous.kind === "screening" ? "screening-grid" : "benchmark-points",
          id: previous.id,
        },
        { selected: false },
      );
      if (previous.kind === "screening") {
        map.setFeatureState({ source: "screening-points", id: previous.id }, { selected: false });
      }
    }
    if (selected) {
      map.setFeatureState(
        {
          source: selected.kind === "screening" ? "screening-grid" : "benchmark-points",
          id: selected.id,
        },
        { selected: true },
      );
      if (selected.kind === "screening") {
        map.setFeatureState({ source: "screening-points", id: selected.id }, { selected: true });
        const feature = data.features.find((item) => item.id === selected.id);
        if (feature && previous?.id !== selected.id) {
          map.easeTo({ center: screeningPolygonCenter(feature), zoom: Math.max(map.getZoom(), 9), duration: 650 });
        }
      } else if (previous?.id !== selected.id) {
        const coordinate = benchmarkCoordinates[selected.id];
        if (coordinate) map.easeTo({ center: coordinate, zoom: Math.max(map.getZoom(), 8), duration: 650 });
      }
    }
    previousSelectionRef.current = selected;
  }, [data.features, selected]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    fitLebanon(map);
  }, [resetKey]);

  return (
    <div className="production-map-wrap">
      <div
        ref={containerRef}
        className="production-map"
        role="application"
        aria-label="Interactive map of Lebanon AI-screened solar candidates and regional research benchmarks"
      />
      <div className="production-map-status">
        <span className="live-pulse" />
        <div>
          <strong>{data.features.length} public cells visible</strong>
          <small>5 km privacy-safe aggregation</small>
        </div>
      </div>
      <div className="production-map-legend" aria-label="Map legend">
        {view !== "research" && <span><i className="legend-screened" /> AI screened</span>}
        {view !== "research" && <span><i className="legend-corroborated" /> Corroborated</span>}
        {view !== "ai" && <span><i className="legend-benchmark" /> LCEC region estimate</span>}
      </div>
    </div>
  );
}
