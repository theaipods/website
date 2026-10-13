import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const children = [
  spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev"], { stdio: "inherit" }),
  spawn(process.execPath, ["--import", "tsx", "scripts/worker.ts"], { stdio: "inherit" }),
];
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; for (const child of children) child.kill(); process.exitCode = code; }
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
for (const child of children) child.on("exit", code => stop(code || 0));
