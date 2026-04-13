export type BriefingItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  requiresAction: boolean;
};

export type BriefingSummary = {
  title: string;
  body: string;
};

export type DailyBriefing = {
  summary: BriefingSummary;
  items: BriefingItem[];
  counts: {
    meetings: number;
    emailsNeedingProposal: number;
    totalActions: number;
  };
};
