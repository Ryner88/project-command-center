import { ProposalGeneratorForm } from "@/components/proposals/proposal-generator-form";
import { getProposalDomainLabel } from "@/lib/proposal-domain";
import {
  ensureProposalSeedForBriefingItem,
  getProposalSeedById
} from "@/services/proposal-seed.service";
import { getProject } from "@/services/project.service";

export const dynamic = "force-dynamic";

type NewProposalPageProps = {
  searchParams: Promise<{
    seedId?: string;
    briefingItemId?: string;
    projectId?: string;
  }>;
};

export default async function NewProposalPage({ searchParams }: NewProposalPageProps) {
  const { seedId, briefingItemId, projectId } = await searchParams;
  const project = projectId ? await getProject(projectId) : null;
  const seed =
    (seedId ? await getProposalSeedById(seedId) : null) ??
    (briefingItemId ? await ensureProposalSeedForBriefingItem(briefingItemId) : null);
  const title = project
    ? `${project.clientName} ${project.name} Proposal`
    : seed?.clientName
      ? `${seed.clientName} ${seed.projectType ?? "Project"} Proposal`
      : `${seed?.projectType ?? "Project"} Proposal`;

  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">New Proposal</span>
        <h1>Proposal generator and estimator</h1>
        <p>
          The estimator is implemented as the proposal creation flow rather than as a separate
          product module.
        </p>
        <div className="card source-context-card">
          <strong>Source context carried into generation</strong>
          <p>
            {seed
              ? `Using saved ${seed.sourceType.toLowerCase()} context${seed.clientName ? ` for ${seed.clientName}` : ""}${seed.projectType ? ` • ${seed.projectType}` : ""}.`
              : "No briefing seed selected, so this flow will create a proposal directly from manual input."}
          </p>
          <p className="muted">
            The controls below are prefilled from the selected source when available, then saved
            into the generated proposal record.
          </p>
        </div>
      </section>
      <section className="grid two">
        <article className="frame stack">
          <div className="section-head">
            <span className="eyebrow">Input Context</span>
            <h2>{seed ? "Original saved source input" : "Start from direct manual input"}</h2>
          </div>
          <div className="card">
            <strong>{seed?.summary ?? "No built-in seed selected."}</strong>
            <p className="muted">
              {seed
                ? `Source: ${seed.sourceType}${seed.clientName ? ` for ${seed.clientName}` : ""}${seed.projectDomain ? ` • Domain: ${getProposalDomainLabel(seed.projectDomain)}` : ""}`
                : "Enter the manual request details on the right and PCC will save a generated proposal from those exact inputs."}
            </p>
            <p className="muted">
              {seed
                ? "This card shows the original saved source only. The edited controls on the right are the actual inputs used for generation."
                : "Use the controls on the right to define the domain, working request, and summary that should drive the saved generated output."}
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
            <h2>Saved inputs used for the generated proposal</h2>
          </div>
          <div className="card">
            <strong>Context, timeline, and generation flow</strong>
            <p className="muted">
              Review the source context first, confirm dates and domain next, then generate a
              proposal that lands in the dashboard ready for export.
            </p>
          </div>
          <ProposalGeneratorForm
            projectId={project?.id}
            initialClientName={project?.clientName ?? seed?.clientName ?? ""}
            initialStartDate={project?.startDate ?? ""}
            initialDueDate={project?.dueDate ?? ""}
            initialProjectDomain={seed?.projectDomain}
            initialProjectDomainOther={seed?.projectDomainOther}
            initialProjectType={project?.name ?? seed?.projectType ?? ""}
            initialSummary={project?.description ?? seed?.summary ?? ""}
            initialTitle={title}
            initialRawRequest={project?.description ?? seed?.summary ?? ""}
            proposalSeedId={seed?.id}
          />
        </article>
      </section>
    </main>
  );
}
