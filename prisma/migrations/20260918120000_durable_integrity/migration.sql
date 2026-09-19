-- Preflight: fail before schema changes if historical records violate the new guarantees.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "Proposal" p JOIN "ProposalSeed" s ON s.id = p."proposalSeedId" WHERE p."userId" <> s."userId")
    OR EXISTS (SELECT 1 FROM "Export" e JOIN "Proposal" p ON p.id = e."proposalId" WHERE e."userId" <> p."userId")
    OR EXISTS (SELECT 1 FROM "ProposalSeed" WHERE "sourceReference" IS NOT NULL
       GROUP BY "userId", "sourceType", "sourceReference" HAVING count(*) > 1)
  THEN RAISE EXCEPTION 'Existing owner mismatch or duplicate source reference; repair data before migration';
  END IF;
END $$;

ALTER TABLE "ProposalSeed" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "Proposal" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "ProposalSeed_userId_id_key" ON "ProposalSeed"("userId", "id");
CREATE UNIQUE INDEX "Proposal_userId_id_key" ON "Proposal"("userId", "id");
CREATE UNIQUE INDEX "ProposalSeed_owner_source_reference_key" ON "ProposalSeed"("userId", "sourceType", "sourceReference") WHERE "sourceReference" IS NOT NULL;
CREATE INDEX "ProposalSeed_userId_createdAt_idx" ON "ProposalSeed"("userId", "createdAt");
CREATE INDEX "Proposal_userId_createdAt_idx" ON "Proposal"("userId", "createdAt");
CREATE INDEX "Proposal_userId_status_createdAt_idx" ON "Proposal"("userId", "status", "createdAt");
CREATE INDEX "Export_userId_createdAt_idx" ON "Export"("userId", "createdAt");

ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_proposalSeedId_fkey";
-- PostgreSQL column-list SET NULL preserves Proposal.userId and the proposal history.
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_owner_seed_fkey"
  FOREIGN KEY ("userId", "proposalSeedId") REFERENCES "ProposalSeed"("userId", "id")
  ON DELETE SET NULL ("proposalSeedId") ON UPDATE CASCADE;
ALTER TABLE "Export" DROP CONSTRAINT "Export_proposalId_fkey";
ALTER TABLE "Export" ADD CONSTRAINT "Export_owner_proposal_fkey"
  FOREIGN KEY ("userId", "proposalId") REFERENCES "Proposal"("userId", "id")
  ON DELETE CASCADE ON UPDATE CASCADE;
