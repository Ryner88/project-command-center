import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: node scripts/with-next-lock.mjs COMMAND [ARGS...]");
  process.exit(2);
}

const checkoutKey = createHash("sha256").update(process.cwd()).digest("hex").slice(0, 16);
const lockPath = path.join(tmpdir(), `pcc-next-${checkoutKey}.lock`);
async function acquireLock() {
  try {
    await mkdir(lockPath);
    await writeFile(path.join(lockPath, "pid"), String(process.pid));
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const ownerPid = Number(await readFile(path.join(lockPath, "pid"), "utf8").catch(() => "0"));
    try {
      if (!Number.isInteger(ownerPid) || ownerPid <= 0) throw new Error("stale lock");
      process.kill(ownerPid, 0);
      console.error("Another Next.js dev server or build is using this checkout. Stop it or use a separate checkout.");
      process.exit(73);
    } catch {
      await rm(lockPath, { recursive: true, force: true });
      await acquireLock();
    }
  }
}
await acquireLock();

let child;
const cleanup = async () => rm(lockPath, { recursive: true, force: true });
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child?.kill(signal));
}

try {
  child = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  const exit = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
  const signalExitCodes = { SIGINT: 130, SIGTERM: 143 };
  process.exitCode = exit.code ?? signalExitCodes[exit.signal] ?? 1;
} finally {
  await cleanup();
}
