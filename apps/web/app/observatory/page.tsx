import type { Metadata } from "next";

import { ObservatoryClient } from "@/components/observatory-client";
import { nationalCapacityBenchmark } from "@/lib/benchmark";
import { getObservationRelease } from "@/lib/release";

export const metadata: Metadata = {
  title: "Observatory",
  description: "Explore the NuWatt solar evidence map, uncertainty ranges, coverage, and source quality.",
};

export default async function ObservatoryPage() {
  const release = await getObservationRelease();
  return <ObservatoryClient release={release} benchmark={nationalCapacityBenchmark} />;
}
