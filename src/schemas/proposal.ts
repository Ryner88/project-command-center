import { z } from "zod";

export const proposalGenerationSchema = z.object({
  proposalSeedId: z.string().optional(),
  title: z.string().min(1),
  clientName: z.string().min(1),
  summary: z.string().min(1),
  projectType: z.string().optional()
});

export const proposalStatusSchema = z.object({
  status: z.enum(["DRAFT", "IN_REVIEW", "SENT", "WON", "LOST"])
});
