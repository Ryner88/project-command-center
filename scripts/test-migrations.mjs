import { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const url = process.env.TEST_DATABASE_URL;
if (!url || !/phase2|test/.test(new URL(url).pathname)) {
  throw new Error("TEST_DATABASE_URL must target a disposable database named with test or phase2");
}
const db = new PrismaClient({ datasources: { db: { url } } });
const prisma = path.resolve("node_modules/.bin/prisma");
const run = (args, extra = {}) => execFileSync(prisma, args, {
  stdio: "inherit", env: { ...process.env, DATABASE_URL: url, ...extra }
});
const root = await mkdtemp(path.join(tmpdir(), "pcc-migration-test-"));
try {
  execFileSync("psql", [url, "-v", "ON_ERROR_STOP=1", "-c", "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"], { stdio: "ignore" });
  // The caller supplies an empty disposable database. The old schema is deployed first.
  await mkdir(path.join(root, "migrations"));
  await cp("prisma/schema.prisma", path.join(root, "schema.prisma"));
  await cp("prisma/migrations/migration_lock.toml", path.join(root, "migrations/migration_lock.toml"));
  for (const name of ["20260414220000_init", "20260420120000_add_proposal_domains", "20260420133000_add_proposal_start_date"]) {
    await cp(path.join("prisma/migrations", name), path.join(root, "migrations", name), { recursive: true });
  }
  run(["migrate", "deploy", "--schema", path.join(root, "schema.prisma")]);
  execFileSync("psql", [url, "-v", "ON_ERROR_STOP=1", "-c", `
    INSERT INTO "User" (id,email,"updatedAt") VALUES ('demo-user','upgrade@example.test',now());
    INSERT INTO "ProposalSeed" (id,"userId","sourceType","sourceReference",summary,context,"updatedAt")
      VALUES ('upgrade_seed','demo-user','EMAIL','source_1','Upgrade fixture','{}',now());
    INSERT INTO "Proposal" (id,"userId","proposalSeedId",title,"clientName",summary,scope,deliverables,"taskBreakdown",risks,assumptions,"priceRange","updatedAt")
      VALUES ('upgrade_proposal','demo-user','upgrade_seed','Upgrade proposal','Client','Upgrade fixture','[]','[]','[]','[]','[]','$1',now());
    INSERT INTO "Export" (id,"userId","proposalId","fileName","filePath","mimeType","updatedAt")
      VALUES ('upgrade_export','demo-user','upgrade_proposal','proposal.html','/api/proposals/upgrade_proposal/export/download','text/html',now());
  `], { stdio: "inherit" });
  const user = { id: "demo-user" };
  const seed = { id: "upgrade_seed" };
  const proposalData = {
    id: "upgrade_proposal", userId: user.id, proposalSeedId: seed.id,
    title: "Upgrade proposal", clientName: "Client", summary: "Upgrade fixture",
    scope: [], deliverables: [], taskBreakdown: [], risks: [], assumptions: [], priceRange: "$1",
  };
  run(["migrate", "deploy"]);
  run(["migrate", "status"]);
  assert.equal((await db.proposal.findUniqueOrThrow({ where: { id: proposalData.id } })).proposalSeedId, seed.id);
  assert.equal((await db.export.findUniqueOrThrow({ where: { proposalId: proposalData.id } })).id, "upgrade_export");
  const other = await db.user.create({ data: { id: "other_user", email: "other@example.test" } });
  await assert.rejects(db.proposal.create({ data: { ...proposalData, id: "bad_owner", userId: other.id } }));
  await assert.rejects(db.export.create({ data: {
    userId: other.id, proposalId: proposalData.id, fileName: "bad", filePath: "bad", mimeType: "text/html"
  } }));
  await assert.rejects(db.proposalSeed.create({ data: {
    userId: user.id, sourceType: "EMAIL", sourceReference: "source_1", summary: "duplicate", context: {}
  } }));
  await assert.rejects(db.$transaction(async (tx) => {
    await tx.proposalSeed.create({ data: {
      id: "rolled_back_seed", userId: user.id, sourceType: "MANUAL", summary: "rollback", context: {}
    } });
    throw new Error("deliberate rollback");
  }));
  assert.equal(await db.proposalSeed.count({ where: { id: "rolled_back_seed" } }), 0);
  // Exercise every model through the generated client.
  await Promise.all([db.user.count(), db.briefingItem.count(), db.proposalSeed.count(), db.proposal.count(), db.export.count()]);
  console.log("Upgrade, stable IDs, owner constraints, uniqueness, and rollback passed");
} finally {
  await db.$disconnect();
  await rm(root, { recursive: true, force: true });
}
