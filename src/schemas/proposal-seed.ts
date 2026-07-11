import { z } from "zod";

import { PROPOSAL_DOMAINS } from "@/lib/proposal-domain";

export const proposalSeedSchema = z
  .object({
    sourceType: z.enum(["EMAIL", "BRIEFING", "MANUAL"]),
    sourceReference: z.string().optional(),
    clientName: z.string().optional(),
    projectType: z.string().optional(),
    projectDomain: z.enum(PROPOSAL_DOMAINS).optional(),
    projectDomainOther: z.string().min(1).optional(),
    summary: z.string().min(1),
    context: z.record(z.string(), z.unknown()).default({})
  })
  .superRefine((value, ctx) => {
    if (value.projectDomain === "OTHER" && !value.projectDomainOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom project domain is required when domain is Other.",
        path: ["projectDomainOther"]
      });
    }
  });
