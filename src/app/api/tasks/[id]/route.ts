import { NextRequest,NextResponse } from "next/server";
import { taskUpdateSchema } from "@/schemas/project";
import { updateTask } from "@/services/project.service";
import { getErrorPayload } from "@/lib/app-error";
export async function PATCH(r:NextRequest,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const t=await updateTask(id,taskUpdateSchema.parse(await r.json()));return t?NextResponse.json({data:t}):NextResponse.json({error:"Task was not found."},{status:404});}catch(e){const p=getErrorPayload(e,"Task could not be updated.");return NextResponse.json(p.body,{status:p.status});}}
