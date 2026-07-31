import type {
  CapacityRange,
  EvidenceStatus,
  ObservationCell,
  ObservationRelease,
} from "@/lib/types";

type JsonRecord = Record<string, unknown>;

function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as JsonRecord;
}

function textValue(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function numberValue(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return value;
}

function range(properties: JsonRecord, prefix: string, unit: string): CapacityRange {
  const result = {
    p10: numberValue(properties[`${prefix}_p10_${unit}`], `${prefix} P10`),
    p50: numberValue(properties[`${prefix}_p50_${unit}`], `${prefix} P50`),
    p90: numberValue(properties[`${prefix}_p90_${unit}`], `${prefix} P90`),
  };
  if (result.p10 < 0 || result.p10 > result.p50 || result.p50 > result.p90) {
    throw new Error(`${prefix} must satisfy 0 <= P10 <= P50 <= P90`);
  }
  return result;
}

function parseRing(geometryValue: unknown, index: number): [number, number][] {
  const geometry = record(geometryValue, `Feature ${index} geometry`);
  if (geometry.type !== "Polygon" || !Array.isArray(geometry.coordinates)) {
    throw new Error(`Feature ${index} must use Polygon geometry`);
  }
  const rawRing = geometry.coordinates[0];
  if (!Array.isArray(rawRing) || rawRing.length < 4) {
    throw new Error(`Feature ${index} polygon must have a closed exterior ring`);
  }
  const ring = rawRing.map((coordinate, coordinateIndex) => {
    if (
      !Array.isArray(coordinate) ||
      coordinate.length < 2 ||
      typeof coordinate[0] !== "number" ||
      typeof coordinate[1] !== "number"
    ) {
      throw new Error(`Feature ${index} coordinate ${coordinateIndex} is invalid`);
    }
    return [coordinate[0], coordinate[1]] as [number, number];
  });
  const first = ring[0];
  const last = ring.at(-1);
  if (!last || first[0] !== last[0] || first[1] !== last[1]) {
    throw new Error(`Feature ${index} polygon ring must be closed`);
  }
  return ring;
}

function ringCenter(ring: [number, number][]): [number, number] {
  const longitudes = ring.map(([longitude]) => longitude);
  const latitudes = ring.map(([, latitude]) => latitude);
  return [
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  ];
}

function parseCell(
  featureValue: unknown,
  index: number,
  metadata: JsonRecord,
  minCellCount: number,
  gridSizeM: number,
): ObservationCell {
  const feature = record(featureValue, `Feature ${index}`);
  if (feature.type !== "Feature") throw new Error(`Feature ${index} must have type Feature`);
  const properties = record(feature.properties, `Feature ${index} properties`);
  const polygon = parseRing(feature.geometry, index);
  const status = textValue(properties.status, `Feature ${index} status`) as EvidenceStatus;
  if (!new Set<EvidenceStatus>(["detected", "verified"]).has(status)) {
    throw new Error(`Feature ${index} must be detected or verified`);
  }
  const installations = numberValue(properties.installations, `Feature ${index} installations`);
  if (!Number.isInteger(installations) || installations < minCellCount) {
    throw new Error(`Feature ${index} violates the public minimum cell count`);
  }
  const confidence = numberValue(properties.confidence, `Feature ${index} confidence`);
  if (confidence < 0 || confidence > 1) throw new Error(`Feature ${index} confidence is invalid`);
  const imageryResolutionM = numberValue(
    properties.imagery_resolution_m,
    `Feature ${index} imagery resolution`,
  );
  if (status === "detected" && imageryResolutionM > 1) {
    throw new Error(`Feature ${index} cannot be detected from imagery coarser than 1 metre`);
  }

  return {
    id: textValue(properties.id ?? feature.id, `Feature ${index} id`),
    municipality: textValue(properties.municipality, `Feature ${index} municipality`),
    district: textValue(properties.district, `Feature ${index} district`),
    governorate: textValue(properties.governorate, `Feature ${index} governorate`),
    status,
    installations,
    capacityMwp: range(properties, "capacity", "mwp"),
    generationGwh: range(properties, "generation", "gwh"),
    confidence,
    coverageKm2: numberValue(properties.coverage_km2, `Feature ${index} coverage`),
    imageryDate: textValue(properties.imagery_date, `Feature ${index} imagery date`),
    imageryResolutionM,
    centroid: ringCenter(polygon),
    polygon,
    modelVersion: textValue(
      properties.model_version ?? metadata.model_version,
      `Feature ${index} model version`,
    ),
    sourceAssetId: textValue(
      properties.source_asset_id ?? metadata.source_asset_id,
      `Feature ${index} source asset`,
    ),
    gridSizeM,
  };
}

export function parsePublicObservationRelease(payloadValue: unknown): ObservationRelease {
  const payload = record(payloadValue, "Release");
  if (payload.type !== "FeatureCollection" || !Array.isArray(payload.features)) {
    throw new Error("Release must be a GeoJSON FeatureCollection");
  }
  const metadata = record(payload.metadata, "Release metadata");
  if (metadata.data_mode !== "model-detections") {
    throw new Error("Production releases must declare data_mode=model-detections");
  }
  if (metadata.privacy !== "public-aggregate") {
    throw new Error("Production releases must be privacy-safe public aggregates");
  }
  if (metadata.source_license_decision !== "approved") {
    throw new Error("Production releases require an approved source licence decision");
  }
  const gridSizeM = numberValue(metadata.grid_size_m, "grid_size_m");
  const minCellCount = numberValue(metadata.min_cell_count, "min_cell_count");
  if (gridSizeM < 250) throw new Error("Public grid cells must be at least 250 metres");
  if (!Number.isInteger(minCellCount) || minCellCount < 3) {
    throw new Error("Public cells must suppress groups smaller than three detections");
  }
  const cells = payload.features.map((feature, index) =>
    parseCell(feature, index, metadata, minCellCount, gridSizeM),
  );
  if (!cells.length) throw new Error("A production release must contain at least one public cell");

  return {
    id: textValue(metadata.release, "release"),
    dataMode: "model-detections",
    cells,
    disclaimer:
      "Locations are privacy-safe aggregates of AI detections. Capacity and technical yield remain imagery-derived estimates.",
    sourceLabel: textValue(metadata.imagery_source, "imagery_source"),
    sourceUrl: typeof metadata.source_url === "string" ? metadata.source_url : undefined,
    gridSizeM,
    minCellCount,
    modelVersion: textValue(metadata.model_version, "model_version"),
  };
}
