import { NextRequest, NextResponse } from "next/server";
import { observedRoute } from "@/lib/observability";
import { getReadiness } from "@/services/reliability.service";
export const dynamic = "force-dynamic";
export const GET = observedRoute("monitoring.readiness", async (_request: NextRequest) => {
  const readiness = await getReadiness();
  return NextResponse.json(readiness, { status: readiness.ready ? 200 : 503 });
});
