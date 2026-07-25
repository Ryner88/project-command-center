# Priority Task Queue

Last updated: 2026-07-25

## Merged Proposal-Flow Work

- Proposal generation now supports domain-aware drafts for website, finance, school, medical, and custom project types.
- Manual proposal submit now persists through the generate route, local demo storage, redirect, and saved detail render.
- Demo-mode proposal persistence now survives a module reload before the detail view is rendered.
- Regression coverage exists for domain draft output, manual proposal flow, and demo persistence reload behavior.
- HTML export remains the verified deployment-safe export path; PDF export still depends on runtime Chromium availability.

## This Week's Validation Rule

- Do not deploy Project Command Center to either VPS this week.
- Use Vercel-oriented validation instead: `npm test`, `npm run build`, and `npm run build:vercel`.
- Treat `npm run build:vercel` as the deployment-gate build because `vercel.json` uses it as the Vercel build command.

## Next Feature

Priority 1: tighten production/demo mode boundaries.

Why this is next:

- The merged proposal flow now makes persistence behavior more important than draft-generation coverage alone.
- Current list, detail, seed, and export paths can still fall back to demo store data after a database lookup returns no records.
- Production accounts should render real empty states instead of seeded demo content when a database is configured and reachable.

Acceptance criteria:

- With `DATABASE_URL` configured and migrations applied, proposal list, proposal detail, proposal seed, and export reads never fall through to local demo fixtures.
- Empty production accounts show empty states or not-found responses as appropriate.
- Local demo mode continues to use JSON-backed demo records when `DATABASE_URL` is unset.
- Tests cover database-ready empty results, missing proposal detail, missing proposal seed, and export lookup behavior.

## Execution Queue

1. Add an explicit data-mode helper that distinguishes local demo mode from database-backed mode.
2. Update proposal list/detail/status services to avoid demo fallback when the database is ready.
3. Update proposal seed services to avoid demo fallback when the database is ready.
4. Update export services to avoid demo fallback when the database is ready.
5. Add focused service and/or route tests for empty database-backed behavior.
6. Run `npm test`, `npm run build`, and `npm run build:vercel`.

## Later

- Normalize API errors for proposal status updates and export actions.
- Expand Prisma-backed proposal flow tests beyond empty-state behavior.
- Replace the hardcoded demo user with session-derived identity before expanding beyond demo mode.
- Decide whether PDF should be replaced by a deployment-safe renderer or kept behind explicit availability checks.
