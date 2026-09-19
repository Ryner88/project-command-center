import { getReliabilitySnapshot, retryRead } from "@/lib/observability";
import { getDeploymentHealth } from "@/services/deployment-health.service";

export async function getReadiness() {
  try {
    const health = await retryRead(async () => {
      const result = await getDeploymentHealth();
      const databaseRequired = result.checks.databaseConfigured || process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
      if (databaseRequired && result.mode !== "database") throw new Error("Database is not ready");
      return result;
    });
    return { ...health, ready: health.status !== "error" };
  } catch {
    return { status: "error" as const, mode: "unavailable" as const, ready: false, checks: { databaseConfigured: Boolean(process.env.DATABASE_URL), databaseMigrated: false, demoFallbackAllowed: process.env.NODE_ENV !== "production" } };
  }
}

export async function getDiagnostics() {
  return {
    buildId: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.BUILD_ID ?? "local",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    reliability: getReliabilitySnapshot(),
    readiness: await getReadiness(),
    thresholds: { readinessFailures: 2, failedOperationsInFiveMinutes: 5, healthLatencyMs: 2000 }
  };
}
