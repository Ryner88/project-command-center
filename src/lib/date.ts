export function formatProposalDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = parseDateInput(value);

  if (!parsed) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(parsed);
}

export function isValidDateInput(value?: string) {
  if (!value) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseDateInput(value?: string) {
  if (!value || !isValidDateInput(value)) {
    return undefined;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

export function addUtcDays(date: Date, days: number) {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function getTodayUtcDate() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function formatProposalDateRange(start: Date, end: Date) {
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

  const startMonth = start.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC"
  });
  const endMonth = end.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC"
  });
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();

  if (sameMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }

  if (sameYear) {
    return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
  }

  return `${startMonth} ${startDay}, ${start.getUTCFullYear()}-${endMonth} ${endDay}, ${end.getUTCFullYear()}`;
}
