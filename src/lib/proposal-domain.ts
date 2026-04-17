export const PROPOSAL_DOMAINS = [
  "WEBSITE",
  "SAAS_SOFTWARE",
  "EDUCATION_SCHOOL",
  "MEDICAL_HEALTHCARE",
  "INTERNAL_TOOL",
  "FINANCE",
  "OTHER"
] as const;

export type ProposalDomain = (typeof PROPOSAL_DOMAINS)[number];

export type ProposalDraftSections = {
  summary: string;
  scope: string[];
  deliverables: string[];
  taskBreakdown: string[];
  timeline: string;
  risks: string[];
  assumptions: string[];
  priceRange: string;
};

export type ProposalDraftInput = {
  clientName: string;
  summary: string;
  projectType?: string;
  projectDomain?: ProposalDomain;
};

type DomainTemplate = Omit<ProposalDraftSections, "summary"> & {
  summaryTemplate: (input: ProposalDraftInput) => string;
};

const WEBSITE_ONLY_PATTERNS = [
  /\bcms\b/i,
  /\bsitemap\b/i,
  /marketing site/i,
  /lead capture forms?/i
];

export const proposalDomainOptions = [
  { value: "WEBSITE", label: "Website" },
  { value: "SAAS_SOFTWARE", label: "SaaS/software" },
  { value: "EDUCATION_SCHOOL", label: "Education/school" },
  { value: "MEDICAL_HEALTHCARE", label: "Medical/healthcare" },
  { value: "INTERNAL_TOOL", label: "Internal tool" },
  { value: "FINANCE", label: "Finance" },
  { value: "OTHER", label: "Other" }
] as const satisfies ReadonlyArray<{ value: ProposalDomain; label: string }>;

const domainLabelMap = proposalDomainOptions.reduce<Record<ProposalDomain, string>>(
  (result, option) => {
    result[option.value] = option.label;
    return result;
  },
  {
    WEBSITE: "Website",
    SAAS_SOFTWARE: "SaaS/software",
    EDUCATION_SCHOOL: "Education/school",
    MEDICAL_HEALTHCARE: "Medical/healthcare",
    INTERNAL_TOOL: "Internal tool",
    FINANCE: "Finance",
    OTHER: "Other"
  }
);

