import { NextRequest,NextResponse } from "next/server";
import { projectUpdateSchema } from "@/schemas/project";
import { getProject,updateProject } from "@/services/project.service";
import { getErrorPayload } from "@/lib/app-error";
type C={params:Promise<{id:string}>};
export async function GET(_:NextRequest,c:C){const {id}=await c.params;const p=await getProject(id);return p?NextResponse.json({data:p}):NextResponse.json({error:"Project was not found."},{status:404});}
export async function PATCH(r:NextRequest,c:C){try{const {id}=await c.params;const p=await updateProject(id,projectUpdateSchema.parse(await r.json()));return p?NextResponse.json({data:p}):NextResponse.json({error:"Project was not found."},{status:404});}catch(e){const p=getErrorPayload(e,"Project could not be updated.");return NextResponse.json(p.body,{status:p.status});}}
