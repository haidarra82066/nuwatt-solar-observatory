"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type {
  GeoJSONSource,
  Map as MapLibreMap,
  MapLayerMouseEvent,
  StyleSpecification,
} from "maplibre-gl";

import type { CellFeatureCollection, EvidenceStatus, MapMetric } from "@/lib/types";

interface ObservatoryMapProps {
  data: CellFeatureCollection;
  metric: MapMetric;
  statuses: EvidenceStatus[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

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

function popupContent(properties: Record<string, unknown>) {
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

export default function ObservatoryMap({ data, metric, statuses, selectedId, onSelect }: ObservatoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const selectRef = useRef(onSelect);

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

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
            "raster-saturation": -0.82,
            "raster-contrast": 0.12,
            "raster-brightness-min": 0.16,
            "raster-brightness-max": 0.82,
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
      maxZoom: 13,
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
      map.addLayer({
        id: "cells-fill",
        type: "fill",
        source: "observations",
        paint: {
          "fill-color": metricExpressions.capacity as never,
          "fill-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.86, 0.62],
        },
      });
      map.addLayer({
        id: "cells-outline",
        type: "line",
        source: "observations",
        paint: {
          "line-color": ["case", ["boolean", ["feature-state", "selected"], false], "#ffffff", "#bcecf7"],
          "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 3, 1.2],
          "line-opacity": 0.95,
        },
      });

      map.on("click", "cells-fill", (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature?.properties) return;
        const id = String(feature.properties.id);
        selectRef.current(id);
        new maplibregl.Popup({ offset: 12, closeButton: false })
          .setLngLat(event.lngLat)
          .setDOMContent(popupContent(feature.properties))
          .addTo(map);
      });

      map.on("mouseenter", "cells-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "cells-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [data]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getLayer("cells-fill")) return;
    map.setPaintProperty("cells-fill", "fill-color", metricExpressions[metric] as never);
  }, [metric]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getLayer("cells-fill")) return;
    const filter = statuses.length === 3 ? null : (["in", ["get", "status"], ["literal", statuses]] as never);
    map.setFilter("cells-fill", filter);
    map.setFilter("cells-outline", filter);
  }, [statuses]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded() || !map.getSource("observations")) return;
    (map.getSource("observations") as GeoJSONSource).setData(data);

    for (const feature of data.features) {
      map.setFeatureState({ source: "observations", id: feature.id }, { selected: feature.id === selectedId });
    }

    const selected = data.features.find((feature) => feature.id === selectedId);
    const first = selected?.geometry.coordinates[0]?.[0];
    const opposite = selected?.geometry.coordinates[0]?.[2];
    if (first && opposite) {
      map.fitBounds([first, opposite], { padding: 90, maxZoom: 10, duration: 700 });
    }
  }, [data, selectedId]);

  return <div className="observatory-map" ref={containerRef} />;
}
