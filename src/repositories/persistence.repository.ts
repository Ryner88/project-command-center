import { Prisma, type ProposalStatus } from "@prisma/client";
import { AppError } from "@/lib/app-error";
import { prisma } from "@/lib/prisma";
import type { ProposalSeedInput } from "@/types/proposal-seed";

type Client = Prisma.TransactionClient | typeof prisma;

export const transaction = <T>(work: (tx: Prisma.TransactionClient) => Promise<T>) =>
  prisma.$transaction(work);

export const users = {
  ready: async () => {
    const rows = await prisma.$queryRaw<Array<{ userTable: string | null }>>`
      SELECT to_regclass('public."User"')::text AS "userTable"`;
    return Boolean(rows[0]?.userTable);
  },
  ensure: (id: string, email: string, name: string) => prisma.user.upsert({
    where: { id }, update: { email, name }, create: { id, email, name }
  })
};

export const seeds = {
  list: (userId: string) => prisma.proposalSeed.findMany({
    where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" }
  }),
  first: (userId: string) => prisma.proposalSeed.findFirst({
    where: { userId, archivedAt: null }, orderBy: { createdAt: "asc" }
  }),
  get: (userId: string, id: string, db: Client = prisma) => db.proposalSeed.findFirst({
    where: { id, userId, archivedAt: null }
  }),
  bySource: (userId: string, sourceType: ProposalSeedInput["sourceType"], sourceReference: string) =>
    prisma.proposalSeed.findFirst({ where: { userId, sourceType, sourceReference } }),
  create: (userId: string, input: ProposalSeedInput, db: Client = prisma) => db.proposalSeed.create({
    data: {
      userId, sourceType: input.sourceType, sourceReference: input.sourceReference,
      clientName: input.clientName, projectType: input.projectType,
      projectDomain: input.projectDomain, projectDomainOther: input.projectDomainOther,
      summary: input.summary,
      context: {
        ...(input.context ?? {}),
        ...(input.projectDomain ? { projectDomain: input.projectDomain } : {}),
        ...(input.projectDomainOther ? { projectDomainOther: input.projectDomainOther } : {})
      } as Prisma.InputJsonObject
    }
  })
};

export const proposals = {
  list: (userId: string) => prisma.proposal.findMany({
    where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" }
  }),
  get: (userId: string, id: string, db: Client = prisma) => db.proposal.findFirst({
    where: { id, userId }
  }),
  create: (userId: string, data: Omit<Prisma.ProposalUncheckedCreateInput, "userId">, db: Client) =>
    db.proposal.create({ data: { ...data, userId } }),
  updateStatus: (userId: string, id: string, status: ProposalStatus) =>
    prisma.proposal.updateManyAndReturn({ where: { id, userId }, data: { status } }),
  edit: (userId:string,id:string,data:Prisma.ProposalUpdateInput) => transaction(async tx=>{
    const current=await tx.proposal.findFirst({where:{id,userId}}); if(!current) return null;
    const last=await tx.proposalVersion.aggregate({where:{proposalId:id},_max:{version:true}});
    await tx.proposalVersion.create({data:{userId,proposalId:id,version:(last._max.version??0)+1,snapshot:current as unknown as Prisma.InputJsonObject}});
    return tx.proposal.update({where:{id},data});
  }),
  versions: (userId:string,id:string)=>prisma.proposalVersion.findMany({where:{userId,proposalId:id},orderBy:{version:"desc"}})
};

export const exports = {
  list: (userId: string, proposalId: string) => prisma.export.findMany({
    where: { userId, proposalId }, orderBy: { createdAt: "desc" }
  }),
  upsert: (userId: string, data: { proposalId: string; fileName: string; filePath: string; mimeType: string }) =>
    transaction(async (tx) => {
      if (!await proposals.get(userId, data.proposalId, tx)) {
        throw new AppError(404, `Proposal ${data.proposalId} was not found.`);
      }
      return tx.export.upsert({
        where: { proposalId: data.proposalId },
        update: { fileName: data.fileName, filePath: data.filePath, mimeType: data.mimeType },
        create: { ...data, userId }
      });
    })
};

export const projects = {
  list: (userId:string, archived=false) => prisma.project.findMany({
    where:{ userId, archivedAt: archived ? { not:null } : null }, include:{ tasks:{ where:{ archivedAt:null }, orderBy:[{ completedAt:"asc" },{ position:"asc" }] }, _count:{ select:{ proposals:true } } }, orderBy:[{ priority:"desc" },{ updatedAt:"desc" }]
  }),
  get: (userId:string,id:string,db:Client=prisma) => db.project.findFirst({ where:{userId,id}, include:{ tasks:{ where:{archivedAt:null},orderBy:[{completedAt:"asc"},{position:"asc"}] }, _count:{select:{proposals:true}} } }),
  create: (userId:string,data:Prisma.ProjectUncheckedCreateWithoutUserInput) => prisma.project.create({data:{...data,userId}}),
  update: (userId:string,id:string,data:Prisma.ProjectUpdateManyMutationInput) => prisma.project.updateManyAndReturn({where:{userId,id},data}),
};

export const tasks = {
  create: async (userId:string,projectId:string,data:Omit<Prisma.TaskUncheckedCreateInput,"userId"|"projectId">) => transaction(async tx => {
    if (!await tx.project.findFirst({where:{id:projectId,userId,archivedAt:null}})) throw new AppError(404,"Project was not found.");
    return tx.task.create({data:{...data,userId,projectId}});
  }),
  update: (userId:string,id:string,data:Prisma.TaskUpdateManyMutationInput) => prisma.task.updateManyAndReturn({where:{userId,id},data})
};
