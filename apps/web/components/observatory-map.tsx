"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapLayerMouseEvent,
  StyleSpecification,
} from "maplibre-gl";

import type {
  CellFeatureCollection,
  CellFeatureProperties,
  CellPointFeatureCollection,
  EvidenceStatus,
  MapMetric,
} from "@/lib/types";

interface CandidateMarkerRecord {
  marker: maplibregl.Marker;
  element: HTMLButtonElement;
  properties: CellFeatureProperties;
}

interface ObservatoryMapProps {
  data: CellFeatureCollection;
  points: CellPointFeatureCollection;
  metric: MapMetric;
  statuses: EvidenceStatus[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const metricLabels: Record<MapMetric, string> = {
  capacity: "estimated capacity",
  installations: "candidate installations",
  confidence: "model confidence",
};

const metricExpressions: Record<MapMetric, unknown> = {
  capacity: [
    "interpolate",
    ["linear"],
    ["get", "capacity_p50_mwp"],
    0.2,
    "#f4c19e",
    0.65,
    "#52bcdd",
    1.35,
    "#0b7596",
  ],
  installations: [
    "interpolate",
    ["linear"],
    ["get", "installations"],
    40,
    "#f4c19e",
    120,
    "#52bcdd",
    230,
    "#0b7596",
  ],
  confidence: [
    "interpolate",
    ["linear"],
    ["get", "confidence"],
    0.5,
    "#f2a06b",
    0.72,
    "#f4c19e",
    0.95,
    "#52bcdd",
  ],
};

const heatmapWeightExpressions: Record<MapMetric, unknown> = {
  capacity: ["interpolate", ["linear"], ["get", "capacity_p50_mwp"], 0.2, 0.15, 1.35, 1],
  installations: ["interpolate", ["linear"], ["get", "installations"], 40, 0.15, 230, 1],
  confidence: ["interpolate", ["linear"], ["get", "confidence"], 0.5, 0.15, 0.95, 1],
};

const clusterRadiusExpressions: Record<MapMetric, unknown> = {
  capacity: ["interpolate", ["linear"], ["get", "capacity_p50_mwp"], 0.2, 7, 1.35, 17],
  installations: ["interpolate", ["linear"], ["get", "installations"], 40, 7, 230, 17],
  confidence: ["interpolate", ["linear"], ["get", "confidence"], 0.5, 7, 0.95, 17],
};

const evidenceFilterLayers = [
  "cells-fill",
  "cells-outline",
  "candidate-heat",
  "candidate-halo",
  "candidate-points",
];

const metricDomains: Record<MapMetric, [number, number]> = {
  capacity: [0.2, 1.35],
  installations: [40, 230],
  confidence: [0.5, 0.95],
};

function metricValue(properties: CellFeatureProperties, metric: MapMetric) {
  if (metric === "capacity") return properties.capacity_p50_mwp;
  return properties[metric];
}

function updateCandidateMarkers(
  markers: Map<string, CandidateMarkerRecord>,
  metric: MapMetric,
  statuses: EvidenceStatus[],
  selectedId: string | null,
) {
  const [minimum, maximum] = metricDomains[metric];

  for (const [id, record] of markers) {
    const rawValue = metricValue(record.properties, metric);
    const weight = Math.max(0, Math.min(1, (rawValue - minimum) / (maximum - minimum)));
    record.element.style.display = statuses.includes(record.properties.status) ? "grid" : "none";
    record.element.style.setProperty("--marker-size", `${18 + weight * 12}px`);
    record.element.style.setProperty("--heat-size", `${82 + weight * 92}px`);
    record.element.style.setProperty("--heat-opacity", String(0.52 + weight * 0.34));
    record.element.classList.toggle("selected", id === selectedId);
  }
}

function popupContent(properties: Record<string, unknown> | CellFeatureProperties) {
  const container = document.createElement("div");
  container.className = "map-popup";

  const eyebrow = document.createElement("span");
  eyebrow.textContent = `${String(properties.status).toUpperCase()} · ${String(properties.id)}`;
  const title = document.createElement("strong");
  title.textContent = String(properties.municipality);
  const details = document.createElement("p");
  details.textContent = `${properties.installations} candidate installations · ${properties.capacity_p50_mwp} MWp P50`;

  container.append(eyebrow, title, details);
  return container;
}

function fitEvidenceExtent(map: MapLibreMap, points: CellPointFeatureCollection) {
  const bounds = new maplibregl.LngLatBounds();
  for (const feature of points.features) {
    bounds.extend(feature.geometry.coordinates);
  }

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, {
      padding: { top: 64, right: 64, bottom: 64, left: 64 },
      maxZoom: 8.25,
      duration: 0,
    });
  }
}

