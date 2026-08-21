import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/app-error";
import { isValidDateInput } from "@/lib/date";
import { validateProposalDeadline } from "@/lib/proposal-schedule";
import {
  getProposalDomainLabel,
  inferProposalDomain
} from "@/lib/proposal-domain";
import { getDataMode, isDatabaseMode } from "@/services/data-mode.service";
import { readDemoStore, writeDemoStore } from "@/services/demo-store.service";
import {
  ensureCurrentUser,
  isDatabaseReady
} from "@/services/current-user.service";
import type { ProposalStatus } from "@/types/proposal";
import type { ProposalGenerationInput, Proposal } from "@/types/proposal";

import {
  createProposalSeed,
  getProposalSeedById
} from "@/services/proposal-seed.service";
import { generateProposalDraft } from "@/services/ai/proposal-ai.service";

export async function listProposals(): Promise<Proposal[]> {
  if (isDatabaseMode(await getDataMode())) {
    const user = await ensureCurrentUser();
    const proposals = await prisma.proposal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return proposals.map(mapProposalRecord);
  }

  const store = await readDemoStore();
  return store.proposals;
}

export async function generateProposal(input: ProposalGenerationInput): Promise<Proposal> {
  const dataMode = await getDataMode();
  const databaseReady = isDatabaseMode(dataMode) && (await isDatabaseReady());

  if (process.env.VERCEL && !databaseReady) {
    throw new AppError(
      503,
      "Proposal persistence is not configured for this deployment. Set DATABASE_URL and run migrations before generating proposals."
    );
  }

  const normalized = await normalizeProposalGenerationInput(input);
  const generated = await generateProposalDraft(normalized);
  const proposal: Proposal = {
    id: "",
    proposalSeedId: normalized.proposalSeedId,
    title: normalized.title,
    clientName: normalized.clientName,
    projectType: normalized.projectType,
    projectDomain: normalized.projectDomain,
    projectDomainOther: normalized.projectDomainOther,
    status: "DRAFT",
    startDate: normalized.startDate,
    dueDate: normalized.dueDate,
    summary: generated.summary,
    scope: generated.scope,
    deliverables: generated.deliverables,
    taskBreakdown: generated.taskBreakdown,
    timeline: generated.timeline,
    risks: generated.risks,
    assumptions: generated.assumptions,
    priceRange: generated.priceRange,
    sourceLabel: buildSourceLabel(
      normalized.sourceSeed?.sourceType,
      normalized.projectDomain,
      normalized.projectDomainOther
    )
  };

  if (databaseReady) {
    const user = await ensureCurrentUser();
    const created = await prisma.proposal.create({
      data: {
        userId: user.id,
        proposalSeedId: proposal.proposalSeedId,
        title: proposal.title,
        clientName: proposal.clientName,
        projectType: proposal.projectType,
        projectDomain: proposal.projectDomain,
        projectDomainOther: proposal.projectDomainOther,
        status: proposal.status,
        startDate: proposal.startDate,
        dueDate: proposal.dueDate,
        summary: proposal.summary,
        scope: proposal.scope,
        deliverables: proposal.deliverables,
        taskBreakdown: proposal.taskBreakdown,
        timeline: proposal.timeline,
        risks: proposal.risks,
        assumptions: proposal.assumptions,
        priceRange: proposal.priceRange,
        sourceLabel: proposal.sourceLabel
      }
    });

    return mapProposalRecord(created);
  }

  const store = await readDemoStore();
  const demoProposal = {
    ...proposal,
    id: `proposal_${store.proposals.length + 1}`
  };
  store.proposals.push(demoProposal);
  await writeDemoStore(store);

  return demoProposal;
}

