export type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  attendee: string;
  summary: string;
};

export type ImportantEmail = {
  id: string;
  from: string;
  subject: string;
  preview: string;
  requiresProposal: boolean;
  category: "quote_request" | "existing_proposal" | "informational";
};
