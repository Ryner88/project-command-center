# Priority Task Queue

Last updated: 2026-09-19

## Completed Work

- Phase 2 persistence work is implemented on `phase-2-durable-persistence`: production data access uses one repository boundary, proposal and export writes are transactional, and owner consistency plus source-reference uniqueness are enforced by PostgreSQL.
- Real PostgreSQL tests cover clean migration, upgrade from the original three migrations, stable IDs, owner constraints, source-reference uniqueness, and transaction rollback.
- Portable JSON export/import and daily PostgreSQL backups are implemented. Both restore paths were tested on 2026-09-18 through app health, proposal detail, and HTML export reads.
- Phase 2 production rollout completed on 2026-09-19: backup configuration and artifacts were verified, production data was profiled and repaired, the constraint migration was applied, deployment and manual route checks passed, and a production portable export restored successfully.
- Proposal generation now supports domain-aware drafts for website, finance, school, medical, and custom project types.
- Manual proposal submit now persists through the generate route, local demo storage, redirect, and saved detail render.
- Demo-mode proposal persistence now survives a module reload before the detail view is rendered.
- Regression coverage exists for domain draft output, manual proposal flow, and demo persistence reload behavior.
- Production/demo mode boundaries are now explicit: database-backed proposal list, detail, seed, and export reads no longer fall through to local demo fixtures.
- Empty database-backed accounts now render empty states or not-found responses instead of seeded demo content.
- Local demo mode continues to use JSON-backed demo records when `DATABASE_URL` is unset.
- HTML export remains the verified deployment-safe export path; PDF export still depends on runtime Chromium availability.
- Deployment health/readiness now has a dynamic Node.js route at `/api/health`.
- Production-like runtime no longer falls back to seeded demo proposals when the configured database is unavailable.
- Local development with no `DATABASE_URL` still reports explicit demo mode and serves JSON-backed demo records.
- Vercel production verification cleared the production database blocker: Neon Postgres is reachable, migrations are current, and deployed `/api/proposals` returns a database-backed record.
- Production `/api/health` is deployed and returns database mode with migrations ready and `demoFallbackAllowed: false`.
- Controlled production proposal `cmt3cs0xp0003ld04lk2q3owx` survived a production redeployment.
- 2026-08-27 current production verification passes on deployment `dpl_DaHm2Y8xDBZPkKMqT4YTcC8yBHEm`.
- Phase 1 rollback drill is complete: rollback to `dpl_ACEGU85muZczSezt5XBK3AxGxn1o`, health verification, controlled record survival, roll-forward to `dpl_DaHm2Y8xDBZPkKMqT4YTcC8yBHEm`, and final health verification all passed.
- Phase 2 durable persistence design and analysis are documented in `docs/phase-2-durable-persistence-design.md`. The design now calls for AI generation outside database transactions, owner-aware constraints, mandatory source-reference uniqueness, and real Postgres upgrade tests.
- The local Prisma `P1012` remains a local-shell configuration issue, not a Vercel production problem.

## This Week's Validation Rule

- Do not deploy Project Command Center to either VPS this week.
- Use Vercel-oriented validation instead: `npm test`, `npm run build`, and `npm run build:vercel`.
- Treat `npm run build:vercel` as the deployment-gate build because `vercel.json` uses it as the Vercel build command.

## Next PCC Task

Priority 1: review and merge the verified Phase 2 branch.

Why this is next:

- The production operating contract is now tracked in `docs/production-operating-contract.md`; keep it current while implementation proceeds.
- The Vercel build path passes, and production no-demo fallback behavior is verified locally and in production health.
- Vercel successfully injects `DATABASE_URL`; production migrations are current.
- Production proof exists for `/api/health` and controlled write/read/redeployment durability.
- Phase 1 is closed after the rollback and roll-forward drill passed without reversing database migrations.
- Phase 2 design covers repository boundaries, transaction requirements, owner-consistency constraints, mandatory source-reference uniqueness, indexes, archive/delete policy, real Postgres migration tests, export/import shape, and backup/restore proof.

