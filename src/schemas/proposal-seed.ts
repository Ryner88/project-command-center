import { z } from "zod";

import { PROPOSAL_DOMAINS } from "@/lib/proposal-domain";

export const proposalSeedSchema = z.object({
  sourceType: z.enum(["EMAIL", "BRIEFING", "MANUAL"]),
  sourceReference: z.string().optional(),
  clientName: z.string().optional(),
  projectType: z.string().optional(),
  projectDomain: z.enum(PROPOSAL_DOMAINS).optional(),
  summary: z.string().min(1),
  context: z.record(z.string(), z.unknown()).default({})
});
