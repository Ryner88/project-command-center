import { isDatabaseReady } from "@/services/current-user.service";

export type DataMode = "database" | "demo";

export async function getDataMode(): Promise<DataMode> {
  if (await isDatabaseReady()) {
    return "database";
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "database";
  }

  return "demo";
}

export function isDatabaseMode(mode: DataMode) {
  return mode === "database";
}
