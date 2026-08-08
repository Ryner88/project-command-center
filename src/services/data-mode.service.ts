import { isDatabaseReady } from "@/services/current-user.service";

export type DataMode = "database" | "demo";

export async function getDataMode(): Promise<DataMode> {
  return (await isDatabaseReady()) ? "database" : "demo";
}

export function isDatabaseMode(mode: DataMode) {
  return mode === "database";
}
