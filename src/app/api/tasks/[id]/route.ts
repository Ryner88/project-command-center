import { NextRequest,NextResponse } from "next/server";
import { taskUpdateSchema } from "@/schemas/project";
import { updateTask } from "@/services/project.service";
import { getErrorPayload } from "@/lib/app-error";
import { recordOwnerMutation } from "@/services/audit.service";
import { observedRoute } from "@/lib/observability";
type C={params:Promise<{id:string}>};
export const PATCH=observedRoute<[C]>("tasks.update",async(r:NextRequest,{params}:C)=>{try{const {id}=await params;const t=await updateTask(id,taskUpdateSchema.parse(await r.json()));if(!t)return NextResponse.json({error:"Task was not found."},{status:404});await recordOwnerMutation({action:"task.updated",entityType:"task",entityId:id,requestId:r.headers.get("x-request-id")});return NextResponse.json({data:t});}catch(e){const p=getErrorPayload(e,"Task could not be updated.");return NextResponse.json(p.body,{status:p.status});}});
