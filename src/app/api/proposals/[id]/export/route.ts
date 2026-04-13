import { NextRequest, NextResponse } from "next/server";

import { exportProposalPdf } from "@/services/pdf.service";

type ExportRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, { params }: ExportRouteProps) {
  const { id } = await params;
  const result = await exportProposalPdf(id);

  return NextResponse.json({ data: result });
}
