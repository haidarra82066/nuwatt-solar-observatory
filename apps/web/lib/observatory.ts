import type {
  CellFeatureCollection,
  CellFeatureProperties,
  CellPointFeatureCollection,
  EvidenceStatus,
  MunicipalitySummary,
  ObservationCell,
  ObservatorySummary,
} from "@/lib/types";

export const DEMO_RELEASE = "demo-2026-01";

function box(lng: number, lat: number, width = 0.055, height = 0.04): [number, number][] {
  return [
    [lng - width, lat - height],
    [lng + width, lat - height],
    [lng + width, lat + height],
    [lng - width, lat + height],
    [lng - width, lat - height],
  ];
}

export const observationCells: ObservationCell[] = [
  {
    id: "LBN-BEY-001",
    municipality: "Beirut",
    district: "Beirut",
    governorate: "Beirut",
    status: "verified",
    installations: 226,
    capacityMwp: { p10: 1.04, p50: 1.31, p90: 1.61 },
    generationGwh: { p10: 1.52, p50: 1.94, p90: 2.45 },
    confidence: 0.91,
    coverageKm2: 4.8,
    imageryDate: "2026-05-18",
    imageryResolutionM: 0.3,
    centroid: [35.5018, 33.8938],
    polygon: box(35.5018, 33.8938, 0.035, 0.025),
  },
  {
    id: "LBN-BAB-002",
    municipality: "Baabda",
    district: "Baabda",
    governorate: "Mount Lebanon",
    status: "detected",
    installations: 184,
    capacityMwp: { p10: 0.89, p50: 1.12, p90: 1.39 },
    generationGwh: { p10: 1.30, p50: 1.66, p90: 2.10 },
    confidence: 0.84,
    coverageKm2: 5.1,
    imageryDate: "2026-04-11",
    imageryResolutionM: 0.5,
    centroid: [35.5432, 33.8339],
    polygon: box(35.5432, 33.8339, 0.045, 0.03),
  },
  {
    id: "LBN-KES-003",
    municipality: "Jounieh",
    district: "Keserwan",
    governorate: "Keserwan-Jbeil",
    status: "detected",
    installations: 142,
    capacityMwp: { p10: 0.71, p50: 0.93, p90: 1.17 },
    generationGwh: { p10: 1.03, p50: 1.38, p90: 1.78 },
    confidence: 0.81,
    coverageKm2: 4.2,
    imageryDate: "2026-03-27",
    imageryResolutionM: 0.5,
    centroid: [35.6179, 33.9808],
    polygon: box(35.6179, 33.9808, 0.05, 0.035),
  },
  {
    id: "LBN-ZAH-004",
    municipality: "Zahle",
    district: "Zahle",
    governorate: "Beqaa",
    status: "estimated",
    installations: 165,
    capacityMwp: { p10: 0.77, p50: 1.02, p90: 1.33 },
    generationGwh: { p10: 1.15, p50: 1.55, p90: 2.07 },
    confidence: 0.68,
    coverageKm2: 5.7,
    imageryDate: "2026-04-03",
    imageryResolutionM: 10,
    centroid: [35.902, 33.8463],
    polygon: box(35.902, 33.8463, 0.07, 0.05),
  },
  {
    id: "LBN-BAA-005",
    municipality: "Baalbek",
    district: "Baalbek",
    governorate: "Baalbek-Hermel",
    status: "estimated",
    installations: 98,
    capacityMwp: { p10: 0.54, p50: 0.78, p90: 1.06 },
    generationGwh: { p10: 0.82, p50: 1.20, p90: 1.67 },
    confidence: 0.61,
    coverageKm2: 4.9,
    imageryDate: "2026-02-16",
    imageryResolutionM: 10,
    centroid: [36.2181, 34.006],
    polygon: box(36.2181, 34.006, 0.08, 0.055),
  },
  {
    id: "LBN-TRI-006",
    municipality: "Tripoli",
    district: "Tripoli",
    governorate: "North Lebanon",
    status: "detected",
    installations: 137,
    capacityMwp: { p10: 0.63, p50: 0.82, p90: 1.04 },
    generationGwh: { p10: 0.91, p50: 1.21, p90: 1.58 },
    confidence: 0.79,
    coverageKm2: 4.6,
    imageryDate: "2026-03-09",
    imageryResolutionM: 0.5,
    centroid: [35.8497, 34.4367],
    polygon: box(35.8497, 34.4367, 0.05, 0.035),
  },
  {
    id: "LBN-SAI-007",
    municipality: "Saida",
    district: "Saida",
    governorate: "South Lebanon",
    status: "verified",
    installations: 121,
    capacityMwp: { p10: 0.58, p50: 0.73, p90: 0.91 },
    generationGwh: { p10: 0.86, p50: 1.09, p90: 1.39 },
    confidence: 0.9,
    coverageKm2: 3.8,
    imageryDate: "2026-05-02",
    imageryResolutionM: 0.3,
    centroid: [35.3715, 33.5571],
    polygon: box(35.3715, 33.5571, 0.04, 0.03),
  },
  {
    id: "LBN-NAB-008",
    municipality: "Nabatieh",
    district: "Nabatieh",
    governorate: "Nabatieh",
    status: "estimated",
    installations: 88,
    capacityMwp: { p10: 0.39, p50: 0.56, p90: 0.76 },
    generationGwh: { p10: 0.59, p50: 0.86, p90: 1.20 },
    confidence: 0.64,
    coverageKm2: 4.1,
    imageryDate: "2026-02-28",
    imageryResolutionM: 10,
    centroid: [35.4824, 33.3772],
    polygon: box(35.4824, 33.3772, 0.055, 0.04),
  },
  {
    id: "LBN-TYR-009",
    municipality: "Tyre",
    district: "Tyre",
    governorate: "South Lebanon",
    status: "detected",
    installations: 76,
    capacityMwp: { p10: 0.36, p50: 0.48, p90: 0.62 },
    generationGwh: { p10: 0.54, p50: 0.72, p90: 0.96 },
    confidence: 0.77,
    coverageKm2: 3.5,
    imageryDate: "2026-03-18",
    imageryResolutionM: 0.5,
    centroid: [35.2038, 33.2705],
    polygon: box(35.2038, 33.2705, 0.045, 0.03),
  },
  {
    id: "LBN-ALE-010",
    municipality: "Aley",
    district: "Aley",
    governorate: "Mount Lebanon",
    status: "estimated",
    installations: 47,
    capacityMwp: { p10: 0.19, p50: 0.28, p90: 0.39 },
    generationGwh: { p10: 0.29, p50: 0.43, p90: 0.61 },
    confidence: 0.58,
    coverageKm2: 3.3,
    imageryDate: "2026-01-25",
    imageryResolutionM: 10,
    centroid: [35.5992, 33.8089],
    polygon: box(35.5992, 33.8089, 0.045, 0.035),
  },
];

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

