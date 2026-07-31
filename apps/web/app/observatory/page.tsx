import type { Metadata } from "next";

import { ObservatoryClient } from "@/components/observatory-client";
import { observationCells } from "@/lib/observatory";

export const metadata: Metadata = {
  title: "Observatory",
  description: "Explore the NuWatt solar evidence map, uncertainty ranges, coverage, and source quality.",
};

export default function ObservatoryPage() {
  return <ObservatoryClient cells={observationCells} />;
}
