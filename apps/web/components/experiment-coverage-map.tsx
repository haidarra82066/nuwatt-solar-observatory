"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type {
  GeoJSONSourceSpecification,
  Map as MapLibreMap,
  StyleSpecification,
} from "maplibre-gl";

const coverage: Exclude<GeoJSONSourceSpecification["data"], string> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [35.51574783866193, 33.89737827070466],
            [35.52405919337954, 33.89737827070466],
            [35.52405919337954, 33.90418515362868],
            [35.51574783866193, 33.90418515362868],
            [35.51574783866193, 33.89737827070466],
          ],
        ],
      },
      properties: {
        name: "Historical imagery coverage",
        accepted_detections: 0,
      },
    },
  ],
};

export function ExperimentCoverageMap() {
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
            "raster-brightness-max": 0.94,
          },
        },
      ],
    };

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [35.5199, 33.9008],
      zoom: 14,
      minZoom: 11,
      maxZoom: 18,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource("experiment-coverage", {
        type: "geojson",
        data: coverage,
      });
      map.addLayer({
        id: "experiment-coverage-fill",
        type: "fill",
        source: "experiment-coverage",
        paint: {
          "fill-color": "#49b9dc",
          "fill-opacity": 0.2,
        },
      });
      map.addLayer({
        id: "experiment-coverage-outline",
        type: "line",
        source: "experiment-coverage",
        paint: {
          "line-color": "#087d9b",
          "line-width": 3,
          "line-dasharray": [2, 1.5],
        },
      });
      map.fitBounds(
        [
          [35.51574783866193, 33.89737827070466],
          [35.52405919337954, 33.90418515362868],
        ],
        { padding: 54, duration: 0 },
      );
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="experiment-map-frame">
      <div ref={containerRef} className="experiment-map-canvas" aria-label="Beirut Port experiment coverage map" />
      <div className="experiment-map-result">
        <span>Validated result</span>
        <strong>0 accepted detections</strong>
        <small>No heat layer or capacity estimate was emitted.</small>
      </div>
    </div>
  );
}
