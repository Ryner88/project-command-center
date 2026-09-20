import { NextRequest, NextResponse } from "next/server";

import { proposalStatusSchema } from "@/schemas/proposal";
import { updateProposalStatus } from "@/services/proposal.service";
import { recordOwnerMutation } from "@/services/audit.service";
import { getErrorPayload } from "@/lib/app-error";
import { observedRoute } from "@/lib/observability";

type StatusRouteProps = {
  params: Promise<{ id: string }>;
};

export const PATCH = observedRoute<[StatusRouteProps]>(
  "proposals.status",
  async (request: NextRequest, { params }: StatusRouteProps) => {
    try {
      const input = proposalStatusSchema.parse(await request.json());
      const { id } = await params;
      const proposal = await updateProposalStatus(id, input.status);
      await recordOwnerMutation({
        action: "proposal.status_changed",
        entityType: "proposal",
        entityId: id,
        requestId: request.headers.get("x-request-id"),
        metadata: { status: input.status }
      });
      return NextResponse.json({ data: proposal });
    } catch (error) {
      const payload = getErrorPayload(error, "Proposal status could not be updated.");
      return NextResponse.json(payload.body, { status: payload.status });
    }
  }
);
