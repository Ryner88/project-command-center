import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getErrorPayload } from "@/lib/app-error";
import { proposalGenerationSchema } from "@/schemas/proposal";
import { generateProposal } from "@/services/proposal.service";
import { recordOwnerMutation } from "@/services/audit.service";
import { observedRoute } from "@/lib/observability";

export const POST = observedRoute("proposals.generate", async (request: NextRequest) => {
  try {
    const body = await request.json();
    const input = proposalGenerationSchema.parse(body);
    const proposal = await generateProposal(input);
    await recordOwnerMutation({
      action: "proposal.generated",
      entityType: "proposal",
      entityId: proposal.id,
      requestId: request.headers.get("x-request-id")
    });

    return NextResponse.json({ data: proposal }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Proposal input is invalid.",
          details: error.issues.map((issue) => issue.message)
        },
        { status: 400 }
      );
    }

    const payload = getErrorPayload(error, "Proposal generation failed.");
    return NextResponse.json(payload.body, { status: payload.status });
  }
});
