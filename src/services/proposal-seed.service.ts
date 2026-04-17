import { mockImportantEmails } from "@/data/mock-emails";
import type { Prisma } from "@prisma/client";
import { DEMO_USER_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  ensureCurrentUser,
  isDatabaseConfigured
} from "@/services/current-user.service";
import type { ProposalSeedInput, ProposalSeed } from "@/types/proposal-seed";

declare global {
  var demoProposalSeeds: ProposalSeed[] | undefined;
}

const demoSeeds =
  global.demoProposalSeeds ??
  [
  {
    id: "seed_1",
    userId: DEMO_USER_ID,
    sourceType: "EMAIL",
    sourceReference: "thread_123",
    clientName: "Sarah",
    projectType: "Website build",
    summary: "Client requested a quote for a marketing website redesign with CMS.",
    context: {
      pages: 10,
      cms: true
    }
  }
];

if (process.env.NODE_ENV !== "production") {
  global.demoProposalSeeds = demoSeeds;
}

export async function listProposalSeeds(): Promise<ProposalSeed[]> {
  if (isDatabaseConfigured()) {
    const user = await ensureCurrentUser();
    const seeds = await prisma.proposalSeed.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    if (seeds.length > 0) {
      return seeds.map(mapProposalSeedRecord);
    }
  }

  return demoSeeds;
}

export async function createProposalSeed(input: ProposalSeedInput): Promise<ProposalSeed> {
  if (isDatabaseConfigured()) {
    const user = await ensureCurrentUser();
    const seed = await prisma.proposalSeed.create({
      data: {
        userId: user.id,
        sourceType: input.sourceType,
        sourceReference: input.sourceReference,
        clientName: input.clientName,
        projectType: input.projectType,
        summary: input.summary,
        context: input.context as Prisma.InputJsonObject
      }
    });

    return mapProposalSeedRecord(seed);
  }

  const seed: ProposalSeed = {
    id: `seed_${demoSeeds.length + 1}`,
    userId: DEMO_USER_ID,
    ...input
  };

  demoSeeds.push(seed);

  return seed;
}

export async function getSampleProposalSeed(): Promise<ProposalSeed> {
  if (isDatabaseConfigured()) {
    const user = await ensureCurrentUser();
    const existing = await prisma.proposalSeed.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" }
    });

    if (existing) {
      return mapProposalSeedRecord(existing);
    }

    return createProposalSeed({
      sourceType: "MANUAL",
      clientName: "Acme",
      projectType: "Website redesign",
      summary: "Client requested a quote for a marketing website redesign with CMS.",
      context: {
        pages: 10,
        cms: true
      }
    });
  }

  return demoSeeds[0];
}

export async function getProposalSeedById(id: string): Promise<ProposalSeed | null> {
  if (isDatabaseConfigured()) {
    const user = await ensureCurrentUser();
    const seed = await prisma.proposalSeed.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    return seed ? mapProposalSeedRecord(seed) : null;
  }

  return demoSeeds.find((seed) => seed.id === id) ?? null;
}

export async function ensureProposalSeedForBriefingItem(
  briefingItemId: string
): Promise<ProposalSeed | null> {
  const existingSeed =
    demoSeeds.find((seed) => seed.sourceReference === briefingItemId) ?? null;

  if (existingSeed) {
    return existingSeed;
  }

  const email = mockImportantEmails.find((item) => item.id === briefingItemId);

  if (!email || !email.requiresProposal) {
    return null;
  }

  const inferredProjectType = email.subject.toLowerCase().includes("website")
    ? "Website redesign"
    : "Client proposal";

  return createProposalSeed({
    sourceType: "BRIEFING",
    sourceReference: briefingItemId,
    clientName: email.from.split("<")[0].trim(),
    projectType: inferredProjectType,
    summary: email.preview,
    context: {
      emailFrom: email.from,
      emailSubject: email.subject
    }
  });
}

function mapProposalSeedRecord(seed: {
  id: string;
  userId: string;
  sourceType: "EMAIL" | "BRIEFING" | "MANUAL";
  sourceReference: string | null;
  clientName: string | null;
  projectType: string | null;
  summary: string;
  context: unknown;
}): ProposalSeed {
  return {
    id: seed.id,
    userId: seed.userId,
    sourceType: seed.sourceType,
    sourceReference: seed.sourceReference ?? undefined,
    clientName: seed.clientName ?? undefined,
    projectType: seed.projectType ?? undefined,
    summary: seed.summary,
    context:
      seed.context && typeof seed.context === "object" && !Array.isArray(seed.context)
        ? (seed.context as Record<string, unknown>)
        : {}
  };
}
