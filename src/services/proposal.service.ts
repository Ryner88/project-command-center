import type { ProposalStatus } from "@/types/proposal";
import type { ProposalGenerationInput, Proposal } from "@/types/proposal";

import { getProposalSeedById } from "@/services/proposal-seed.service";
import { generateProposalDraft } from "@/services/ai/proposal-ai.service";

const demoProposals: Proposal[] = [
  {
    id: "proposal_1",
    title: "Acme Website Redesign",
    clientName: "Acme",
    status: "DRAFT",
    dueDate: "2026-04-16",
    summary: "Refresh Acme's marketing site before a product launch with clearer conversion paths and editor-friendly CMS controls.",
    scope: [
      "Discovery workshop",
      "UX/UI design",
      "CMS implementation"
    ],
    deliverables: [
      "Messaging workshop summary",
      "10-page responsive design system",
      "CMS-powered marketing website"
    ],
    taskBreakdown: [
      "Discovery and content audit",
      "Design iteration and approvals",
      "Build, QA, and launch preparation"
    ],
    timeline: "6 weeks",
    risks: ["Tight stakeholder review cycles", "Content delays"],
    assumptions: [
      "Stakeholder feedback is consolidated weekly",
      "Final copy is delivered before build begins"
    ],
    priceRange: "$11,500 - $15,000",
    sourceLabel: "Manual draft"
  }
];

export async function listProposals(): Promise<Proposal[]> {
  return demoProposals;
}

export async function generateProposal(input: ProposalGenerationInput): Promise<Proposal> {
  const sourceSeed = input.proposalSeedId
    ? await getProposalSeedById(input.proposalSeedId)
    : null;
  const generated = await generateProposalDraft(input);
  const proposal: Proposal = {
    id: `proposal_${demoProposals.length + 1}`,
    proposalSeedId: input.proposalSeedId,
    title: input.title,
    clientName: input.clientName,
    status: "DRAFT",
    summary: generated.summary,
    scope: generated.scope,
    deliverables: generated.deliverables,
    taskBreakdown: generated.taskBreakdown,
    timeline: generated.timeline,
    risks: generated.risks,
    assumptions: generated.assumptions,
    priceRange: generated.priceRange,
    sourceLabel: sourceSeed
      ? `${sourceSeed.sourceType.toLowerCase()} seed`
      : "Manual draft"
  };

  demoProposals.push(proposal);

  return proposal;
}

export async function getProposalById(id: string): Promise<Proposal | null> {
  return demoProposals.find((proposal) => proposal.id === id) ?? null;
}

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus
): Promise<Proposal | null> {
  const proposal = demoProposals.find((item) => item.id === id);

  if (!proposal) {
    return null;
  }

  proposal.status = status;
  return proposal;
}
