import { getOpenAIClient } from "@/lib/openai";
import { proposalGeneratorPrompt } from "@/prompts/proposal-generator";
import type { ProposalGenerationInput } from "@/types/proposal";

export async function generateProposalDraft(input: ProposalGenerationInput) {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackDraft(input);
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
          content: JSON.stringify(input)
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
    const fallback = buildFallbackDraft(input);

    return {
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
    };
  } catch {
    return buildFallbackDraft(input);
  }
}

function buildFallbackDraft(input: ProposalGenerationInput) {
  return {
    summary: `Proposal for ${input.clientName}: ${input.summary}`,
    scope: [
      `${input.projectType ?? "Project"} discovery`,
      "Strategic design and approvals",
      "Build, QA, and launch support"
    ],
    deliverables: [
      "Approved sitemap and page plan",
      "Responsive design system and page designs",
      "CMS build with contact and lead capture forms"
    ],
    taskBreakdown: [
      "Week 1: discovery, sitemap, and content alignment",
      "Week 2-3: design, revisions, and approvals",
      "Week 4-5: development, CMS setup, and QA",
      "Week 6: stakeholder review, launch prep, and handoff"
    ],
    timeline: "4-6 weeks",
    risks: ["Client-side content delays", "Scope changes after kickoff"],
    assumptions: [
      "Client provides final copy and imagery on schedule",
      "Feedback is consolidated into one review round per phase"
    ],
    priceRange: "$9,000 - $14,000"
  };
}
