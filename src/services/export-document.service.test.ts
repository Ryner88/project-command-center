import { describe, expect, it } from "vitest";

import { renderProposalHtml } from "@/services/export-document.service";
import type { Proposal } from "@/types/proposal";

describe("proposal export schedule", () => {
  it("renders saved date boundaries and duration instead of a legacy generic timeline", () => {
    const proposal: Proposal = {
      id: "legacy-schedule",
      title: "Cross-year delivery proposal",
      clientName: "Synthetic Client",
      status: "DRAFT",
      startDate: "2026-11-01",
      dueDate: "2027-06-15",
      summary: "A synthetic project for schedule verification.",
      scope: ["Discovery", "Implementation"],
      deliverables: ["Working release"],
      taskBreakdown: [
        "Week 1: discovery",
        "Week 2-3: design",
        "Week 4-5: implementation and QA",
        "Week 6: handoff"
      ],
      timeline: "4-6 weeks",
      risks: ["Review availability"],
      assumptions: ["Stakeholder access"],
      priceRange: "$1,000 - $2,000"
    };

    const html = renderProposalHtml(proposal);

    expect(html).toContain("32 weeks 2 days delivery plan");
    expect(html).toContain("November 1, 2026");
    expect(html).toContain("June 15, 2027");
    expect(html).toContain("discovery");
    expect(html).toContain("handoff");
    expect(html).not.toContain("4-6 weeks");
    expect(html).not.toContain("Week 6");
  });
});
