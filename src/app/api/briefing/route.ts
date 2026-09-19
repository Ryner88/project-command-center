import { NextResponse } from "next/server";

import { getTodayBriefing } from "@/services/briefing.service";
import { observedRoute } from "@/lib/observability";
import type { NextRequest } from "next/server";

export const GET = observedRoute("briefing.read", async (_request: NextRequest) => {
  const briefing = await getTodayBriefing();
  return NextResponse.json(briefing);
});
