import Link from "next/link";
import { notFound } from "next/navigation";

import { formatProposalDate } from "@/lib/date";
import { getProposalDomainLabel } from "@/lib/proposal-domain";
import { listExportsForProposal } from "@/services/export.service";
import { getProposalById } from "@/services/proposal.service";

type ProposalDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProposalDetailPage({
  params
}: ProposalDetailPageProps) {
  const { id } = await params;
  const proposal = await getProposalById(id);

  if (!proposal) {
    notFound();
  }

  const exports = await listExportsForProposal(proposal.id);

  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">Proposal Detail</span>
        <h1>{proposal.title}</h1>
        <p>
          Generated proposal record saved in PCC. This view renders the stored
          proposal content rather than a fixture.
        </p>
        <p className="muted">
          Client: {proposal.clientName}
          {proposal.projectType ? ` • Type: ${proposal.projectType}` : ""}
          {proposal.projectDomain
            ? ` • Domain: ${getProposalDomainLabel(proposal.projectDomain, proposal.projectDomainOther)}`
            : ""}
          {proposal.startDate
            ? ` • Start: ${formatProposalDate(proposal.startDate) ?? proposal.startDate}`
            : ""}
          {proposal.timeline ? ` • Timeline: ${proposal.timeline}` : ""}
          {proposal.dueDate
            ? ` • Deadline: ${formatProposalDate(proposal.dueDate) ?? proposal.dueDate}`
            : ""}
          {proposal.priceRange ? ` • ${proposal.priceRange}` : ""}
          {proposal.sourceLabel ? ` • Source: ${proposal.sourceLabel}` : ""}
        </p>
        <div className="action-row">
          <Link className="cta" href="/proposals">
            Back to dashboard
          </Link>
          <Link className="ghost-button" href="/proposals/new">
            Create another proposal
          </Link>
        </div>
      </section>
      <section className="frame stack">
        <div className="section-head">
          <span className="eyebrow">Summary</span>
          <h2>Saved proposal output</h2>
        </div>
        <div className="card">
          <p>{proposal.summary}</p>
        </div>
        {proposal.projectDomain === "MEDICAL_HEALTHCARE" ? (
          <div className="card">
            <strong>Review flag</strong>
            <p>
              Regulated medical or healthcare language requires legal, privacy,
              security, or compliance review before client delivery.
            </p>
          </div>
        ) : null}
        <div className="grid three">
          <div className="card">
            <strong>Scope</strong>
            <ul className="feature-list">
              {proposal.scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <strong>Deliverables</strong>
            <ul className="feature-list">
              {proposal.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <strong>Task breakdown</strong>
            <ul className="feature-list">
              {proposal.taskBreakdown.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid two">
          <div className="card">
            <strong>Risks</strong>
            <ul className="feature-list">
              {proposal.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <strong>Assumptions</strong>
            <ul className="feature-list">
              {proposal.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        {exports.length > 0 ? (
          <div className="card">
            <strong>Latest export preview</strong>
            <p className="muted">
              <a
                href={exports[0].filePath}
                rel="noreferrer"
                target="_blank"
              >
                {exports[0].fileName}
              </a>
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
