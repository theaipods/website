import { spawn } from "node:child_process";
const child = spawn(process.execPath, ["--import", "tsx", "scripts/worker.ts"], { stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } });
process.on("SIGINT", () => child.kill());
process.on("SIGTERM", () => child.kill());
child.on("exit", code => { process.exitCode = code || 0; });
