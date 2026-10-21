import { NextResponse } from "next/server";

import { getDeploymentHealth } from "@/services/deployment-health.service";
import { observedRoute } from "@/lib/observability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = observedRoute("monitoring.health", async () => {
  const health = await getDeploymentHealth();
  const status = health.status === "error" ? 503 : 200;

  return NextResponse.json(health, { status });
});
