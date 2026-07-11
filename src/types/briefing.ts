export type BriefingItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  requiresAction: boolean;
  urgency: "now" | "today" | "fyi";
  actionLabel?: string;
  reason?: string;
};

export type BriefingSummary = {
  title: string;
  body: string;
};

export type FocusTodayItem = {
  label: string;
  value: string;
  tone: "alert" | "neutral" | "calm";
  detail: string;
};

export type DailyBriefing = {
  summary: BriefingSummary;
  items: BriefingItem[];
  focusToday: FocusTodayItem[];
  counts: {
    meetings: number;
    emailsNeedingProposal: number;
    totalActions: number;
  };
};
