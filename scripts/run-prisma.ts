import { spawn } from "node:child_process";
import { applyDatabaseEnvAliases } from "./env-aliases";

applyDatabaseEnvAliases();

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Missing Prisma command arguments.");
  process.exit(1);
}

const child = spawn("npx", ["prisma", ...args], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
