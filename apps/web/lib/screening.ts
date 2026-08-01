export type ScreeningEvidenceStatus = "screened" | "corroborated";

export interface ScreeningProperties {
  id: string;
  evidence_status: ScreeningEvidenceStatus;
  candidate_count: number;
  corroborated_candidate_count: number;
  candidate_footprint_area_m2: number;
  governorates: string[];
  region_groups: string[];
  source_snapshot: string;
  review_imagery_date: string;
  review_imagery_resolution_m: number;
  grid_size_m: number;
}

export interface ScreeningFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: ScreeningProperties;
}

export interface ScreeningReleaseMetadata {
  release: string;
  data_mode: "ai-screening-experiment";
  release_status: "share-with-caveats";
  evidence_scope: string;
  not_rooftop_inventory: boolean;
  not_panel_level_detection: boolean;
  not_national_capacity_inventory: boolean;
  source_dataset: string;
  source_license: string;
  source_attribution: string;
  source_model_imagery: string;
  source_model_imagery_resolution_m: number;
  source_validation_reference_asia_precision: number;
  source_validation_reference_asia_recall: number;
  source_validation_reference_scope: string;
  independent_review_imagery: string;
  independent_review_date: string;
  independent_review_resolution_m: number;
  corroboration_source: string;
  corroboration_license: string;
  corroboration_attribution: string;
  grid_size_m: number;
  privacy: string;
  exact_source_geometries_public: boolean;
  candidate_count: number;
  corroborated_candidate_count: number;
  candidate_footprint_area_m2: number;
  capacity_estimate_emitted: boolean;
  technical_yield_estimate_emitted: boolean;
  manual_review: string;
}

export interface ScreeningFeatureCollection {
  type: "FeatureCollection";
  metadata: ScreeningReleaseMetadata;
  features: ScreeningFeature[];
}

export interface ScreeningRegionSummary {
  region: string;
  candidateCount: number;
  corroboratedCount: number;
  footprintM2: number;
  cellCount: number;
}

export const screeningRegionOrder = [
  "Beqaa",
  "South",
  "North",
  "Beirut & Mount Lebanon",
] as const;

const regionAliases: Record<string, string> = {
  "Beirut and Mount Lebanon": "Beirut & Mount Lebanon",
};

export function summarizeScreeningRegions(
  release: ScreeningFeatureCollection,
): ScreeningRegionSummary[] {
  const regions = new Map<string, ScreeningRegionSummary>();

  for (const feature of release.features) {
    for (const sourceRegion of feature.properties.region_groups) {
      const region = regionAliases[sourceRegion] ?? sourceRegion;
      const current = regions.get(region) ?? {
        region,
        candidateCount: 0,
        corroboratedCount: 0,
        footprintM2: 0,
        cellCount: 0,
      };
      current.candidateCount += feature.properties.candidate_count;
      current.corroboratedCount += feature.properties.corroborated_candidate_count;
      current.footprintM2 += feature.properties.candidate_footprint_area_m2;
      current.cellCount += 1;
      regions.set(region, current);
    }
  }

  return screeningRegionOrder
    .map((region) => regions.get(region))
    .filter((region): region is ScreeningRegionSummary => Boolean(region));
}

export function screeningPolygonCenter(feature: ScreeningFeature): [number, number] {
  const ring = feature.geometry.coordinates[0];
  const longitudes = ring.map(([longitude]) => longitude);
  const latitudes = ring.map(([, latitude]) => latitude);
  return [
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  ];
}
