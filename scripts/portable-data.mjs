import { PrismaClient } from "@prisma/client";
import { readFile, writeFile } from "node:fs/promises";

const db = new PrismaClient();
const [command, file] = process.argv.slice(2);
if (!["export", "import"].includes(command) || !file) {
  console.error("Usage: node scripts/portable-data.mjs export|import FILE");
  process.exit(2);
}

function validRecord(record, required) {
  return (
    record &&
    typeof record === "object" &&
    required.every((key) => typeof record[key] === "string" && record[key].length > 0)
  );
}

try {
  if (command === "export") {
    const payload = await db.$transaction(
      async (tx) => ({
        schemaVersion: 2,
        exportedAt: new Date().toISOString(),
        users: await tx.user.findMany({ orderBy: { id: "asc" } }),
        briefingItems: await tx.briefingItem.findMany({ orderBy: { id: "asc" } }),
        proposalSeeds: await tx.proposalSeed.findMany({ orderBy: { id: "asc" } }),
        projects: await tx.project.findMany({ orderBy: { id: "asc" } }),
        proposals: await tx.proposal.findMany({ orderBy: { id: "asc" } }),
        tasks: await tx.task.findMany({ orderBy: { id: "asc" } }),
        proposalVersions: await tx.proposalVersion.findMany({ orderBy: { id: "asc" } }),
        auditEvents: await tx.auditEvent.findMany({ orderBy: { id: "asc" } })
      }),
      { isolationLevel: "RepeatableRead" }
    );
    await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, { flag: "wx", mode: 0o600 });
    console.log(`Exported ${payload.proposals.length} proposals to ${file}`);
  } else {
    const payload = JSON.parse(await readFile(file, "utf8"));
    if (
      payload.schemaVersion !== 2 ||
      !Number.isFinite(Date.parse(payload.exportedAt)) ||
      !Array.isArray(payload.users) ||
      !Array.isArray(payload.briefingItems) ||
      !Array.isArray(payload.proposalSeeds) ||
      !Array.isArray(payload.projects) ||
      !Array.isArray(payload.proposals) ||
      !Array.isArray(payload.tasks) ||
      !Array.isArray(payload.proposalVersions) ||
      !Array.isArray(payload.auditEvents) ||
      !payload.users.every((r) => validRecord(r, ["id", "email", "createdAt", "updatedAt"])) ||
      !payload.briefingItems.every((r) =>
        validRecord(r, ["id", "userId", "title", "summary", "source", "createdAt", "updatedAt"])
      ) ||
      !payload.proposalSeeds.every(
        (r) =>
          validRecord(r, ["id", "userId", "sourceType", "summary", "createdAt", "updatedAt"]) &&
          r.context &&
          typeof r.context === "object" &&
          !Array.isArray(r.context)
      ) ||
      !payload.projects.every((r) =>
        validRecord(r, [
          "id",
          "userId",
          "name",
          "clientName",
          "description",
          "status",
          "priority",
          "createdAt",
          "updatedAt"
        ])
      ) ||
      !payload.proposals.every(
        (r) =>
          validRecord(r, [
            "id",
            "userId",
            "title",
            "clientName",
            "status",
            "summary",
            "priceRange",
            "createdAt",
            "updatedAt"
          ]) &&
          ["scope", "deliverables", "taskBreakdown", "risks", "assumptions"].every(
            (key) => Array.isArray(r[key]) && r[key].every((item) => typeof item === "string")
          )
      ) ||
      !payload.tasks.every((r) =>
        validRecord(r, ["id", "userId", "projectId", "title", "priority", "createdAt", "updatedAt"])
      ) ||
      !payload.proposalVersions.every(
        (r) =>
          validRecord(r, ["id", "userId", "proposalId", "createdAt"]) &&
          Number.isInteger(r.version) &&
          r.snapshot &&
          typeof r.snapshot === "object" &&
          !Array.isArray(r.snapshot)
      ) ||
      !payload.auditEvents.every((r) =>
        validRecord(r, ["id", "userId", "action", "entityType", "createdAt"])
      )
    ) {
      throw new Error("Invalid or unsupported portable export");
    }
    await db.$transaction(async (tx) => {
      const counts = await Promise.all([
        tx.user.count(),
        tx.briefingItem.count(),
        tx.proposalSeed.count(),
        tx.project.count(),
        tx.proposal.count(),
        tx.task.count(),
        tx.proposalVersion.count(),
        tx.export.count(),
        tx.auditEvent.count()
      ]);
      if (counts.some(Boolean)) throw new Error("Import requires an empty database");
      for (const user of payload.users) await tx.user.create({ data: user });
      for (const item of payload.briefingItems) await tx.briefingItem.create({ data: item });
      for (const seed of payload.proposalSeeds) await tx.proposalSeed.create({ data: seed });
      for (const project of payload.projects) await tx.project.create({ data: project });
      for (const proposal of payload.proposals) await tx.proposal.create({ data: proposal });
      for (const task of payload.tasks) await tx.task.create({ data: task });
      for (const version of payload.proposalVersions) {
        await tx.proposalVersion.create({ data: version });
      }
      for (const event of payload.auditEvents) await tx.auditEvent.create({ data: event });
      // Export metadata is regenerated from proposal IDs; serialized file paths are never trusted.
      for (const proposal of payload.proposals) {
        await tx.export.create({
          data: {
            userId: proposal.userId,
            proposalId: proposal.id,
            fileName: `${proposal.id}.html`,
            filePath: `/api/proposals/${proposal.id}/export/download`,
            mimeType: "text/html"
          }
        });
      }
    });
    console.log(`Imported ${payload.proposals.length} proposals`);
  }
} finally {
  await db.$disconnect();
}
