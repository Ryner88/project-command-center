import { NextResponse } from "next/server";

import { getTodayBriefing } from "@/services/briefing.service";
import { observedRoute } from "@/lib/observability";

export const GET = observedRoute("briefing.read", async () => {
  const briefing = await getTodayBriefing();
  return NextResponse.json(briefing);
});
