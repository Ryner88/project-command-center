import { NextRequest, NextResponse } from "next/server";

import { proposalSeedSchema } from "@/schemas/proposal-seed";
import { createProposalSeed, listProposalSeeds } from "@/services/proposal-seed.service";
import { recordOwnerMutation } from "@/services/audit.service";
import { getErrorPayload } from "@/lib/app-error";
import { observedRoute } from "@/lib/observability";

export const GET = observedRoute("proposal_seeds.list", async () => {
  const seeds = await listProposalSeeds();
  return NextResponse.json({ data: seeds });
});

export const POST = observedRoute("proposal_seeds.create", async (request: NextRequest) => {
  try {
    const input = proposalSeedSchema.parse(await request.json());
    const seed = await createProposalSeed(input);
    await recordOwnerMutation({ action: "proposal_seed.created", entityType: "proposal_seed", entityId: seed.id, requestId: request.headers.get("x-request-id") });
    return NextResponse.json({ data: seed }, { status: 201 });
  } catch (error) {
    const payload = getErrorPayload(error, "Proposal source could not be created.");
    return NextResponse.json(payload.body, { status: payload.status });
  }
});
