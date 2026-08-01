import { getScreeningRelease } from "@/lib/screening-server";

export async function GET() {
  const release = await getScreeningRelease();
  return Response.json(release, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-NuWatt-Release": release.metadata.release,
    },
  });
}
