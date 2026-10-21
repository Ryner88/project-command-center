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

const TOTAL_SCHEDULE_DAYS = PHASE_CONFIG.reduce((sum, phase) => sum + phase.durationDays, 0);

export function getProposalMinimumLeadDays() {
  return TOTAL_SCHEDULE_DAYS - 1;
}

export function validateProposalDeadline(
  dueDate?: string,
  startDate?: string,
  today: Date = getTodayUtcDate()
) {
  const requestedStartDate = parseDateInput(startDate);

  if (startDate && !requestedStartDate) {
    return "Enter a valid start date.";
  }

  if (!dueDate) {
    return null;
  }

  const deadline = parseDateInput(dueDate);

  if (!deadline) {
    return "Enter a valid deadline date.";
  }

  if (requestedStartDate && deadline < requestedStartDate) {
    return "Deadline must be on or after the requested start date.";
  }

  const scheduleAnchor = requestedStartDate ?? today;
  const minimumDeadline = addUtcDays(scheduleAnchor, getProposalMinimumLeadDays());

  if (deadline < minimumDeadline) {
    return `Deadline is too soon for the planned schedule. Choose ${formatProposalDate(
      toDateInput(minimumDeadline)
    )} or later to fit the minimum 7-week plan from the requested start date.`;
  }

  return null;
}

export function buildProposalSchedule(
  dueDate: string,
  taskBreakdown: string[],
  startDate?: string
) {
  const deadline = parseDateInput(dueDate);

  if (!deadline) {
    return null;
  }

  const requestedStartDate = parseDateInput(startDate);

  if (startDate && (!requestedStartDate || requestedStartDate > deadline)) {
    return null;
  }

  if (requestedStartDate) {
    return buildForwardProposalSchedule(requestedStartDate, deadline, taskBreakdown);
  }

  return buildBackplannedSchedule(deadline, taskBreakdown);
}

function buildBackplannedSchedule(deadline: Date, taskBreakdown: string[]) {
  const phases = [];
  let phaseEnd = deadline;

  for (let index = PHASE_CONFIG.length - 1; index >= 0; index -= 1) {
    const config = PHASE_CONFIG[index];
    const phaseStart = addUtcDays(phaseEnd, -(config.durationDays - 1));
    const item = getPhaseTaskDetail(taskBreakdown, index, config.title);

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
    deadlineLabel: formatProposalDate(toDateInput(deadline))
  };
}

function buildForwardProposalSchedule(startDate: Date, deadline: Date, taskBreakdown: string[]) {
  const calendarDays = getInclusiveDateSpan(startDate, deadline);
  const phaseLengths = allocatePhaseDays(calendarDays);
  const phases = [];
  let phaseStart = startDate;

  for (let index = 0; index < PHASE_CONFIG.length; index += 1) {
    const config = PHASE_CONFIG[index];
    const durationDays = phaseLengths[index];
    const phaseEnd = addUtcDays(phaseStart, durationDays - 1);
    const item = getPhaseTaskDetail(taskBreakdown, index, config.title);

    phases.push({
      index,
      title: config.title,
      detail: normalizeTaskDetail(item),
      rangeLabel: formatProposalDateRange(phaseStart, phaseEnd),
      startDate: phaseStart,
      endDate: phaseEnd
    });

    phaseStart = addUtcDays(phaseEnd, 1);
  }

  return {
    phases,
    totalWeeks: (calendarDays - 1) / 7,
    totalDays: calendarDays - 1,
    startDate,
    endDate: deadline,
    deadlineLabel: formatProposalDate(toDateInput(deadline))
  };
}

export function formatProposalDuration(totalDays: number) {
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  if (weeks > 0 && days > 0) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ${days} day${days === 1 ? "" : "s"}`;
  }

  if (weeks > 0) {
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }

  return `${days} day${days === 1 ? "" : "s"}`;
}

export function getProposalScheduleDisplay(proposal: {
  startDate?: string;
  dueDate?: string;
  timeline?: string;
  taskBreakdown: string[];
}) {
  if (!proposal.dueDate) {
    return { timeline: proposal.timeline, taskBreakdown: proposal.taskBreakdown, schedule: null };
  }

  const schedule = buildProposalSchedule(
    proposal.dueDate,
    proposal.taskBreakdown,
    proposal.startDate
  );

  if (!schedule) {
    return {
      timeline: "Schedule needs review: invalid start date or deadline",
      taskBreakdown: proposal.taskBreakdown,
      schedule: null
    };
  }

  return {
    timeline: `${formatProposalDuration(schedule.totalDays)} delivery plan`,
    taskBreakdown: schedule.phases.map((phase) => `${phase.rangeLabel}: ${phase.detail}`),
    schedule
  };
}

function allocatePhaseDays(totalDays: number) {
  const minimumDays = PHASE_CONFIG.length;

  if (totalDays <= minimumDays) {
    return PHASE_CONFIG.map((_, index) =>
      index === PHASE_CONFIG.length - 1 ? totalDays - index : 1
    );
  }

  const rawAllocations = PHASE_CONFIG.map(
    (phase) => (phase.durationDays / TOTAL_SCHEDULE_DAYS) * totalDays
  );
  const baseAllocations = rawAllocations.map((value) => Math.max(1, Math.floor(value)));
  let assignedDays = baseAllocations.reduce((sum, value) => sum + value, 0);

  while (assignedDays < totalDays) {
    const nextIndex = rawAllocations
      .map((value, index) => ({
        index,
        remainder: value - baseAllocations[index]
      }))
      .sort((left, right) => right.remainder - left.remainder)[0]?.index;

    if (nextIndex === undefined) {
      break;
    }

    baseAllocations[nextIndex] += 1;
    assignedDays += 1;
  }

  while (assignedDays > totalDays) {
    const nextIndex = baseAllocations.findIndex((value) => value > 1);

    if (nextIndex === -1) {
      break;
    }

    baseAllocations[nextIndex] -= 1;
    assignedDays -= 1;
  }

  return baseAllocations;
}

function getInclusiveDateSpan(startDate: Date, endDate: Date) {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor((endDate.getTime() - startDate.getTime()) / dayMs) + 1;
}

function normalizeTaskDetail(value: string) {
  const parts = value.split(":");
  return parts.length > 1 ? parts.slice(1).join(":").trim() : value.trim();
}

function getPhaseTaskDetail(taskBreakdown: string[], index: number, fallback: string) {
  if (index === PHASE_CONFIG.length - 1 && taskBreakdown.length > PHASE_CONFIG.length) {
    return taskBreakdown.slice(index).map(normalizeTaskDetail).join("; ");
  }

  return taskBreakdown[index] ?? fallback;
}

function toDateInput(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
