import { NextRequest, NextResponse } from "next/server";

import { proposalGenerationSchema } from "@/schemas/proposal";
import { generateProposal } from "@/services/proposal.service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = proposalGenerationSchema.parse(body);
  const proposal = await generateProposal(input);

  return NextResponse.json({ data: proposal }, { status: 201 });
}
