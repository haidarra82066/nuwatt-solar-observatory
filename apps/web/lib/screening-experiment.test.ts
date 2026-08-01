import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

type ScreeningProperties = {
  id: string;
  evidence_status: "screened" | "corroborated";
  candidate_count: number;
  corroborated_candidate_count: number;
  candidate_footprint_area_m2: number;
};

type ScreeningRelease = {
  metadata: {
    data_mode: string;
    exact_source_geometries_public: boolean;
    grid_size_m: number;
    candidate_count: number;
    corroborated_candidate_count: number;
    candidate_footprint_area_m2: number;
    capacity_estimate_emitted: boolean;
    technical_yield_estimate_emitted: boolean;
  };
  features: Array<{ properties: ScreeningProperties }>;
};

const release = JSON.parse(
  readFileSync(
    new URL(
      "../public/data/experiments/lbn-satlas-screening-2024-01-v1.geojson",
      import.meta.url,
    ),
    "utf8",
  ),
) as ScreeningRelease;

describe("Satlas Lebanon screening release", () => {
  it("publishes a privacy-safe candidate layer without capacity claims", () => {
    expect(release.metadata.data_mode).toBe("ai-screening-experiment");
    expect(release.metadata.exact_source_geometries_public).toBe(false);
    expect(release.metadata.grid_size_m).toBe(5_000);
    expect(release.metadata.capacity_estimate_emitted).toBe(false);
    expect(release.metadata.technical_yield_estimate_emitted).toBe(false);

    for (const feature of release.features) {
      expect(["screened", "corroborated"]).toContain(
        feature.properties.evidence_status,
      );
      expect(feature.properties).not.toHaveProperty("capacity_p10_mwp");
      expect(feature.properties).not.toHaveProperty("capacity_p50_mwp");
      expect(feature.properties).not.toHaveProperty("capacity_p90_mwp");
      expect(feature.properties).not.toHaveProperty("technical_yield_p10_mwh");
      expect(feature.properties).not.toHaveProperty("technical_yield_p50_mwh");
      expect(feature.properties).not.toHaveProperty("technical_yield_p90_mwh");
    }
  });

  it("reconciles every published aggregate to release metadata", () => {
    const ids = release.features.map(({ properties }) => properties.id);
    const candidateCount = release.features.reduce(
      (sum, { properties }) => sum + properties.candidate_count,
      0,
    );
    const corroboratedCount = release.features.reduce(
      (sum, { properties }) => sum + properties.corroborated_candidate_count,
      0,
    );
    const footprint = release.features.reduce(
      (sum, { properties }) => sum + properties.candidate_footprint_area_m2,
      0,
    );

    expect(new Set(ids).size).toBe(ids.length);
    expect(release.features).toHaveLength(18);
    expect(candidateCount).toBe(release.metadata.candidate_count);
    expect(corroboratedCount).toBe(
      release.metadata.corroborated_candidate_count,
    );
    expect(footprint).toBeCloseTo(
      release.metadata.candidate_footprint_area_m2,
      3,
    );
  });
});
