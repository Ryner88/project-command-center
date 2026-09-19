import { NextRequest, NextResponse } from "next/server";

import { getErrorPayload } from "@/lib/app-error";
import { createProposalExport } from "@/services/export-document.service";
import { recordOwnerMutation } from "@/services/audit.service";

type ExportRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, { params }: ExportRouteProps) {
  try {
    const { id } = await params;
    const result = await createProposalExport(id);
    await recordOwnerMutation({ action: "proposal.exported", entityType: "proposal", entityId: id, requestId: _request.headers.get("x-request-id") });

    return NextResponse.json({ data: result });
  } catch (error) {
    const payload = getErrorPayload(error, "Proposal export failed.");
    return NextResponse.json(payload.body, { status: payload.status });
  }
}
