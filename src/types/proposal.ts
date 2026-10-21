import type { ProposalDomain } from "@/lib/proposal-domain";

export type ProposalStatus = "DRAFT" | "IN_REVIEW" | "SENT" | "WON" | "LOST";

export type Proposal = {
  id: string;
  proposalSeedId?: string;
  projectId?: string;
  title: string;
  clientName: string;
  projectType?: string;
  projectDomain?: ProposalDomain;
  projectDomainOther?: string;
  status: ProposalStatus;
  startDate?: string;
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
  projectId?: string;
  proposalSeedId?: string;
  title?: string;
  clientName?: string;
  startDate?: string;
  dueDate?: string;
  summary?: string;
  projectType?: string;
  projectDomain?: ProposalDomain;
  projectDomainOther?: string;
  rawRequest?: string;
};
