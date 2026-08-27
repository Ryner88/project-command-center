# Phase 2 Durable Persistence And Data Integrity Design

Last updated: 2026-08-27

## Goal

Phase 2 turns PCC persistence from "verified database-backed deployment" into a durable operating model. The target is not more UI surface area. The target is to make every implemented production record safe to create, read, update, export, migrate, back up, restore, and reason about.

Phase 2 is complete when production data integrity does not depend on developer memory, fixture behavior, or manual database inspection.

## Current Analysis

Phase 1 proved that production is using Postgres, migrations are current, demo fallback is blocked in production, and the controlled proposal survives redeploy and rollback. That is deployment proof, not full data-integrity proof. The current code still has several Phase 2-level risks:

- Production services call Prisma directly in several places, which spreads ownership checks and query behavior across service modules.
- Demo and production paths live in the same services, so the mode boundary is guarded by conditionals instead of a hard adapter boundary.
- Manual proposal generation currently creates a proposal seed before AI generation and before proposal persistence. The Phase 2 implementation must normalize without writing, run AI generation outside any database transaction, then open one short transaction to create the manual seed and proposal together.
- Seed-backed proposal generation must re-check seed ownership inside the final transaction before creating the proposal.
- Export upsert currently trusts the target `proposalId` path and must verify proposal ownership inside the same transaction that writes the export.
- The schema currently allows owner mismatch between related records, such as a proposal pointing at another user's seed or an export pointing at another user's proposal. Phase 2 must enforce owner consistency at the database level, not only in services.
- The briefing-seed flow uses check-then-create for `sourceReference`; without a database uniqueness guarantee, concurrent requests can create duplicate seeds for the same source.
- JSON fields are mapped defensively to empty arrays, which is useful for UI resilience but can hide malformed persisted data. Integrity scanning belongs in a dedicated command or diagnostic endpoint, not in `/api/health`.
- The schema has relationship constraints, but common owner-scoped list/status queries need explicit indexes before data volume grows.
- Archive/delete behavior is not yet modeled, so future destructive UI work would be underspecified.
- Migration testing is not yet a first-class command against real Postgres for clean installs, upgrades from the current three-migration schema, rollback behavior, and constraint rejection.
- Backup/restore evidence does not yet prove app-level readability from a restored database.

The highest leverage Phase 2 move is the repository boundary. Once ownership checks, Prisma query shapes, and transaction participation are centralized, constraints, migration tests, export/import, and restore drills become much easier to verify without changing every service at once.

The main sequencing constraint is production compatibility. PCC already has production data, including proposal `cmt3cs0xp0003ld04lk2q3owx`; Phase 2 migrations must preserve existing IDs and records. Additive indexes and nullable archive fields are safe early migrations. Type conversions, especially string date fields to `DateTime`, should wait until data profiling and compatibility tests exist.

## Current Production Surface

Implemented durable entities:

- `User`
- `ProposalSeed`
- `Proposal`
- `Export`

Dormant schema entities:

- `BriefingItem` is modeled in Prisma but current briefing output is derived from integrations and mock data in `src/services/briefing.service.ts`. Phase 2 should either add explicit briefing persistence or keep `BriefingItem` dormant and exclude it from repository and backup scope until it is used by production workflows.

Implemented production workflows:

- List proposal seeds and proposals.
- Create proposal seeds.
- Generate proposals from manual input or a proposal seed.
- Read proposal detail pages.
- Update proposal status.
- Create and retrieve proposal exports.
- Run Vercel deployment health checks against database configuration and migrations.

Known non-goals for Phase 2:

- Do not start the Phase 3 project/task UI before persistence boundaries are hardened.
- Do not add public authentication scope here unless a persistence decision requires ownership fields to be prepared for it.
- Do not reverse any production migration as part of validation.
- Do not hold database transactions open while calling OpenAI or any other external AI/provider API.

## Design Principles

- Production data access goes through repository-style modules with explicit ownership checks.
- Demo storage remains isolated behind demo-only adapters and is never imported by production repositories.
- Multi-record writes use short database transactions, and external API calls happen before or after those transactions.
- Delete behavior is explicit: archive when the operator may need history, hard delete only for generated or replaceable child records.
- Migrations are forward-only in production.
- Every migration must be testable against a clean database and compatible with existing production-shaped data.
- Backup and restore proof must verify application-level readability, not only database-level dump success.

## Workstreams

### 1. Repository Boundary

Create a durable data-access layer under `src/repositories/` or an equivalent local pattern:

- `user.repository.ts`
- `proposal-seed.repository.ts`
- `proposal.repository.ts`
- `export.repository.ts`
- `briefing.repository.ts` only if Phase 2 adds briefing persistence; otherwise keep briefing persistence explicitly dormant.

The services should orchestrate behavior; repositories should own Prisma query shapes, ownership filters, transaction participation, and record mapping. Repository write methods must accept a `Prisma.TransactionClient` or a shared transaction-scoped client type so services can compose atomic operations without repositories opening nested transactions.

Acceptance criteria:

- Production services no longer call `prisma.*` directly except through repositories or a shared transaction helper.
- Repository methods require `userId` or a transaction context where ownership is relevant.
- Repository methods that participate in atomic workflows accept a transaction client.
- Demo-mode reads and writes remain outside production repositories.

### 2. Transaction Boundaries

Make these operations atomic:

- Manual proposal generation:
  - Normalize input without writing.
  - Run AI draft generation outside any database transaction.
  - Open one short transaction.
  - Create the manual seed and proposal together.
- Seed-backed proposal generation:
  - Normalize input and run AI draft generation outside any database transaction.
  - Open one short transaction.
  - Re-check seed ownership inside the transaction.
  - Create the proposal inside that same transaction.
- Proposal export creation: verify proposal ownership and upsert export in one transaction.
- Future import/restore writes: create parent and child records in one transaction.

Acceptance criteria:

- A failed proposal create cannot leave an orphan manual seed.
- A failed export upsert cannot create an export for another user's proposal.
- OpenAI or fallback AI generation is never executed inside an open database transaction.
- Real Postgres tests prove transaction rollback behavior.

### 3. Constraints And Indexes

Add forward migrations for production query integrity and performance.

Required owner-consistency constraints:

- Enforce that `Proposal(userId, proposalSeedId)` can only reference a `ProposalSeed` owned by the same user when `proposalSeedId` is non-null.
- Enforce that exports cannot point at another user's proposal. Preferred design: remove redundant `Export.userId` and derive ownership through `Proposal`; alternative design: keep `Export.userId` and add a composite owner-aware foreign key to `Proposal(userId, id)`.
- Add database-level tests proving cross-owner proposal-seed and export-proposal relationships are rejected.

Required source-reference uniqueness:

- Add a partial unique Postgres index on `ProposalSeed(userId, sourceType, sourceReference)` where `sourceReference IS NOT NULL`.
- Profile existing production data for duplicates before applying the migration.
- Handle concurrent create conflicts deterministically by returning the existing seed or retrying a bounded lookup after unique-constraint failure.

Required query indexes:

- `Proposal`: index `(userId, createdAt)`.
- `Proposal`: index `(userId, status, createdAt)`.
- `ProposalSeed`: index `(userId, createdAt)`.
- `BriefingItem`: index `(userId, createdAt)` only if briefing persistence becomes active.
- `Export`: keep unique `proposalId`; add index `(proposalId)` implicitly through uniqueness, and add owner/time indexes only if `Export.userId` remains.

Archive policy before adding fields:

- `Proposal`: archive with `archivedAt`; archived proposals should remain readable by direct detail route and hidden from default dashboard lists unless an archived filter is selected later.
- `ProposalSeed`: archive with `archivedAt`; archived seeds should not appear in default seed lists. Unique `sourceReference` constraints still apply to archived seeds unless Phase 2 explicitly implements source-reference reuse.
- `Export`: hard-delete or regenerate; do not archive export rows because `filePath` is a route-derived pointer, not a durable artifact.
- `User`: do not hard-delete during Phase 2.
- `BriefingItem`: no archive policy until briefing persistence is activated.

Recommended field hardening:

- Add `archivedAt DateTime?` only to records covered by the table-specific archive policy.
- Add `deletedAt DateTime?` only if Phase 2 separately adopts soft-delete semantics; do not add it by default.
- Prefer `DateTime` for `Proposal.startDate` and `Proposal.dueDate` in a future compatibility migration. Current string dates are acceptable only while validation is centralized and tested.
- Preserve `onDelete: SetNull` from `Proposal` to `ProposalSeed` so proposal history survives seed cleanup.
- Preserve `onDelete: Cascade` from `Proposal` to `Export` because exports are generated child records.

Acceptance criteria:

- Migrations are forward-only and reviewed for existing production compatibility.
- Owner consistency is enforced by database constraints, not only repository code.
- Source-reference uniqueness is mandatory for non-null references.
- Common list/detail/export queries have explicit indexes.
- Archive/delete semantics are documented before any destructive mutation is exposed.

### 4. Validation And Mapping

Centralize persistence validation at service boundaries:

- Validate user-facing input with schemas before repository calls.
- Validate JSON columns when mapping records out of Prisma.
- Treat malformed persisted JSON as a data integrity error in a dedicated integrity-verification command or diagnostic endpoint, not as silent empty arrays for critical fields.
- Keep comprehensive JSON integrity scans out of `/api/health`; health should stay fast and focused on deployment readiness.
- Keep export HTML escaping in place and add tests around stored content with special characters.

Acceptance criteria:

- Proposal JSON fields have tested mapping behavior for valid, empty, and malformed data.
- Invalid status updates, missing records, and cross-user access return controlled application errors.
- Export generation remains safe for stored user content.

### 5. Migration Testing

Add a repeatable migration test path that does not depend on production and uses real Postgres:

- Run migrations against a clean disposable Postgres database.
- Build an upgrade fixture from the current three-migration schema with production-shaped records, then apply new Phase 2 migrations.
- Verify Prisma Client can query every model.
- Seed a minimal user, proposal seed, proposal, and export.
- Run the app-level health check against that database.
- Prove transaction rollback behavior with a real failed transaction.
- Prove stable ID and relationship preservation through upgrade.
- Prove owner-aware foreign keys and source-reference uniqueness reject invalid writes at the database level.

Preferred command shape:

```bash
npm run test:migrations
```

The command can wrap Docker Postgres locally or use a temporary hosted test database if Docker is unavailable. Mocked Prisma transactions are acceptable for narrow service orchestration tests, but they do not satisfy Phase 2 migration or integrity proof.

Acceptance criteria:

- Clean database migration succeeds.
- Upgrade from the current three-migration schema succeeds with production-shaped records.
- Minimal production-shaped data can be inserted and read.
- Failed transactions roll back fully in real Postgres.
- Cross-owner relationships and duplicate non-null source references are rejected by the database.
- The test fails if migrations are pending, broken, or incompatible with the Prisma schema.

### 6. Export And Import

Design a portable JSON export format for owner-controlled backup and restore drills:

- Include schema version.
- Include exported timestamp.
- Include users, proposal seeds, and proposals.
- Include briefing items only if Phase 2 activates briefing persistence.
- Omit export rows by default because current `Export.filePath` stores an API route, not a portable artifact. If export metadata is included, recompute `filePath` on import from the restored proposal ID instead of trusting serialized paths.
- Exclude secrets and deployment-specific runtime configuration.
- Preserve stable IDs during restore into an empty database.
- Use transactions for restore.

Acceptance criteria:

- Export produces a deterministic, documented JSON shape.
- Import into a clean database preserves proposal IDs, including controlled records used for verification.
- Import validates schema version and rejects malformed payloads.
- Restored export paths are regenerated, not copied blindly from source data.

### 7. Backup And Restore

Define two backup layers:

- Database backup: Neon/Vercel Postgres provider-native backup or dump.
- Application export: PCC JSON export for portable owner-controlled recovery.

Restore drill:

1. Create backup from current production-shaped data.
2. Restore into a clean non-production database.
3. Run migrations if needed.
4. Point a preview/local app at the restored database.
5. Verify `/api/health`.
6. Verify a known proposal detail page and export path.

Acceptance criteria:

- Backup cadence is documented.
- Restore is tested without touching production data.
- Restore evidence records source backup, target environment, commands, health result, and record IDs verified.

## Implementation Order

1. Create repository boundary and move Prisma calls behind it.
2. Refactor proposal generation so input normalization and AI generation happen before writes; create manual seeds and proposals in one short transaction.
3. Add transaction helper and make seed-backed generation/export writes atomic with ownership re-checks inside transactions.
4. Add owner-aware database constraints, mandatory partial uniqueness for source references, and query indexes.
5. Add archive fields only after applying the table-specific archive policy.
6. Add real Postgres migration, upgrade, transaction rollback, stable-ID, and constraint rejection tests.
7. Add export/import format and service tests.
8. Run backup/restore drill in non-production.
9. Update the production operating contract with Phase 2 evidence and close Phase 2.

## Exit Gate

Phase 2 closes only when all of these are true:

- Every implemented production entity is durable and accessed through the repository boundary.
- Multi-record writes are transactional, and external AI/provider calls happen outside database transactions.
- Invalid or partially written state is prevented by constraints, validation, or transactions.
- Owner consistency and non-null source-reference uniqueness are enforced by the database and covered by real Postgres tests.
- A fresh database migrates successfully from zero.
- Upgrade from the current three-migration schema succeeds with production-shaped records and preserves stable IDs and relationships.
- A backup can be restored into a clean environment and verified through app health plus record-level reads.
- Documentation identifies what is archived, what is hard-deleted, and why.