export function getSummary(
  cells: ObservationCell[] = observationCells,
  release = DEMO_RELEASE,
): ObservatorySummary {
  const evidenceCounts: Record<EvidenceStatus, number> = {
    detected: 0,
    estimated: 0,
    verified: 0,
  };

  const totals = cells.reduce(
    (result, cell) => {
      result.installations += cell.installations;
      result.capacity.p10 += cell.capacityMwp.p10;
      result.capacity.p50 += cell.capacityMwp.p50;
      result.capacity.p90 += cell.capacityMwp.p90;
      result.generation.p10 += cell.generationGwh.p10;
      result.generation.p50 += cell.generationGwh.p50;
      result.generation.p90 += cell.generationGwh.p90;
      result.coverage += cell.coverageKm2;
      result.confidence += cell.confidence * cell.coverageKm2;
      evidenceCounts[cell.status] += cell.installations;
      return result;
    },
    {
      installations: 0,
      capacity: { p10: 0, p50: 0, p90: 0 },
      generation: { p10: 0, p50: 0, p90: 0 },
      coverage: 0,
      confidence: 0,
    },
  );

  const lastImageryDate = cells.reduce(
    (latest, cell) => (cell.imageryDate > latest ? cell.imageryDate : latest),
    "0000-00-00",
  );

  return {
    release,
    installations: totals.installations,
    capacityMwp: {
      p10: round(totals.capacity.p10),
      p50: round(totals.capacity.p50),
      p90: round(totals.capacity.p90),
    },
    generationGwh: {
      p10: round(totals.generation.p10),
      p50: round(totals.generation.p50),
      p90: round(totals.generation.p90),
    },
    coverageKm2: round(totals.coverage, 1),
    meanConfidence: totals.coverage ? round(totals.confidence / totals.coverage, 3) : 0,
    lastImageryDate,
    evidenceCounts,
  };
}

export function getMunicipalities(cells: ObservationCell[] = observationCells): MunicipalitySummary[] {
  return cells
    .map((cell) => ({
      municipality: cell.municipality,
      district: cell.district,
      governorate: cell.governorate,
      installations: cell.installations,
      capacityMwpP50: cell.capacityMwp.p50,
      generationGwhP50: cell.generationGwh.p50,
      meanConfidence: cell.confidence,
      statuses: [cell.status],
    }))
    .sort((a, b) => b.capacityMwpP50 - a.capacityMwpP50);
}

function toFeatureProperties(cell: ObservationCell): CellFeatureProperties {
  return {
    id: cell.id,
    municipality: cell.municipality,
    district: cell.district,
    governorate: cell.governorate,
    status: cell.status,
    installations: cell.installations,
    capacity_p10_mwp: cell.capacityMwp.p10,
    capacity_p50_mwp: cell.capacityMwp.p50,
    capacity_p90_mwp: cell.capacityMwp.p90,
    generation_p10_gwh: cell.generationGwh.p10,
    generation_p50_gwh: cell.generationGwh.p50,
    generation_p90_gwh: cell.generationGwh.p90,
    confidence: cell.confidence,
    coverage_km2: cell.coverageKm2,
    imagery_date: cell.imageryDate,
    imagery_resolution_m: cell.imageryResolutionM,
    model_version: cell.modelVersion,
    source_asset_id: cell.sourceAssetId,
    grid_size_m: cell.gridSizeM,
  };
}

export function toFeatureCollection(cells: ObservationCell[] = observationCells): CellFeatureCollection {
  return {
    type: "FeatureCollection",
    features: cells.map((cell) => ({
      type: "Feature",
      id: cell.id,
      geometry: {
        type: "Polygon",
        coordinates: [cell.polygon],
      },
      properties: toFeatureProperties(cell),
    })),
  };
}

export function toPointFeatureCollection(
  cells: ObservationCell[] = observationCells,
): CellPointFeatureCollection {
  return {
    type: "FeatureCollection",
    features: cells.map((cell) => ({
      type: "Feature",
      id: cell.id,
      geometry: {
        type: "Point",
        coordinates: cell.centroid,
      },
      properties: toFeatureProperties(cell),
    })),
  };
}
