import { NextRequest,NextResponse } from "next/server";
import { taskInputSchema } from "@/schemas/project";
import { createTask } from "@/services/project.service";
import { getErrorPayload } from "@/lib/app-error";
export async function POST(r:NextRequest,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;return NextResponse.json({data:await createTask(id,taskInputSchema.parse(await r.json()))},{status:201});}catch(e){const p=getErrorPayload(e,"Task could not be created.");return NextResponse.json(p.body,{status:p.status});}}
