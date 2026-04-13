import Link from "next/link";

import { getTodayBriefing } from "@/services/briefing.service";
import { fetchCalendarEvents } from "@/services/integrations/calendar.service";
import { fetchImportantEmails } from "@/services/integrations/gmail.service";
import { listProposals } from "@/services/proposal.service";

export const dynamic = "force-dynamic";

export default async function BriefingPage() {
  const [briefing, events, emails, proposals] = await Promise.all([
    getTodayBriefing(),
    fetchCalendarEvents(),
    fetchImportantEmails(),
    listProposals()
  ]);
  const emailsNeedingProposal = emails.filter((email) => email.requiresProposal);
  const dueProposal = proposals[0];

  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">Morning Briefing</span>
        <h1>{briefing.summary.title}</h1>
        <p>{briefing.summary.body}</p>
      </section>
      <section className="grid two">
        <article className="frame stack">
          <span className="pill">Today</span>
          <h2>1 upcoming sales call</h2>
          <p>Today&apos;s briefing centers on a live website opportunity and the proposal work it should trigger.</p>
        </article>
        <article className="frame stack">
          <span className="pill">Proposals</span>
          <h2>1 quote request to turn into a proposal</h2>
          <p>The story is intentionally tight: one quote request, one sales call, and one existing proposal due this week.</p>
        </article>
      </section>
      <section className="grid two">
        <article className="frame stack">
          <div className="section-head">
            <span className="eyebrow">Calendar</span>
            <h2>Calendar snapshot</h2>
          </div>
          <div className="list">
            {events.map((event) => (
              <div className="card event-card" key={event.id}>
                <div className="row spread">
                  <strong>{event.title}</strong>
                  <span className="pill">calendar</span>
                </div>
                <p>
                  {event.startTime} - {event.endTime} with {event.attendee}
                </p>
                <p className="muted">{event.summary}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="frame stack">
          <div className="section-head">
            <span className="eyebrow">Inbox</span>
            <h2>Important emails</h2>
          </div>
          <div className="list">
            {emails.map((email) => (
              <div className="card" key={email.id}>
                <div className="row spread">
                  <strong>{email.subject}</strong>
                  <span className={`pill ${email.requiresProposal ? "pill-alert" : "pill-neutral"}`}>
                    {email.category.replaceAll("_", " ")}
                  </span>
                </div>
                <p>{email.from}</p>
                <p className="muted">{email.preview}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className="grid two">
        <article className="frame stack">
          <div className="section-head">
            <span className="eyebrow">Briefing</span>
            <h2>Today&apos;s priorities</h2>
          </div>
          <div className="list">
            {briefing.items.map((item) => (
              <div className="card" key={item.id}>
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
                <span className="pill">{item.source}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="frame stack">
          <div className="section-head">
            <span className="eyebrow">Handoff</span>
            <h2>Proposal handoff</h2>
          </div>
          <p>
            Proposal seeds formalize context from briefing items, emails, or
            manual inputs before proposal generation.
          </p>
          <div className="list">
            {emailsNeedingProposal.map((email) => (
              <div className="card highlight-card" key={email.id}>
                <strong>{email.subject}</strong>
                <p className="muted">{email.preview}</p>
                <div className="stack">
                  <span className="pill pill-alert">ready for proposal seed</span>
                  <Link className="cta" href={`/proposals/new?briefingItemId=${email.id}`}>
                    Create proposal from this item
                  </Link>
                </div>
              </div>
            ))}
            <div className="card">
              <strong>{dueProposal.title}</strong>
              <p className="muted">
                Existing proposal due this week: {dueProposal.dueDate}. Keep this in view while generating the new quote.
              </p>
              <Link className="ghost-button" href="/proposals">
                View proposal dashboard
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
