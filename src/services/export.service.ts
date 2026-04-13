import type { ProposalExport } from "@/types/export";

const demoExports: ProposalExport[] = [];

export async function listExportsForProposal(proposalId: string) {
  return demoExports.filter((item) => item.proposalId === proposalId);
}

export async function upsertProposalExport(
  proposalExport: Omit<ProposalExport, "id" | "createdAt">
) {
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