async function normalizeProposalGenerationInput(input: ProposalGenerationInput) {
  const sourceSeed = input.proposalSeedId
    ? await getProposalSeedById(input.proposalSeedId)
    : null;
  const rawRequest = cleanText(input.rawRequest);
  const summary = cleanText(input.summary) ?? rawRequest ?? sourceSeed?.summary;

  if (input.proposalSeedId && !sourceSeed) {
    throw new AppError(404, `Proposal seed ${input.proposalSeedId} was not found.`);
  }

  if (!summary) {
    throw new AppError(400, "Proposal summary or working request is required.");
  }

  const clientName = cleanText(input.clientName) ?? sourceSeed?.clientName;

  if (!clientName) {
    throw new AppError(
      400,
      "Client name is required. Enter it directly instead of relying on request parsing."
    );
  }

  const dueDate = normalizeDueDate(input.dueDate);
  const startDate = normalizeDueDate(input.startDate);
  const deadlineValidationError = validateProposalDeadline(dueDate, startDate);

  if (deadlineValidationError) {
    throw new AppError(400, deadlineValidationError);
  }

  const projectType = cleanText(input.projectType) ?? sourceSeed?.projectType;

  if (!projectType) {
    throw new AppError(
      400,
      "Project type is required. Enter it directly instead of relying on request parsing."
    );
  }

  const projectDomainOther =
    cleanText(input.projectDomainOther) ?? sourceSeed?.projectDomainOther;
  const projectDomain =
    input.projectDomain ??
    sourceSeed?.projectDomain ??
    inferProposalDomain({ summary, projectType });

  if (!projectDomain) {
    throw new AppError(400, "Project domain is required.");
  }

  if (projectDomain === "OTHER" && !projectDomainOther) {
    throw new AppError(400, "Enter a custom project domain when selecting Other.");
  }

  const title =
    cleanText(input.title) ?? `${clientName} ${projectType} Proposal`;

  if (sourceSeed) {
    return {
      proposalSeedId: sourceSeed.id,
      sourceSeed,
      title,
      clientName,
      startDate,
      dueDate,
      summary,
      projectType,
      projectDomain,
      projectDomainOther
    };
  }

  const manualSeed = await createProposalSeed({
    sourceType: "MANUAL",
    clientName,
    projectType,
    projectDomain,
    projectDomainOther,
    summary,
    context: rawRequest ? { rawRequest } : {}
  });

  return {
    proposalSeedId: manualSeed.id,
    sourceSeed: manualSeed,
    title,
    clientName,
    startDate,
    dueDate,
    summary,
    projectType,
    projectDomain,
    projectDomainOther
  };
}

export async function getProposalById(id: string): Promise<Proposal | null> {
  if (isDatabaseMode(await getDataMode())) {
    const user = await ensureCurrentUser();
    const proposal = await prisma.proposal.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    return proposal ? mapProposalRecord(proposal) : null;
  }

  const store = await readDemoStore();
  return store.proposals.find((proposal) => proposal.id === id) ?? null;
}

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus
): Promise<Proposal | null> {
  if (isDatabaseMode(await getDataMode())) {
    const user = await ensureCurrentUser();
    const proposal = await prisma.proposal.updateManyAndReturn({
      where: {
        id,
        userId: user.id
      },
      data: { status }
    });

    return proposal[0] ? mapProposalRecord(proposal[0]) : null;
  }

  const store = await readDemoStore();
  const proposal = store.proposals.find((item) => item.id === id);

  if (!proposal) {
    return null;
  }

  proposal.status = status;
  await writeDemoStore(store);
  return proposal;
}

function mapProposalRecord(record: {
  id: string;
  proposalSeedId: string | null;
  title: string;
  clientName: string;
  projectType: string | null;
  projectDomain: Proposal["projectDomain"] | null;
  projectDomainOther: string | null;
  status: ProposalStatus;
  startDate?: string | null;
  dueDate: string | null;
  summary: string;
  scope: unknown;
  deliverables: unknown;
  taskBreakdown: unknown;
  timeline: string | null;
  risks: unknown;
  assumptions: unknown;
  priceRange: string;
  sourceLabel: string | null;
}): Proposal {
  return {
    id: record.id,
    proposalSeedId: record.proposalSeedId ?? undefined,
    title: record.title,
    clientName: record.clientName,
    projectType: record.projectType ?? undefined,
    projectDomain: record.projectDomain ?? undefined,
    projectDomainOther: record.projectDomainOther ?? undefined,
    status: record.status,
    startDate: record.startDate ?? undefined,
    dueDate: record.dueDate ?? undefined,
    summary: record.summary,
    scope: readStringArray(record.scope),
    deliverables: readStringArray(record.deliverables),
    taskBreakdown: readStringArray(record.taskBreakdown),
    timeline: record.timeline ?? undefined,
    risks: readStringArray(record.risks),
    assumptions: readStringArray(record.assumptions),
    priceRange: record.priceRange,
    sourceLabel: record.sourceLabel ?? undefined
  };
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function cleanText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeDueDate(value?: string) {
  return isValidDateInput(value) ? value : undefined;
}

function formatSourceType(sourceType: "EMAIL" | "BRIEFING" | "MANUAL") {
  switch (sourceType) {
    case "EMAIL":
      return "Email seed";
    case "BRIEFING":
      return "Briefing seed";
    case "MANUAL":
      return "Manual input";
  }
}

function buildSourceLabel(
  sourceType: "EMAIL" | "BRIEFING" | "MANUAL" | undefined,
  projectDomain: ReturnType<typeof inferProposalDomain>,
  projectDomainOther?: string
) {
  const source = !sourceType || sourceType === "MANUAL"
    ? "Generated from manual input"
    : `Generated from ${formatSourceType(sourceType).toLowerCase()}`;

  return `${source} • ${getProposalDomainLabel(projectDomain, projectDomainOther) ?? "Other"}`;
}
