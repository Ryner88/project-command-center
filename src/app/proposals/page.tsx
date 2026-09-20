import Link from "next/link";

import { ProposalCardActions } from "@/components/proposals/proposal-card-actions";
import { formatProposalDate } from "@/lib/date";
import { getProposalDomainLabel } from "@/lib/proposal-domain";
import { listExportsForProposal } from "@/services/export.service";
import { listProposals } from "@/services/proposal.service";
import type { Proposal, ProposalStatus } from "@/types/proposal";

export const dynamic = "force-dynamic";

type ProposalsPageProps = {
  searchParams: Promise<{
    generated?: string;
    exported?: string;
    statusUpdated?: string;
    status?: ProposalStatus | "ALL";
    domain?: Proposal["projectDomain"] | "ALL";
  }>;
};

export default async function ProposalsPage({ searchParams }: ProposalsPageProps) {
  const params = await searchParams;
  const proposals = await listProposals();
  const proposalCards = await Promise.all(
    proposals.map(async (proposal) => ({
      proposal,
      exports: await listExportsForProposal(proposal.id)
    }))
  );
  const filteredCards = proposalCards
    .filter(({ proposal }) =>
      params.status && params.status !== "ALL" ? proposal.status === params.status : true
    )
    .filter(({ proposal }) =>
      params.domain && params.domain !== "ALL" ? proposal.projectDomain === params.domain : true
    )
    .sort((left, right) => getProposalAttentionScore(right) - getProposalAttentionScore(left));
  const pipelineCounts = countByStatus(proposalCards.map(({ proposal }) => proposal));
  const dueSoonCount = proposalCards.filter((card) => isDueSoon(card.proposal)).length;
  const exportedCount = proposalCards.filter((card) => card.exports.length > 0).length;
  const readyToSendCount = proposalCards.filter(
    (card) => getNextStep(card) === "Ready to send"
  ).length;
  const needsAttentionCards = filteredCards.filter((card) => getProposalAttentionScore(card) >= 60);
  const domainOptions = Array.from(
    new Set(
      proposalCards
        .map(({ proposal }) => proposal.projectDomain)
        .filter((domain): domain is NonNullable<Proposal["projectDomain"]> => Boolean(domain))
    )
  );

  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">Proposal Dashboard</span>
        <h1>Track draft, sent, and won work in one place.</h1>
        <p>
          The dashboard anchors the proposal lifecycle while the generator lives under the same
          domain.
        </p>
        <Link className="cta" href="/proposals/new">
          Create new proposal
        </Link>
        <div className="grid three dashboard-summary-grid">
          <div className="card dashboard-summary-card">
            <span className="eyebrow">In flight</span>
            <strong className="dashboard-summary-value">
              {pipelineCounts.DRAFT + pipelineCounts.IN_REVIEW}
            </strong>
            <p>Drafts and in-review proposals that still need active delivery decisions.</p>
          </div>
          <div className="card dashboard-summary-card">
            <span className="eyebrow">Due soon</span>
            <strong className="dashboard-summary-value">{dueSoonCount}</strong>
            <p>Proposals with deadlines already on the near-term clock.</p>
          </div>
          <div className="card dashboard-summary-card">
            <span className="eyebrow">Ready to send</span>
            <strong className="dashboard-summary-value">{readyToSendCount}</strong>
            <p>Reviewed proposals with exports ready and the next step clearly defined.</p>
          </div>
        </div>
      </section>
      {(params.generated || params.exported || params.statusUpdated) && (
        <section className="frame">
          {params.generated ? (
            <div className="stack">
              <p>Proposal {params.generated} was generated and is highlighted below.</p>
              <div className="action-row">
                <Link className="cta" href={`#proposal-${params.generated}`}>
                  Jump to new proposal
                </Link>
                <Link className="ghost-button" href={`/proposals/${params.generated}`}>
                  Open detail view
                </Link>
              </div>
            </div>
          ) : params.exported ? (
            <div className="stack">
              <p>Proposal {params.exported} export is ready for download.</p>
              <div className="action-row">
                <Link className="cta" href={`#proposal-${params.exported}`}>
                  Return to exported proposal
                </Link>
                <Link className="ghost-button" href={`/proposals/${params.exported}`}>
                  Open proposal detail
                </Link>
              </div>
            </div>
          ) : (
            <p>Proposal {params.statusUpdated} status was updated.</p>
          )}
        </section>
      )}
      <section className="frame stack">
        <div className="section-head">
          <span className="eyebrow">Pipeline Snapshot</span>
          <h2>Compact view of the current proposal pipeline</h2>
        </div>
        <div className="grid pipeline-grid">
          {[
            { label: "Draft", value: pipelineCounts.DRAFT, tone: "draft" },
            { label: "In Review", value: pipelineCounts.IN_REVIEW, tone: "review" },
            { label: "Sent", value: pipelineCounts.SENT, tone: "sent" },
            { label: "Won / Lost", value: pipelineCounts.WON + pipelineCounts.LOST, tone: "closed" }
          ].map((item) => (
            <div className={`card pipeline-card pipeline-${item.tone}`} key={item.label}>
              <span className="eyebrow">{item.label}</span>
              <strong className="dashboard-summary-value">{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="frame stack">
        <div className="section-head">
          <span className="eyebrow">Needs Attention</span>
          <h2>Urgency-ranked proposals to handle first</h2>
        </div>
        <div className="list">
          {needsAttentionCards.length > 0 ? (
            needsAttentionCards.map((card) => (
              <div className="card attention-card" key={card.proposal.id}>
                <div className="row spread start">
                  <div className="stack">
                    <strong>{card.proposal.title}</strong>
                    <p className="muted">{buildHealthLine(card)}</p>
                  </div>
                  <div className="attention-badges">
                    {getAttentionBadges(card).map((badge) => (
                      <span className={`pill ${badge.tone}`} key={badge.label}>
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </div>
                <p>{card.proposal.summary}</p>
                <p className="muted">Next step: {getNextStep(card)}</p>
              </div>
            ))
          ) : (
            <p className="muted">No proposals currently need urgent attention.</p>
          )}
        </div>
      </section>
      <section className="frame stack">
        <div className="section-head">
          <span className="eyebrow">All Proposals</span>
          <h2>Filter by status and domain, then work the queue in priority order</h2>
        </div>
        <form className="dashboard-filters grid two" method="GET">
          <label className="input-group">
            <span className="field-label">Status</span>
            <select defaultValue={params.status ?? "ALL"} name="status">
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="SENT">Sent</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
          </label>
          <label className="input-group">
            <span className="field-label">Domain</span>
            <select defaultValue={params.domain ?? "ALL"} name="domain">
              <option value="ALL">All domains</option>
              {domainOptions.map((domain) => (
                <option key={domain} value={domain}>
                  {getProposalDomainLabel(domain)}
                </option>
              ))}
            </select>
          </label>
          <div className="action-row">
            <button className="cta" type="submit">
              Apply filters
            </button>
            <Link className="ghost-button" href="/proposals">
              Clear filters
            </Link>
          </div>
          <p className="muted dashboard-filter-summary">
            Showing {filteredCards.length} of {proposalCards.length} proposals. Exported:{" "}
            {exportedCount}.
          </p>
        </form>
        <div className="list">
          {filteredCards.map(({ proposal, exports }) => (
            <div
              className={`card proposal-card stack ${params.generated === proposal.id ? "highlight-surface" : ""}`}
              id={`proposal-${proposal.id}`}
              key={proposal.id}
            >
              <div className="stack">
                <div className="row spread start">
                  <div className="stack proposal-card-head">
                    <strong>{proposal.title}</strong>
                    <div className="attention-badges">
                      <span className={`status-badge status-${proposal.status.toLowerCase()}`}>
                        {proposal.status.replace("_", " ")}
                      </span>
                      {getAttentionBadges({ proposal, exports }).map((badge) => (
                        <span className={`pill ${badge.tone}`} key={badge.label}>
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="proposal-next-step">
                    Next: {getNextStep({ proposal, exports })}
                  </span>
                </div>
                {params.generated === proposal.id ? (
                  <div className="card proposal-highlight-card">
                    <strong>Newly generated proposal</strong>
                    <p className="muted">
                      Review this draft, move it into review, then export HTML or PDF directly from
                      the actions below.
                    </p>
                  </div>
                ) : null}
                <p>{proposal.summary}</p>
                <p className="muted">{buildHealthLine({ proposal, exports })}</p>
                <p className="price-range">Suggested price range: {proposal.priceRange}</p>
              </div>
              <div className="grid three">
                <div>
                  <strong>Scope</strong>
                  <ul className="feature-list">
                    {proposal.scope.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Deliverables</strong>
                  <ul className="feature-list">
                    {proposal.deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Timeline and tasks</strong>
                  <ul className="feature-list">
                    {proposal.taskBreakdown.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid two">
                <div>
                  <strong>Risks</strong>
                  <ul className="feature-list">
                    {proposal.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Assumptions</strong>
                  <ul className="feature-list">
                    {proposal.assumptions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="stack">
                <ProposalCardActions currentStatus={proposal.status} proposalId={proposal.id} />
                <div className="action-row">
                  <Link className="ghost-button" href={`/proposals/${proposal.id}`}>
                    Open detail view
                  </Link>
                  <Link className="ghost-button" href="/proposals/new">
                    Duplicate as new draft
                  </Link>
                </div>
                {exports.length > 0 && (
                  <p className="muted">
                    Latest export: <a href={exports[0].filePath}>{exports[0].fileName}</a>
                  </p>
                )}
              </div>
            </div>
          ))}
          {filteredCards.length === 0 ? (
            <div className="empty-state">
              <strong>
                {proposalCards.length
                  ? "No proposals match the current filters"
                  : "No proposals yet"}
              </strong>
              <p className="muted">
                {proposalCards.length
                  ? "Clear or change the filters to see more proposals."
                  : "Create the first proposal from project context, briefing context, or direct input."}
              </p>
              <Link className="cta" href="/proposals/new">
                Create the first proposal
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

type ProposalCard =
  Awaited<ReturnType<typeof listExportsForProposal>> extends infer T
    ? { proposal: Proposal; exports: T extends Array<infer Export> ? Export[] : never }
    : never;

function countByStatus(proposals: Proposal[]) {
  return proposals.reduce(
    (result, proposal) => {
      result[proposal.status] += 1;
      return result;
    },
    {
      DRAFT: 0,
      IN_REVIEW: 0,
      SENT: 0,
      WON: 0,
      LOST: 0
    } satisfies Record<ProposalStatus, number>
  );
}

function getProposalAttentionScore({ proposal, exports }: ProposalCard) {
  let score = 0;

  if (proposal.status === "DRAFT") {
    score += 35;
  }

  if (proposal.status === "IN_REVIEW") {
    score += 45;
  }

  if (proposal.status === "SENT") {
    score += 25;
  }

  if (isDueSoon(proposal)) {
    score += 35;
  }

  if (exports.length === 0 && (proposal.status === "IN_REVIEW" || proposal.status === "SENT")) {
    score += 20;
  }

  if (proposal.risks.length >= 3) {
    score += 10;
  }

  return score;
}

function getAttentionBadges(card: ProposalCard) {
  const badges: Array<{ label: string; tone: string }> = [];

  if (isDueSoon(card.proposal)) {
    badges.push({ label: "due soon", tone: "pill-alert" });
  }

  if (card.proposal.status === "IN_REVIEW") {
    badges.push({ label: "awaiting review", tone: "pill-neutral" });
  }

  if (card.proposal.status === "DRAFT" && card.exports.length === 0) {
    badges.push({ label: "needs export", tone: "" });
  }

  if (card.proposal.status === "SENT") {
    badges.push({ label: "follow up", tone: "" });
  }

  if (card.proposal.status === "IN_REVIEW" && card.exports.length > 0) {
    badges.push({ label: "ready to send", tone: "" });
  }

  return badges;
}

function getNextStep({ proposal, exports }: ProposalCard) {
  if (proposal.status === "DRAFT") {
    return exports.length > 0 ? "Move into review" : "Create export and review pricing";
  }

  if (proposal.status === "IN_REVIEW") {
    return exports.length > 0 ? "Ready to send" : "Export deliverable for approval";
  }

  if (proposal.status === "SENT") {
    return "Follow up with client";
  }

  if (proposal.status === "WON") {
    return "Prepare kickoff";
  }

  return "Archive learnings";
}

function isDueSoon(proposal: Proposal) {
  if (!proposal.dueDate) {
    return false;
  }

  const dueDate = new Date(`${proposal.dueDate}T00:00:00Z`);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = diffMs / (24 * 60 * 60 * 1000);

  return diffDays <= 7;
}

function buildHealthLine({ proposal, exports }: ProposalCard) {
  return [
    `Client: ${proposal.clientName}`,
    proposal.projectType ? `Type: ${proposal.projectType}` : null,
    proposal.projectDomain
      ? `Domain: ${getProposalDomainLabel(proposal.projectDomain, proposal.projectDomainOther)}`
      : null,
    proposal.startDate
      ? `Start: ${formatProposalDate(proposal.startDate) ?? proposal.startDate}`
      : null,
    proposal.dueDate
      ? `Deadline: ${formatProposalDate(proposal.dueDate) ?? proposal.dueDate}`
      : null,
    proposal.timeline ? `Timeline: ${proposal.timeline}` : null,
    proposal.sourceLabel ? `Source: ${proposal.sourceLabel}` : null,
    exports.length > 0 ? "Export ready" : "No export yet"
  ]
    .filter(Boolean)
    .join(" • ");
}
