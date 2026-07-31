import { DEMO_RELEASE, getMunicipalities } from "@/lib/observatory";

export function GET() {
  return Response.json(
    {
      data: getMunicipalities(),
      meta: {
        release: DEMO_RELEASE,
        dataMode: "synthetic-demo",
        count: getMunicipalities().length,
      },
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } },
  );
}