export default function ObservatoryMap({
  data,
  points,
  metric,
  statuses,
  selectedId,
  onSelect,
}: ObservatoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, CandidateMarkerRecord>>(new Map());
  const selectRef = useRef(onSelect);
  const metricRef = useRef<MapMetric>(metric);
  const statusesRef = useRef<EvidenceStatus[]>(statuses);
  const selectedIdRef = useRef<string | null>(selectedId);
  const previousSelectedIdRef = useRef<string | null>(selectedId);

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    metricRef.current = metric;
  }, [metric]);

  useEffect(() => {
    statusesRef.current = statuses;
  }, [statuses]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const candidateMarkers = markersRef.current;

    const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    const attribution = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? "© OpenStreetMap contributors";
    const style: StyleSpecification = {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: [tileUrl],
          tileSize: 256,
          attribution,
        },
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm",
          paint: {
            "raster-saturation": -0.35,
            "raster-contrast": 0.08,
            "raster-brightness-min": 0.08,
            "raster-brightness-max": 0.94,
          },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [35.72, 33.84],
      zoom: 7.15,
      minZoom: 6.4,
      maxZoom: 15,
      maxBounds: [
        [34.6, 32.7],
        [36.9, 34.9],
      ],
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource("observations", { type: "geojson", data });
      map.addSource("observation-points", { type: "geojson", data: points });

      map.addLayer({
        id: "cells-fill",
        type: "fill",
        source: "observations",
        paint: {
          "fill-color": metricExpressions.capacity as never,
          "fill-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.34, 0.14],
        },
      });

      map.addLayer({
        id: "candidate-heat",
        type: "heatmap",
        source: "observation-points",
        maxzoom: 13,
        paint: {
          "heatmap-weight": heatmapWeightExpressions.capacity as never,
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 6, 0.95, 11, 1.7],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 6, 34, 10, 54, 13, 72],
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0.9, 11, 0.48, 13, 0],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(11, 117, 150, 0)",
            0.12,
            "rgba(244, 193, 158, 0.34)",
            0.36,
            "rgba(82, 188, 221, 0.68)",
            0.64,
            "rgba(11, 117, 150, 0.86)",
            1,
            "rgba(4, 44, 70, 0.96)",
          ],
        },
      });

      map.addLayer({
        id: "cells-outline",
        type: "line",
        source: "observations",
        paint: {
          "line-color": ["case", ["boolean", ["feature-state", "selected"], false], "#051d2d", "#087fa3"],
          "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 3.4, 1.8],
          "line-opacity": 0.96,
        },
      });

      map.addLayer({
        id: "candidate-halo",
        type: "circle",
        source: "observation-points",
        paint: {
          "circle-radius": ["+", clusterRadiusExpressions.capacity as never, 5] as never,
          "circle-color": "#ffffff",
          "circle-opacity": 0.86,
        },
      });

      map.addLayer({
        id: "candidate-points",
        type: "circle",
        source: "observation-points",
        paint: {
          "circle-radius": clusterRadiusExpressions.capacity as never,
          "circle-color": [
            "match",
            ["get", "status"],
            "verified",
            "#14946f",
            "detected",
            "#087fa3",
            "estimated",
            "#e28a55",
            "#087fa3",
          ],
          "circle-opacity": 0.97,
          "circle-stroke-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "#061d2c",
            "#ffffff",
          ],
          "circle-stroke-width": ["case", ["boolean", ["feature-state", "selected"], false], 4, 2],
        },
      });

      const openFeature = (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature?.properties) return;
        const id = String(feature.properties.id);
        selectRef.current(id);
        new maplibregl.Popup({ offset: 18, closeButton: false })
          .setLngLat(event.lngLat)
          .setDOMContent(popupContent(feature.properties))
          .addTo(map);
      };

      map.on("click", "candidate-points", openFeature);
      map.on("click", "cells-fill", openFeature);
      map.on("mouseenter", "candidate-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "candidate-points", () => {
        map.getCanvas().style.cursor = "";
      });

      for (const feature of points.features) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = `candidate-marker ${feature.properties.status}`;
        if (feature.geometry.coordinates[0] > 35.8) {
          element.classList.add("label-left");
        }
        element.setAttribute(
          "aria-label",
          `${feature.properties.municipality}: ${feature.properties.installations} synthetic candidate installations`,
        );

        const count = document.createElement("b");
        count.textContent = String(feature.properties.installations);
        const label = document.createElement("span");
        label.textContent = feature.properties.municipality;
        element.append(count, label);
        element.addEventListener("click", (event) => {
          event.stopPropagation();
          selectRef.current(feature.id);
          new maplibregl.Popup({ offset: 22, closeButton: false })
            .setLngLat(feature.geometry.coordinates)
            .setDOMContent(popupContent(feature.properties))
            .addTo(map);
        });

        const marker = new maplibregl.Marker({ element, anchor: "center" })
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);
        candidateMarkers.set(feature.id, { marker, element, properties: feature.properties });
      }

      updateCandidateMarkers(
        candidateMarkers,
        metricRef.current,
        statusesRef.current,
        selectedIdRef.current,
      );

      for (const feature of data.features) {
        const state = { selected: feature.id === selectedIdRef.current };
        map.setFeatureState({ source: "observations", id: feature.id }, state);
        map.setFeatureState({ source: "observation-points", id: feature.id }, state);
      }

      map.resize();
      fitEvidenceExtent(map, points);
    });

    mapRef.current = map;
    return () => {
      for (const record of candidateMarkers.values()) {
        record.marker.remove();
      }
      candidateMarkers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [data, points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getLayer("cells-fill")) return;
    map.setPaintProperty("cells-fill", "fill-color", metricExpressions[metric] as never);
    map.setPaintProperty("candidate-heat", "heatmap-weight", heatmapWeightExpressions[metric] as never);
    map.setPaintProperty("candidate-halo", "circle-radius", ["+", clusterRadiusExpressions[metric], 5] as never);
    map.setPaintProperty("candidate-points", "circle-radius", clusterRadiusExpressions[metric] as never);
    updateCandidateMarkers(markersRef.current, metric, statusesRef.current, selectedIdRef.current);
  }, [metric]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getLayer("cells-fill")) return;
    const filter = statuses.length === 3 ? null : (["in", ["get", "status"], ["literal", statuses]] as never);
    for (const layerId of evidenceFilterLayers) {
      map.setFilter(layerId, filter);
    }
    updateCandidateMarkers(markersRef.current, metricRef.current, statuses, selectedIdRef.current);
  }, [statuses]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getSource("observations") || !map.getSource("observation-points")) return;
    (map.getSource("observations") as GeoJSONSource).setData(data);
    (map.getSource("observation-points") as GeoJSONSource).setData(points);

    for (const feature of data.features) {
      const state = { selected: feature.id === selectedId };
      map.setFeatureState({ source: "observations", id: feature.id }, state);
      map.setFeatureState({ source: "observation-points", id: feature.id }, state);
    }

    if (previousSelectedIdRef.current !== selectedId) {
      const selected = points.features.find((feature) => feature.id === selectedId);
      if (selected) {
        map.easeTo({ center: selected.geometry.coordinates, zoom: Math.max(map.getZoom(), 9), duration: 700 });
      }
    }
    previousSelectedIdRef.current = selectedId;
    updateCandidateMarkers(markersRef.current, metricRef.current, statusesRef.current, selectedId);
  }, [data, points, selectedId]);

  return (
    <div className="observatory-map-wrap">
      <div className="observatory-map" ref={containerRef} />
      <div className="map-heatmap-note">
        <span>Synthetic pilot layer</span>
        <strong>Heat = relative {metricLabels[metric]}</strong>
        <small>Circles mark generalized candidate clusters</small>
      </div>
    </div>
  );
}
