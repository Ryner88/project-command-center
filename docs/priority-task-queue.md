# Priority Task Queue

Last updated: 2026-08-10

## Completed Work

- Proposal generation now supports domain-aware drafts for website, finance, school, medical, and custom project types.
- Manual proposal submit now persists through the generate route, local demo storage, redirect, and saved detail render.
- Demo-mode proposal persistence now survives a module reload before the detail view is rendered.
- Regression coverage exists for domain draft output, manual proposal flow, and demo persistence reload behavior.
- Production/demo mode boundaries are now explicit: database-backed proposal list, detail, seed, and export reads no longer fall through to local demo fixtures.
- Empty database-backed accounts now render empty states or not-found responses instead of seeded demo content.
- Local demo mode continues to use JSON-backed demo records when `DATABASE_URL` is unset.
- HTML export remains the verified deployment-safe export path; PDF export still depends on runtime Chromium availability.

## This Week's Validation Rule

- Do not deploy Project Command Center to either VPS this week.
- Use Vercel-oriented validation instead: `npm test`, `npm run build`, and `npm run build:vercel`.
- Treat `npm run build:vercel` as the deployment-gate build because `vercel.json` uses it as the Vercel build command.

## Next PCC Task

Priority 1: verify deployment behavior with explicit production/demo boundaries.

Why this is next:

- The production operating contract is now tracked in `docs/production-operating-contract.md`; keep it current while implementation proceeds.
- The production/demo boundary implementation is complete locally, but deployed behavior still needs confirmation against the real runtime.
- PCC needs proof that the Vercel build, Prisma migration, configured-database path, and no-database demo path match the intended boundary rules.
- Deployment verification is now the remaining gate before promoting the proposal flow as production-ready.

Acceptance criteria:

- `npm test`, `npm run build`, and `npm run build:vercel` pass from the current queue state.
- `npm run prisma:migrate:deploy` succeeds in the deployment environment with `DATABASE_URL` configured.
- Smoke testing with `DATABASE_URL` configured confirms generated proposals persist through list, detail, status, and HTML export paths without demo fallback.
- Smoke testing without `DATABASE_URL` confirms local demo mode still uses JSON-backed demo records.
- Any deployment-only failure is captured as a follow-up with the failing command, environment, and observed behavior.

## Execution Queue

1. Keep the production operating contract and architecture decisions current.
2. Run local validation: `npm test`, `npm run build`, and `npm run build:vercel`.
3. Run `npm run prisma:migrate:deploy` in the deployment environment with `DATABASE_URL` configured.
4. Smoke-test proposal generation with `DATABASE_URL` configured.
5. Verify proposal list, detail, status update, and HTML export paths use database-backed records only.
6. Verify an empty production account renders empty states or not-found responses without seeded demo content.
7. Verify local no-database demo mode still uses JSON-backed demo records.
8. Test rollback from the deployed version to the previous working release.
9. Record deployment verification results and open follow-ups for any deployment-only gaps.

## Later

- Harden persistence, migrations, backup, and restore.
- Complete end-to-end project, proposal, and task workflows.
- Establish the access and security boundary.
- Add monitoring and recovery procedures.
- Formalize CI/CD and releases.
- Finish production UX and portfolio documentation.
- Run the final production-readiness acceptance review.
