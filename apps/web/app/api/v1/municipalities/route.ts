import { getMunicipalities } from "@/lib/observatory";
import { getObservationRelease } from "@/lib/release";

export async function GET() {
  const release = await getObservationRelease();
  const municipalities = getMunicipalities(release.cells);
  return Response.json(
    {
      data: municipalities,
      meta: {
        release: release.id,
        dataMode: release.dataMode,
        count: municipalities.length,
      },
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } },
  );
}
