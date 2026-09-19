import { z } from "zod";

import { PROPOSAL_DOMAINS } from "@/lib/proposal-domain";

export const proposalGenerationSchema = z
  .object({
    proposalSeedId: z.string().optional(),
    projectId: z.string().optional(),
    title: z.string().min(1).optional(),
    clientName: z.string().min(1).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    summary: z.string().min(1).optional(),
    projectType: z.string().min(1).optional(),
    projectDomain: z.enum(PROPOSAL_DOMAINS).optional(),
    projectDomainOther: z.string().min(1).optional(),
    rawRequest: z.string().min(1).optional()
  })
  .superRefine((value, ctx) => {
    if (value.projectDomain === "OTHER" && !value.projectDomainOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom project domain is required when domain is Other.",
        path: ["projectDomainOther"]
      });
    }

    if (value.startDate && value.dueDate && value.startDate > value.dueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be on or before the deadline.",
        path: ["startDate"]
      });
    }

    if (value.proposalSeedId) {
      return;
    }

    if (!value.clientName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Client name is required for manual proposal generation.",
        path: ["clientName"]
      });
    }

    if (!value.projectType?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project type is required for manual proposal generation.",
        path: ["projectType"]
      });
    }

    if (!value.projectDomain) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project domain is required for manual proposal generation.",
        path: ["projectDomain"]
      });
    }

    if (!value.summary?.trim() && !value.rawRequest?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a summary or working request for manual proposal generation.",
        path: ["summary"]
      });
    }
  });

export const proposalStatusSchema = z.object({
  status: z.enum(["DRAFT", "IN_REVIEW", "SENT", "WON", "LOST"])
});
export const proposalEditSchema = z.object({
  title:z.string().trim().min(1).max(240), summary:z.string().trim().min(1).max(10000),
  priceRange:z.string().trim().min(1).max(120), timeline:z.string().trim().max(500).optional(),
  scope:z.array(z.string().trim().min(1)).max(50), deliverables:z.array(z.string().trim().min(1)).max(50),
  taskBreakdown:z.array(z.string().trim().min(1)).max(50), risks:z.array(z.string().trim().min(1)).max(50), assumptions:z.array(z.string().trim().min(1)).max(50)
});
