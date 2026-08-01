import { getObservationRelease } from "@/lib/release";
import { getScreeningRelease } from "@/lib/screening-server";

export async function GET() {
  const [legacyRelease, screeningRelease] = await Promise.all([
    getObservationRelease(),
    getScreeningRelease(),
  ]);
  return Response.json({
    status: "ok",
    service: "nuwatt-observatory-api",
    publicRelease: screeningRelease.metadata.release,
    publicDataMode: screeningRelease.metadata.data_mode,
    publicCandidateCount: screeningRelease.metadata.candidate_count,
    legacyContractRelease: legacyRelease.id,
    legacyContractDataMode: legacyRelease.dataMode,
    timestamp: new Date().toISOString(),
  });
}
