"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapLayerMouseEvent,
  Marker,
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

interface EvidenceMarker {
  element: HTMLButtonElement;
  marker: Marker;
}

function setMarkerVisibility(
  markers: Map<string, EvidenceMarker>,
  isVisible: (id: string) => boolean,
) {
  for (const [id, marker] of markers) marker.element.hidden = !isVisible(id);
}

function setSelectedMarker(
  markers: Map<string, EvidenceMarker>,
  selectedId: string | null,
) {
  for (const [id, marker] of markers) {
    marker.element.classList.toggle("selected", id === selectedId);
  }
}

function removeMarkers(markers: Map<string, EvidenceMarker>) {
  for (const marker of markers.values()) marker.marker.remove();
  markers.clear();
}

function mapProperties(feature: ScreeningFeatureCollection["features"][number]) {
  const { governorates, region_groups: regionGroups, ...properties } = feature.properties;
  return {
    ...properties,
    governorates_label: governorates.join(", "),
    region_groups_label: regionGroups.join(", "),
  };
}

function toGridCollection(data: ScreeningFeatureCollection) {
  return {
    type: "FeatureCollection" as const,
    features: data.features.map((feature) => ({
      ...feature,
      properties: mapProperties(feature),
    })),
  };
}

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
      properties: mapProperties(feature),
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
  const regionGroups = String(
    properties.region_groups_label ?? properties.region_groups ?? "Lebanon",
  );
  appendText(container, "span", `${String(properties.evidence_status).toUpperCase()} · MODEL SCREENING CELL`);
  appendText(container, "strong", regionGroups);
  appendText(
    container,
    "p",
    `${properties.candidate_count} candidate${Number(properties.candidate_count) === 1 ? "" : "s"} · ${Number(properties.corroborated_candidate_count)} corroborated · ${Math.round(Number(properties.candidate_footprint_area_m2)).toLocaleString("en-GB")} m² footprint`,
  );
  return container;
}

