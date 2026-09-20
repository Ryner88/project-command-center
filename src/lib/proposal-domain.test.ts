import { describe, expect, it } from "vitest";

import { buildProposalDraft, containsWebsiteLanguageForTesting } from "@/lib/proposal-domain";

const samples = [
  {
    clientName: "Northstar Coffee",
    projectType: "Website redesign",
    projectDomain: "WEBSITE" as const,
    summary:
      "Redesign a marketing website for a regional coffee brand with new location pages, case studies, and a flexible editing workflow."
  },
  {
    clientName: "LedgerLoop",
    projectType: "Fintech operations platform",
    projectDomain: "FINANCE" as const,
    summary:
      "Build a fintech operations platform for reconciliation workflows, approval routing, and payment operations visibility."
  },
  {
    clientName: "Riverview School District",
    projectType: "School family portal",
    projectDomain: "EDUCATION_SCHOOL" as const,
    summary:
      "Create a school portal that supports district administrators, educators, guardians, and students with accessible workflows and term-based rollout constraints."
  },
  {
    clientName: "Harbor Clinic Network",
    projectType: "Patient intake workflow platform",
    projectDomain: "MEDICAL_HEALTHCARE" as const,
    summary:
      "Design and implement a healthcare intake workflow platform with privacy-conscious data handling, operational approvals, and extra review checkpoints."
  }
];

describe("proposal domain drafting", () => {
  it("produces clearly different draft outputs across manual seed examples", () => {
    const drafts = samples.map((sample) => buildProposalDraft(sample));

    expect(drafts[0].deliverables.join(" ")).toMatch(/CMS|sitemap/i);
    expect(new Set(drafts.map((draft) => draft.timeline)).size).toBeGreaterThan(2);
    expect(new Set(drafts.map((draft) => draft.priceRange)).size).toBe(4);
    expect(new Set(drafts.map((draft) => draft.deliverables.join(" | "))).size).toBe(4);
  });

  it("keeps website-only wording out of non-website proposal sections", () => {
    for (const sample of samples.filter((item) => item.projectDomain !== "WEBSITE")) {
      const draft = buildProposalDraft(sample);
      const content = [
        draft.summary,
        ...draft.scope,
        ...draft.deliverables,
        ...draft.taskBreakdown,
        ...draft.risks,
        ...draft.assumptions
      ];

      expect(content.some((item) => containsWebsiteLanguageForTesting(item))).toBe(false);
    }
  });

  it("adds medical guardrails and school-specific language", () => {
    const schoolDraft = buildProposalDraft(samples[2]);
    const medicalDraft = buildProposalDraft(samples[3]);

    expect(schoolDraft.deliverables.join(" ")).toMatch(
      /administrators|educators|students|guardians/i
    );
    expect(schoolDraft.deliverables.join(" ")).toMatch(/accessible|WCAG/i);
    expect(schoolDraft.assumptions.join(" ")).toMatch(/privacy/i);
    expect(schoolDraft.risks.join(" ")).toMatch(/calendar/i);

    expect(medicalDraft.risks.join(" ")).toMatch(/review flag/i);
    expect(medicalDraft.deliverables.join(" ")).toMatch(/privacy|security/i);
    expect(medicalDraft.assumptions.join(" ")).toMatch(
      /does not make compliance certification claims/i
    );
  });
});
