import { NextResponse } from "next/server";

import { getDeploymentHealth } from "@/services/deployment-health.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const health = await getDeploymentHealth();
  const status = health.status === "error" ? 503 : 200;

  return NextResponse.json(health, { status });
}
