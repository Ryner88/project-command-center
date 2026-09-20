import { z } from "zod";

export const projectStatusSchema = z.enum([
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED"
]);
export const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const projectInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  clientName: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(5000),
  status: projectStatusSchema.default("PLANNING"),
  priority: prioritySchema.default("MEDIUM"),
  startDate: z.string().optional(),
  dueDate: z.string().optional()
});
export const projectUpdateSchema = projectInputSchema
  .partial()
  .extend({ archived: z.boolean().optional() });
export const taskInputSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(3000).optional(),
  priority: prioritySchema.default("MEDIUM"),
  position: z.coerce.number().int().min(0).optional()
});
export const taskUpdateSchema = taskInputSchema
  .partial()
  .extend({ completed: z.boolean().optional() });
