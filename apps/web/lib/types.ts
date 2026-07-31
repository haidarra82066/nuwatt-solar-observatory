export type EvidenceStatus = "detected" | "estimated" | "verified";

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

export interface CellFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry: {
      type: "Polygon";
      coordinates: [number, number][][];
    };
    properties: {
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
    };
  }>;
}
