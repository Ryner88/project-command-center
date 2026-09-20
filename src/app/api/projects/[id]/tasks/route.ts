import { NextRequest, NextResponse } from "next/server";
import { taskInputSchema } from "@/schemas/project";
import { createTask } from "@/services/project.service";
import { getErrorPayload } from "@/lib/app-error";
import { recordOwnerMutation } from "@/services/audit.service";
import { observedRoute } from "@/lib/observability";
type C = { params: Promise<{ id: string }> };
export const POST = observedRoute<[C]>("tasks.create", async (r: NextRequest, { params }: C) => {
  try {
    const { id } = await params;
    const data = await createTask(id, taskInputSchema.parse(await r.json()));
    await recordOwnerMutation({
      action: "task.created",
      entityType: "task",
      entityId: data.id,
      requestId: r.headers.get("x-request-id"),
      metadata: { projectId: id }
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    const p = getErrorPayload(e, "Task could not be created.");
    return NextResponse.json(p.body, { status: p.status });
  }
});
