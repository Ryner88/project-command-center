import { NextRequest, NextResponse } from "next/server";
import { getReliabilitySnapshot, observedRoute } from "@/lib/observability";
export const dynamic = "force-dynamic";
export const GET = observedRoute("monitoring.liveness", async (_request: NextRequest) => NextResponse.json({ status: "ok", uptimeSeconds: getReliabilitySnapshot().uptimeSeconds }));
