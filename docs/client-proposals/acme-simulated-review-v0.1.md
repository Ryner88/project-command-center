# Acme requirements review — simulated decision record

**Status:** SIMULATED — NOT CLIENT AUTHORIZATION; review completed  
**Record version:** 0.1  
**Scenario date:** October 23, 2026  
**Representative:** ChatGPT (GPT-6), acting as Acme Corp's simulated Product Owner / Client Approver  
**Authority:** Simulated only; no authority to bind Acme Corp  
**Simulated review date:** October 23, 2026  
**Real approval date:** Not recorded  
**Source package:** [Acme requirements decision package](acme-requirements-approval-package.md)

## Purpose and guardrail

This record tests whether the candidate [feature specification](acme-dashboard-mvp-feature-specification.md) and [reporting specification](acme-dashboard-reporting-specification.md) support a complete stakeholder review. It may contain realistic fictional choices and objections. It must not be copied into the approval fields of the client-facing package or used to close [#22](https://github.com/Ryner88/project-command-center/issues/22) or [#23](https://github.com/Ryner88/project-command-center/issues/23). The original proposal's high-level promises remain the source baseline; Sarah Chen and Apex Retail Co. are agency proposal fixtures, not Acme data.

## Feature decisions — simulated #22 review

Decision vocabulary: **Approve (simulated)**, **Request changes**, **Defer**, or **Reject**. “Approve (simulated)” evaluates a scenario choice only; it is not approval of an Acme deliverable or acceptance test.

| ID  | Candidate                                                                                  | Simulated decision  | Reason and required change or acceptance condition                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P00 | Deliver an executive analytics dashboard, not the agency proposal application              | Approve (simulated) | This matches the recovered proposal's product identity. Acceptance still needs approved user flows and reference data.                                                                  |
| A01 | Executive overview                                                                         | Request changes     | Name each executive decision and KPI; state formula, unit, reporting period, source, permitted viewers, and expected result on a reference dataset. A generic KPI card is insufficient. |
| A02 | Metric detail                                                                              | Defer               | Drilldowns and history are not named in the proposal. Include them only if a specific executive decision requires them and their data/access costs fit an approved change.              |
| A03 | Visualizations                                                                             | Request changes     | Select the exact measures and chart/table forms, labels, empty states, and accessibility behavior. No chart count or type is approved by the source proposal.                           |
| A04 | Filters                                                                                    | Request changes     | Identify the permitted business dimensions, date basis, defaults, combinations, reset, and whether every display uses the same filtered dataset.                                        |
| A05 | Freshness and source health                                                                | Request changes     | Keep the high-level real-time reporting promise; supply the source-specific latency and stale/outage contract in #23 before implementation acceptance.                                  |
| A06 | AI-assisted weekly summaries                                                               | Request changes     | Keep the promised weekly summary concept; define inputs, evidence, human review, failure behavior, and acceptance separately under #24. No automatic distribution is approved.          |
| A07 | User access                                                                                | Request changes     | Executive audience is known, but sign-in, role matrix, sensitive metrics, and cross-scope isolation require explicit decisions and authorization tests.                                 |
| S01 | Exports, alerts, administration, mobile apps, and client portal beyond the stated proposal | Reject              | Do not add these to the current MVP from broad “dashboard” wording. A separately approved change request may revisit them.                                                              |

**Feature review outcome:** Request a revised feature schedule before simulated sign-off. The overview, visualizations, filters, freshness, summaries, and access rules need the stated detail. The four original phases may organize that work, but each included feature still needs an explicit deliverable, expected test result, and phase assignment. The simulated P00 decision does not authorize a release or change the client agreement.

## Reporting decisions — simulated #23 review

| Area                                                 | Simulated decision | Required measurable definition or objection                                                                                                                                                                                     |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KPI names and calculation methods                    | Request changes    | Name each business measure, event date, numerator/denominator where relevant, unit, reporting period, dimensions, and reference result. Reject the agency proposal pipeline metrics as defaults for Acme.                       |
| Named source systems and access ownership            | Request changes    | Supply actual system names, data owners, API/feed methods, authentication/access owners, and test-data providers. No Acme source is established by the proposal.                                                                |
| Expected/peak volumes and historical backfill        | Request changes    | State records, event/update rates, history, peak load, and source-side limits so performance tests have a load model.                                                                                                           |
| Refresh behavior and event-to-visible latency        | Request changes    | Define refresh/publish cadence, maximum age at a stated percentile over a stated observation window, and measurement from source event timestamp to visible dashboard value. No number can be approved from the current source. |
| Stale, outage, recovery, and reconciliation behavior | Request changes    | Define a stale threshold, last-update display, old-value policy, retries, missed-event replay, duplicate handling, reconciliation owner, and recovery target.                                                                   |
| Normal and failure acceptance tests                  | Request changes    | Provide source-stamped reference data and expected outputs, then run normal, peak, stale, outage, recovery, reconciliation, and authorization-isolation tests.                                                                  |

**Reporting review outcome:** Request a completed source and metric register before simulated sign-off. The original proposal's “real-time” promise is retained, but its performance contract is not yet measurable. This review deliberately assigns no fictional source name, KPI, refresh frequency, or latency number to Acme.

## Technical acceptance and issue disposition

| Gate                                              | Current evidence                                                                                         | Simulated review result                                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Candidate documentation and two-record arithmetic | [Fixture test record](../manual-test-results/2026-10-23-issue-22-23-simulation.md): static checks passed | Approve (simulated) as a test of the document format only; no client-dashboard behavior was exercised |
| Client-dashboard feature acceptance               | No Acme-approved feature inventory or client-dashboard test result                                       | Request changes; #22 technical acceptance is not satisfied                                            |
| Real-time reporting acceptance                    | No named Acme source, threshold, or R06–R07 result                                                       | Request changes; #23 technical acceptance is not satisfied                                            |
| Authorized client approval                        | No real Acme approver, written approval, or approval date                                                | **Not satisfied**                                                                                     |

**Issue #22:** Open. **Issue #23:** Open. The simulated representative requests changes on both. Neither the fictional review date nor any “Approve (simulated)” decision may be entered as Acme's approval date or used to close either issue.
