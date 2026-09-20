import Link from "next/link";
import { LoadDemoWorkspaceButton } from "@/components/demo/load-demo-workspace-button";
import { getDataMode } from "@/services/data-mode.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const mode = await getDataMode();
  return (
    <main className="home stack">
      <section className="home-hero">
        <div className="home-message">
          <span className="eyebrow">Project Command Center</span>
          <h1>Turn today&apos;s client signals into a proposal you can send.</h1>
          <p>
            Review the morning briefing, generate a scoped proposal, then manage status and exports
            from the dashboard.
          </p>
          <div className="action-row primary-actions">
            <Link className="cta" href="/briefing">
              Start workflow
            </Link>
            <Link className="ghost-button" href="/proposals/new">
              New proposal
            </Link>
            <Link className="ghost-button" href="/proposals">
              Dashboard
            </Link>
          </div>
          {mode === "demo" ? (
            <div className="demo-callout stack" aria-label="Demo workspace controls">
              <strong>Demo mode is empty until you choose to load sample work.</strong>
              <p>
                Sample records stay in this local demo workspace and are never loaded in production.
              </p>
              <LoadDemoWorkspaceButton />
            </div>
          ) : null}
        </div>

        <aside className="workflow-card" aria-label="Recommended workflow">
          <span className="pill">Workflow</span>
          <h2>Recommended path</h2>
          <ol className="workflow-list">
            <li>
              <strong>Briefing</strong>
              <span>Find the request that needs action.</span>
            </li>
            <li>
              <strong>Generate</strong>
              <span>Convert context into scope, pricing, and timeline.</span>
            </li>
            <li>
              <strong>Review</strong>
              <span>Track status, export HTML, and export PDF.</span>
            </li>
          </ol>
        </aside>
      </section>

      <section className="proof-grid" aria-label="Product status">
        <article className="proof-card">
          <span className="proof-value">3</span>
          <strong>Core checkpoints</strong>
          <p>Briefing, proposal creation, and dashboard review.</p>
        </article>
        <article className="proof-card">
          <span className="proof-value">PDF</span>
          <strong>Export ready</strong>
          <p>Proposal exports include HTML and PDF delivery paths.</p>
        </article>
        <article className="proof-card">
          <span className="proof-value">Live</span>
          <strong>Neon persistence</strong>
          <p>Production proposals are stored in Postgres.</p>
        </article>
        <article className="proof-card">
          <span className="proof-value">Explicit</span>
          <strong>Demo workspace</strong>
          <p>Sample proposal data loads only when you request it outside production.</p>
        </article>
      </section>
    </main>
  );
}
