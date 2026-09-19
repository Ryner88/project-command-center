import { projects, tasks } from "@/repositories/persistence.repository";
import { ensureCurrentUser } from "@/services/current-user.service";
import type { z } from "zod";
import type { projectInputSchema, projectUpdateSchema, taskInputSchema, taskUpdateSchema } from "@/schemas/project";

export async function listProjects(archived=false){ const u=await ensureCurrentUser(); return (await projects.list(u.id,archived)).map(mapProject); }
export async function getProject(id:string){ const u=await ensureCurrentUser(); const p=await projects.get(u.id,id); return p?mapProject(p):null; }
export async function createProject(input:z.infer<typeof projectInputSchema>){ const u=await ensureCurrentUser(); return projects.create(u.id,{...input,startDate:input.startDate||null,dueDate:input.dueDate||null}); }
export async function updateProject(id:string,input:z.infer<typeof projectUpdateSchema>){ const u=await ensureCurrentUser(); const {archived,...data}=input; return (await projects.update(u.id,id,{...data,...(archived===undefined?{}:{archivedAt:archived?new Date():null})}))[0]??null; }
export async function createTask(projectId:string,input:z.infer<typeof taskInputSchema>){ const u=await ensureCurrentUser(); return tasks.create(u.id,projectId,{...input,description:input.description||null}); }
export async function updateTask(id:string,input:z.infer<typeof taskUpdateSchema>){ const u=await ensureCurrentUser(); const {completed,...data}=input; return (await tasks.update(u.id,id,{...data,...(completed===undefined?{}:{completedAt:completed?new Date():null})}))[0]??null; }
function mapProject(p:any){ return {...p,startDate:p.startDate??undefined,dueDate:p.dueDate??undefined,archivedAt:p.archivedAt?.toISOString(),createdAt:p.createdAt.toISOString(),updatedAt:p.updatedAt.toISOString(),proposalCount:p._count.proposals,tasks:p.tasks.map((t:any)=>({...t,description:t.description??undefined,completedAt:t.completedAt?.toISOString(),createdAt:t.createdAt.toISOString(),updatedAt:t.updatedAt.toISOString()}))}; }