Acceptance criteria:

- Commit and push the health/no-fallback changes. Done: `933902c`.
- Vercel deploys the new commit successfully. Done: `dpl_J1yXYbSQKVuDgjjkRdok8VSiiA7s`.
- Production `/api/health` reports database mode, migration readiness, and `demoFallbackAllowed: false`. Done.
- A controlled write/read/redeployment durability drill confirms new records survive process and deployment replacement. Done: proposal `cmt3cs0xp0003ld04lk2q3owx` survived redeploy `dpl_AckauQtogfP45t1aYaSiBsYv3nYM`.
- Application rollback to an eligible prior deployment is tested without reversing database migrations. Done: rollback to `dpl_ACEGU85muZczSezt5XBK3AxGxn1o`, then roll-forward to `dpl_DaHm2Y8xDBZPkKMqT4YTcC8yBHEm`.
- Any deployment-only failure is captured with the failing command, environment, and observed behavior. Done: GitHub issue #2 tracks the rollback execution blocker.
- GitHub issue #2 is closed after successful rollback proof. Done.

## Execution Queue

1. Review and merge `phase-2-durable-persistence`.
2. Confirm the next scheduled backup completes under the daily schedule.
3. Begin the next planned product phase only after the Phase 2 merge is recorded.

## Deployment Verification Log: 2026-08-14

- Config: `vercel.json` uses `npm run build:vercel`; the wrapper passed, but skipped migrations because no shell-level `DATABASE_URL` was present.
- Migrations: `npm run prisma:migrate:deploy` failed with Prisma `P1012` because `DATABASE_URL` was not available to Prisma.
- Health checks: `/api/health` returned `503` in production-like runtime with configured but unreachable database, with `demoFallbackAllowed: false`.
- No demo fallback: production-like `/api/proposals` and `/proposals` returned `500` instead of seeded demo data when the database was unavailable.
- Local demo mode: `env DATABASE_URL= npm run dev` returned `/api/health` `200` with `mode: "demo"` and served JSON-backed proposal records.
- Local durable data drill: blocked because Docker/Postgres was unavailable locally; superseded by separate Vercel evidence that an existing database-backed proposal ID is visible from current and prior deployments.
- Rollback: blocked because no live rollback was performed.
- Production-readiness review: not ready until the new health route deploys, production health passes, a controlled write/read/redeployment drill succeeds, and rollback is exercised.

## Vercel Verification Update: 2026-08-14

- Latest production deployment: `READY`, commit `03e60fe`.
- Database: reachable Neon Postgres in production.
- Migrations: 3 migrations found; none pending.
- `/api/health`: `404` because the new health route is not deployed yet.
- `/api/proposals`: `200` with a database-backed record.
- Durability evidence: the same proposal ID is available from the current and prior deployment.
- Runtime errors: none reported during the past 7 days.
- Rollback: eligible prior deployments exist, but no live rollback was performed.
- Status change: production database blocker is cleared; Phase 1 remains open until the health/no-fallback slice deploys, production health passes, a controlled write/read/redeployment durability drill succeeds, and application rollback is tested without reversing migrations.

## Phase 1 Production Gate Update: 2026-08-21

- Implementation commit: `933902c` (`Add production health gate`).
- Redeploy trigger commit: `ac18996` (`Trigger Phase 1 redeploy verification`).
- Production health deployment: `dpl_J1yXYbSQKVuDgjjkRdok8VSiiA7s`, `READY`.
- Redeployment durability deployment: `dpl_AckauQtogfP45t1aYaSiBsYv3nYM`, `READY`.
- `/api/health`: `200`, `status: "ok"`, `mode: "database"`, `databaseConfigured: true`, `databaseMigrated: true`, `demoFallbackAllowed: false`.
- Controlled write: created proposal `cmt3cs0xp0003ld04lk2q3owx` through `/api/proposals/generate`.
- Readback: `/api/proposals` returned the controlled proposal, and `/proposals/cmt3cs0xp0003ld04lk2q3owx` returned `200`.
- Redeployment persistence: the same proposal remained readable after redeployment `dpl_AckauQtogfP45t1aYaSiBsYv3nYM`.
- Runtime errors: none reported in Vercel for the last hour after verification.
- Rollback: not executed from this environment because the connected Vercel toolset lacks rollback/promote and the local Vercel CLI has no credentials. Tracked in GitHub issue #2.

