import { mockCalendarEvents } from "@/data/mock-calendar-events";
import type { CalendarEvent } from "@/types/integrations";

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  return mockCalendarEvents;
}
