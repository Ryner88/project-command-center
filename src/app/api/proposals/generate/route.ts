import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { proposalGenerationSchema } from "@/schemas/proposal";
import { generateProposal } from "@/services/proposal.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = proposalGenerationSchema.parse(body);
    const proposal = await generateProposal(input);

    return NextResponse.json({ data: proposal }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Proposal input is invalid." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Proposal generation failed."
      },
      { status: 400 }
    );
  }
}
