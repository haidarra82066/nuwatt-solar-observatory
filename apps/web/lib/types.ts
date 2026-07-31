export type EvidenceStatus = "detected" | "estimated" | "verified";

export type DataMode = "synthetic-demo" | "model-detections";

export type MapMetric = "capacity" | "installations" | "confidence";

export interface CapacityRange {
  p10: number;
  p50: number;
  p90: number;
}

export interface ObservationCell {
  id: string;
  municipality: string;
  district: string;
  governorate: string;
  status: EvidenceStatus;
  installations: number;
  capacityMwp: CapacityRange;
  generationGwh: CapacityRange;
  confidence: number;
  coverageKm2: number;
  imageryDate: string;
  imageryResolutionM: number;
  centroid: [number, number];
  polygon: [number, number][];
  modelVersion?: string;
  sourceAssetId?: string;
  gridSizeM?: number;
}

export interface ObservationRelease {
  id: string;
  dataMode: DataMode;
  cells: ObservationCell[];
  disclaimer: string;
  sourceLabel: string;
  sourceUrl?: string;
  gridSizeM?: number;
  minCellCount?: number;
  modelVersion?: string;
}

export interface RegionalCapacityBenchmark {
  region: string;
  capacityMwp: number;
  sharePercent: number;
}

export interface NationalCapacityBenchmark {
  asOf: string;
  published: string;
  totalCapacityMwp: number;
  methodology: string;
  sourceLabel: string;
  sourceUrl: string;
  regions: RegionalCapacityBenchmark[];
}

export interface MunicipalitySummary {
  municipality: string;
  district: string;
  governorate: string;
  installations: number;
  capacityMwpP50: number;
  generationGwhP50: number;
  meanConfidence: number;
  statuses: EvidenceStatus[];
}

export interface ObservatorySummary {
  release: string;
  installations: number;
  capacityMwp: CapacityRange;
  generationGwh: CapacityRange;
  coverageKm2: number;
  meanConfidence: number;
  lastImageryDate: string;
  evidenceCounts: Record<EvidenceStatus, number>;
}

export interface CellFeatureProperties {
  id: string;
  municipality: string;
  district: string;
  governorate: string;
  status: EvidenceStatus;
  installations: number;
  capacity_p10_mwp: number;
  capacity_p50_mwp: number;
  capacity_p90_mwp: number;
  generation_p10_gwh: number;
  generation_p50_gwh: number;
  generation_p90_gwh: number;
  confidence: number;
  coverage_km2: number;
  imagery_date: string;
  imagery_resolution_m: number;
  model_version?: string;
  source_asset_id?: string;
  grid_size_m?: number;
}

export interface CellFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry: {
      type: "Polygon";
      coordinates: [number, number][][];
    };
    properties: CellFeatureProperties;
  }>;
}

export interface CellPointFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    properties: CellFeatureProperties;
  }>;
}
