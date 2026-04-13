import { z } from "zod";

export const estimateLineSchema = z.object({
  label: z.string(),
  hours: z.number().nonnegative(),
  role: z.string()
});
