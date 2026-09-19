import { NextRequest,NextResponse } from "next/server";
import { projectInputSchema } from "@/schemas/project";
import { createProject,listProjects } from "@/services/project.service";
import { getErrorPayload } from "@/lib/app-error";
export async function GET(r:NextRequest){ return NextResponse.json({data:await listProjects(r.nextUrl.searchParams.get("archived")==="true")}); }
export async function POST(r:NextRequest){ try{return NextResponse.json({data:await createProject(projectInputSchema.parse(await r.json()))},{status:201});}catch(e){const p=getErrorPayload(e,"Project could not be created.");return NextResponse.json(p.body,{status:p.status});} }
