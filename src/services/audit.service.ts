import type { Prisma } from "@prisma/client";
import { auditEvents } from "@/repositories/persistence.repository";
import { ensureCurrentUser } from "@/services/current-user.service";
import { getDataMode } from "@/services/data-mode.service";

export async function recordOwnerMutation(input: {
  action: string;
  entityType: string;
  entityId?: string;
  requestId?: string | null;
  metadata?: Prisma.InputJsonObject;
}) {
  if (await getDataMode() !== "database") return;
  const user = await ensureCurrentUser();
  await auditEvents.create(user.id, {
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    requestId: input.requestId ?? undefined,
    metadata: input.metadata
  });
}