function benchmarkPopup(properties: Record<string, unknown>) {
  const container = document.createElement("div");
  container.className = "map-popup production-popup benchmark-popup";
  appendText(container, "span", "REGIONAL BENCHMARK · END OF 2023");
  appendText(container, "strong", String(properties.region));
  appendText(
    container,
    "p",
    `${Number(properties.capacity_mwp).toLocaleString("en-GB", { maximumFractionDigits: 2 })} MWp · ${properties.share_percent}% of national estimate. Regional context, not mapped sites.`,
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
  const screeningMarkersRef = useRef<Map<string, EvidenceMarker>>(new Map());
  const benchmarkMarkersRef = useRef<Map<string, EvidenceMarker>>(new Map());
  const onSelectRef = useRef(onSelect);
  const previousSelectionRef = useRef<MapSelection | null>(selected);
  const points = useMemo(() => toPointCollection(data), [data]);
  const grid = useMemo(() => toGridCollection(data), [data]);
  const benchmarkPoints = useMemo(
    () => toBenchmarkCollection(benchmarkRegions),
    [benchmarkRegions],
  );
  const initialDataRef = useRef(data);
  const initialGridRef = useRef(grid);
  const initialPointsRef = useRef(points);
  const initialBenchmarkPointsRef = useRef(benchmarkPoints);
  const initialBenchmarkRegionsRef = useRef(benchmarkRegions);
  const initialViewRef = useRef(view);
  const [mapReadout, setMapReadout] = useState({ longitude: 35.78, latitude: 33.88, zoom: 7.1 });

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const screeningMarkers = screeningMarkersRef.current;
    const benchmarkMarkers = benchmarkMarkersRef.current;

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
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: "metric" }), "bottom-left");

    const updateMapReadout = () => {
      const center = map.getCenter();
      setMapReadout({ longitude: center.lng, latitude: center.lat, zoom: map.getZoom() });
    };
    map.on("moveend", updateMapReadout);

    map.on("load", () => {
      for (const feature of initialDataRef.current.features) {
        const button = document.createElement("button");
        const count = feature.properties.candidate_count;
        const corroborated = feature.properties.evidence_status === "corroborated";
        button.type = "button";
        button.className = `map-evidence-marker map-evidence-marker-screening${corroborated ? " corroborated" : ""}`;
        button.classList.toggle(
          "selected",
          previousSelectionRef.current?.kind === "screening" &&
            previousSelectionRef.current.id === feature.id,
        );
        button.setAttribute(
          "aria-label",
          `${count} model-screened solar candidate${count === 1 ? "" : "s"} in ${feature.properties.region_groups.join(", ")}`,
        );
        const value = document.createElement("strong");
        value.textContent = String(count);
        const label = document.createElement("span");
        label.textContent = corroborated ? "MODEL + OSM" : "MODEL";
        button.append(value, label);
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current({ kind: "screening", id: feature.id });
          new maplibregl.Popup({ offset: 24, closeButton: false })
            .setLngLat(screeningPolygonCenter(feature))
            .setDOMContent(screeningPopup(mapProperties(feature)))
            .addTo(map);
        });
        const marker = new maplibregl.Marker({ element: button, anchor: "center" })
          .setLngLat(screeningPolygonCenter(feature))
          .addTo(map);
        screeningMarkers.set(feature.id, { element: button, marker });
      }

      for (const region of initialBenchmarkRegionsRef.current) {
        const coordinate = benchmarkCoordinates[region.region];
        if (!coordinate) continue;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "map-evidence-marker map-evidence-marker-benchmark";
        button.classList.toggle(
          "selected",
          previousSelectionRef.current?.kind === "benchmark" &&
            previousSelectionRef.current.id === region.region,
        );
        button.setAttribute(
          "aria-label",
          `${region.region}: ${region.capacityMwp.toLocaleString("en-GB", { maximumFractionDigits: 2 })} MWp regional capacity estimate`,
        );
        const value = document.createElement("strong");
        value.textContent = `${Math.round(region.capacityMwp)}`;
        const label = document.createElement("span");
        label.textContent = "MWp";
        button.append(value, label);
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current({ kind: "benchmark", id: region.region });
          new maplibregl.Popup({ offset: 30, closeButton: false })
            .setLngLat(coordinate)
            .setDOMContent(benchmarkPopup({
              id: region.region,
              region: region.region,
              capacity_mwp: region.capacityMwp,
              share_percent: region.sharePercent,
            }))
            .addTo(map);
        });
        const marker = new maplibregl.Marker({ element: button, anchor: "center" })
          .setLngLat(coordinate)
          .addTo(map);
        benchmarkMarkers.set(region.region, { element: button, marker });
      }

      setMarkerVisibility(screeningMarkers, () => initialViewRef.current !== "research");
      setMarkerVisibility(benchmarkMarkers, () => initialViewRef.current !== "ai");

      map.addSource("screening-grid", { type: "geojson", data: initialGridRef.current });
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
      updateMapReadout();
    });

    return () => {
      removeMarkers(screeningMarkers);
      removeMarkers(benchmarkMarkers);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    setMarkerVisibility(screeningMarkersRef.current, () => view !== "research");
    setMarkerVisibility(benchmarkMarkersRef.current, () => view !== "ai");
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    setLayerGroupVisibility(map, screeningLayerIds, view !== "research");
    setLayerGroupVisibility(map, benchmarkLayerIds, view !== "ai");
  }, [view]);

  useEffect(() => {
    const visibleIds = new Set(data.features.map((feature) => feature.id));
    setMarkerVisibility(
      screeningMarkersRef.current,
      (id) => view !== "research" && visibleIds.has(id),
    );
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const source = map.getSource("screening-grid") as GeoJSONSource | undefined;
    const pointSource = map.getSource("screening-points") as GeoJSONSource | undefined;
    source?.setData(grid);
    pointSource?.setData(points);
  }, [data, grid, points, view]);

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
    setSelectedMarker(
      screeningMarkersRef.current,
      selected?.kind === "screening" ? selected.id : null,
    );
    setSelectedMarker(
      benchmarkMarkersRef.current,
      selected?.kind === "benchmark" ? selected.id : null,
    );
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
        aria-label="Interactive map of Lebanon model-screened solar candidates and regional capacity benchmarks"
      />
      <div className="map-reference-grid" aria-hidden="true" />
      <div className="map-centre-reticle" aria-hidden="true"><i /><i /></div>
      <div className="production-map-status">
        <span className="live-pulse" />
        <div>
          <strong>{data.features.length} screening cells</strong>
          <small>Public aggregation · 5 km grid</small>
        </div>
      </div>
      <div className="map-reference-readout" aria-label="Current map centre and zoom">
        <span>Map centre · WGS84</span>
        <strong>{mapReadout.latitude.toFixed(4)}° N&nbsp;&nbsp;{mapReadout.longitude.toFixed(4)}° E</strong>
        <small>Zoom {mapReadout.zoom.toFixed(1)} · EPSG:4326</small>
      </div>
      <div className="production-map-legend" aria-label="Map legend">
        {view !== "research" && <span><i className="legend-screened" /> Model-screened</span>}
        {view !== "research" && <span><i className="legend-corroborated" /> OSM corroborated</span>}
        {view !== "ai" && <span><i className="legend-benchmark" /> LCEC benchmark</span>}
      </div>
    </div>
  );
}
