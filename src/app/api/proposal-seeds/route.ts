import { NextRequest, NextResponse } from "next/server";

import { proposalSeedSchema } from "@/schemas/proposal-seed";
import { createProposalSeed, listProposalSeeds } from "@/services/proposal-seed.service";

export async function GET() {
  const seeds = await listProposalSeeds();
  return NextResponse.json({ data: seeds });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = proposalSeedSchema.parse(body);
  const seed = await createProposalSeed(input);

  return NextResponse.json({ data: seed }, { status: 201 });
}
