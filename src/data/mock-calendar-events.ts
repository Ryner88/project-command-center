import type { CalendarEvent } from "@/types/integrations";

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "cal_1",
    title: "Sales call: Northstar Studio website redesign",
    startTime: "2:00 PM",
    endTime: "2:45 PM",
    attendee: "Sarah Chen",
    summary: "Discovery call for a 10-page marketing site redesign with CMS, case studies, and faster lead capture."
  },
  {
    id: "cal_2",
    title: "Pricing review: Acme proposal",
    startTime: "4:30 PM",
    endTime: "5:00 PM",
    attendee: "Internal team",
    summary: "Finalize price range and assumptions for the Acme proposal due this week."
  }
];
