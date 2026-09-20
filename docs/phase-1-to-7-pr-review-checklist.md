# Phase 1–7 pull request review checklist

Use this checklist before merging the production-readiness branches. Run it in an isolated environment with production-shaped configuration and a disposable PostgreSQL database.

For each case, record one result in the PR discussion or a copy of the [manual test result template](manual-test-results/TEMPLATE.md):

- **Pass**: observed behavior matches the expected result.
- **Fail**: behavior is implemented but incorrect. Open an issue and link it.
- **Blocked**: a required service, secret, permission, or environment is unavailable. Record the owner and next step.
- **Not implemented**: the required behavior does not exist. This blocks the related phase gate.

## Preflight checks

- [ ] **PF-01 — Branch and build:** Record the branch, commit SHA, build ID, reviewer, and test date.
- [ ] **PF-02 — Isolated environment:** Confirm the test does not use the production database or production customer data.
- [ ] **PF-03 — Configuration:** Confirm required variables are present and preview values are separate from production values.
- [ ] **PF-04 — Clean database:** Create a disposable PostgreSQL database and confirm that it contains no application tables.
- [ ] **PF-05 — Dependencies:** Install from the lockfile and record any installation failure.
- [ ] **PF-06 — Browser:** Record the browser version and test desktop and 390-pixel mobile viewports.
- [ ] **PF-07 — Evidence directory:** Create a location for logs, screenshots, exports, backups, and recordings.
- [ ] **PF-08 — Issue handling:** Confirm every failed case will receive a linked issue before review ends.

## Phase 1 — Deployment verification

- [ ] **P1-01:** Deploy a production build from documented commands in a clean environment.
- [ ] **P1-02:** Confirm startup fails clearly when required production configuration is missing.
- [ ] **P1-03:** Confirm `/api/live` returns `200` with a request identifier.
- [ ] **P1-04:** Confirm `/api/ready` reports the database and migration state accurately.
- [ ] **P1-05:** Create, save, reopen, edit, and export a real proposal after deployment.
- [ ] **P1-06:** Restart or redeploy the application and confirm the saved proposal remains available.
- [ ] **P1-07:** Confirm production does not create seeded or demo records.
- [ ] **P1-08:** Roll back to the previous deployment, verify health and saved data, then restore the candidate deployment.

## Phase 2 — Durable persistence and integrity

- [ ] **P2-01:** Run every migration against a new PostgreSQL database.
- [ ] **P2-02:** Run the upgrade path from the pre-Phase 2 schema.
- [ ] **P2-03:** Confirm production reads and writes use the repository boundary.
- [ ] **P2-04:** Attempt a cross-owner relationship and confirm the database rejects it.
- [ ] **P2-05:** Attempt a duplicate required source reference and confirm the database rejects it.
- [ ] **P2-06:** Force a multi-record operation to fail and confirm the transaction leaves no partial records.
- [ ] **P2-07:** Verify stable IDs, creation timestamps, update timestamps, and archive behavior.
- [ ] **P2-08:** Export portable workspace data and import it into a clean database.
- [ ] **P2-09:** Run the scheduled-backup command and verify the artifact and retention metadata.
- [ ] **P2-10:** Restore the backup into a clean database and verify application-level record counts and reads.

## Phase 3 — Complete workflows

- [ ] **P3-01:** Create a project through the UI with valid client context.
- [ ] **P3-02:** Edit the project, change status and priority, and confirm the saved values after reopening.
- [ ] **P3-03:** Search and filter projects by text, status, and priority.
- [ ] **P3-04:** Archive a project, find it in archived results, and restore it.
- [ ] **P3-05:** Create multiple tasks under a project and verify their project relationship.
- [ ] **P3-06:** Reorder tasks, complete one, reopen it, and verify history-relevant timestamps.
- [ ] **P3-07:** Generate a proposal from the saved project context.
- [ ] **P3-08:** Confirm proposal generation failure does not leave a partial proposal or related record.
- [ ] **P3-09:** Edit and save the proposal, then confirm a version-history entry exists.
- [ ] **P3-10:** Reopen the proposal detail and verify its project, source, dates, scope, and status.
- [ ] **P3-11:** Export HTML and confirm user-provided content is escaped and readable.
- [ ] **P3-12:** Exercise validation, loading, empty, error, and recovery states without editing files or database rows.

