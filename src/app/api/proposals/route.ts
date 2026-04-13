import { NextResponse } from "next/server";

import { listProposals } from "@/services/proposal.service";

export async function GET() {
  const proposals = await listProposals();
  return NextResponse.json({ data: proposals });
}
