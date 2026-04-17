import { z } from "zod";

export const proposalGenerationSchema = z.object({
  proposalSeedId: z.string().optional(),
  title: z.string().min(1).optional(),
  clientName: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  projectType: z.string().optional(),
  rawRequest: z.string().min(1).optional()
});

export const proposalStatusSchema = z.object({
  status: z.enum(["DRAFT", "IN_REVIEW", "SENT", "WON", "LOST"])
});
