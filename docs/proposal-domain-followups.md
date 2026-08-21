# Proposal Domain Follow-Ups

## Current Status

Validated with four manual examples via the local draft generator and automated tests:

- Website project: website-specific deliverables remain intact, including sitemap and CMS language.
- Fintech/software project: finance-specific deliverables, controls-oriented risks, and finance-oriented pricing/timeline are produced without website-only wording.
- School project: role-aware, accessibility-aware, privacy-aware, and school-calendar-aware wording is produced without website-only wording.
- Medical project: privacy/security language, no compliance-claim wording, and an explicit review flag are produced without website-only wording.

Automated coverage now includes:

- Domain draft regression tests for website, finance, school, and medical samples.
- Integration coverage for manual form submit -> generate route -> demo persistence -> redirect -> saved detail render.
- Demo-mode regression coverage confirming generated proposals survive a module reload before the detail view is rendered.
- Deployment health coverage confirming production-like runtime stays on the database path when readiness fails.
- Deployment readiness coverage confirming `/api/health` reports database mode, blocked production readiness, local demo mode, and Vercel no-database failure states.

Four-project deployment verification status:

- Website project: domain generation remains covered; production `/api/health` is deployed and verifies database mode with no demo fallback.
- Finance project: domain generation remains covered; production Neon Postgres is reachable, migrations are current, and the controlled write/read/redeployment durability drill passed.
- School project: domain generation remains covered; local no-database demo mode still serves JSON-backed records only in development.
- Medical project: domain generation remains covered; production readiness remains blocked only until application rollback is tested without reversing migrations.

Commands used:

- `npx tsc --noEmit`
- `npx tsc scripts/manual-domain-check.ts src/lib/proposal-domain.ts --outDir /tmp/manual-domain-check --module commonjs --moduleResolution node --target es2022 --esModuleInterop`
- `node /tmp/manual-domain-check/scripts/manual-domain-check.js`
- `npm test`
- `npm run build`
- `npm run build:vercel`
- `npm run prisma:migrate:deploy` failed locally with Prisma `P1012` because `DATABASE_URL` was not exported in the shell.
- Vercel production verification: latest deployment `READY` at commit `03e60fe`; Neon Postgres reachable; 3 migrations found with none pending; `/api/proposals` returned `200` with a database-backed record; `/api/health` returned `404` because the new route is not deployed yet.
- `npm run start -- --hostname 127.0.0.1 --port 3100`
- `env DATABASE_URL= npm run dev -- --hostname 127.0.0.1 --port 3102`
- `curl -sS -i http://127.0.0.1:3100/api/health`
- `curl -sS -i http://127.0.0.1:3100/api/proposals`
- `curl -sS -i http://127.0.0.1:3100/proposals`
- `curl -sS -i http://127.0.0.1:3102/api/health`
- `curl -sS -i http://127.0.0.1:3102/api/proposals`
- `curl -sS https://project-command-center-alpha.vercel.app/api/health`
- `curl -sS -X POST https://project-command-center-alpha.vercel.app/api/proposals/generate ...`
- `curl -sS https://project-command-center-alpha.vercel.app/api/proposals`
- `curl -sS -I https://project-command-center-alpha.vercel.app/proposals/cmt3cs0xp0003ld04lk2q3owx`

## Remaining Bugs

- Local Prisma migration remains blocked until `DATABASE_URL` is exported to the shell. This is local-only; Vercel production successfully injects `DATABASE_URL` during `npm run build:vercel`.
- Application rollback drill is still pending because the connected Vercel toolset does not expose rollback/promote and the local Vercel CLI has no credentials. Tracked in GitHub issue #2.
- PDF export still depends on Playwright Chromium being available in the runtime. The route now fails with an actionable message, but HTML export remains the only verified deployment-safe path.
- If the OpenAI path returns weak but technically valid domain output, the sanitizer still focuses on removing website-only wording from non-website proposals rather than grading domain quality more deeply.

## Next Steps

- Complete an application rollback drill without reversing database migrations.
- Decide whether the no-database deployed fallback should be supported at all. Local demo mode now uses a JSON-backed store, but truly durable deployed fallback storage would need a platform store such as Postgres, KV, Blob, or equivalent.
- If PDF export is still required, replace the current browser-based path with a deployment-safe renderer or managed PDF service and keep HTML as the default escape hatch.

## Roadmap Items

- Tighten production/demo mode boundaries so a configured database never falls through to fixture records for list, detail, or export paths. Empty production accounts should render empty states, while local demo mode can keep seeded examples.
- Add API error normalization for proposal status updates and export actions, including invalid status payloads, missing proposals, and failed export generation, so client UI can show actionable messages instead of generic failures.
- Expand proposal flow tests to cover the database-backed path with Prisma, including manual seed creation, detail rendering, status updates, export upsert, and empty-account behavior.
- Add an authenticated-user boundary before expanding beyond demo mode. Proposal, seed, and export queries already carry `userId`; the next slice should replace the hardcoded demo user with session-derived identity and verify cross-user isolation.
- Decide the export product direction: keep HTML as the supported download format, or introduce a deployment-safe PDF service with explicit health checks and UI copy that reflects availability.
