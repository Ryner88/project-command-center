import Link from "next/link";

export default function HomePage() {
  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">Project Command Center</span>
        <h1>One workspace for your morning briefing and proposal pipeline.</h1>
        <p>
          This MVP skeleton focuses on the architecture: briefing ingestion,
          proposal seeds, AI-driven proposal generation, and PDF export.
        </p>
        <Link className="cta" href="/briefing">
          Open today&apos;s briefing
        </Link>
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
    </main>
  );
}
