import { getSummary } from "@/lib/observatory";
import { getObservationRelease } from "@/lib/release";

export async function GET() {
  const release = await getObservationRelease();
  return Response.json(
    {
      data: getSummary(release.cells, release.id),
      meta: {
        dataMode: release.dataMode,
        disclaimer: release.disclaimer,
        source: release.sourceLabel,
        modelVersion: release.modelVersion,
        gridSizeM: release.gridSizeM,
      },
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } },
  );
}
