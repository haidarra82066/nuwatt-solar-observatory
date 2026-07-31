import { nationalCapacityBenchmark } from "@/lib/benchmark";

export function GET() {
  return Response.json({
    evidenceType: "published-market-benchmark",
    aiDetectedLocations: false,
    ...nationalCapacityBenchmark,
  });
}
