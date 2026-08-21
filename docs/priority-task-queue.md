# Priority Task Queue

Last updated: 2026-08-21

## Completed Work

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
- The local Prisma `P1012` remains a local-shell configuration issue, not a Vercel production problem.

## This Week's Validation Rule

- Do not deploy Project Command Center to either VPS this week.
- Use Vercel-oriented validation instead: `npm test`, `npm run build`, and `npm run build:vercel`.
- Treat `npm run build:vercel` as the deployment-gate build because `vercel.json` uses it as the Vercel build command.

## Next PCC Task

Priority 1: complete the executable rollback drill.

Why this is next:

- The production operating contract is now tracked in `docs/production-operating-contract.md`; keep it current while implementation proceeds.
- The Vercel build path passes, and production no-demo fallback behavior is verified locally and in production health.
- Vercel successfully injects `DATABASE_URL`; production migrations are current.
- Production proof exists for `/api/health` and controlled write/read/redeployment durability.
- Rollback remains the only incomplete Phase 1 gate item because the connected Vercel toolset did not expose rollback/promote and the local CLI had no credentials.

Acceptance criteria:

- Commit and push the health/no-fallback changes. Done: `933902c`.
- Vercel deploys the new commit successfully. Done: `dpl_J1yXYbSQKVuDgjjkRdok8VSiiA7s`.
- Production `/api/health` reports database mode, migration readiness, and `demoFallbackAllowed: false`. Done.
- A controlled write/read/redeployment durability drill confirms new records survive process and deployment replacement. Done: proposal `cmt3cs0xp0003ld04lk2q3owx` survived redeploy `dpl_AckauQtogfP45t1aYaSiBsYv3nYM`.
- Application rollback to an eligible prior deployment is tested without reversing database migrations.
- Any deployment-only failure is captured with the failing command, environment, and observed behavior. Done: GitHub issue #2 tracks the rollback execution blocker.

## Execution Queue

1. Test rollback from the deployed version to an eligible previous release without reversing database migrations.
2. Verify proposal `cmt3cs0xp0003ld04lk2q3owx` remains readable after rollback.
3. Roll forward to the current health/no-fallback deployment.
4. Verify production `/api/health` returns database mode, migrations ready, and `demoFallbackAllowed: false`.

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

## Later

- Harden persistence, migrations, backup, and restore.
- Complete end-to-end project, proposal, and task workflows.
- Establish the access and security boundary.
- Add monitoring and recovery procedures.
- Formalize CI/CD and releases.
- Finish production UX and portfolio documentation.
- Run the final production-readiness acceptance review.
