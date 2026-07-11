import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.env.DATABASE_URL) {
  run("prisma", ["migrate", "deploy"]);
} else {
  console.log("DATABASE_URL is not set; skipping Prisma migrations.");
}

run("next", ["build"]);
