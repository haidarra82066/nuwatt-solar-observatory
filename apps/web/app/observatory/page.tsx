import type { Metadata } from "next";

import { ObservatoryClient } from "@/components/observatory-client";
import { nationalCapacityBenchmark } from "@/lib/benchmark";
import { getScreeningRelease } from "@/lib/screening-server";

export const metadata: Metadata = {
  title: "Lebanon Solar Evidence Atlas",
  description:
    "Explore model-screened large-installation candidates and published regional capacity benchmarks for Lebanon.",
};

export default async function ObservatoryPage() {
  const release = await getScreeningRelease();
  return <ObservatoryClient release={release} benchmark={nationalCapacityBenchmark} />;
}
