import { workerTick } from "../lib/server/orchestrator";
import { researchWorkerTick } from "../lib/server/research-jobs";
import { indexPendingKnowledge } from "../lib/server/embeddings";
import { db } from "../lib/server/db";
import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");
console.info("The AI Pods worker is ready. Polling persisted jobs every 1.5 seconds.");
let running = true;
process.on("SIGINT", () => { running = false; });
process.on("SIGTERM", () => { running = false; });
async function main() {
  await Promise.all([
    (async()=>{while(running){await workerTick();await new Promise(resolve=>setTimeout(resolve,1500));}})(),
    (async()=>{while(running){try{await researchWorkerTick();}catch{console.error('Research worker could not poll; retrying.');}await new Promise(resolve=>setTimeout(resolve,1500));}})(),
    (async()=>{while(running){try{await indexPendingKnowledge();}catch{console.error('Knowledge indexing deferred; retrying.');}await new Promise(resolve=>setTimeout(resolve,15000));}})(),
  ]);
  await db().close();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
