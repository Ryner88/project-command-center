import { NextRequest,NextResponse } from "next/server";
import { proposalEditSchema } from "@/schemas/proposal";
import { editProposal,listProposalVersions } from "@/services/proposal.service";
import { getErrorPayload } from "@/lib/app-error";
import { recordOwnerMutation } from "@/services/audit.service";
type C={params:Promise<{id:string}>};
export async function GET(_:NextRequest,c:C){const {id}=await c.params;return NextResponse.json({data:await listProposalVersions(id)});}
export async function PATCH(r:NextRequest,c:C){try{const {id}=await c.params;const p=await editProposal(id,proposalEditSchema.parse(await r.json()));if(!p)return NextResponse.json({error:"Proposal was not found."},{status:404});await recordOwnerMutation({action:"proposal.edited",entityType:"proposal",entityId:id,requestId:r.headers.get("x-request-id")});return NextResponse.json({data:p});}catch(e){const p=getErrorPayload(e,"Proposal could not be saved.");return NextResponse.json(p.body,{status:p.status});}}
