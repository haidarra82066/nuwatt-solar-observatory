import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ScreeningFeatureCollection } from "@/lib/screening";

export async function getScreeningRelease(): Promise<ScreeningFeatureCollection> {
  const releasePath = path.join(
    process.cwd(),
    "public",
    "data",
    "experiments",
    "lbn-satlas-screening-2024-01-v1.geojson",
  );
  const contents = await readFile(releasePath, "utf8");
  return JSON.parse(contents) as ScreeningFeatureCollection;
}