## Phase 1 Rollback Attempt: 2026-08-27

- Current production deployment: `dpl_ACEGU85muZczSezt5XBK3AxGxn1o`, `READY`, commit `e5ea5f2c1d39167870c2ef034c3d1a06360853ef` (`Record Phase 1 production verification`).
- Rollback candidate visible in Vercel: `dpl_AckauQtogfP45t1aYaSiBsYv3nYM`, `READY`, commit `ac18996d4d57922995b0ae724def47ab5f4e22b2`.
- Current health verification: `https://project-command-center-alpha.vercel.app/api/health` returned `200` with `status: "ok"`, `mode: "database"`, `databaseConfigured: true`, `databaseMigrated: true`, and `demoFallbackAllowed: false`.
- Controlled record verification: `/api/proposals` returned proposal `cmt3cs0xp0003ld04lk2q3owx`, and `/proposals/cmt3cs0xp0003ld04lk2q3owx` returned `200`.
- Rollback command attempted: `npx vercel rollback project-command-center-m9a32cejr-ryner88s-projects.vercel.app --yes`.
- Result: rollback did not execute. Vercel CLI 59.7.0 reported no existing credentials and entered device-login flow with user code `XKSB-WJPV`; the pending login was cancelled.
- Connected Vercel app limitation: deployment list/fetch and project deploy are available, but rollback/promote/alias mutation is not exposed.
- Database migration handling: no Prisma rollback, migration reset, or destructive database command was run.
- Phase 1 status at this point: blocked. This was superseded by the successful rollback drill later on 2026-08-27.

## Phase 1 Rollback Drill Passed: 2026-08-27

- Initial retry target: `npx vercel rollback project-command-center-m9a32cejr-ryner88s-projects.vercel.app --yes` authenticated successfully but failed with Vercel `402` because the target was farther back than the previous production deployment on the current plan.
- Executed rollback command: `npx vercel rollback dpl_ACEGU85muZczSezt5XBK3AxGxn1o --yes --timeout 5m`.
- Rollback result: production rolled back to `project-command-center-6w8fnl424-ryner88s-projects.vercel.app` (`dpl_ACEGU85muZczSezt5XBK3AxGxn1o`).
- Rolled-back health verification: `https://project-command-center-alpha.vercel.app/api/health` returned `200` with `status: "ok"`, `mode: "database"`, `databaseConfigured: true`, `databaseMigrated: true`, and `demoFallbackAllowed: false`.
- Rolled-back record verification: `/api/proposals` returned controlled proposal `cmt3cs0xp0003ld04lk2q3owx`, and `/proposals/cmt3cs0xp0003ld04lk2q3owx` returned `200`.
- Executed roll-forward command: `npx vercel rollback dpl_DaHm2Y8xDBZPkKMqT4YTcC8yBHEm --yes --timeout 5m`.
- Roll-forward result: production restored to `project-command-center-e0ozoi759-ryner88s-projects.vercel.app` (`dpl_DaHm2Y8xDBZPkKMqT4YTcC8yBHEm`).
- Final health verification: `/api/health` returned `200` with database mode, migrations ready, and `demoFallbackAllowed: false`.
- Final record verification: controlled proposal `cmt3cs0xp0003ld04lk2q3owx` remained readable after roll-forward.
- Database migration handling: no Prisma rollback, migration reset, or destructive database command was run.
- Phase 1 status: closed. GitHub issue #2 closed.

## Later

- Harden persistence, migrations, backup, and restore.
- Complete end-to-end project, proposal, and task workflows.
- Establish the access and security boundary.
- Add monitoring and recovery procedures.
- Formalize CI/CD and releases.
- Finish production UX and portfolio documentation.
- Run the final production-readiness acceptance review.
