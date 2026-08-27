# Phase 2 Durable Persistence And Data Integrity Design

Last updated: 2026-08-27

## Goal

Phase 2 turns PCC persistence from "verified database-backed deployment" into a durable operating model. The target is not more UI surface area. The target is to make every implemented production record safe to create, read, update, export, migrate, back up, restore, and reason about.

Phase 2 is complete when production data integrity does not depend on developer memory, fixture behavior, or manual database inspection.

## Current Analysis

Phase 1 proved that production is using Postgres, migrations are current, demo fallback is blocked in production, and the controlled proposal survives redeploy and rollback. That is deployment proof, not full data-integrity proof. The current code still has several Phase 2-level risks:

- Production services call Prisma directly in several places, which spreads ownership checks and query behavior across service modules.
- Demo and production paths live in the same services, so the mode boundary is guarded by conditionals instead of a hard adapter boundary.
- Manual proposal generation creates a proposal seed before creating the proposal; without a transaction, a failure after seed creation can leave orphaned operational data.
- Export upsert currently trusts the target `proposalId` path and should verify proposal ownership inside the same transaction that writes the export.
- JSON fields are mapped defensively to empty arrays, which is useful for UI resilience but can hide malformed persisted data.
- The schema has relationship constraints, but common owner-scoped list/status queries need explicit indexes before data volume grows.
- Archive/delete behavior is not yet modeled, so future destructive UI work would be underspecified.
- Migration testing is not yet a first-class command against a clean database.
- Backup/restore evidence does not yet prove app-level readability from a restored database.

The highest leverage Phase 2 move is the repository boundary. Once ownership checks, Prisma query shapes, and transaction participation are centralized, constraints, migration tests, export/import, and restore drills become much easier to verify without changing every service at once.

The main sequencing constraint is production compatibility. PCC already has production data, including proposal `cmt3cs0xp0003ld04lk2q3owx`; Phase 2 migrations must preserve existing IDs and records. Additive indexes and nullable archive fields are safe early migrations. Type conversions, especially string date fields to `DateTime`, should wait until data profiling and compatibility tests exist.

## Current Production Surface

Implemented durable entities:

- `User`
- `BriefingItem`
- `ProposalSeed`
- `Proposal`
- `Export`

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

## Design Principles

- Production data access goes through repository-style modules with explicit ownership checks.
- Demo storage remains isolated behind demo-only adapters and is never imported by production repositories.
- Multi-record writes use transactions.
- Delete behavior is explicit: archive when the operator may need history, hard delete only for generated or replaceable child records.
- Migrations are forward-only in production.
- Every migration must be testable against a clean database and compatible with existing production data.
- Backup and restore proof must verify application-level readability, not only database-level dump success.

## Workstreams

### 1. Repository Boundary

Create a durable data-access layer under `src/repositories/` or an equivalent local pattern:

- `user.repository.ts`
- `proposal-seed.repository.ts`
- `proposal.repository.ts`
- `export.repository.ts`
- `briefing.repository.ts`

The services should orchestrate behavior; repositories should own Prisma query shapes, ownership filters, transaction participation, and record mapping.

Acceptance criteria:

- Production services no longer call `prisma.*` directly except through repositories or a shared transaction helper.
- Repository methods require `userId` or a transaction context where ownership is relevant.
- Demo-mode reads and writes remain outside production repositories.

### 2. Transaction Boundaries

Make these operations atomic:

- Manual proposal generation: create seed and proposal in one transaction.
- Seed-backed proposal generation: verify seed ownership and create proposal in one transaction.
- Proposal export creation: verify proposal ownership and upsert export in one transaction.
- Future import/restore writes: create parent and child records in one transaction.

Acceptance criteria:

- A failed proposal create cannot leave an orphan manual seed.
- A failed export upsert cannot create an export for another user's proposal.
- Tests cover transaction rollback behavior with mocked Prisma transactions or a test database.

### 3. Constraints And Indexes

Add forward migrations for production query integrity and performance.

Recommended constraints:

- `Proposal`: index `(userId, createdAt)`.
- `Proposal`: index `(userId, status, createdAt)`.
- `ProposalSeed`: index `(userId, createdAt)`.
- `ProposalSeed`: unique or indexed `(userId, sourceType, sourceReference)` for non-null source references, if supported by Prisma/Postgres migration SQL.
- `BriefingItem`: index `(userId, createdAt)`.
- `Export`: keep unique `proposalId`; add index `(userId, createdAt)`.

Recommended field hardening:

- Add archive fields to user-owned records before adding destructive UI behavior:
  - `archivedAt DateTime?`
  - `deletedAt DateTime?` only if soft-delete semantics are needed separately from archive.
- Prefer `DateTime` for `Proposal.startDate` and `Proposal.dueDate` in a future compatibility migration. Current string dates are acceptable only while validation is centralized and tested.
- Preserve `onDelete: SetNull` from `Proposal` to `ProposalSeed` so proposal history survives seed cleanup.
- Preserve `onDelete: Cascade` from `Proposal` to `Export` because exports are generated child records.

Acceptance criteria:

- Migrations are forward-only and reviewed for existing production compatibility.
- Common list/detail/export queries have explicit indexes.
- Archive/delete semantics are documented before any destructive mutation is exposed.

### 4. Validation And Mapping

Centralize persistence validation at service boundaries:

- Validate user-facing input with schemas before repository calls.
- Validate JSON columns when mapping records out of Prisma.
- Treat malformed persisted JSON as a data integrity error in production health or diagnostics, not as silent empty arrays for critical fields.
- Keep export HTML escaping in place and add tests around stored content with special characters.

Acceptance criteria:

- Proposal JSON fields have tested mapping behavior for valid, empty, and malformed data.
- Invalid status updates, missing records, and cross-user access return controlled application errors.
- Export generation remains safe for stored user content.

### 5. Migration Testing

Add a repeatable migration test path that does not depend on production:

- Run migrations against a clean disposable Postgres database.
- Verify Prisma Client can query every model.
- Seed a minimal user, proposal seed, proposal, and export.
- Run the app-level health check against that database.

Preferred command shape:

```bash
npm run test:migrations
```

The command can wrap Docker Postgres locally or use a temporary hosted test database if Docker is unavailable.

Acceptance criteria:

- Clean database migration succeeds.
- Minimal production-shaped data can be inserted and read.
- The test fails if migrations are pending, broken, or incompatible with the Prisma schema.

### 6. Export And Import

Design a portable JSON export format for owner-controlled backup and restore drills:

- Include schema version.
- Include exported timestamp.
- Include users, proposal seeds, proposals, exports metadata, and briefing items.
- Exclude secrets and deployment-specific runtime configuration.
- Preserve stable IDs during restore into an empty database.
- Use transactions for restore.

Acceptance criteria:

- Export produces a deterministic, documented JSON shape.
- Import into a clean database preserves proposal IDs, including controlled records used for verification.
- Import validates schema version and rejects malformed payloads.

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
2. Add transaction helper and make proposal generation/export writes atomic.
3. Add focused repository and transaction tests.
4. Add index/archive migration and migration tests.
5. Add export/import format and service tests.
6. Run backup/restore drill in non-production.
7. Update the production operating contract with Phase 2 evidence and close Phase 2.

## Exit Gate

Phase 2 closes only when all of these are true:

- Every implemented production entity is durable and accessed through the repository boundary.
- Multi-record writes are transactional.
- Invalid or partially written state is prevented by constraints, validation, or transactions.
- A fresh database migrates successfully from zero.
- A backup can be restored into a clean environment and verified through app health plus record-level reads.
- Documentation identifies what is archived, what is hard-deleted, and why.
