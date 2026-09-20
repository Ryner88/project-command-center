import { NextResponse } from "next/server";

import { observedRoute } from "@/lib/observability";
import { getDataMode } from "@/services/data-mode.service";
import { loadDemoWorkspace } from "@/services/demo-store.service";

export const POST = observedRoute("demo.load", async () => {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return NextResponse.json(
      { error: "Demo loading is unavailable in production." },
      { status: 404 }
    );
  }
  if ((await getDataMode()) !== "demo") {
    return NextResponse.json(
      { error: "Demo loading is available only when the app is running in demo mode." },
      { status: 409 }
    );
  }
  const workspace = await loadDemoWorkspace();
  return NextResponse.json({
    data: {
      proposalCount: workspace.proposals.length,
      seedCount: workspace.proposalSeeds.length
    }
  });
});