const domainTemplates: Record<ProposalDomain, DomainTemplate> = {
  WEBSITE: {
    summaryTemplate: (input) =>
      `Website proposal for ${input.clientName}: ${input.summary}`,
    scope: [
      "Website discovery, messaging alignment, and content planning",
      "Responsive design, implementation, QA, and launch support",
      "Content editing workflow setup and stakeholder handoff"
    ],
    deliverables: [
      "Approved sitemap and page inventory",
      "Responsive page designs and reusable component system",
      "CMS implementation with lead capture forms and launch checklist"
    ],
    taskBreakdown: [
      "Week 1: discovery, sitemap, content alignment, and technical planning",
      "Week 2-3: design, copy placement, revisions, and approvals",
      "Week 4-5: development, CMS setup, QA, and analytics configuration",
      "Week 6: launch readiness review, training, and post-launch support"
    ],
    timeline: "4-6 weeks",
    risks: [
      "Client-side content or approvals delay page completion",
      "Scope expansion after approved sitemap impacts timeline"
    ],
    assumptions: [
      "Client provides final copy and brand assets on schedule",
      "Feedback is consolidated into one review round per phase"
    ],
    priceRange: "$9,000 - $14,000"
  },
  SAAS_SOFTWARE: {
    summaryTemplate: (input) =>
      `Software delivery proposal for ${input.clientName}: ${input.summary}`,
    scope: [
      "Product discovery, workflow definition, and success criteria alignment",
      "Application UX, implementation, QA, and staged release planning",
      "Operational handoff for launch, monitoring, and iteration"
    ],
    deliverables: [
      "Prioritized product requirements and user flow specification",
      "Application interface designs and engineering-ready implementation plan",
      "Tested software release candidate with deployment and support notes"
    ],
    taskBreakdown: [
      "Week 1-2: discovery, requirements framing, architecture validation, and backlog setup",
      "Week 3-5: UX design, core feature implementation, and integration work",
      "Week 6-7: QA, bug resolution, acceptance review, and release preparation",
      "Week 8: production rollout planning, training, and handoff"
    ],
    timeline: "8-10 weeks",
    risks: [
      "Late product decisions can reshape implementation scope",
      "Third-party dependency changes may affect feature sequencing"
    ],
    assumptions: [
      "A client product owner can provide prompt requirement decisions",
      "Existing systems and APIs needed for delivery are available for testing"
    ],
    priceRange: "$28,000 - $48,000"
  },
  EDUCATION_SCHOOL: {
    summaryTemplate: (input) =>
      `School project proposal for ${input.clientName}: ${input.summary}`,
    scope: [
      "Discovery across school roles, workflows, and operational constraints",
      "Accessible experience design and implementation aligned to school calendars",
      "Privacy-aware rollout planning, training, and support"
    ],
    deliverables: [
      "Role-based workflow plan covering administrators, educators, students, and guardians as applicable",
      "Accessible product or service specification with WCAG-oriented acceptance criteria",
      "Implementation and rollout plan aligned to term schedules, approvals, and training needs"
    ],
    taskBreakdown: [
      "Week 1-2: stakeholder discovery, role mapping, privacy review inputs, and schedule planning",
      "Week 3-4: accessibility-first design, workflow validation, and revision cycle",
      "Week 5-7: implementation, QA, and school process alignment",
      "Week 8: training, launch planning around school operations, and handoff"
    ],
    timeline: "8-12 weeks",
    risks: [
      "School calendar constraints can limit testing and rollout windows",
      "Role-specific approval chains may slow requirement signoff"
    ],
    assumptions: [
      "The school designates decision-makers for operations, IT, and program stakeholders",
      "Accessibility, privacy, and onboarding feedback is consolidated per review cycle"
    ],
    priceRange: "$18,000 - $34,000"
  },
  MEDICAL_HEALTHCARE: {
    summaryTemplate: (input) =>
      `Healthcare project proposal for ${input.clientName}: ${input.summary}`,
    scope: [
      "Operational discovery, workflow definition, and requirements clarification",
      "Privacy-conscious solution design, implementation planning, QA, and rollout support",
      "Documentation and review checkpoints for security, legal, and compliance stakeholders"
    ],
    deliverables: [
      "Validated workflow and requirements brief for clinical, administrative, and support stakeholders as applicable",
      "Privacy and security-focused implementation plan with data handling boundaries and access considerations",
      "Release readiness package including review checkpoints, testing summary, and operational handoff"
    ],
    taskBreakdown: [
      "Week 1-2: discovery, stakeholder interviews, risk review inputs, and requirements framing",
      "Week 3-5: design or implementation planning with privacy and security checkpoints",
      "Week 6-8: build, QA, remediation, and operational review preparation",
      "Week 9-10: approval support, launch planning, and handoff"
    ],
    timeline: "10-14 weeks",
    risks: [
      "Review flag: legal, privacy, security, and compliance stakeholders must validate regulated workflow language before release",
      "Clinical or operational workflow changes can affect scope, sequencing, and acceptance"
    ],
    assumptions: [
      "This proposal does not make compliance certification claims and any regulated requirements will be verified by the client and its advisors",
      "Security, privacy, and approval contacts are available for timely review checkpoints"
    ],
    priceRange: "$40,000 - $75,000"
  },
  INTERNAL_TOOL: {
    summaryTemplate: (input) =>
      `Internal tool proposal for ${input.clientName}: ${input.summary}`,
    scope: [
      "Workflow discovery, systems mapping, and stakeholder prioritization",
      "Operational tool design, implementation, QA, and rollout support",
      "Permissions, handoff, and adoption planning for internal teams"
    ],
    deliverables: [
      "Current-state workflow map and target-state operating model",
      "Role-aware internal tool specification with integration requirements",
      "Tested release plan with admin enablement and documentation"
    ],
    taskBreakdown: [
      "Week 1: workflow discovery, systems inventory, and success metric definition",
      "Week 2-4: design, implementation, and integration work",
      "Week 5-6: QA, user acceptance testing, and refinement",
      "Week 7: deployment planning, training, and operational handoff"
    ],
    timeline: "6-8 weeks",
    risks: [
      "Unclear process ownership can slow requirement decisions",
      "Legacy system constraints may affect integration effort"
    ],
    assumptions: [
      "Internal stakeholders provide access to current tools and process documentation",
      "Pilot users are available for acceptance testing during the build"
    ],
    priceRange: "$16,000 - $30,000"
  },
  FINANCE: {
    summaryTemplate: (input) =>
      `Finance project proposal for ${input.clientName}: ${input.summary}`,
    scope: [
      "Discovery of financial workflows, control points, and operating requirements",
      "Product or platform design, implementation, QA, and release planning",
      "Operational readiness support with security, audit, and approval checkpoints"
    ],
    deliverables: [
      "Documented finance workflow requirements and risk-sensitive user journeys",
      "Implementation plan covering permissions, audit visibility, and systems integration",
      "Release readiness package with testing summary, controls review inputs, and handoff"
    ],
    taskBreakdown: [
      "Week 1-2: discovery, workflow mapping, controls review inputs, and backlog definition",
      "Week 3-5: design, implementation, and integration execution",
      "Week 6-8: QA, reconciliation testing, and remediation",
      "Week 9: launch planning, training, and post-release support setup"
    ],
    timeline: "8-12 weeks",
    risks: [
      "Control, approval, or vendor review cycles may extend delivery timing",
      "Integration with financial systems can surface additional data mapping effort"
    ],
    assumptions: [
      "Relevant finance, security, and operations contacts are available for scheduled reviews",
      "Required sandbox or test environments are accessible before implementation begins"
    ],
    priceRange: "$35,000 - $60,000"
  },
  OTHER: {
    summaryTemplate: (input) =>
      `Project proposal for ${input.clientName}: ${input.summary}`,
    scope: [
      "Discovery, prioritization, and delivery planning",
      "Design or implementation execution with QA and stakeholder reviews",
      "Launch readiness, handoff, and support planning"
    ],
    deliverables: [
      "Approved scope definition and implementation plan",
      "Core project deliverables aligned to stakeholder priorities",
      "Testing, handoff, and rollout support package"
    ],
    taskBreakdown: [
      "Week 1: discovery, planning, and requirements alignment",
      "Week 2-4: execution, reviews, and iteration",
      "Week 5-6: QA, final revisions, and launch preparation",
      "Week 7: handoff and closeout"
    ],
    timeline: "6-8 weeks",
    risks: [
      "Unclear requirements may expand the delivery scope",
      "Stakeholder feedback timing can affect milestone dates"
    ],
    assumptions: [
      "A primary client contact can coordinate timely decisions",
      "Dependencies outside the project team are surfaced during discovery"
    ],
    priceRange: "$12,000 - $22,000"
  }
};

