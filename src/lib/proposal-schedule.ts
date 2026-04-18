import {
  addUtcDays,
  formatProposalDate,
  formatProposalDateRange,
  getTodayUtcDate,
  parseDateInput
} from "@/lib/date";

const PHASE_CONFIG = [
  {
    title: "Discovery and planning",
    durationDays: 7
  },
  {
    title: "Execution and reviews",
    durationDays: 21
  },
  {
    title: "QA and final revisions",
    durationDays: 14
  },
  {
    title: "Handoff and closeout",
    durationDays: 7
  }
] as const;

const TOTAL_SCHEDULE_DAYS = PHASE_CONFIG.reduce(
  (sum, phase) => sum + phase.durationDays,
  0
);

export function getProposalMinimumLeadDays() {
  return TOTAL_SCHEDULE_DAYS - 1;
}

export function validateProposalDeadline(
  dueDate?: string,
  today: Date = getTodayUtcDate()
) {
  if (!dueDate) {
    return null;
  }

  const deadline = parseDateInput(dueDate);

  if (!deadline) {
    return "Enter a valid deadline date.";
  }

  const minimumDeadline = addUtcDays(today, getProposalMinimumLeadDays());

  if (deadline < minimumDeadline) {
    return `Deadline is too soon for the planned schedule. Choose ${formatProposalDate(
      toDateInput(minimumDeadline)
    )} or later to fit the minimum 7-week plan.`;
  }

  return null;
}

export function buildProposalSchedule(
  dueDate: string,
  taskBreakdown: string[]
) {
  const deadline = parseDateInput(dueDate);

  if (!deadline) {
    return null;
  }

  const phases = [];
  let phaseEnd = deadline;

  for (let index = PHASE_CONFIG.length - 1; index >= 0; index -= 1) {
    const config = PHASE_CONFIG[index];
    const phaseStart = addUtcDays(phaseEnd, -(config.durationDays - 1));
    const item = taskBreakdown[index] ?? config.title;

    phases.unshift({
      index,
      title: config.title,
      detail: normalizeTaskDetail(item),
      rangeLabel: formatProposalDateRange(phaseStart, phaseEnd),
      startDate: phaseStart,
      endDate: phaseEnd
    });

    phaseEnd = addUtcDays(phaseStart, -1);
  }

  return {
    phases,
    totalWeeks: TOTAL_SCHEDULE_DAYS / 7,
    totalDays: TOTAL_SCHEDULE_DAYS,
    startDate: phases[0]?.startDate,
    endDate: deadline,
    deadlineLabel: formatProposalDate(dueDate)
  };
}

function normalizeTaskDetail(value: string) {
  const parts = value.split(":");
  return parts.length > 1 ? parts.slice(1).join(":").trim() : value.trim();
}

function toDateInput(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
