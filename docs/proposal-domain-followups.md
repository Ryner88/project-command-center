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

Commands used:

- `npx tsc --noEmit`
- `npx tsc scripts/manual-domain-check.ts src/lib/proposal-domain.ts --outDir /tmp/manual-domain-check --module commonjs --moduleResolution node --target es2022 --esModuleInterop`
- `node /tmp/manual-domain-check/scripts/manual-domain-check.js`
- `npm test`

## Remaining Bugs

- Deployed-environment verification is still pending. This workspace does not have access to the live deployment, so the migration and smoke check with and without `DATABASE_URL` still need to be run against the real environment.
- PDF export still depends on Playwright Chromium being available in the runtime. The route now fails with an actionable message, but HTML export remains the only verified deployment-safe path.
- If the OpenAI path returns weak but technically valid domain output, the sanitizer still focuses on removing website-only wording from non-website proposals rather than grading domain quality more deeply.

## Next Steps

- Run `npm run prisma:migrate:deploy` in the deployment environment and then smoke-test proposal generation with `DATABASE_URL` enabled.
- Decide whether the no-database deployed fallback should be supported at all. Local demo mode now uses a JSON-backed store, but truly durable deployed fallback storage would need a platform store such as Postgres, KV, Blob, or equivalent.
- If PDF export is still required, replace the current browser-based path with a deployment-safe renderer or managed PDF service and keep HTML as the default escape hatch.
