import { z } from "zod";

export const proposalSeedSchema = z.object({
  sourceType: z.enum(["EMAIL", "BRIEFING", "MANUAL"]),
  sourceReference: z.string().optional(),
  clientName: z.string().optional(),
  projectType: z.string().optional(),
  summary: z.string().min(1),
  context: z.record(z.string(), z.unknown()).default({})
});
