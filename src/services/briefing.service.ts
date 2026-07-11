import { generateBriefingSummary } from "@/services/ai/briefing-ai.service";
import { fetchCalendarEvents } from "@/services/integrations/calendar.service";
import { fetchImportantEmails } from "@/services/integrations/gmail.service";
import type { BriefingItem, DailyBriefing } from "@/types/briefing";

export async function getTodayBriefing(): Promise<DailyBriefing> {
  const [events, emails] = await Promise.all([
    fetchCalendarEvents(),
    fetchImportantEmails()
  ]);

  const meetingsToday = events.length;
  const emailsNeedingProposal = emails.filter((email) => email.requiresProposal).length;
  const dueProposalEmail = emails.find((email) => email.category === "existing_proposal");

  const items: BriefingItem[] = [
    ...events.map(mapCalendarEventToBriefingItem),
    ...emails.map(mapEmailToBriefingItem)
  ].sort(compareBriefingItems);

  const summary = await generateBriefingSummary(items);

  return {
    summary,
    items,
    focusToday: [
      {
        label: "Proposal follow-up",
        value: `${emailsNeedingProposal}`,
        tone: emailsNeedingProposal > 0 ? "alert" : "calm",
        detail:
          emailsNeedingProposal > 0
            ? `${emailsNeedingProposal} quote request${emailsNeedingProposal === 1 ? "" : "s"} ready to convert into a proposal.`
            : "No new quote requests need proposal work."
      },
      {
        label: "Meetings today",
        value: `${meetingsToday}`,
        tone: meetingsToday > 0 ? "neutral" : "calm",
        detail:
          meetingsToday > 0
            ? `${meetingsToday} meeting${meetingsToday === 1 ? "" : "s"} on the calendar, including live client context.`
            : "No meetings scheduled today."
      },
      {
        label: "Due this week",
        value: dueProposalEmail ? "1" : "0",
        tone: dueProposalEmail ? "alert" : "calm",
        detail: dueProposalEmail
          ? "An existing proposal still needs pricing review before its deadline."
          : "No active proposal deadlines flagged."
      }
    ],
    counts: {
      meetings: meetingsToday,
      emailsNeedingProposal,
      totalActions: items.filter((item) => item.urgency !== "fyi").length
    }
  };
}

function compareBriefingItems(
  left: DailyBriefing["items"][number],
  right: DailyBriefing["items"][number]
) {
  const rank = {
    now: 0,
    today: 1,
    fyi: 2
  } as const;

  return rank[left.urgency] - rank[right.urgency];
}

function getEmailReason(email: Awaited<ReturnType<typeof fetchImportantEmails>>[number]) {
  switch (email.category) {
    case "quote_request":
      return "Requested quote, timeline pressure, and concrete scope are already present.";
    case "existing_proposal":
      return "Existing proposal deadline is approaching and pricing still needs review.";
    case "informational":
      return "Informational update with no immediate delivery decision required.";
  }
}

function mapCalendarEventToBriefingItem(
  event: Awaited<ReturnType<typeof fetchCalendarEvents>>[number]
): BriefingItem {
  const isSalesCall = event.title.toLowerCase().includes("sales call");

  return {
    id: event.id,
    title: event.title,
    summary: `${event.startTime} - ${event.endTime} with ${event.attendee} • ${event.summary}`,
    source: "calendar",
    requiresAction: isSalesCall,
    urgency: isSalesCall ? "today" : "fyi",
    actionLabel: isSalesCall ? "Prep for call" : "Keep on radar",
    reason: isSalesCall
      ? "Client-facing discovery call scheduled today."
      : "Internal milestone tied to active proposal work."
  };
}

function mapEmailToBriefingItem(
  email: Awaited<ReturnType<typeof fetchImportantEmails>>[number]
): BriefingItem {
  return {
    id: email.id,
    title: email.subject,
    summary: email.preview,
    source: "email",
    requiresAction: email.requiresProposal || email.category === "existing_proposal",
    urgency: email.requiresProposal
      ? "now"
      : email.category === "existing_proposal"
        ? "today"
        : "fyi",
    actionLabel: email.requiresProposal
      ? "Create proposal"
      : email.category === "existing_proposal"
        ? "Review due proposal"
        : "Read update",
    reason: getEmailReason(email)
  };
}
