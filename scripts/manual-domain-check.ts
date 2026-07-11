import {
  buildProposalDraft,
  containsWebsiteLanguageForTesting,
  type ProposalDomain
} from "../src/lib/proposal-domain";

const seeds: Array<{
  name: string;
  clientName: string;
  projectType: string;
  projectDomain: ProposalDomain;
  summary: string;
}> = [
  {
    name: "website-project",
    clientName: "Northstar Coffee",
    projectType: "Website redesign",
    projectDomain: "WEBSITE",
    summary:
      "Redesign a marketing website for a regional coffee brand with new location pages, case studies, and a flexible editing workflow."
  },
  {
    name: "fintech-software-project",
    clientName: "LedgerLoop",
    projectType: "Fintech operations platform",
    projectDomain: "FINANCE",
    summary:
      "Build a fintech operations platform for reconciliation workflows, approval routing, and payment operations visibility."
  },
  {
    name: "school-project",
    clientName: "Riverview School District",
    projectType: "School family portal",
    projectDomain: "EDUCATION_SCHOOL",
    summary:
      "Create a school portal that supports district administrators, educators, guardians, and students with accessible workflows and term-based rollout constraints."
  },
  {
    name: "medical-project",
    clientName: "Harbor Clinic Network",
    projectType: "Patient intake workflow platform",
    projectDomain: "MEDICAL_HEALTHCARE",
    summary:
      "Design and implement a healthcare intake workflow platform with privacy-conscious data handling, operational approvals, and extra review checkpoints."
  }
];

for (const seed of seeds) {
  const draft = buildProposalDraft(seed);
  const bannedMentions = [
    draft.summary,
    ...draft.scope,
    ...draft.deliverables,
    ...draft.taskBreakdown,
    ...draft.risks,
    ...draft.assumptions
  ].filter((item) => containsWebsiteLanguageForTesting(item));

  console.log(`\n=== ${seed.name} (${seed.projectDomain}) ===`);
  console.log(`Timeline: ${draft.timeline}`);
  console.log(`Price: ${draft.priceRange}`);
  console.log("Deliverables:");
  for (const item of draft.deliverables) {
    console.log(`- ${item}`);
  }
  console.log("Risks:");
  for (const item of draft.risks) {
    console.log(`- ${item}`);
  }
  console.log(
    `Website-only wording present: ${bannedMentions.length > 0 ? bannedMentions.join(" | ") : "none"}`
  );
}
