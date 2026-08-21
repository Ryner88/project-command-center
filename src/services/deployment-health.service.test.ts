import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isDatabaseConfigured: vi.fn(),
  isDatabaseReady: vi.fn()
}));

vi.mock("@/services/current-user.service", () => ({
  isDatabaseConfigured: mocks.isDatabaseConfigured,
  isDatabaseReady: mocks.isDatabaseReady
}));

describe("deployment health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isDatabaseConfigured.mockReturnValue(false);
    mocks.isDatabaseReady.mockResolvedValue(false);
  });

  it("reports database mode when the configured database is migrated", async () => {
    mocks.isDatabaseConfigured.mockReturnValue(true);
    mocks.isDatabaseReady.mockResolvedValue(true);

    const { getDeploymentHealth } = await import(
      "@/services/deployment-health.service"
    );

    await expect(
      getDeploymentHealth({ NODE_ENV: "production" })
    ).resolves.toEqual({
      status: "ok",
      mode: "database",
      checks: {
        databaseConfigured: true,
        databaseMigrated: true,
        demoFallbackAllowed: false
      }
    });
  });

  it("fails readiness in production when migrations have not completed", async () => {
    mocks.isDatabaseConfigured.mockReturnValue(true);
    mocks.isDatabaseReady.mockResolvedValue(false);

    const { getDeploymentHealth } = await import(
      "@/services/deployment-health.service"
    );

    await expect(
      getDeploymentHealth({ NODE_ENV: "production" })
    ).resolves.toEqual({
      status: "error",
      mode: "unavailable",
      checks: {
        databaseConfigured: true,
        databaseMigrated: false,
        demoFallbackAllowed: false
      }
    });
  });

  it("keeps local no-database demo mode explicitly allowed", async () => {
    const { getDeploymentHealth } = await import(
      "@/services/deployment-health.service"
    );

    await expect(getDeploymentHealth({ NODE_ENV: "development" })).resolves.toEqual(
      {
        status: "ok",
        mode: "demo",
        checks: {
          databaseConfigured: false,
          databaseMigrated: false,
          demoFallbackAllowed: true
        }
      }
    );
  });

  it("fails readiness on Vercel when no database is available", async () => {
    const { getDeploymentHealth } = await import(
      "@/services/deployment-health.service"
    );

    await expect(
      getDeploymentHealth({ NODE_ENV: "development", VERCEL: "1" })
    ).resolves.toEqual({
      status: "error",
      mode: "unavailable",
      checks: {
        databaseConfigured: false,
        databaseMigrated: false,
        demoFallbackAllowed: false
      }
    });
  });
});