export function getProposalDomainLabel(domain?: ProposalDomain) {
  return domain ? domainLabelMap[domain] : undefined;
}

export function inferProposalDomain(input: {
  summary?: string;
  projectType?: string;
}): ProposalDomain {
  const corpus = `${input.summary ?? ""} ${input.projectType ?? ""}`.toLowerCase();

  if (
    includesAny(corpus, [
      "medical",
      "healthcare",
      "patient",
      "clinic",
      "hospital",
      "hipaa",
      "phi",
      "ehr"
    ])
  ) {
    return "MEDICAL_HEALTHCARE";
  }

  if (
    includesAny(corpus, [
      "school",
      "district",
      "student",
      "teacher",
      "classroom",
      "campus",
      "ferpa",
      "education"
    ])
  ) {
    return "EDUCATION_SCHOOL";
  }

  if (
    includesAny(corpus, [
      "fintech",
      "finance",
      "bank",
      "payments",
      "trading",
      "lending",
      "reconciliation",
      "financial"
    ])
  ) {
    return "FINANCE";
  }

  if (
    includesAny(corpus, [
      "internal tool",
      "ops dashboard",
      "operations dashboard",
      "back office",
      "staff tool",
      "admin tool"
    ])
  ) {
    return "INTERNAL_TOOL";
  }

  if (
    includesAny(corpus, [
      "website",
      "landing page",
      "marketing site",
      "cms",
      "sitemap",
      "webflow"
    ])
  ) {
    return "WEBSITE";
  }

  if (
    includesAny(corpus, [
      "saas",
      "software",
      "platform",
      "application",
      "mobile app",
      "web app",
      "portal"
    ])
  ) {
    return "SAAS_SOFTWARE";
  }

  return "OTHER";
}

