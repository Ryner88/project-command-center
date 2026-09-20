import { isDatabaseConfigured, isDatabaseReady } from "@/services/current-user.service";

export type DeploymentHealth = {
  status: "ok" | "degraded" | "error";
  mode: "database" | "demo" | "unavailable";
  checks: {
    databaseConfigured: boolean;
    databaseMigrated: boolean;
    demoFallbackAllowed: boolean;
  };
};

export async function getDeploymentHealth(
  env: NodeJS.ProcessEnv = process.env
): Promise<DeploymentHealth> {
  const databaseConfigured = isDatabaseConfigured();
  const databaseMigrated = await isDatabaseReady();
  const requiresDatabase = env.NODE_ENV === "production" || Boolean(env.VERCEL);
  const demoFallbackAllowed = !requiresDatabase;

  if (databaseMigrated) {
    return {
      status: "ok",
      mode: "database",
      checks: {
        databaseConfigured,
        databaseMigrated,
        demoFallbackAllowed
      }
    };
  }

  if (requiresDatabase) {
    return {
      status: "error",
      mode: "unavailable",
      checks: {
        databaseConfigured,
        databaseMigrated,
        demoFallbackAllowed
      }
    };
  }

  return {
    status: databaseConfigured ? "degraded" : "ok",
    mode: "demo",
    checks: {
      databaseConfigured,
      databaseMigrated,
      demoFallbackAllowed
    }
  };
}
