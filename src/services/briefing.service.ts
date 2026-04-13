import { generateBriefingSummary } from "@/services/ai/briefing-ai.service";
import { fetchCalendarEvents } from "@/services/integrations/calendar.service";
import { fetchImportantEmails } from "@/services/integrations/gmail.service";
import type { DailyBriefing } from "@/types/briefing";

export async function getTodayBriefing(): Promise<DailyBriefing> {
  const [events, emails] = await Promise.all([
    fetchCalendarEvents(),
    fetchImportantEmails()
  ]);

  const items = [
    ...events.map((event) => ({
      id: event.id,
      title: event.title,
      summary: `${event.startTime} - ${event.endTime} with ${event.attendee} • ${event.summary}`,
      source: "calendar",
      requiresAction: false
    })),
    ...emails.map((email) => ({
      id: email.id,
      title: email.subject,
      summary: email.preview,
      source: "email",
      requiresAction: email.requiresProposal
    }))
  ];

  const summary = await generateBriefingSummary(items);

  return {
    summary,
    items,
    counts: {
      meetings: events.length,
      emailsNeedingProposal: emails.filter((email) => email.requiresProposal).length,
      totalActions: items.filter((item) => item.requiresAction).length
    }
  };
}
