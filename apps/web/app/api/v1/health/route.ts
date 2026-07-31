import { getObservationRelease } from "@/lib/release";

export async function GET() {
  const release = await getObservationRelease();
  return Response.json({
    status: "ok",
    service: "nuwatt-observatory-api",
    release: release.id,
    dataMode: release.dataMode,
    timestamp: new Date().toISOString(),
  });
}
