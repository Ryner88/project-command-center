import { PrismaClient } from "@prisma/client";
import { readFile, writeFile } from "node:fs/promises";

const db = new PrismaClient();
const [command, file] = process.argv.slice(2);
if (!["export", "import"].includes(command) || !file) {
  console.error("Usage: node scripts/portable-data.mjs export|import FILE");
  process.exit(2);
}

function validRecord(record, required) {
  return record && typeof record === "object" && required.every((key) =>
    typeof record[key] === "string" && record[key].length > 0);
}

try {
  if (command === "export") {
    const payload = await db.$transaction(async (tx) => ({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      users: await tx.user.findMany({ orderBy: { id: "asc" } }),
      proposalSeeds: await tx.proposalSeed.findMany({ orderBy: { id: "asc" } }),
      proposals: await tx.proposal.findMany({ orderBy: { id: "asc" } })
    }), { isolationLevel: "RepeatableRead" });
    await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, { flag: "wx", mode: 0o600 });
    console.log(`Exported ${payload.proposals.length} proposals to ${file}`);
  } else {
    const payload = JSON.parse(await readFile(file, "utf8"));
    if (payload.schemaVersion !== 1 || !Number.isFinite(Date.parse(payload.exportedAt)) ||
        !Array.isArray(payload.users) || !Array.isArray(payload.proposalSeeds) ||
        !Array.isArray(payload.proposals) ||
        !payload.users.every((r) => validRecord(r, ["id", "email", "createdAt", "updatedAt"])) ||
        !payload.proposalSeeds.every((r) => validRecord(r, ["id", "userId", "sourceType", "summary", "createdAt", "updatedAt"]) && r.context && typeof r.context === "object" && !Array.isArray(r.context)) ||
        !payload.proposals.every((r) => validRecord(r, ["id", "userId", "title", "clientName", "status", "summary", "priceRange", "createdAt", "updatedAt"]) &&
          ["scope", "deliverables", "taskBreakdown", "risks", "assumptions"].every((key) => Array.isArray(r[key]) && r[key].every((item) => typeof item === "string")))) {
      throw new Error("Invalid or unsupported portable export");
    }
    await db.$transaction(async (tx) => {
      const counts = await Promise.all([tx.user.count(), tx.proposalSeed.count(), tx.proposal.count(), tx.export.count()]);
      if (counts.some(Boolean)) throw new Error("Import requires an empty database");
      for (const user of payload.users) await tx.user.create({ data: user });
      for (const seed of payload.proposalSeeds) await tx.proposalSeed.create({ data: seed });
      for (const proposal of payload.proposals) await tx.proposal.create({ data: proposal });
      // Export metadata is regenerated from proposal IDs; serialized file paths are never trusted.
      for (const proposal of payload.proposals) {
        await tx.export.create({ data: {
          userId: proposal.userId, proposalId: proposal.id,
          fileName: `${proposal.id}.html`,
          filePath: `/api/proposals/${proposal.id}/export/download`,
          mimeType: "text/html"
        } });
      }
    });
    console.log(`Imported ${payload.proposals.length} proposals`);
  }
} finally {
  await db.$disconnect();
}
