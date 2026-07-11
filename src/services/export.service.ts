import { prisma } from "@/lib/prisma";
import { readDemoStore, writeDemoStore } from "@/services/demo-store.service";
import {
  ensureCurrentUser,
  isDatabaseReady
} from "@/services/current-user.service";
import type { ProposalExport } from "@/types/export";

export async function listExportsForProposal(proposalId: string) {
  if (await isDatabaseReady()) {
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

  const store = await readDemoStore();
  return store.exports.filter((item) => item.proposalId === proposalId);
}

export async function upsertProposalExport(
  proposalExport: Omit<ProposalExport, "id" | "createdAt">
) {
  if (await isDatabaseReady()) {
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

  const store = await readDemoStore();
  const existingExport = store.exports.find(
    (item) => item.proposalId === proposalExport.proposalId
  );

  if (existingExport) {
    existingExport.fileName = proposalExport.fileName;
    existingExport.filePath = proposalExport.filePath;
    existingExport.mimeType = proposalExport.mimeType;
    existingExport.createdAt = new Date().toISOString();
    await writeDemoStore(store);
    return existingExport;
  }

  const exportRecord: ProposalExport = {
    id: `export_${store.exports.length + 1}`,
    createdAt: new Date().toISOString(),
    ...proposalExport
  };

  store.exports.push(exportRecord);
  await writeDemoStore(store);

  return exportRecord;
}
