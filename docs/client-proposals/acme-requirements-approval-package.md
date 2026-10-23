# Acme analytics dashboard — requirements decision package

**Status:** Candidate — Pending Client Approval  
**Version:** 0.1 draft  
**Prepared:** October 23, 2026  
**Decision owner:** To be identified by Acme  
**Supporting schedules:** [MVP feature scope](acme-dashboard-mvp-feature-specification.md) and [reporting contract](acme-dashboard-reporting-specification.md)

## Purpose and decision boundary

The existing client proposal describes an executive analytics dashboard with real-time reporting and AI-assisted weekly summaries. It does not name the dashboard's pages, charts, KPIs, filters, data sources, refresh targets, or permissions. This package asks Acme to decide those details in one place.

This draft is a decision form, not a change to the existing proposal. A completed, approved version must be expressly incorporated into the client agreement to become delivery scope. A blank, pending, or deferred field is **not** approval. Internal simulations do not supply Acme data, milestone dates, integrations, charts, or performance targets.

## 1. Feature decisions

For each candidate below, select **Include**, **Defer**, or **Exclude**. For every included item, complete the behavior, data, test, role, deliverable, and phase fields in the [feature specification](acme-dashboard-mvp-feature-specification.md) or an expressly attached approved schedule. A broad selection without those details is incomplete. Real-time reporting and AI-assisted weekly summaries are already promised at a high level; deferring or excluding either requires an explicit change to the existing proposal.

| ID  | Candidate decision                  | Acme selection                            | Required detail before inclusion                                                  |
| --- | ----------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| A01 | Executive overview                  | Pending                                   | Named KPIs, units, periods, source, visibility, and expected reference values     |
| A02 | Metric detail                       | Pending                                   | Measures, breakdowns, history, drilldowns, and access rules                       |
| A03 | Charts or other visualizations      | Pending                                   | Chart inventory, measures, labels, interactions, and accessible equivalent values |
| A04 | Filters                             | Pending                                   | Fields, values, defaults, combinations, reset behavior, and effect on displays    |
| A05 | Freshness and source health display | Pending                                   | Approved source-specific targets and stale/outage display from Section 2          |
| A06 | AI-assisted weekly summaries        | Promised at a high level; details pending | Separate summary inputs, review, evidence, safety, and acceptance schedule        |
| A07 | User access                         | Pending                                   | Named roles, sign-in method, permission matrix, and data boundaries               |

**Additional feature requested by Acme:** Pending. Record its behavior, dependency, acceptance test, effort/estimate impact, deliverable, phase, and approval before adding it. Export, alerts, administration, mobile apps, and a client portal have not been approved by this package.

**Questions for Acme:** Which decisions must executive users make with the dashboard? Which pages and workflows support those decisions? Which features are required for the first release, which may follow later, and which are excluded? Who can view, change, administer, or export each category of information?

## 2. Reporting decisions

Acme must identify each source and metric before a real-time target can be tested. The [reporting specification](acme-dashboard-reporting-specification.md) describes the measurement and failure cases to approve. Its internal worked example is not an Acme KPI catalog.

### Source and integration register

Add one row for each real source. A source is not approved until its access and owner fields are complete.

| Source system and data owner | Data/API or feed; access method | Integration implementer and test-data provider | Expected/peak volume and backfill | Approval |
| ---------------------------- | ------------------------------- | ---------------------------------------------- | --------------------------------- | -------- |
| Pending                      | Pending                         | Pending                                        | Pending                           | Pending  |

### Metric and filter register

Add one row per KPI and identify any chart or filter that depends on it. Do not substitute total proposals or estimated pipeline value unless Acme independently selects those as business metrics.

| KPI name and decision it supports | Formula, unit, source of truth, and reporting period | Allowed dimensions, filters, chart, and viewer roles | Reference dataset and expected test result | Approval |
| --------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------ | -------- |
| Pending                           | Pending                                              | Pending                                              | Pending                                    | Pending  |

### Freshness and failure contract

Record values **per source**, or identify an explicitly approved common policy. “Real-time” alone is not a measurable target.

| Decision                                                             | Acme answer and evidence |
| -------------------------------------------------------------------- | ------------------------ |
| Source event timestamp and publication cadence                       | Pending                  |
| Ingestion method and dashboard refresh behavior                      | Pending                  |
| Maximum event-to-visible latency, percentile, and observation window | Pending                  |
| Expected and peak load for the timing test                           | Pending                  |
| Clock synchronization and measurement method                         | Pending                  |
| Stale threshold, last-update display, and treatment of old values    | Pending                  |
| Retry, outage, replay, recovery, and reconciliation policy           | Pending                  |
| Incident and discrepancy owner                                       | Pending                  |

**Questions for Acme:** Which systems are available for testing and who grants access? Which business event timestamp starts the freshness clock? How old may a value be before users see a warning? What should users see during an outage? How will missed or duplicate updates be detected and corrected?

## 3. Acceptance and delivery mapping

For each **included** feature and approved source, add the expected result to an acceptance record. The four phase names below come from the existing proposal; this package assigns no new dates.

| Existing phase         | Required decision or evidence before acceptance                                                                               | Acme owner / evidence |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Discovery and planning | Approved feature inventory, exclusions, user flows, source/metric register, and measurable reporting contract                 | Pending               |
| Execution and reviews  | Reviewed interface designs and integration plan against the approved inventory                                                | Pending               |
| QA and final revisions | Reference-data checks; role isolation; normal, stale, outage, recovery, volume, and latency tests against approved thresholds | Pending               |
| Handoff and closeout   | Release candidate, deployment/support notes, known limits, and acceptance sign-off                                            | Pending               |

**Acceptance evidence required:** A feature-by-feature expected result and actual result; named test dataset and source timestamps; volume and latency measurements at the approved percentile; stale/outage/recovery and reconciliation outcomes; authorization checks; defects and accepted exceptions. Internal simulation and agency application tests do not satisfy these Acme acceptance tests.

## 4. Approval record

Complete this section **only after** all included features, source/metric rows, thresholds, exclusions, tests, and phase assignments are filled in or explicitly marked for a separate change request. Identify the exact version and attachments approved. An approval of this form does not silently approve unresolved rows or the separate weekly-summary detail schedule.

| Field                                                   | Acme decision |
| ------------------------------------------------------- | ------------- |
| Authorized Acme approver, title, and organization       | Pending       |
| Authority to approve scope and reporting targets        | Pending       |
| Approved document version and attached schedules        | Pending       |
| Included, deferred, and excluded feature list           | Pending       |
| Reporting source, KPI, and target register version      | Pending       |
| Accepted changes to estimate or milestone dates, if any | Pending       |
| Written approval location or signature                  | Pending       |
| Approval date                                           | Pending       |
| Agency acknowledgment and date                          | Pending       |

Store completed answers, signatures, credentials, and confidential source details in a restricted client record. Keep this public draft blank and link to the approved version by a suitable private reference.

**Current decision:** No Acme approval is recorded. Feature and reporting decisions remain open until the completed package is approved, expressly incorporated into the client-facing agreement, and the corresponding acceptance evidence passes. Weekly-summary detail requires its own approved schedule.
