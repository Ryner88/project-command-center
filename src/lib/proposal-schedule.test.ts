import { describe, expect, it } from "vitest";

import { parseDateInput } from "@/lib/date";
import {
  buildProposalSchedule,
  getProposalScheduleDisplay,
  validateProposalDeadline
} from "@/lib/proposal-schedule";

const genericTasks = [
  "Week 1: discovery",
  "Week 2-3: design",
  "Week 4-5: implementation and QA",
  "Week 6: handoff"
];

describe("proposal scheduling", () => {
  it("fits a short valid project into the selected dates", () => {
    const display = getProposalScheduleDisplay({
      startDate: "2026-11-01",
      dueDate: "2026-12-20",
      timeline: "4-6 weeks",
      taskBreakdown: genericTasks
    });

    expect(validateProposalDeadline("2026-12-20", "2026-11-01")).toBeNull();
    expect(display.timeline).toBe("7 weeks delivery plan");
    expect(display.schedule?.phases.at(-1)?.endDate.toISOString().slice(0, 10)).toBe("2026-12-20");
  });

  it("uses explicit cross-year dates for duration and every phase", () => {
    const proposal = {
      startDate: "2026-11-01",
      dueDate: "2027-06-15",
      timeline: "4-6 weeks",
      taskBreakdown: genericTasks
    };
    const display = getProposalScheduleDisplay(proposal);

    expect(display.timeline).toBe("32 weeks 2 days delivery plan");
    expect(display.schedule?.totalDays).toBe(226);
    expect(display.schedule?.phases[0].startDate.toISOString().slice(0, 10)).toBe("2026-11-01");
    expect(display.schedule?.phases.at(-1)?.endDate.toISOString().slice(0, 10)).toBe("2027-06-15");
    expect(display.taskBreakdown).toHaveLength(4);
    expect(display.taskBreakdown.join(" ")).not.toMatch(/Week [1-6]|4-6 weeks/);
    expect(display.taskBreakdown[0]).toContain("Nov 1-Dec 3, 2026");
  });

  it("rejects a short delivery window and invalid calendar dates", () => {
    expect(validateProposalDeadline("2026-11-07", "2026-11-01")).toMatch(/too soon/);
    expect(validateProposalDeadline("2026-02-30", "2026-01-01")).toBe(
      "Enter a valid deadline date."
    );
    expect(validateProposalDeadline(undefined, "2026-02-30")).toBe("Enter a valid start date.");
    expect(parseDateInput("2026-02-30")).toBeUndefined();
  });

  it("flags contradictory saved dates without changing their source data", () => {
    const proposal = {
      startDate: "2027-06-15",
      dueDate: "2026-11-01",
      timeline: "4-6 weeks",
      taskBreakdown: genericTasks
    };
    const display = getProposalScheduleDisplay(proposal);

    expect(buildProposalSchedule(proposal.dueDate, genericTasks, proposal.startDate)).toBeNull();
    expect(display.timeline).toMatch(/needs review/);
    expect(proposal.timeline).toBe("4-6 weeks");
    expect(proposal.taskBreakdown).toEqual(genericTasks);
  });
});
