import { mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: node scripts/with-next-lock.mjs COMMAND [ARGS...]");
  process.exit(2);
}

const lockPath = path.resolve(".next.lock");
try {
  await mkdir(lockPath);
} catch (error) {
  if (error?.code === "EEXIST") {
    console.error("Another Next.js dev server or build is using this checkout. Stop it or use a separate checkout.");
    process.exit(73);
  }
  throw error;
}

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
  if (exit.signal) process.kill(process.pid, exit.signal);
  process.exitCode = exit.code ?? 1;
} finally {
  await cleanup();
}
