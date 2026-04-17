# Proposal Domain Follow-Ups

## Manual Check Status

Validated with four manual seed examples via the local draft generator:

- Website project: website-specific deliverables remained intact, including sitemap and CMS language.
- Fintech/software project: finance-specific deliverables, controls-oriented risks, and longer timeline/pricing were produced without website-only wording.
- School project: role-aware, accessibility-aware, and school-calendar-aware wording was produced without website-only wording.
- Medical project: privacy/security language, no compliance-claim wording, and an explicit review flag were produced without website-only wording.

Commands used:

- `npx tsc --noEmit`
- `npx tsc scripts/manual-domain-check.ts src/lib/proposal-domain.ts --outDir /tmp/manual-domain-check --module commonjs --moduleResolution node --target es2022 --esModuleInterop`
- `node /tmp/manual-domain-check/scripts/manual-domain-check.js`

## Remaining Bugs

- The manual test harness is TypeScript-only. Running it directly with `node --experimental-strip-types` still runs into module-resolution friction in this repo, so the reliable path today is compile-to-temp first.
- Proposal records do not persist `projectDomain` as a dedicated database field yet. The generator uses it during creation and stores it in seed context, but existing stored proposals cannot be queried by domain without a schema update.
- If the OpenAI path returns low-quality domain output, the sanitizer only strips website-only wording from non-website proposals. It does not yet score whether the remaining language is strong enough for the selected domain.

## Next Steps

- Add a proper Prisma field for `projectDomain` on proposal seeds and proposals, then expose domain filters in the dashboard.
- Add automated tests around domain inference, medical guardrails, education wording, and non-website term sanitization.
- Add a visible review banner in the proposal detail view when medical guardrails trigger regulated-review language.
