import { NextResponse } from "next/server";

import { getErrorPayload } from "@/lib/app-error";
import { getProposalPdfDocument } from "@/services/export-document.service";

export const runtime = "nodejs";

type ExportPdfRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ExportPdfRouteProps) {
  try {
    const { id } = await params;
    const document = await getProposalPdfDocument(id);

    return new NextResponse(document.content, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${document.fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const payload = getErrorPayload(error, "Proposal PDF export failed.");
    return NextResponse.json(payload.body, { status: payload.status });
  }
}
