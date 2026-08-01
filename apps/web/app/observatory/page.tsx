import type { Metadata } from "next";

import { ObservatoryClient } from "@/components/observatory-client";
import { nationalCapacityBenchmark } from "@/lib/benchmark";
import { getScreeningRelease } from "@/lib/screening-server";

export const metadata: Metadata = {
  title: "Lebanon Solar Observatory",
  description:
    "Explore Lebanon's public solar evidence map, AI-screened large-installation candidates, and regional LCEC research benchmarks.",
};

export default async function ObservatoryPage() {
  const release = await getScreeningRelease();
  return <ObservatoryClient release={release} benchmark={nationalCapacityBenchmark} />;
}
