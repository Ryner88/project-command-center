import { NextResponse } from "next/server";

import { getProposalExportDocument } from "@/services/export-document.service";

type ExportDownloadRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ExportDownloadRouteProps) {
  const { id } = await params;
  const document = await getProposalExportDocument(id);

  return new NextResponse(document.content, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${document.fileName}"`,
      "Cache-Control": "no-store"
    }
  });
}
