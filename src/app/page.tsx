import Link from "next/link";

export default function HomePage() {
  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">Project Command Center</span>
        <h1>Judge demo: start with the briefing, generate a proposal, then review the dashboard.</h1>
        <p>
          This MVP runs in demo mode by default. Gmail and Calendar use local
          mock data, so no live OAuth connection is required to evaluate the
          product flow.
        </p>
        <div className="action-row">
          <Link className="cta" href="/briefing">
            Open Briefing
          </Link>
          <Link className="ghost-button" href="/proposals/new">
            Start New Proposal
          </Link>
          <Link className="ghost-button" href="/proposals">
            Open Proposal Dashboard
          </Link>
        </div>
        <div className="card demo-callout">
          <strong>Demo mode is active</strong>
          <p>
            Briefing content is sourced from mocked inbox and calendar records,
            and proposal generation falls back to a local template when no
            OpenAI key is configured.
          </p>
        </div>
      </section>
      <section className="grid two">
        <article className="frame stack">
          <span className="pill">Morning Briefing</span>
          <h2>Events, email signals, and proposal actions</h2>
          <p>
            Briefing items surface what matters today and can create proposal
            seeds when follow-up is needed.
          </p>
        </article>
        <article className="frame stack">
          <span className="pill">Proposal Workflow</span>
          <h2>Estimator folded into proposal creation</h2>
          <p>
            Proposal generation now lives under <code>/proposals/new</code>,
            which keeps dashboard, creation, export, and status changes in one
            domain.
          </p>
        </article>
      </section>
      <section className="grid three">
        <article className="frame stack">
          <span className="eyebrow">Step 1</span>
          <h2>Briefing</h2>
          <p>
            Review today&apos;s meeting and inbox signals, then open a proposal
            seed directly from the briefing.
          </p>
          <Link className="ghost-button" href="/briefing">
            Go to Briefing
          </Link>
        </article>
        <article className="frame stack">
          <span className="eyebrow">Step 2</span>
          <h2>New Proposal flow</h2>
          <p>
            Edit the extracted project context, generate the draft, and keep
            estimation inside the same workflow.
          </p>
          <Link className="ghost-button" href="/proposals/new">
            Go to New Proposal
          </Link>
        </article>
        <article className="frame stack">
          <span className="eyebrow">Step 3</span>
          <h2>Proposal Dashboard</h2>
          <p>
            Inspect proposal status, exports, risks, and pricing after
            generation.
          </p>
          <Link className="ghost-button" href="/proposals">
            Go to Dashboard
          </Link>
        </article>
      </section>
    </main>
  );
}
