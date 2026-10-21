import { NextResponse } from "next/server";

import { listProposals } from "@/services/proposal.service";
import { observedRoute } from "@/lib/observability";

export const GET = observedRoute("proposals.list", async () => {
  const proposals = await listProposals();
  return NextResponse.json({ data: proposals });
});
