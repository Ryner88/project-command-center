import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadDemoWorkspace, resetDemoStoreForTests } from "@/services/demo-store.service";

const mocks = vi.hoisted(() => ({
  ensureCurrentUser: vi.fn(),
  isDatabaseReady: vi.fn(),
  prisma: {
    export: {
      findMany: vi.fn()
    },
    proposal: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      updateManyAndReturn: vi.fn()
    },
    proposalSeed: {
      findFirst: vi.fn(),
      findMany: vi.fn()
    }
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma
}));

vi.mock("@/services/current-user.service", () => ({
  ensureCurrentUser: mocks.ensureCurrentUser,
  isDatabaseReady: mocks.isDatabaseReady
}));

describe("data mode boundary", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.ensureCurrentUser.mockResolvedValue({ id: "user_test" });
    mocks.isDatabaseReady.mockResolvedValue(false);
    await resetDemoStoreForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("selects demo mode when the database is not ready", async () => {
    const { getDataMode } = await import("@/services/data-mode.service");

    await expect(getDataMode()).resolves.toBe("demo");
  });

  it("selects database mode when the database is ready", async () => {
    mocks.isDatabaseReady.mockResolvedValue(true);

    const { getDataMode } = await import("@/services/data-mode.service");

    await expect(getDataMode()).resolves.toBe("database");
  });

  it("keeps production mode on the database path when readiness fails", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const { getDataMode } = await import("@/services/data-mode.service");

    await expect(getDataMode()).resolves.toBe("database");
  });

  it("returns an empty proposal list in database mode without fixture fallback", async () => {
    mocks.isDatabaseReady.mockResolvedValue(true);
    mocks.prisma.proposal.findMany.mockResolvedValue([]);

    const { listProposals } = await import("@/services/proposal.service");

    await expect(listProposals()).resolves.toEqual([]);
    expect(mocks.prisma.proposal.findMany).toHaveBeenCalledWith({
      where: { userId: "user_test", archivedAt: null },
      orderBy: { createdAt: "desc" }
    });
  });

  it("returns a safe project error when local demo mode has no database", async () => {
    const { listProjects } = await import("@/services/project.service");

    await expect(listProjects()).rejects.toMatchObject({
      status: 503,
      message: "Project workflows require a configured database."
    });
    expect(mocks.ensureCurrentUser).not.toHaveBeenCalled();
  });

  it("returns null for a missing proposal detail in database mode", async () => {
    mocks.isDatabaseReady.mockResolvedValue(true);
    mocks.prisma.proposal.findFirst.mockResolvedValue(null);

    const { getProposalById } = await import("@/services/proposal.service");

    await expect(getProposalById("missing_proposal")).resolves.toBeNull();
  });

  it("returns null for a missing status update target in database mode", async () => {
    mocks.isDatabaseReady.mockResolvedValue(true);
    mocks.prisma.proposal.updateManyAndReturn.mockResolvedValue([]);

    const { updateProposalStatus } = await import("@/services/proposal.service");

    await expect(updateProposalStatus("missing_proposal", "IN_REVIEW")).resolves.toBeNull();
  });

  it("returns empty seed and export reads in database mode", async () => {
    mocks.isDatabaseReady.mockResolvedValue(true);
    mocks.prisma.proposalSeed.findMany.mockResolvedValue([]);
    mocks.prisma.proposalSeed.findFirst.mockResolvedValue(null);
    mocks.prisma.export.findMany.mockResolvedValue([]);

    const { listProposalSeeds, getProposalSeedById } =
      await import("@/services/proposal-seed.service");
    const { listExportsForProposal } = await import("@/services/export.service");

    await expect(listProposalSeeds()).resolves.toEqual([]);
    await expect(getProposalSeedById("missing_seed")).resolves.toBeNull();
    await expect(listExportsForProposal("missing_proposal")).resolves.toEqual([]);
  });

  it("keeps JSON-backed demo records in demo mode", async () => {
    const { listProposals } = await import("@/services/proposal.service");
    await expect(listProposals()).resolves.toEqual([]);

    await loadDemoWorkspace();
    const { getProposalById } = await import("@/services/proposal.service");
    const { listProposalSeeds } = await import("@/services/proposal-seed.service");

    await expect(listProposals()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "proposal_1",
          clientName: "Sarah"
        })
      ])
    );
    await expect(getProposalById("proposal_1")).resolves.toEqual(
      expect.objectContaining({
        id: "proposal_1",
        clientName: "Sarah"
      })
    );
    await expect(listProposalSeeds()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "seed_1",
          clientName: "Sarah"
        })
      ])
    );
  });

  it("does not expose the demo loader on Vercel", async () => {
    vi.stubEnv("VERCEL", "1");
    const { POST } = await import("@/app/api/demo/load/route");
    const response = await POST(
      new Request("http://localhost/api/demo/load", { method: "POST" }) as never
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Demo loading is unavailable in production."
    });
  });
});
