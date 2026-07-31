import type { NextRequest } from "next/server";

import { DEMO_RELEASE, observationCells, toFeatureCollection } from "@/lib/observatory";
import type { EvidenceStatus } from "@/lib/types";

const allowedStatuses = new Set<EvidenceStatus>(["detected", "estimated", "verified"]);

export function GET(request: NextRequest) {
  const requestedStatus = request.nextUrl.searchParams.get("status")?.toLowerCase();
  const governorate = request.nextUrl.searchParams.get("governorate")?.toLowerCase();

  if (requestedStatus && !allowedStatuses.has(requestedStatus as EvidenceStatus)) {
    return Response.json(
      { error: "Invalid status", allowed: Array.from(allowedStatuses) },
      { status: 400 },
    );
  }

  const cells = observationCells.filter((cell) => {
    const statusMatches = !requestedStatus || cell.status === requestedStatus;
    const governorateMatches = !governorate || cell.governorate.toLowerCase() === governorate;
    return statusMatches && governorateMatches;
  });

  return Response.json(toFeatureCollection(cells), {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "X-Data-Release": DEMO_RELEASE,
      "X-Data-Mode": "synthetic-demo",
    },
  });
}
