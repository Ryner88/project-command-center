# PR #36 proposal workflow manual verification

- Date: 2026-10-21
- Reviewer: Codex
- Branch: `issue-22-proposal-mvp-scope`
- Tested commit: `8922a4edcc76c9bc7ee729c02419b050c0c73b18`
- Browser: headless Chromium through Playwright on Linux
- Test data: synthetic client and proposal records only
- Environments: isolated local demo store; separate disposable PostgreSQL 16 database

This record verifies Project Command Center's **internal proposal workflow**. It does not verify Acme's AI-powered analytics dashboard deliverable or resolve the feature and reporting decisions in [#22](https://github.com/Ryner88/project-command-center/issues/22) and [#23](https://github.com/Ryner88/project-command-center/issues/23).

## Isolated local demo run

The application ran with `DATABASE_URL` and `OPENAI_API_KEY` unset, a test-only owner password, and `DEMO_STORAGE_ROOT` pointing to a disposable `/tmp` directory. `/api/health` returned HTTP 200 with `mode: "demo"` and `databaseConfigured: false`.

| Check                             | Result | Observed evidence                                                                                                                          |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Anonymous access                  | Pass   | `/proposals` redirected to `/login?next=%2Fproposals`.                                                                                     |
| Owner sign-in through `localhost` | Pass   | Login API returned 200 and the empty dashboard showed `Showing 0 of 0 proposals`.                                                          |
| Required input validation         | Pass   | Submitting an empty generation form displayed `Enter proposal notes or a working summary.`                                                 |
| Proposal creation                 | Pass   | Manual input created `proposal_1`; the detail page showed the saved title and scope, deliverables, task breakdown, risks, and assumptions. |
| Detail after reload               | Pass   | `Manual Test Dashboard Proposal` remained on the saved detail page.                                                                        |
| Status update                     | Pass   | The status remained `IN_REVIEW` after a dashboard reload.                                                                                  |
| Status and domain filters         | Pass   | Filtering for `IN_REVIEW` and the custom `OTHER` domain showed `Showing 1 of 1 proposals`; the filters could be cleared.                   |
| HTML export                       | Pass   | Download returned HTTP 200, `text/html`, and included the saved title and synthetic client name.                                           |
| Browser diagnostics               | Pass   | No page errors or failed application responses were observed in the completed run.                                                         |

When accessed through `127.0.0.1`, the local sign-in POST returned 403 because its `Origin` did not match the application's expected `localhost` origin. The same form passed through `localhost`. Use the configured application origin consistently for future local tests. This observation does not establish a production authentication defect or justify relaxing the origin check.

## Disposable PostgreSQL run

A separate PostgreSQL 16 cluster was initialized under `/tmp` and bound to loopback port 5433. A new `pcc_manual_test_20261021` database received all six repository migrations. The application ran against that database with AI generation disabled and test-only owner credentials. `/api/health` returned HTTP 200 with `mode: "database"`, `databaseConfigured: true`, and `databaseMigrated: true`.

| Check                            | Result | Observed evidence                                                                                                 |
| -------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| Owner sign-in and empty database | Pass   | Login API returned 200; dashboard showed `Showing 0 of 0 proposals`.                                              |
| Browser creation                 | Pass   | Generation returned 201 and opened saved proposal `cmvi8jgdw0003to00jn39l0l7`.                                    |
| Browser reload and status        | Pass   | Detail survived reload; status update returned 200 and remained `IN_REVIEW` after reload.                         |
| HTML export                      | Pass   | Export and download returned 200; downloaded HTML contained the saved title and client.                           |
| Direct database read             | Pass   | `Proposal` contained the same ID, title, client, and `IN_REVIEW` status; `Export` contained one related row.      |
| App restart                      | Pass   | After restarting Next.js against the same database, the detail page and saved HTML export were still retrievable. |
| Browser diagnostics              | Pass   | No page errors or failed application responses were observed.                                                     |

The local app and disposable database were stopped after verification. These checks demonstrate database-backed persistence in a local test environment; they do not prove production readiness or backup/restore behavior.

## Deployed preview

The preview for evidence commit `aa255c39baa68d3091f61efa31a944e17c458398` is deployment `dpl_7tuS7Df75nDFrf8R2szcXsJpJcSy` at `https://project-command-center-jwz3a6h0i-ryner88s-projects.vercel.app`. It is in Vercel's `READY` build state. An authenticated `npx vercel curl /api/health --deployment <preview URL>` reached the application and returned `status: "error"`, `mode: "unavailable"`, `databaseConfigured: false`, `databaseMigrated: false`, and `demoFallbackAllowed: false`.

`npx vercel env ls preview` listed no `DATABASE_URL` for the linked project. It also listed no `APP_ACCESS_PASSWORD` or `SESSION_SECRET`, which the repository's Preview environment example requires for owner sign-in. The missing Preview database variable accounts for `databaseConfigured: false`; no production database setting was inspected or changed. A separate Preview PostgreSQL database, required variables, migrations, and a fresh deployment are needed before a database-backed preview browser test can run. **No deployed preview browser workflow was performed**, and deployment protection was not changed. GitHub's deployment and CI checks are separate from application readiness and manual preview verification.

### Fresh Preview deployment and browser observations

The later deployment `dpl_3rGVCBPFixAewUvDdNcocvVgmC9w` at `https://project-command-center-bh8acyatf-ryner88s-projects.vercel.app` was built from `ac9a0d8` for Preview. It is Vercel `READY` and remains protected by Vercel Authentication. Authenticated CLI access to `/api/health` returned `status: "ok"`, `mode: "database"`, `databaseConfigured: true`, `databaseMigrated: true`, and `demoFallbackAllowed: false`. The PR's quality, migrations, build, and end-to-end CI checks passed.

The owner reported successful sign-in through the new protected Preview URL. The owner also reported the following findings while exercising the proposal workflow; these are user observations, not independently observed automated browser results:

| Observation                                           | Result on `ac9a0d8`                                                                                                                                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner sign-in                                         | Passed, per owner report.                                                                                                                                                                |
| HTML export action                                    | Opened the HTML document in a browser tab rather than downloading it automatically.                                                                                                      |
| Filtered empty state                                  | Incorrectly offered “Create the first proposal” when saved proposals existed but none matched the filters.                                                                               |
| Proposal with start `2026-11-01` and due `2027-06-15` | Dashboard showed a generic `4–6 weeks` timeline and tasks ended at Week 6, while export showed dated milestones across the longer window. The selected dates are 226 elapsed days apart. |

Proposal creation, saved detail after reload, status persistence, filter results, export content, and browser diagnostics on this protected Preview have not yet been reported as passing. Do not treat this deployment as a complete end-to-end pass.

The working branch now includes fixes for the HTML download behavior, filtered empty state, and date-authoritative proposal scheduling. Those changes were made **after** `ac9a0d8` and require a new deployment and browser retest before the Preview findings can be closed. Existing saved proposals are not migrated or rewritten; views and exports derive a consistent schedule from their saved dates, and an explicit edit can save the normalized schedule.

## Scope and disposition

- Internal application functionality: verified in local demo and local PostgreSQL modes.
- Deployed preview browser behavior: owner sign-in reported as passed; other workflow results are unverified and three issues were observed.
- Acme dashboard feature inventory and real-time reporting: still open in #22 and #23, pending client-facing approval.
- No client analytics dashboard feature is validated by this proposal-management test.
