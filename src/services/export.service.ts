import { prisma } from "@/lib/prisma";
import {
  ensureCurrentUser,
  isDatabaseConfigured
} from "@/services/current-user.service";
import type { ProposalExport } from "@/types/export";

declare global {
  var demoProposalExports: ProposalExport[] | undefined;
}

const demoExports = global.demoProposalExports ?? [];

if (process.env.NODE_ENV !== "production") {
  global.demoProposalExports = demoExports;
}

export async function listExportsForProposal(proposalId: string) {
  if (isDatabaseConfigured()) {
    const user = await ensureCurrentUser();
    const exports = await prisma.export.findMany({
      where: {
        proposalId,
        userId: user.id
      },
      orderBy: { createdAt: "desc" }
    });

    return exports.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString()
    }));
  }

  return demoExports.filter((item) => item.proposalId === proposalId);
}

export async function upsertProposalExport(
  proposalExport: Omit<ProposalExport, "id" | "createdAt">
) {
  if (isDatabaseConfigured()) {
    const user = await ensureCurrentUser();
    const exportRecord = await prisma.export.upsert({
      where: {
        proposalId: proposalExport.proposalId
      },
      update: {
        fileName: proposalExport.fileName,
        filePath: proposalExport.filePath,
        mimeType: proposalExport.mimeType
      },
      create: {
        userId: user.id,
        proposalId: proposalExport.proposalId,
        fileName: proposalExport.fileName,
        filePath: proposalExport.filePath,
        mimeType: proposalExport.mimeType
      }
    });

    return {
      ...exportRecord,
      createdAt: exportRecord.createdAt.toISOString()
    };
  }

  const existingExport = demoExports.find(
    (item) => item.proposalId === proposalExport.proposalId
  );

  if (existingExport) {
    existingExport.fileName = proposalExport.fileName;
    existingExport.filePath = proposalExport.filePath;
    existingExport.mimeType = proposalExport.mimeType;
    existingExport.createdAt = new Date().toISOString();
    return existingExport;
  }

  const exportRecord: ProposalExport = {
    id: `export_${demoExports.length + 1}`,
    createdAt: new Date().toISOString(),
    ...proposalExport
  };

  demoExports.push(exportRecord);

  return exportRecord;
}
