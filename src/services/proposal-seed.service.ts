import { mockImportantEmails } from "@/data/mock-emails";
import { DEMO_USER_ID } from "@/lib/constants";
import type { ProposalSeedInput, ProposalSeed } from "@/types/proposal-seed";

const demoSeeds: ProposalSeed[] = [
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

export async function listProposalSeeds(): Promise<ProposalSeed[]> {
  return demoSeeds;
}

export async function createProposalSeed(input: ProposalSeedInput): Promise<ProposalSeed> {
  const seed: ProposalSeed = {
    id: `seed_${demoSeeds.length + 1}`,
    userId: DEMO_USER_ID,
    ...input
  };

  demoSeeds.push(seed);

  return seed;
}

export async function getSampleProposalSeed(): Promise<ProposalSeed> {
  return demoSeeds[0];
}

export async function getProposalSeedById(id: string): Promise<ProposalSeed | null> {
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
