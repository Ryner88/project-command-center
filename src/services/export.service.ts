import { exports } from "@/repositories/persistence.repository";
import { getDataMode, isDatabaseMode } from "@/services/data-mode.service";
import { readDemoStore, writeDemoStore } from "@/services/demo-store.service";
import { ensureCurrentUser } from "@/services/current-user.service";
import type { ProposalExport } from "@/types/export";

export async function listExportsForProposal(proposalId: string) {
  if (isDatabaseMode(await getDataMode())) {
    const user = await ensureCurrentUser();
    const records = await exports.list(user.id, proposalId);

    return records.map((item) => ({
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
  if (isDatabaseMode(await getDataMode())) {
    const user = await ensureCurrentUser();
    const exportRecord = await exports.upsert(user.id, proposalExport);

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
