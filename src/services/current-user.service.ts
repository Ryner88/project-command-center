import { DEMO_USER_ID } from "@/lib/constants";
import { getCurrentUserId } from "@/lib/auth";
import { users } from "@/repositories/persistence.repository";

const DEMO_EMAIL = "demo@project-command-center.local";
const DEMO_NAME = "Demo User";

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

async function checkDatabaseReady() {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    return await users.ready();
  } catch (error) {
    console.warn(JSON.stringify({ level: "warn", service: "project-command-center", event: "database.not_ready", errorType: error instanceof Error ? error.name : "UnknownError" }));
    return false;
  }
}

export async function isDatabaseReady() {
  return checkDatabaseReady();
}

export async function ensureCurrentUser() {
  const userId = await getCurrentUserId();

  return users.ensure(userId || DEMO_USER_ID, DEMO_EMAIL, DEMO_NAME);
}
