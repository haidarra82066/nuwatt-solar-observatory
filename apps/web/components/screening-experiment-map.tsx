"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type {
  GeoJSONSourceSpecification,
  Map as MapLibreMap,
  MapLayerMouseEvent,
  StyleSpecification,
} from "maplibre-gl";

interface ScreeningProperties {
  id: string;
  evidence_status: "screened" | "corroborated";
  candidate_count: number;
  corroborated_candidate_count: number;
  candidate_footprint_area_m2: number;
  region_groups: string[];
}

interface ScreeningCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry: { type: "Polygon"; coordinates: number[][][] };
    properties: ScreeningProperties;
  }>;
}

function polygonCenter(coordinates: number[][][]): [number, number] {
  const ring = coordinates[0];
  const longitudes = ring.map((coordinate) => coordinate[0]);
  const latitudes = ring.map((coordinate) => coordinate[1]);
  return [
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  ];
}

function popupContent(properties: Record<string, unknown>) {
  const container = document.createElement("div");
  container.className = "map-popup";
  const eyebrow = document.createElement("span");
  eyebrow.textContent = String(properties.evidence_status).toUpperCase();
  const title = document.createElement("strong");
  const regions = Array.isArray(properties.region_groups)
    ? properties.region_groups.join(", ")
    : String(properties.region_groups ?? "Lebanon");
  title.textContent = regions;
  const details = document.createElement("p");
  details.textContent = `${properties.candidate_count} AI-screened candidate${properties.candidate_count === 1 ? "" : "s"} · ${properties.corroborated_candidate_count} corroborated · ${Math.round(Number(properties.candidate_footprint_area_m2)).toLocaleString()} m² footprint`;
  container.append(eyebrow, title, details);
  return container;
}

export function ScreeningExperimentMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const tileUrl =
      process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
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
            "raster-saturation": -0.42,
            "raster-contrast": 0.08,
            "raster-brightness-max": 0.95,
          },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [35.82, 33.88],
      zoom: 7.2,
      minZoom: 6.4,
      maxZoom: 15,
      maxBounds: [
        [34.8, 32.85],
        [36.75, 34.75],
      ],
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", async () => {
      const response = await fetch("/data/experiments/lbn-satlas-screening-2024-01-v1.geojson");
      if (!response.ok) return;
      const grid = (await response.json()) as ScreeningCollection;
      const points = {
        type: "FeatureCollection" as const,
        features: grid.features.map((feature) => ({
          type: "Feature" as const,
          id: feature.id,
          geometry: {
            type: "Point" as const,
            coordinates: polygonCenter(feature.geometry.coordinates),
          },
          properties: feature.properties,
        })),
      };

      map.addSource("screening-grid", {
        type: "geojson",
        data: grid as GeoJSONSourceSpecification["data"],
      });
      map.addSource("screening-points", {
        type: "geojson",
        data: points as GeoJSONSourceSpecification["data"],
      });
      map.addLayer({
        id: "screening-heat",
        type: "heatmap",
        source: "screening-points",
        maxzoom: 11,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "candidate_count"],
            1,
            0.35,
            3,
            1,
          ],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 6, 0.85, 10, 1.45],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 6, 20, 10, 42],
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.82, 11, 0.22],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(82,188,221,0)",
            0.2,
            "#f4c19e",
            0.5,
            "#52bcdd",
            0.8,
            "#087d9b",
            1,
            "#16213e",
          ],
        },
      });
      map.addLayer({
        id: "screening-grid-fill",
        type: "fill",
        source: "screening-grid",
        minzoom: 8,
        paint: {
          "fill-color": [
            "case",
            ["==", ["get", "evidence_status"], "corroborated"],
            "#2aa881",
            "#3aaed1",
          ],
          "fill-opacity": [
            "interpolate",
            ["linear"],
            ["get", "candidate_count"],
            1,
            0.22,
            3,
            0.48,
          ],
        },
      });
      map.addLayer({
        id: "screening-grid-outline",
        type: "line",
        source: "screening-grid",
        minzoom: 8,
        paint: {
          "line-color": [
            "case",
            ["==", ["get", "evidence_status"], "corroborated"],
            "#18745b",
            "#087d9b",
          ],
          "line-width": 1.6,
        },
      });
      map.addLayer({
        id: "screening-points",
        type: "circle",
        source: "screening-points",
        paint: {
          "circle-color": [
            "case",
            ["==", ["get", "evidence_status"], "corroborated"],
            "#18745b",
            "#087d9b",
          ],
          "circle-radius": ["interpolate", ["linear"], ["get", "candidate_count"], 1, 5, 3, 9],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
        },
      });

      map.on("click", "screening-grid-fill", (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature?.properties) return;
        new maplibregl.Popup({ closeButton: false, offset: 12 })
          .setLngLat(event.lngLat)
          .setDOMContent(popupContent(feature.properties))
          .addTo(map);
      });
      map.on("mouseenter", "screening-grid-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "screening-grid-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="screening-map-canvas" aria-label="Lebanon AI solar screening heatmap" />;
}