export function buildProposalDraft(input: ProposalDraftInput): ProposalDraftSections {
  const projectDomain =
    input.projectDomain ?? inferProposalDomain({ summary: input.summary, projectType: input.projectType });
  const template = domainTemplates[projectDomain];

  return {
    summary: template.summaryTemplate(input),
    scope: [...template.scope],
    deliverables: [...template.deliverables],
    taskBreakdown: [...template.taskBreakdown],
    timeline: template.timeline,
    risks: [...template.risks],
    assumptions: [...template.assumptions],
    priceRange: template.priceRange
  };
}

export function buildProposalPromptContext(domain?: ProposalDomain) {
  if (!domain) {
    return "";
  }

  const label = getProposalDomainLabel(domain);

  if (domain === "MEDICAL_HEALTHCARE") {
    return [
      `Project domain: ${label}.`,
      "Apply medical guardrails:",
      "- Do not state or imply unverified HIPAA, SOC 2, or regulatory compliance claims.",
      "- Use stronger privacy and security wording around access, data handling, approvals, and review checkpoints.",
      "- Include an explicit review flag that legal, privacy, security, or compliance stakeholders must validate regulated language before release."
    ].join("\n");
  }

  if (domain === "EDUCATION_SCHOOL") {
    return [
      `Project domain: ${label}.`,
      "Apply school-specific logic:",
      "- Reflect school roles such as administrators, educators, students, guardians, or IT where relevant.",
      "- Include accessibility expectations in scope, deliverables, or assumptions.",
      "- Use privacy wording appropriate for student and school data without making compliance guarantees.",
      "- Respect school workflow constraints such as calendars, approvals, onboarding, and limited rollout windows."
    ].join("\n");
  }

  if (domain === "WEBSITE") {
    return `Project domain: ${label}. Website outputs may include sitemap, CMS, marketing site, and lead capture language when appropriate.`;
  }

  return [
    `Project domain: ${label}.`,
    "Tailor scope, deliverables, task breakdown, risks, assumptions, and pricing/timeline to this domain.",
    "Do not mention CMS, sitemap, marketing site, or lead capture forms unless the domain is Website."
  ].join("\n");
}

export function sanitizeProposalDraft(
  draft: ProposalDraftSections,
  input: ProposalDraftInput
): ProposalDraftSections {
  const fallback = buildProposalDraft(input);
  const domain =
    input.projectDomain ?? inferProposalDomain({ summary: input.summary, projectType: input.projectType });

  if (domain === "WEBSITE") {
    return draft;
  }

  const summary = containsWebsiteOnlyLanguage(draft.summary)
    ? fallback.summary
    : draft.summary;
  const scope = sanitizeStringArray(draft.scope, fallback.scope);
  const deliverables = sanitizeStringArray(draft.deliverables, fallback.deliverables);
  const taskBreakdown = sanitizeStringArray(draft.taskBreakdown, fallback.taskBreakdown);
  const risks = sanitizeStringArray(draft.risks, fallback.risks);
  const assumptions = sanitizeStringArray(draft.assumptions, fallback.assumptions);

  return {
    ...draft,
    summary,
    scope,
    deliverables,
    taskBreakdown,
    risks,
    assumptions
  };
}

function sanitizeStringArray(items: string[], fallback: string[]) {
  const filtered = items.filter((item) => !containsWebsiteOnlyLanguage(item));
  return filtered.length > 0 ? filtered : fallback;
}

function containsWebsiteOnlyLanguage(value: string) {
  return WEBSITE_ONLY_PATTERNS.some((pattern) => pattern.test(value));
}

export function containsWebsiteLanguageForTesting(value: string) {
  return containsWebsiteOnlyLanguage(value);
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}
