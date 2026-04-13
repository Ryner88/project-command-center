import path from "node:path";

export function getStoragePath(...segments: string[]) {
  return path.join(process.cwd(), "storage", ...segments);
}
