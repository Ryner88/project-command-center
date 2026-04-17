import { ProposalGeneratorForm } from "@/components/proposals/proposal-generator-form";
import { getProposalDomainLabel } from "@/lib/proposal-domain";
import {
  ensureProposalSeedForBriefingItem,
  getProposalSeedById
} from "@/services/proposal-seed.service";

export const dynamic = "force-dynamic";

type NewProposalPageProps = {
  searchParams: Promise<{
    seedId?: string;
    briefingItemId?: string;
  }>;
};

export default async function NewProposalPage({ searchParams }: NewProposalPageProps) {
  const { seedId, briefingItemId } = await searchParams;
  const seed =
    (seedId ? await getProposalSeedById(seedId) : null) ??
    (briefingItemId ? await ensureProposalSeedForBriefingItem(briefingItemId) : null);
  const title = seed?.clientName
    ? `${seed.clientName} ${seed.projectType ?? "Project"} Proposal`
    : `${seed?.projectType ?? "Project"} Proposal`;

  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">New Proposal</span>
        <h1>Proposal generator and estimator</h1>
        <p>
          The estimator is implemented as the proposal creation flow rather than
          as a separate product module.
        </p>
      </section>
      <section className="grid two">
        <article className="frame stack">
          <div className="section-head">
            <span className="eyebrow">Source Context</span>
            <h2>{seed ? "Original seed or extracted source context" : "Start from your own input"}</h2>
          </div>
          <div className="card">
            <strong>{seed?.summary ?? "No built-in seed selected."}</strong>
            <p className="muted">
              {seed
                ? `Source: ${seed.sourceType}${seed.clientName ? ` for ${seed.clientName}` : ""}${seed.projectDomain ? ` • Domain: ${getProposalDomainLabel(seed.projectDomain)}` : ""}`
                : "Paste the client request or type proposal notes and PCC will generate a proposal from manual input."}
            </p>
            <p className="muted">
              {seed
                ? "This card shows the original seed only. The edited controls on the right are the actual inputs used for generation."
                : "Use the controls on the right to define the domain, working request, and summary that should drive the proposal output."}
            </p>
          </div>
          <div className="card">
            <strong>What will be generated</strong>
            <ul className="feature-list">
              <li>Project summary</li>
              <li>Scope and deliverables</li>
              <li>Task breakdown and timeline</li>
              <li>Risks, assumptions, and price range</li>
            </ul>
          </div>
        </article>
        <article className="frame stack">
          <div className="section-head">
            <span className="eyebrow">Generation Controls</span>
            <h2>Edited inputs used for the generated proposal</h2>
          </div>
          <ProposalGeneratorForm
            initialClientName={seed?.clientName ?? ""}
            initialProjectDomain={seed?.projectDomain}
            initialProjectType={seed?.projectType ?? ""}
            initialSummary={seed?.summary ?? ""}
            initialTitle={title}
            initialRawRequest={seed?.summary ?? ""}
            proposalSeedId={seed?.id}
          />
        </article>
      </section>
    </main>
  );
}
