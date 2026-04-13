import { NextResponse } from "next/server";

import { getTodayBriefing } from "@/services/briefing.service";

export async function GET() {
  const briefing = await getTodayBriefing();
  return NextResponse.json(briefing);
}