## Phase 4 — Access and security

- [ ] **P4-01:** Review the threat model against the deployed access model.
- [ ] **P4-02:** Confirm anonymous pages redirect to sign-in and anonymous APIs return `401`.
- [ ] **P4-03:** Confirm an incorrect password fails and a correct password creates a protected session.
- [ ] **P4-04:** Confirm the session cookie is HTTP-only, same-site, and secure in production.
- [ ] **P4-05:** Submit a cross-origin mutation and confirm it returns `403` before application work runs.
- [ ] **P4-06:** Send malformed values to mutation routes and confirm safe validation responses.
- [ ] **P4-07:** Verify exported content escapes hostile markup.
- [ ] **P4-08:** Confirm production responses include the expected security headers and do not expose secrets or stack traces.
- [ ] **P4-09:** Confirm important owner mutations create audit events and demo-only routes return `404` in production.

## Phase 5 — Reliability and operations

- [ ] **P5-01:** Confirm structured logs contain request and operation IDs, status, and duration without request content.
- [ ] **P5-02:** Confirm `/api/diagnostics` reports build ID, uptime, readiness, and failed-operation data.
- [ ] **P5-03:** Stop PostgreSQL and confirm liveness stays up while readiness returns `503`.
- [ ] **P5-04:** Confirm database-backed work fails with a safe message and request ID during the outage.
- [ ] **P5-05:** Restart PostgreSQL and confirm readiness and database work recover without an application restart.
- [ ] **P5-06:** Run a deliberately failing migration and confirm no partial schema change remains.
- [ ] **P5-07:** Restore a verified backup and compare user, project, proposal, task, and audit counts.
- [ ] **P5-08:** Exercise the documented application rollback and database compatibility decision.
- [ ] **P5-09:** Match observed failures to alert thresholds and follow the incident runbook without source debugging.

## Phase 6 — CI/CD and release controls

- [ ] **P6-01:** Confirm formatting, lint, type checking, unit tests, integration tests, browser tests, and production build are required CI jobs.
- [ ] **P6-02:** Confirm migration tests use a clean PostgreSQL service.
- [ ] **P6-03:** Confirm the production dependency audit reports no high-severity finding.
- [ ] **P6-04:** Confirm preview and production use separate environments and secrets.
- [ ] **P6-05:** Build and deploy one preview candidate and record its URL and build ID.
- [ ] **P6-06:** Run the candidate smoke test before promotion.
- [ ] **P6-07:** Supply the wrong expected build ID and confirm promotion stops with a failed job.
- [ ] **P6-08:** Promote the tested artifact and confirm production diagnostics report the same build ID.
- [ ] **P6-09:** Run or dry-run the protected rollback workflow using a recorded working deployment.

## Phase 7 — Production UX and portfolio evidence

- [ ] **P7-01:** Confirm the first local demo visit contains no silently created sample records.
- [ ] **P7-02:** Select **Load demo workspace** and confirm the sample proposal appears; confirm the route returns `404` in production.
- [ ] **P7-03:** Navigate the primary workflow by keyboard and confirm the skip link moves focus to main content.
- [ ] **P7-04:** Run WCAG A and AA scans on home, projects, and a populated proposal dashboard with no serious or critical violations.
- [ ] **P7-05:** Check home, projects, proposal dashboard, and proposal detail at desktop and 390 by 844 pixels with no horizontal overflow.
- [ ] **P7-06:** Confirm reduced-motion preferences suppress nonessential transition and animation duration.
- [ ] **P7-07:** Run three warm proposal reloads and confirm the median browser load time is below three seconds.
- [ ] **P7-08:** Review README setup, architecture, operations, screenshots, deployment evidence, and the isolated demo recording as a new operator.

## Release decision

- [ ] Every case has a recorded result and evidence where required.
- [ ] Every failure and not-implemented result has a linked issue.
- [ ] Blocked cases name the missing dependency, owner, and next action.
- [ ] No unresolved result violates a phase exit gate.
- [ ] Backup, restore, rollback, and production smoke evidence is attached.
- [ ] Reviewer approves merge or records the reasons to hold the release.
