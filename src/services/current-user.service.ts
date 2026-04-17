import { DEMO_USER_ID } from "@/lib/constants";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@project-command-center.local";
const DEMO_NAME = "Demo User";

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
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
