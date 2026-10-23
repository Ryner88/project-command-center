# Acme dashboard requirements discovery worksheet

**Status:** Questions for discovery. Pending answers and decision-log entries are not client approval.

**Source:** The [redacted client proposal](analytics-dashboard-mvp.redacted.pdf) describes an analytics dashboard for executive teams and promises real-time reporting. Its stated AI feature is assisted weekly summaries; the proposal does not define broader AI behavior. The [requirements audit](analytics-dashboard-mvp-requirements-audit.md) identifies the missing detail. This worksheet supports [#22](https://github.com/Ryner88/project-command-center/issues/22), [#23](https://github.com/Ryner88/project-command-center/issues/23), and [#24](https://github.com/Ryner88/project-command-center/issues/24).

**Fixture status:** The user confirmed Sarah Chen and Apex Retail Co. are fictional scenarios. Their proposal exports can exercise a proposed requirements and reporting model, but neither is a source of Acme requirements or approval. Any Acme stakeholder interview and approval must come from a separately identified authorized person.

## Source and approval record

Before using any answer as a commitment, record the real stakeholder's full name, organization, role, relationship to Acme, interview date, and the location of their written response. Identify who at Acme can approve the feature scope, reporting targets, estimates, and milestone mapping. Record that person's explicit approval and version of the agreed scope. Do not enter fictional fixture identities as approvers.

| Source or approval field                                              | Recorded value and evidence |
| --------------------------------------------------------------------- | --------------------------- |
| Real stakeholder's name, organization, role, and relationship to Acme | Pending                     |
| Interview date and written response location                          | Pending                     |
| Authorized Acme approver and scope of approval authority              | Pending                     |
| Explicit approval evidence and date                                   | Pending                     |
| Approved scope document and version                                   | Pending                     |

## #22 — Dashboard feature boundary

Ask an authorized Acme reviewer:

1. Which user groups need the dashboard? What can each group view, change, export, or administer? How will users sign in?
2. Which pages are required? For each page, what decision does it support and what actions can a user take?
3. Which KPIs are required? For each, specify the name, formula, unit, aggregation period, source of truth, and permitted breakdowns.
4. Which charts or other visualizations are required? Specify measures, axes or groups, drilldowns, comparison periods, and empty states.
5. Which filters are required? Specify values, defaults, combinations, reset behavior, and whether filters affect exports or summaries.
6. Which user workflows must work end to end, including viewing current figures, investigating changes, and exporting or sharing results?
7. Which features are required for MVP, optional by separate approval, or excluded? Assign each required feature to one of the proposal's four existing phases and its broad deliverables. Do not alter the proposal's dates without agreement.

For each proposed feature, record its behavior, data dependency, acceptance test, phase, and approving person. Leave unknown fields unresolved; do not substitute Project Command Center's proposal pipeline cards, filters, or single-owner permissions.

## #23 — Real-time reporting contract

For each proposed data source, ask:

1. What is the named system and data owner? Which API, event stream, file feed, or other method is available? Who provides access and test data?
2. What are the expected and peak record counts, update rates, and historical backfill size?
3. How often does the source publish changes? What maximum age may a dashboard value have, measured from source event time to visible result? State the percentile and observation window used to test the target.
4. How will the interface show the last successful update, stale values, missing data, and source-specific outages?
5. What retry, replay, reconciliation, and recovery behavior is required after a source or dashboard outage? Who investigates discrepancies?
6. Which normal, stale-data, outage, recovery, and reconciliation scenarios must pass before acceptance? Who supplies the source-side timestamps and test fixtures?

Do not select refresh intervals, latency targets, source systems, or integration ownership until Acme confirms them. The existing agency application's mock Gmail/Calendar data and proposal database are unrelated to this reporting contract.

## #24 — AI-assisted weekly summaries

Ask an authorized Acme reviewer:

1. What questions should each summary answer, and which KPIs, comparisons, and explanations must it contain?
2. Which approved data sources and reporting periods supply its inputs? How are source values and generated claims traced back to evidence?
3. When and how is it generated? Who receives or can view it, and through which approved channel?
4. Who reviews, edits, and approves a summary before anyone relies on or shares it? What happens when the reviewer rejects it?
5. How are missing, stale, contradictory, or unavailable source data and AI generation failures shown or handled?
6. Which example summaries and failure cases must pass acceptance, and who approves the results?

Keep any model, provider, automation, or delivery-channel choice pending until the client approves it. Record the summary's behavior, inputs, acceptance test, phase, and approval with the other MVP features.

## Decision log

| Decision                                                             | Answer and evidence link | Proposed by | Authorized approver | Approval evidence and date | Approved scope version | Issue    |
| -------------------------------------------------------------------- | ------------------------ | ----------- | ------------------- | -------------------------- | ---------------------- | -------- |
| Real stakeholder's role and approval authority                       | Pending                  | —           | —                   | Pending                    | —                      | #22, #23 |
| Dashboard pages, workflows, KPIs, charts, filters, and roles         | Pending                  | —           | —                   | Pending                    | —                      | #22      |
| Feature acceptance tests and four-phase mapping                      | Pending                  | —           | —                   | Pending                    | —                      | #22      |
| Named sources, integration ownership, volumes, and freshness targets | Pending                  | —           | —                   | Pending                    | —                      | #23      |
| Stale-data, outage, recovery, and reconciliation tests               | Pending                  | —           | —                   | Pending                    | —                      | #23      |
| Weekly summary behavior, inputs, review, failures, and tests         | Pending                  | —           | —                   | Pending                    | —                      | #24      |

Issues #22, #23, and #24 remain open until the approved answers are incorporated into the client-facing agreement or an expressly incorporated scope document. This worksheet records discovery; it is not itself an approval artifact.
