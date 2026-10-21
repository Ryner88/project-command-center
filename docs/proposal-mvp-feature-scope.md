# Project Command Center — MVP Feature Scope

**Status:** Internal agency application scope draft; not the client analytics dashboard proposal.

**Issue clarification:** [#22](https://github.com/Ryner88/project-command-center/issues/22) concerns a separate client analytics dashboard. This document must not be used to satisfy or close that issue.

**Product:** Single-owner agency briefing and proposal workspace

> **Source correction:** The [client analytics dashboard proposal](client-proposals/analytics-dashboard-mvp.redacted.pdf) describes a different product. See the [requirements audit](client-proposals/analytics-dashboard-mvp-requirements-audit.md). The feature boundaries below apply only to the existing agency application.

## 1. Objective and delivery boundary

The MVP lets an agency operator identify a client opportunity, generate and review a project proposal, track its status, and open or download a client-facing HTML export. Completion requires the workflows and acceptance gates below to work with persisted data.

This scope is for briefing and proposal management. It does not imply a general analytics platform, financial reporting system, or full project-management suite. Existing project and task features may remain available, but they are not additional MVP acceptance obligations unless named below.

## 2. Included pages and deliverables

| ID  | Page or capability                  | Required behavior                                                                                      | Deliverable        | Milestone | Current repository state                                |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------ | --------- | ------------------------------------------------------- |
| F01 | Home (`/`)                          | Introduce the workflow and navigate to briefing, creation, and dashboard                               | Home page          | M1        | Implemented                                             |
| F02 | Morning Briefing (`/briefing`)      | Show urgency groups, calendar snapshot, important email summaries, and a proposal handoff              | Briefing interface | M2        | Implemented with local email and calendar mock adapters |
| F03 | New Proposal (`/proposals/new`)     | Accept manual or saved seed context, validate inputs, generate a draft, and save it                    | Proposal generator | M2        | Implemented                                             |
| F04 | Proposal Dashboard (`/proposals`)   | Show pipeline counts, attention queue, proposal list, status/domain filters, and status/export actions | Dashboard          | M3        | Implemented                                             |
| F05 | Proposal Detail (`/proposals/[id]`) | Display saved summary, scope, deliverables, tasks, timeline, price range, risks, and assumptions       | Detail view        | M3        | Implemented                                             |
| F06 | HTML export                         | Generate an HTML document from a saved proposal and make it available to open or download              | Export capability  | M4        | Implemented                                             |

The source project also includes project pages, project tasks, proposal editing/version history, and a PDF export route. Those existing capabilities are outside the required F01–F06 acceptance boundary.

## 3. KPIs, visual summaries, and filters

The dashboard must show saved proposal counts for **Draft**, **In Review**, **Sent**, and **Won/Lost combined**. It must also show the number of proposals with an HTML export and the number matching the active list filters. Pipeline and exported counts cover the owner's saved proposal set; the matching count covers the filtered list. The existing **In flight**, **Due soon**, and **Ready to send** summaries may supplement these required counts.

The current `/proposals` Pipeline Snapshot renders all four required status-count cards. The filter summary displays the exported and matching counts.

Required visual summaries are numerical status cards, an urgency-ranked attention queue, status badges on proposals, and morning briefing urgency groups. Graphical bar, line, pie, and doughnut charts are not required.

| Filter          | Values                                      | Required behavior                                      |
| --------------- | ------------------------------------------- | ------------------------------------------------------ |
| Proposal status | All, Draft, In Review, Sent, Won, Lost      | Limit the displayed proposal list to the chosen status |
| Project domain  | All plus domains present in saved proposals | Limit the displayed proposal list to the chosen domain |

The filters must be usable together and clearable back to the complete list. Client-name search, date-range filters, custom sorting, and saved filter sets are optional.

## 4. Proposal generation and lifecycle

The generator must accept or preserve client name, proposal title, project type, project domain (including **Other** with a custom domain), a request summary or raw request, optional start and deadline dates, and optional saved seed or project context. Manual generation requires client name, project type, domain, and a summary or raw request. Invalid inputs must produce actionable errors.

A saved draft must include a project summary, scope, deliverables, task breakdown, timeline, estimated price range, risks, and assumptions. The operator must be able to reopen and review the saved draft. Generation does not approve the content or turn it into a client commitment.

The status values are **Draft**, **In Review**, **Sent**, **Won**, and **Lost**. The intended path is Draft → In Review → Sent → Won or Lost. Operators may change status manually; enforced transitions, approval chains, automatic email delivery, and electronic signatures are outside this MVP. A status change must persist after reload.

External AI generation is available when configured, and the current implementation can create a local draft when the provider is unavailable. The detailed input, review, evidence, safety, and operating-cost contract belongs to [#24](https://github.com/Ryner88/project-command-center/issues/24); this feature scope does not waive that work.

## 5. User and ownership model

The only included role is **Workspace Owner / Agency Operator**. This operator can view the briefing and dashboard, create and retrieve proposals, update statuses, view details, and generate exports.

Production currently requires an owner password and signed session cookie. The database user ID is a fixed application owner (`demo-user`); repository queries and relationships are owner scoped. This is a single-owner access model, not individual user accounts or multi-user authorization. A multi-user release requires session-derived identity and verified cross-user isolation before it can be offered.

Administrator, collaborator, read-only viewer, and client-portal roles are excluded. Additional security and recovery requirements are tracked in [#26](https://github.com/Ryner88/project-command-center/issues/26).

## 6. Core workflows

**W01 — Briefing opportunity to proposal**

1. Open Morning Briefing and review the urgency groups and handoff items.
2. Select an email-derived item marked as needing a proposal, or start a proposal manually from the briefing.
3. Review and complete the carried source context in New Proposal.
4. Generate the draft, then open its saved detail page.

The briefing's email and calendar examples currently come from local mock adapters. Live Gmail or Calendar connections are not part of W01.

**W02 — Manual proposal**

1. Open New Proposal and enter the required project information.
2. Generate a draft and review its saved content.
3. Return to the dashboard and find the proposal.

**W03 — Pipeline management**

1. Review pipeline counts and the attention queue on the dashboard.
2. Filter by status and/or domain, then clear the filters.
3. Open a proposal, update its status, and confirm the saved status after reload.

**W04 — Proposal export**

1. Find and review a saved proposal.
2. Request its HTML export.
3. Open or download the document and confirm that it reflects the saved proposal.

## 7. Included, optional, and excluded work

**Required MVP:** F01–F06 and W01–W04; owner-scoped persisted proposals and seeds; input validation; manual status management; KPI cards and filters; HTML export; application liveness and database readiness checks; migrations and backup/restore evidence appropriate to deployment. Production errors must remain visible rather than silently substituting demo data.

**Optional, requiring separate approval:** deployment-safe PDF delivery, graphical charts, additional KPI analytics, advanced search and date filters, live Gmail/Calendar OAuth, rich templates, deadline notifications, and automated customer communications. The presence of an existing PDF route does not make PDF an MVP acceptance gate.

**Excluded after MVP:** multi-tenant collaboration and role-based access control, client portals, payments/subscriptions/invoicing, electronic signatures, full task or project-management scope, real-time collaboration, CRM synchronization, native mobile apps, unrestricted third-party integrations, and autonomous proposal sending.

## 8. Milestones and acceptance gates

| Milestone                        | Deliverables                                                              | Acceptance gate                                                     |
| -------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| M1 — Foundation                  | F01; owner session, persistence model, liveness and readiness foundations | Home loads; access and database readiness can be checked            |
| M2 — Opportunity Capture         | F02, F03; W01, W02                                                        | Briefing handoff and manual inputs each produce a retrievable draft |
| M3 — Proposal Management         | F04, F05; W03                                                             | Saved records, counts, filters, detail content, and statuses work   |
| M4 — Export and Data Reliability | F06; W04; persistence and recovery evidence                               | HTML export matches saved data; durability and restore checks pass  |
| M5 — Release Acceptance          | End-to-end review, ownership/security review, documentation               | Required MVP criteria pass and release limitations are stated       |

Milestones are logical deliverable groups, not calendar dates or a claim that all work remains unfinished. Most named application paths already exist; acceptance still requires verification against the agreed proposal.

## 9. MVP acceptance checklist

- [ ] All five listed pages load and their required behavior works.
- [ ] A briefing handoff item opens proposal generation with saved source context.
- [ ] Manual inputs produce a saved, retrievable proposal.
- [ ] Generated drafts contain summary, scope, deliverables, tasks, timeline, price range, risks, and assumptions.
- [ ] Invalid required inputs produce actionable validation errors.
- [ ] Saved records survive application redeployment.
- [ ] Dashboard counts reflect saved owner data; status and domain filters work together and clear.
- [ ] Manual status changes persist after reload.
- [ ] HTML export reflects the saved proposal and opens or downloads successfully.
- [ ] Production data failures do not silently fall back to demo records.
- [ ] Migrations and backup/restore checks pass.
- [ ] The single-owner identity and mock briefing source limitations are disclosed in release materials.
- [ ] Optional and excluded features are not presented as required MVP deliverables.

Detailed performance, accessibility, security, defect, and acceptance ownership thresholds remain to be defined under [#25](https://github.com/Ryner88/project-command-center/issues/25).

## 10. Scope changes and approval

A feature is inside MVP scope only when explicitly included in Sections 2–7 or necessary to satisfy an acceptance gate above. Requests for optional or excluded work require a written change request covering effort, dependencies, deliverable, milestone, and authorized approval. Broad words such as “dashboard,” “integration,” “analytics,” or “core implementation” do not silently add functionality.

**This document does not establish the client analytics dashboard delivery boundary.** The client proposal requires its own feature-level scope and approved change terms. Issue #22 remains open.
