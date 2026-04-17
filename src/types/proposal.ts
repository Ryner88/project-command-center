import type { ProposalDomain } from "@/lib/proposal-domain";

export type ProposalStatus = "DRAFT" | "IN_REVIEW" | "SENT" | "WON" | "LOST";

export type Proposal = {
  id: string;
  proposalSeedId?: string;
  title: string;
  clientName: string;
  status: ProposalStatus;
  dueDate?: string;
  summary: string;
  scope: string[];
  deliverables: string[];
  taskBreakdown: string[];
  timeline?: string;
  risks: string[];
  assumptions: string[];
  priceRange: string;
  sourceLabel?: string;
};

export type ProposalGenerationInput = {
  proposalSeedId?: string;
  title?: string;
  clientName?: string;
  summary?: string;
  projectType?: string;
  projectDomain?: ProposalDomain;
  rawRequest?: string;
};
