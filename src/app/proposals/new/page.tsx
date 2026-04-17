import { ProposalGeneratorForm } from "@/components/proposals/proposal-generator-form";
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
            <span className="eyebrow">Review Step</span>
            <h2>{seed ? "Original extracted context" : "Start from your own text"}</h2>
          </div>
          <div className="card">
            <strong>{seed?.summary ?? "No built-in seed selected."}</strong>
            <p className="muted">
              {seed
                ? `Source: ${seed.sourceType}${seed.clientName ? ` for ${seed.clientName}` : ""}`
                : "Paste the client request or type proposal notes and PCC will build the same generator payload used by seeded proposals."}
            </p>
            <p className="muted">
              {seed
                ? "This card shows the original extracted context only. The edited inputs on the right are what PCC will use for generation."
                : "You can still override title, client, project type, and summary before generation if you want tighter control."}
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
            <span className="eyebrow">Control Step</span>
            <h2>Edited inputs used for generation</h2>
          </div>
          <ProposalGeneratorForm
            initialClientName={seed?.clientName ?? ""}
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
