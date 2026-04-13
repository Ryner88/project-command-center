import { z } from "zod";

export const briefingItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  source: z.string(),
  requiresAction: z.boolean()
});

export const dailyBriefingSchema = z.object({
  summary: z.object({
    title: z.string(),
    body: z.string()
  }),
  items: z.array(briefingItemSchema)
});
