import { getSummary } from "@/lib/observatory";

export function GET() {
  return Response.json(
    {
      data: getSummary(),
      meta: {
        dataMode: "synthetic-demo",
        disclaimer: "Demonstration values are not measured national statistics.",
      },
    },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } },
  );
}
