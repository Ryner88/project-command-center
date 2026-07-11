import { getOpenAIClient } from "@/lib/openai";
import {
  buildProposalDraft,
  buildProposalPromptContext,
  sanitizeProposalDraft
} from "@/lib/proposal-domain";
import { proposalGeneratorPrompt } from "@/prompts/proposal-generator";
import type { ProposalGenerationInput } from "@/types/proposal";

export async function generateProposalDraft(input: ProposalGenerationInput) {
  const fallback = buildFallbackDraft(input);

  if (!process.env.OPENAI_API_KEY) {
    return fallback;
  }

  try {
    const openai = getOpenAIClient();

    if (!openai) {
      return buildFallbackDraft(input);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: proposalGeneratorPrompt.trim()
        },
        {
          role: "user",
          content: JSON.stringify({
            ...input,
            promptContext: buildProposalPromptContext(
              input.projectDomain,
              input.projectDomainOther
            )
          })
        }
      ]
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return buildFallbackDraft(input);
    }

    const parsed = JSON.parse(content) as {
      summary?: string;
      scope?: string[];
      deliverables?: string[];
      taskBreakdown?: string[];
      timeline?: string;
      risks?: string[];
      assumptions?: string[];
      priceRange?: string;
    };
    return sanitizeProposalDraft({
      summary:
        parsed.summary ??
        `Proposal for ${input.clientName}: ${input.summary}`,
      scope:
        parsed.scope && parsed.scope.length > 0
          ? parsed.scope
          : fallback.scope,
      deliverables:
        parsed.deliverables && parsed.deliverables.length > 0
          ? parsed.deliverables
          : fallback.deliverables,
      taskBreakdown:
        parsed.taskBreakdown && parsed.taskBreakdown.length > 0
          ? parsed.taskBreakdown
          : fallback.taskBreakdown,
      timeline: parsed.timeline ?? "4-6 weeks",
      risks:
        parsed.risks && parsed.risks.length > 0
          ? parsed.risks
          : fallback.risks,
      assumptions:
        parsed.assumptions && parsed.assumptions.length > 0
          ? parsed.assumptions
          : fallback.assumptions,
      priceRange: parsed.priceRange ?? fallback.priceRange
    }, input as RequiredDraftInput);
  } catch {
    return fallback;
  }
}

type RequiredDraftInput = Required<
  Pick<ProposalGenerationInput, "clientName" | "summary">
> &
  Pick<
    ProposalGenerationInput,
    "projectType" | "projectDomain" | "projectDomainOther"
  >;

function buildFallbackDraft(input: ProposalGenerationInput) {
  return buildProposalDraft(input as RequiredDraftInput);
}
