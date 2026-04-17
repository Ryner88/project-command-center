import { z } from "zod";

import { PROPOSAL_DOMAINS } from "@/lib/proposal-domain";

export const proposalGenerationSchema = z.object({
  proposalSeedId: z.string().optional(),
  title: z.string().min(1).optional(),
  clientName: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  projectType: z.string().optional(),
  projectDomain: z.enum(PROPOSAL_DOMAINS).optional(),
  rawRequest: z.string().min(1).optional()
});

export const proposalStatusSchema = z.object({
  status: z.enum(["DRAFT", "IN_REVIEW", "SENT", "WON", "LOST"])
});
