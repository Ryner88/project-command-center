# Acme dashboard requirements discovery worksheet

**Status:** Questions for discovery; no client requirements or approval recorded here.

**Source:** The [redacted client proposal](analytics-dashboard-mvp.redacted.pdf) promises an AI-powered analytics dashboard for executive teams, real-time reporting, and AI-assisted weekly summaries. The [requirements audit](analytics-dashboard-mvp-requirements-audit.md) identifies the missing detail. This worksheet supports [#22](https://github.com/Ryner88/project-command-center/issues/22) and [#23](https://github.com/Ryner88/project-command-center/issues/23).

**Sarah's role:** The user suggested Sarah as a source for this work. Her connection to Acme and authority to approve scope have not been verified. The Sarah Chen records elsewhere in this repository are mock agency-workflow data and provide no Acme dashboard requirements.

## Source and approval record

Before using any answer as a commitment, record Sarah's full name, organization, role, relationship to Acme, interview date, and the location of her written response. Identify who at Acme can approve the feature scope, reporting targets, estimates, and milestone mapping. Record that person's explicit approval and version of the agreed scope. If Sarah supplies information but cannot approve it, retain her answers as discovery input.

## #22 — Dashboard feature boundary

Ask Sarah and the authorized Acme reviewer:

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

## Decision log

| Decision                                                             | Answer and evidence link | Proposed by | Approved by and date | Issue    |
| -------------------------------------------------------------------- | ------------------------ | ----------- | -------------------- | -------- |
| Sarah's role and approval authority                                  | Pending                  | —           | —                    | #22, #23 |
| Dashboard pages, workflows, KPIs, charts, filters, and roles         | Pending                  | —           | —                    | #22      |
| Feature acceptance tests and four-phase mapping                      | Pending                  | —           | —                    | #22      |
| Named sources, integration ownership, volumes, and freshness targets | Pending                  | —           | —                    | #23      |
| Stale-data, outage, recovery, and reconciliation tests               | Pending                  | —           | —                    | #23      |

Issues #22 and #23 remain open until the approved answers are incorporated into the client-facing agreement or an expressly incorporated scope document.
