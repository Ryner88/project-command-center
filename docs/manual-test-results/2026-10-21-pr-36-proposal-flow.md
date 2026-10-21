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

The branch later received fixes for the HTML download behavior, filtered empty state, and date-authoritative proposal scheduling in `76ca61f`. The new deployment and retest evidence are described below. Existing saved proposals are not migrated or rewritten; views and exports derive a consistent schedule from their saved dates, and an explicit edit can save the normalized schedule.

### Retest evidence for the schedule fix

Commit `76ca61f` deployed to protected Preview as `dpl_7e1vDNQU3SFYTnL4GiKESStWTQjy` at `https://project-command-center-a77vm1id9-ryner88s-projects.vercel.app`. Vercel reported `READY`, authenticated `/api/health` returned database mode with migrations present and demo fallback disabled, and the PR's quality, migrations, build, and end-to-end CI checks passed.

The owner identified the matching HTML and PDF files in local Windows Downloads. Both were read directly: HTML content was parsed as a document and the six-page PDF was extracted with `pdftotext`. The HTML is 23,950 bytes (SHA-256 `fde0eb8b2857b9c5a2873fa846b77553856fc7ee824dc42462a6418762dba396`); the PDF is 95,286 bytes (SHA-256 `ed8f704cd5c8e5044c61eaac33e6845445ba1970385e839c37b8ae1ee39d9456`). No client-named export is committed to this repository.

| Export check        | Direct inspection result                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| HTML and PDF files  | Present and readable.                                                          |
| Start and deadline  | Both show October 23, 2026 and February 4, 2027.                               |
| Calculated duration | Both show 14 weeks, 6 days, matching the 104 elapsed days between those dates. |
| Milestones          | Both show four contiguous dated phases spanning the selected window.           |
| Content consistency | All three scope items, all three deliverables, price, and phase titles agree.  |

| Phase                  | Dates in both exports              |
| ---------------------- | ---------------------------------- |
| Discovery and planning | October 23–November 6, 2026        |
| Execution and reviews  | November 7–December 21, 2026       |
| QA and final revisions | December 22, 2026–January 20, 2027 |
| Handoff and closeout   | January 21–February 4, 2027        |

The dates were checked arithmetically: the endpoints are 104 elapsed days apart, and the four phases are contiguous with no gaps. The PDF's line wrapping splits some phase ranges across lines, but their dates match the HTML.

The request mentions obtaining a quote before the following week's board review, while implementation ends in February 2027. These may refer to different milestones, but the proposal does not explicitly say so. This remains a content review item; the export comparison alone does not determine the intended board-review commitment.

The exports contain no deployment URL or commit identifier, so they do not establish that their source record came from `76ca61f`. A separately saved Project Command Center page in the same Downloads folder points to the older `bh8acyatf` Preview and shows a different proposal with the original generic timeline; it is historical bug evidence, not provenance for these exports. The exports also do not verify the saved dashboard/detail display, one-click HTML download behavior, or the **Clear filters** empty state. Those browser checks remain open. Proposal creation and status persistence on the new Preview have not been independently evidenced here.

## Scope and disposition

- Internal application functionality: verified in local demo and local PostgreSQL modes.
- Deployed preview browser behavior: owner sign-in was reported as passed on `ac9a0d8`; local HTML/PDF export content consistency was directly verified. One-click download, filtered empty state, saved dashboard/detail consistency, and the remaining workflow checks are unverified.
- Acme dashboard feature inventory and real-time reporting: still open in #22 and #23, pending client-facing approval.
- No client analytics dashboard feature is validated by this proposal-management test.
