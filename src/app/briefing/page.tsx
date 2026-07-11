import Link from "next/link";

import { formatProposalDate } from "@/lib/date";
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
  const urgentItems = briefing.items.filter((item) => item.urgency === "now");
  const todayItems = briefing.items.filter((item) => item.urgency === "today");
  const fyiItems = briefing.items.filter((item) => item.urgency === "fyi");

  return (
    <main className="stack">
      <section className="frame hero">
        <span className="eyebrow">Morning Briefing</span>
        <h1>{briefing.summary.title}</h1>
        <p>{briefing.summary.body}</p>
        <div className="grid three focus-today-grid">
          {briefing.focusToday.map((item) => (
            <div className={`card focus-card focus-${item.tone}`} key={item.label}>
              <span className="eyebrow">{item.label}</span>
              <strong className="focus-value">{item.value}</strong>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
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
      <section className="frame stack">
        <div className="section-head">
          <span className="eyebrow">Focus Today</span>
          <h2>Ranked by urgency and next action</h2>
        </div>
        <div className="grid three">
          <div className="card urgency-column">
            <div className="urgency-head">
              <span className="pill pill-alert">Needs action now</span>
              <strong>{urgentItems.length} item{urgentItems.length === 1 ? "" : "s"}</strong>
            </div>
            <div className="list">
              {urgentItems.length > 0 ? (
                urgentItems.map((item) => (
                  <div className="card urgency-card" key={item.id}>
                    <strong>{item.title}</strong>
                    <p>{item.summary}</p>
                    <p className="muted">{item.reason}</p>
                    <span className="pill">{item.actionLabel ?? "Review"}</span>
                  </div>
                ))
              ) : (
                <p className="muted">No immediate action items right now.</p>
              )}
            </div>
          </div>
          <div className="card urgency-column">
            <div className="urgency-head">
              <span className="pill pill-neutral">Watch today</span>
              <strong>{todayItems.length} item{todayItems.length === 1 ? "" : "s"}</strong>
            </div>
            <div className="list">
              {todayItems.length > 0 ? (
                todayItems.map((item) => (
                  <div className="card urgency-card" key={item.id}>
                    <strong>{item.title}</strong>
                    <p>{item.summary}</p>
                    <p className="muted">{item.reason}</p>
                    <span className="pill pill-neutral">{item.actionLabel ?? "Review"}</span>
                  </div>
                ))
              ) : (
                <p className="muted">No medium-priority items to watch today.</p>
              )}
            </div>
          </div>
          <div className="card urgency-column">
            <div className="urgency-head">
              <span className="pill">FYI</span>
              <strong>{fyiItems.length} item{fyiItems.length === 1 ? "" : "s"}</strong>
            </div>
            <div className="list">
              {fyiItems.length > 0 ? (
                fyiItems.map((item) => (
                  <div className="card urgency-card" key={item.id}>
                    <strong>{item.title}</strong>
                    <p>{item.summary}</p>
                    <p className="muted">{item.reason}</p>
                  </div>
                ))
              ) : (
                <p className="muted">No low-priority updates waiting in the queue.</p>
              )}
            </div>
          </div>
        </div>
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
                <div className="row spread start">
                  <strong>{email.subject}</strong>
                  <span className="pill pill-alert">needs proposal</span>
                </div>
                <p className="muted">{email.preview}</p>
                <div className="stack handoff-reasons">
                  <div className="handoff-reason">
                    <strong>Why this should move now</strong>
                    <p className="muted">
                      Requested quote, concrete scope, and a short deadline window make this
                      the clearest next proposal action.
                    </p>
                  </div>
                  <div className="handoff-reason">
                    <strong>Recommended action</strong>
                    <p className="muted">
                      Create a proposal seed, confirm timeline assumptions, and carry the
                      project context into the generator.
                    </p>
                  </div>
                </div>
                <div className="stack">
                  <div className="action-row">
                    <Link className="cta" href={`/proposals/new?briefingItemId=${email.id}`}>
                      Create proposal from this item
                    </Link>
                    <Link className="ghost-button" href="/proposals">
                      Review active proposals first
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {dueProposal ? (
              <div className="card">
                <strong>{dueProposal.title}</strong>
                <p className="muted">
                  Existing proposal due this week: {formatProposalDate(dueProposal.dueDate) ?? "TBD"}. Keep this in
                  view while generating the new quote.
                </p>
                <Link className="ghost-button" href="/proposals">
                  View proposal dashboard
                </Link>
              </div>
            ) : (
              <div className="card">
                <strong>No saved proposals yet</strong>
                <p className="muted">
                  Generated proposals will appear here once PCC creates and saves a real record.
                </p>
                <Link className="ghost-button" href="/proposals/new">
                  Start a proposal
                </Link>
              </div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
