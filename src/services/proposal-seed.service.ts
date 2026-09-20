import { mockImportantEmails } from "@/data/mock-emails";
import { Prisma } from "@prisma/client";
import { inferProposalDomain } from "@/lib/proposal-domain";
import { AppError } from "@/lib/app-error";
import { DEMO_USER_ID } from "@/lib/constants";
import { seeds } from "@/repositories/persistence.repository";
import { getDataMode, isDatabaseMode } from "@/services/data-mode.service";
import { readDemoStore, writeDemoStore } from "@/services/demo-store.service";
import { ensureCurrentUser } from "@/services/current-user.service";
import type { ProposalSeedInput, ProposalSeed } from "@/types/proposal-seed";

export async function listProposalSeeds(): Promise<ProposalSeed[]> {
  if (isDatabaseMode(await getDataMode())) {
    const user = await ensureCurrentUser();
    return (await seeds.list(user.id)).map(mapProposalSeedRecord);
  }

  const store = await readDemoStore();
  return store.proposalSeeds;
}

export async function createProposalSeed(input: ProposalSeedInput): Promise<ProposalSeed> {
  if (isDatabaseMode(await getDataMode())) {
    const user = await ensureCurrentUser();
    try {
      return mapProposalSeedRecord(await seeds.create(user.id, input));
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        input.sourceReference
      ) {
        const existing = await seeds.bySource(user.id, input.sourceType, input.sourceReference);
        if (existing) return mapProposalSeedRecord(existing);
      }
      throw error;
    }
  }

  const store = await readDemoStore();
  const seed: ProposalSeed = {
    id: `seed_${store.proposalSeeds.length + 1}`,
    userId: DEMO_USER_ID,
    ...input
  };

  store.proposalSeeds.push(seed);
  await writeDemoStore(store);

  return seed;
}

export async function getSampleProposalSeed(): Promise<ProposalSeed> {
  if (isDatabaseMode(await getDataMode())) {
    const user = await ensureCurrentUser();
    const existing = await seeds.first(user.id);

    if (existing) {
      return mapProposalSeedRecord(existing);
    }

    return createProposalSeed({
      sourceType: "MANUAL",
      clientName: "Acme",
      projectType: "Website redesign",
      projectDomain: "WEBSITE",
      summary: "Client requested a quote for a marketing website redesign with CMS.",
      context: {
        projectDomain: "WEBSITE",
        pages: 10,
        cms: true
      }
    });
  }

  const store = await readDemoStore();
  return store.proposalSeeds[0];
}

export async function getProposalSeedById(id: string): Promise<ProposalSeed | null> {
  if (isDatabaseMode(await getDataMode())) {
    const user = await ensureCurrentUser();
    const seed = await seeds.get(user.id, id);

    return seed ? mapProposalSeedRecord(seed) : null;
  }

  const store = await readDemoStore();
  return store.proposalSeeds.find((seed) => seed.id === id) ?? null;
}

export async function ensureProposalSeedForBriefingItem(
  briefingItemId: string
): Promise<ProposalSeed | null> {
  if (isDatabaseMode(await getDataMode())) {
    const user = await ensureCurrentUser();
    const existingSeed = await seeds.bySource(user.id, "BRIEFING", briefingItemId);

    if (existingSeed) {
      return mapProposalSeedRecord(existingSeed);
    }
  } else {
    const store = await readDemoStore();
    const existingSeed =
      store.proposalSeeds.find((seed) => seed.sourceReference === briefingItemId) ?? null;

    if (existingSeed) {
      return existingSeed;
    }
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
    projectDomain: inferProposalDomain({
      summary: email.preview,
      projectType: inferredProjectType
    }),
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
  projectDomain: ProposalSeed["projectDomain"] | null;
  projectDomainOther: string | null;
  summary: string;
  context: unknown;
}): ProposalSeed {
  if (!seed.context || typeof seed.context !== "object" || Array.isArray(seed.context)) {
    throw new AppError(500, "Persisted proposal seed has invalid context data.");
  }
  const context = seed.context as Record<string, unknown>;

  return {
    id: seed.id,
    userId: seed.userId,
    sourceType: seed.sourceType,
    sourceReference: seed.sourceReference ?? undefined,
    clientName: seed.clientName ?? undefined,
    projectType: seed.projectType ?? undefined,
    projectDomain:
      seed.projectDomain ??
      (typeof context.projectDomain === "string"
        ? (context.projectDomain as ProposalSeed["projectDomain"])
        : undefined),
    projectDomainOther:
      seed.projectDomainOther ??
      (typeof context.projectDomainOther === "string" ? context.projectDomainOther : undefined),
    summary: seed.summary,
    context
  };
}
