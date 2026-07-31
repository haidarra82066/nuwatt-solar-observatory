import { DEMO_RELEASE, observationCells } from "@/lib/observatory";
import { parsePublicObservationRelease } from "@/lib/release-contract";
import type { ObservationRelease } from "@/lib/types";

export const demoObservationRelease: ObservationRelease = {
  id: DEMO_RELEASE,
  dataMode: "synthetic-demo",
  cells: observationCells,
  disclaimer:
    "Synthetic pilot values prove the interface and contracts. They are not measured or AI-detected Lebanese PV data.",
  sourceLabel: "Bundled synthetic demonstration",
};

export async function getObservationRelease(): Promise<ObservationRelease> {
  const releaseUrl = process.env.NUWATT_RELEASE_GEOJSON_URL;
  if (!releaseUrl) return demoObservationRelease;

  const response = await fetch(releaseUrl, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Configured observation release returned HTTP ${response.status}`);
  }
  return parsePublicObservationRelease(await response.json());
}
