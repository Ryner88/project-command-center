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
  if (!dueDate) {
    return null;
  }

  const deadline = parseDateInput(dueDate);

  if (!deadline) {
    return "Enter a valid deadline date.";
  }

  const requestedStartDate = parseDateInput(startDate);

  if (startDate && !requestedStartDate) {
    return "Enter a valid start date.";
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

  if (requestedStartDate && requestedStartDate <= deadline) {
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
    deadlineLabel: formatProposalDate(toDateInput(deadline))
  };
}

function buildForwardProposalSchedule(startDate: Date, deadline: Date, taskBreakdown: string[]) {
  const totalDays = getInclusiveDateSpan(startDate, deadline);
  const phaseLengths = allocatePhaseDays(totalDays);
  const phases = [];
  let phaseStart = startDate;

  for (let index = 0; index < PHASE_CONFIG.length; index += 1) {
    const config = PHASE_CONFIG[index];
    const durationDays = phaseLengths[index];
    const phaseEnd = addUtcDays(phaseStart, durationDays - 1);
    const item = taskBreakdown[index] ?? config.title;

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
    totalWeeks: totalDays / 7,
    totalDays,
    startDate,
    endDate: deadline,
    deadlineLabel: formatProposalDate(toDateInput(deadline))
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

function toDateInput(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
