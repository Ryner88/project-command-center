import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { DEMO_USER_ID } from "@/lib/constants";
import type { ProposalExport } from "@/types/export";
import type { ProposalSeed } from "@/types/proposal-seed";
import type { Proposal } from "@/types/proposal";

type DemoStore = {
  proposalSeeds: ProposalSeed[];
  proposals: Proposal[];
  exports: ProposalExport[];
};

function resolveDemoStoreRoot() {
  if (process.env.DEMO_STORAGE_ROOT) {
    return process.env.DEMO_STORAGE_ROOT;
  }

  if (process.env.VERCEL) {
    return path.join("/tmp", "project-command-center");
  }

  if (process.env.TMPDIR && process.env.NODE_ENV === "production") {
    return path.join(process.env.TMPDIR, "project-command-center");
  }

  return process.cwd();
}

const demoStorePath = path.join(resolveDemoStoreRoot(), "storage", "proposals", "demo-store.json");

const emptyStore: DemoStore = {
  proposalSeeds: [],
  proposals: [],
  exports: []
};

const demoWorkspace: DemoStore = {
  proposalSeeds: [
    {
      id: "seed_1",
      userId: DEMO_USER_ID,
      sourceType: "EMAIL",
      sourceReference: "thread_123",
      clientName: "Sarah",
      projectType: "Website build",
      projectDomain: "WEBSITE",
      summary: "Client requested a quote for a marketing website redesign with CMS.",
      context: {
        projectDomain: "WEBSITE",
        pages: 10,
        cms: true
      }
    }
  ],
  proposals: [
    {
      id: "proposal_1",
      proposalSeedId: "seed_1",
      title: "Sarah Website build Proposal",
      clientName: "Sarah",
      projectType: "Website build",
      projectDomain: "WEBSITE",
      status: "DRAFT",
      startDate: "2026-05-04",
      dueDate: "2026-06-12",
      summary:
        "Website project proposal for Sarah covering a marketing site redesign, CMS setup, and launch-ready content structure.",
      scope: [
        "Discovery workshop and requirements alignment",
        "Information architecture for core marketing pages",
        "Responsive website implementation with CMS-backed content"
      ],
      deliverables: [
        "Homepage and supporting page templates",
        "CMS configuration and editor handoff notes",
        "Launch checklist with QA findings"
      ],
      taskBreakdown: [
        "Confirm sitemap, content priorities, and visual direction",
        "Design and build responsive page templates",
        "Run QA, connect analytics, and prepare launch"
      ],
      timeline: "6 weeks",
      risks: [
        "Content delays could push the launch date",
        "Late design changes may require scope adjustment"
      ],
      assumptions: [
        "Client will provide brand assets before design starts",
        "CMS access and hosting details are available during implementation"
      ],
      priceRange: "$8,000 - $12,000",
      sourceLabel: "Generated from email thread"
    }
  ],
  exports: []
};

function cloneStore(store: DemoStore): DemoStore {
  return JSON.parse(JSON.stringify(store)) as DemoStore;
}

async function ensureDemoStoreFile() {
  await mkdir(path.dirname(demoStorePath), { recursive: true });

  try {
    await readFile(demoStorePath, "utf8");
  } catch {
    await writeFile(demoStorePath, JSON.stringify(cloneStore(emptyStore), null, 2), "utf8");
  }
}

export async function readDemoStore(): Promise<DemoStore> {
  await ensureDemoStoreFile();
  const content = await readFile(demoStorePath, "utf8");
  return JSON.parse(content) as DemoStore;
}

export async function writeDemoStore(store: DemoStore) {
  await ensureDemoStoreFile();
  await writeFile(demoStorePath, JSON.stringify(store, null, 2), "utf8");
}

export async function loadDemoWorkspace() {
  const store = cloneStore(demoWorkspace);
  await writeDemoStore(store);
  return store;
}

export async function resetDemoStoreForTests() {
  await rm(demoStorePath, { force: true });
}
