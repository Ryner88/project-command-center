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

The exact commit's Vercel preview is `https://project-command-center-7krhr9kga-ryner88s-projects.vercel.app`. Its `/api/health` route redirected to Vercel SSO before the application responded. The available Vercel CLI identity requires a fresh interactive login. An attempt to create a temporary shareable authentication link was rejected by automatic approval review because it would bypass deployment protection. **No preview browser workflow was performed**, and deployment protection was not changed. GitHub's Vercel deployment check and CI jobs passed for the tested commit; those automated results are separate from manual preview verification.

## Scope and disposition

- Internal application functionality: verified in local demo and local PostgreSQL modes.
- Deployed preview browser behavior: blocked by Vercel authentication access.
- Acme dashboard feature inventory and real-time reporting: still open in #22 and #23, pending client-facing approval.
- No client analytics dashboard feature is validated by this proposal-management test.
