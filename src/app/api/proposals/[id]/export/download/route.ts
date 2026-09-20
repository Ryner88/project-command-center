import { NextResponse } from "next/server";

import { getErrorPayload } from "@/lib/app-error";
import { getProposalExportDocument } from "@/services/export-document.service";
import { observedRoute } from "@/lib/observability";
import type { NextRequest } from "next/server";

type ExportDownloadRouteProps = {
  params: Promise<{ id: string }>;
};

export const GET = observedRoute<[ExportDownloadRouteProps]>(
  "proposals.download_html",
  async (_request: NextRequest, { params }: ExportDownloadRouteProps) => {
    try {
      const { id } = await params;
      const document = await getProposalExportDocument(id);

      return new NextResponse(document.content, {
        headers: {
          "Content-Type": document.mimeType,
          "Content-Disposition": `inline; filename="${document.fileName}"`,
          "Cache-Control": "no-store"
        }
      });
    } catch (error) {
      const payload = getErrorPayload(error, "Proposal export download failed.");
      return NextResponse.json(payload.body, { status: payload.status });
    }
  }
);
