import type { ProposalDomain } from "@/lib/proposal-domain";

export type ProposalSeedSourceType = "EMAIL" | "BRIEFING" | "MANUAL";

export type ProposalSeed = {
  id: string;
  userId: string;
  sourceType: ProposalSeedSourceType;
  sourceReference?: string;
  clientName?: string;
  projectType?: string;
  projectDomain?: ProposalDomain;
  projectDomainOther?: string;
  summary: string;
  context: Record<string, unknown>;
};

export type ProposalSeedInput = Omit<ProposalSeed, "id" | "userId">;
