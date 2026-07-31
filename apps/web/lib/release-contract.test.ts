import { describe, expect, it } from "vitest";

import { parsePublicObservationRelease } from "@/lib/release-contract";

function publicRelease(overrides: Record<string, unknown> = {}) {
  const properties = {
    id: "lbn-ai-2027-01-g1-1",
    municipality: "Beirut",
    district: "Beirut",
    governorate: "Beirut",
    status: "detected",
    installations: 3,
    capacity_p10_mwp: 0.01,
    capacity_p50_mwp: 0.02,
    capacity_p90_mwp: 0.03,
    generation_p10_gwh: 0.015,
    generation_p50_gwh: 0.03,
    generation_p90_gwh: 0.05,
    confidence: 0.88,
    coverage_km2: 0.0625,
    imagery_date: "2027-01-10",
    imagery_resolution_m: 0.3,
    model_version: "pv-detector-1.0.0",
    source_asset_id: "licensed-tile-01",
    ...overrides,
  };
  return {
    type: "FeatureCollection",
    metadata: {
      release: "lbn-ai-2027-01",
      data_mode: "model-detections",
      privacy: "public-aggregate",
      grid_size_m: 250,
      min_cell_count: 3,
      model_version: "pv-detector-1.0.0",
      source_asset_id: "licensed-tile-01",
      imagery_source: "licensed 30 cm imagery",
      source_license_decision: "approved",
    },
    features: [
      {
        type: "Feature",
        id: properties.id,
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [35.5, 33.89],
              [35.502, 33.89],
              [35.502, 33.892],
              [35.5, 33.892],
              [35.5, 33.89],
            ],
          ],
        },
        properties,
      },
    ],
  };
}

describe("public AI release contract", () => {
  it("loads an aggregated, licensed detection release", () => {
    const release = parsePublicObservationRelease(publicRelease());

    expect(release.dataMode).toBe("model-detections");
    expect(release.cells[0].installations).toBe(3);
    expect(release.cells[0].modelVersion).toBe("pv-detector-1.0.0");
  });

  it("rejects raw or overly precise public locations", () => {
    const payload = publicRelease();
    payload.metadata.grid_size_m = 100;

    expect(() => parsePublicObservationRelease(payload)).toThrow("at least 250 metres");
  });

  it("rejects sparse cells", () => {
    expect(() =>
      parsePublicObservationRelease(publicRelease({ installations: 1 })),
    ).toThrow("minimum cell count");
  });

  it("rejects physical detections from coarse imagery", () => {
    expect(() =>
      parsePublicObservationRelease(publicRelease({ imagery_resolution_m: 10 })),
    ).toThrow("coarser than 1 metre");
  });
});
