import { NextRequest, NextResponse } from "next/server";
import { projectInputSchema } from "@/schemas/project";
import { createProject, listProjects } from "@/services/project.service";
import { getErrorPayload } from "@/lib/app-error";
import { recordOwnerMutation } from "@/services/audit.service";
import { observedRoute } from "@/lib/observability";
export const GET = observedRoute("projects.list", async (r: NextRequest) =>
  NextResponse.json({ data: await listProjects(r.nextUrl.searchParams.get("archived") === "true") })
);
export const POST = observedRoute("projects.create", async (r: NextRequest) => {
  try {
    const data = await createProject(projectInputSchema.parse(await r.json()));
    await recordOwnerMutation({
      action: "project.created",
      entityType: "project",
      entityId: data.id,
      requestId: r.headers.get("x-request-id")
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    const p = getErrorPayload(e, "Project could not be created.");
    return NextResponse.json(p.body, { status: p.status });
  }
});
