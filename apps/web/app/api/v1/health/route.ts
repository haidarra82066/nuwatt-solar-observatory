import { DEMO_RELEASE } from "@/lib/observatory";

export function GET() {
  return Response.json({
    status: "ok",
    service: "nuwatt-observatory-api",
    release: DEMO_RELEASE,
    dataMode: "synthetic-demo",
    timestamp: new Date().toISOString(),
  });
}
