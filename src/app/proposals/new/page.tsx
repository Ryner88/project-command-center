import { ProposalGeneratorForm } from "@/components/proposals/proposal-generator-form";
import {
  ensureProposalSeedForBriefingItem,
  getProposalSeedById,
  getSampleProposalSeed
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
    (briefingItemId ? await ensureProposalSeedForBriefingItem(briefingItemId) : null) ??
    (await getSampleProposalSeed());
  const title = seed.clientName
    ? `${seed.clientName} ${seed.projectType ?? "Project"} Proposal`
    : `${seed.projectType ?? "Project"} Proposal`;

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
            <h2>Extracted seed context</h2>
          </div>
          <div className="card">
            <strong>{seed.summary}</strong>
            <p className="muted">
              Source: {seed.sourceType} {seed.clientName ? `for ${seed.clientName}` : ""}
            </p>
            <p className="muted">
              Review and edit the extracted context before generation. This keeps the workflow trustworthy instead of feeling like raw AI output.
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
            <h2>Review and edit proposal inputs</h2>
          </div>
          <ProposalGeneratorForm
            initialClientName={seed.clientName ?? ""}
            initialProjectType={seed.projectType ?? ""}
            initialSummary={seed.summary}
            initialTitle={title}
            proposalSeedId={seed.id}
          />
        </article>
      </section>
    </main>
  );
}
