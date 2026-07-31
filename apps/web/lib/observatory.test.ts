import { describe, expect, it } from "vitest";

import { getMunicipalities, getSummary, observationCells, toFeatureCollection } from "@/lib/observatory";

describe("observatory data contract", () => {
  it("aggregates every demonstration cell", () => {
    const summary = getSummary();

    expect(summary.installations).toBe(
      observationCells.reduce((total, cell) => total + cell.installations, 0),
    );
    expect(summary.capacityMwp.p10).toBeLessThan(summary.capacityMwp.p50);
    expect(summary.capacityMwp.p50).toBeLessThan(summary.capacityMwp.p90);
    expect(summary.coverageKm2).toBeGreaterThan(20);
  });

  it("exports valid polygon features", () => {
    const geojson = toFeatureCollection();

    expect(geojson.type).toBe("FeatureCollection");
    expect(geojson.features).toHaveLength(observationCells.length);
    expect(geojson.features[0].geometry.coordinates[0][0]).toEqual(
      geojson.features[0].geometry.coordinates[0].at(-1),
    );
  });

  it("orders municipality summaries by estimated capacity", () => {
    const municipalities = getMunicipalities();

    expect(municipalities[0].capacityMwpP50).toBeGreaterThanOrEqual(
      municipalities.at(-1)?.capacityMwpP50 ?? 0,
    );
  });
});
