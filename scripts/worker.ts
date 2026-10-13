import { workerTick } from "../lib/server/orchestrator";
import { db } from "../lib/server/db";
import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
console.info("The AI Pods worker is ready. Polling persisted jobs every 1.5 seconds.");
let running = true;
process.on("SIGINT", () => { running = false; });
process.on("SIGTERM", () => { running = false; });
async function main() {
  while (running) { await workerTick(); await new Promise(resolve => setTimeout(resolve, 1500)); }
  await db().close();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
