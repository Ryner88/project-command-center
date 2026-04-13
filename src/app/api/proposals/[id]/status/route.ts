import { NextRequest, NextResponse } from "next/server";

import { proposalStatusSchema } from "@/schemas/proposal";
import { updateProposalStatus } from "@/services/proposal.service";

type StatusRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: StatusRouteProps) {
  const body = await request.json();
  const input = proposalStatusSchema.parse(body);
  const { id } = await params;
  const proposal = await updateProposalStatus(id, input.status);

  return NextResponse.json({ data: proposal });
}
