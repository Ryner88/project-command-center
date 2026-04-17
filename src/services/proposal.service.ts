import { prisma } from "@/lib/prisma";
import {
  ensureCurrentUser,
  isDatabaseConfigured
} from "@/services/current-user.service";
import type { ProposalStatus } from "@/types/proposal";
import type { ProposalGenerationInput, Proposal } from "@/types/proposal";

import {
  createProposalSeed,
  getProposalSeedById
} from "@/services/proposal-seed.service";
import { generateProposalDraft } from "@/services/ai/proposal-ai.service";

declare global {
  var demoProposals: Proposal[] | undefined;
}

const demoProposals = global.demoProposals ?? [];

if (process.env.NODE_ENV !== "production") {
  global.demoProposals = demoProposals;
}

export async function listProposals(): Promise<Proposal[]> {
  if (isDatabaseConfigured()) {
    const user = await ensureCurrentUser();
    const proposals = await prisma.proposal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    if (proposals.length > 0) {
      return proposals.map(mapProposalRecord);
    }
  }

  return demoProposals;
}

export async function generateProposal(input: ProposalGenerationInput): Promise<Proposal> {
  const normalized = await normalizeProposalGenerationInput(input);
  const generated = await generateProposalDraft(normalized);
  const proposal: Proposal = {
    id: `proposal_${demoProposals.length + 1}`,
    proposalSeedId: normalized.proposalSeedId,
    title: normalized.title,
    clientName: normalized.clientName,
    status: "DRAFT",
    summary: generated.summary,
    scope: generated.scope,
    deliverables: generated.deliverables,
    taskBreakdown: generated.taskBreakdown,
    timeline: generated.timeline,
    risks: generated.risks,
    assumptions: generated.assumptions,
    priceRange: generated.priceRange,
    sourceLabel: normalized.sourceSeed
      ? `${normalized.sourceSeed.sourceType.toLowerCase()} seed`
      : "Manual draft"
  };

  if (isDatabaseConfigured()) {
    const user = await ensureCurrentUser();
    const created = await prisma.proposal.create({
      data: {
        userId: user.id,
        proposalSeedId: proposal.proposalSeedId,
        title: proposal.title,
        clientName: proposal.clientName,
        status: proposal.status,
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

  demoProposals.push(proposal);

  return proposal;
}

async function normalizeProposalGenerationInput(input: ProposalGenerationInput) {
  const sourceSeed = input.proposalSeedId
    ? await getProposalSeedById(input.proposalSeedId)
    : null;
  const rawRequest = cleanText(input.rawRequest);
  const summary = cleanText(input.summary) ?? rawRequest ?? sourceSeed?.summary;

  if (!summary) {
    throw new Error("Proposal summary is required.");
  }

  const clientName =
    cleanText(input.clientName) ??
    sourceSeed?.clientName ??
    inferClientName(rawRequest) ??
    "New client";
  const projectType =
    cleanText(input.projectType) ??
    sourceSeed?.projectType ??
    inferProjectType(summary);
  const title =
    cleanText(input.title) ?? `${clientName} ${projectType ?? "Project"} Proposal`;

  if (sourceSeed) {
    return {
      proposalSeedId: sourceSeed.id,
      sourceSeed,
      title,
      clientName,
      summary,
      projectType
    };
  }

  const manualSeed = await createProposalSeed({
    sourceType: "MANUAL",
    clientName,
    projectType,
    summary,
    context: rawRequest ? { rawRequest } : {}
  });

  return {
    proposalSeedId: manualSeed.id,
    sourceSeed: manualSeed,
    title,
    clientName,
    summary,
    projectType
  };
}

export async function getProposalById(id: string): Promise<Proposal | null> {
  if (isDatabaseConfigured()) {
    const user = await ensureCurrentUser();
    const proposal = await prisma.proposal.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    return proposal ? mapProposalRecord(proposal) : null;
  }

  return demoProposals.find((proposal) => proposal.id === id) ?? null;
}

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus
): Promise<Proposal | null> {
  if (isDatabaseConfigured()) {
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

  const proposal = demoProposals.find((item) => item.id === id);

  if (!proposal) {
    return null;
  }

  proposal.status = status;
  return proposal;
}

function mapProposalRecord(record: {
  id: string;
  proposalSeedId: string | null;
  title: string;
  clientName: string;
  status: ProposalStatus;
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
    status: record.status,
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

function inferClientName(rawRequest?: string) {
  if (!rawRequest) {
    return undefined;
  }

  const match = rawRequest.match(
    /\b(?:client|company|brand|for)\s*[:\-]?\s*([A-Z][A-Za-z0-9&.' -]{1,50})/
  );

  return match?.[1]?.trim();
}

function inferProjectType(summary: string) {
  const lower = summary.toLowerCase();

  if (lower.includes("website")) {
    return "Website redesign";
  }

  if (lower.includes("mobile app") || lower.includes("app")) {
    return "App project";
  }

  if (lower.includes("brand")) {
    return "Brand engagement";
  }

  if (lower.includes("seo") || lower.includes("content")) {
    return "Growth marketing";
  }

  return "Project";
}
