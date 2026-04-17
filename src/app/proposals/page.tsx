import Link from "next/link";

import { ProposalCardActions } from "@/components/proposals/proposal-card-actions";
import { listExportsForProposal } from "@/services/export.service";
import { listProposals } from "@/services/proposal.service";

export const dynamic = "force-dynamic";

type ProposalsPageProps = {
  searchParams: Promise<{
    generated?: string;
    exported?: string;
    statusUpdated?: string;
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

  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">Proposal Dashboard</span>
        <h1>Track draft, sent, and won work in one place.</h1>
        <p>
          The dashboard anchors the proposal lifecycle while the generator lives
          under the same domain.
        </p>
        <Link className="cta" href="/proposals/new">
          Create new proposal
        </Link>
      </section>
      {(params.generated || params.exported || params.statusUpdated) && (
        <section className="frame">
          <p>
            {params.generated
              ? `Proposal ${params.generated} was generated.`
              : params.exported
                ? `Proposal ${params.exported} export is ready for download.`
                : `Proposal ${params.statusUpdated} status was updated.`}
          </p>
        </section>
      )}
      <section className="frame stack">
        <div className="section-head">
          <span className="eyebrow">Pipeline</span>
          <h2>Proposal dashboard</h2>
        </div>
        <div className="list">
          {proposalCards.map(({ proposal, exports }) => (
            <div className="card proposal-card stack" key={proposal.id}>
              <div className="stack">
                <div className="row spread start">
                  <strong>{proposal.title}</strong>
                  <span className={`status-badge status-${proposal.status.toLowerCase()}`}>
                    {proposal.status.replace("_", " ")}
                  </span>
                </div>
                <p>{proposal.summary}</p>
                <p className="muted">
                  Client: {proposal.clientName}
                  {proposal.timeline ? ` • Timeline: ${proposal.timeline}` : ""}
                  {proposal.sourceLabel ? ` • Source: ${proposal.sourceLabel}` : ""}
                  {proposal.dueDate ? ` • Due: ${proposal.dueDate}` : ""}
                </p>
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
                <ProposalCardActions
                  currentStatus={proposal.status}
                  proposalId={proposal.id}
                />
                {exports.length > 0 && (
                  <p className="muted">
                    Latest export:{" "}
                    <a href={exports[0].filePath}>
                      {exports[0].fileName}
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
