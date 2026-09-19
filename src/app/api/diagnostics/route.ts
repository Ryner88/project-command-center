import { NextRequest, NextResponse } from "next/server";
import { observedRoute } from "@/lib/observability";
import { getDiagnostics } from "@/services/reliability.service";
export const dynamic = "force-dynamic";
export const GET = observedRoute("monitoring.diagnostics", async (_request: NextRequest) => NextResponse.json(await getDiagnostics()));
