import { NextResponse } from "next/server";

import { listProposals } from "@/services/proposal.service";
import { observedRoute } from "@/lib/observability";
import type { NextRequest } from "next/server";

export const GET = observedRoute("proposals.list", async (_request: NextRequest) => {
  const proposals = await listProposals();
  return NextResponse.json({ data: proposals });
});
