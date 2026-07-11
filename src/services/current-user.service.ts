import { DEMO_USER_ID } from "@/lib/constants";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@project-command-center.local";
const DEMO_NAME = "Demo User";
const USER_TABLE_REGCLASS_QUERY =
  "SELECT to_regclass('public.\"User\"')::text AS \"userTable\"";

declare global {
  var databaseReadyPromise: Promise<boolean> | undefined;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

async function checkDatabaseReady() {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    const result = await prisma.$queryRawUnsafe<Array<{ userTable: string | null }>>(
      USER_TABLE_REGCLASS_QUERY
    );

    return Boolean(result[0]?.userTable);
  } catch (error) {
    console.warn("Database configured but not ready, falling back to demo store.", error);
    return false;
  }
}

export async function isDatabaseReady() {
  global.databaseReadyPromise ??= checkDatabaseReady();
  return global.databaseReadyPromise;
}

export async function ensureCurrentUser() {
  const userId = await getCurrentUserId();

  return prisma.user.upsert({
    where: {
      id: userId || DEMO_USER_ID
    },
    update: {
      email: DEMO_EMAIL,
      name: DEMO_NAME
    },
    create: {
      id: userId || DEMO_USER_ID,
      email: DEMO_EMAIL,
      name: DEMO_NAME
    }
  });
}
