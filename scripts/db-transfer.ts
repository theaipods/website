import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { Database } from "../lib/server/db";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");
const originalTables = ["users", "companies", "knowledge", "chunks", "pods", "audit", "controls"] as const;
const tables = ["users", "companies", "account_plans", "projects", "profile_mcp", "knowledge", "chunks", "chunk_embeddings", "research_jobs", "pods", "audit", "controls"] as const;
type Backup = { format: 1; created: string; tables: Record<string, Record<string, string | number | null>[]> };
async function main() {
  const [action, filename] = process.argv.slice(2);
  if (!["export", "import"].includes(action) || !filename) throw new Error("Usage: npm run db:export -- path.json OR npm run db:import -- path.json. Stop the app and worker first.");
  const database = new Database();
  try {
    if (action === "export") {
      const backup: Backup = { format: 1, created: new Date().toISOString(), tables: {} };
      for (const table of tables) backup.tables[table] = await database.all(`SELECT * FROM ${table}`);
      writeFileSync(filename, JSON.stringify(backup), { flag: "wx", mode: 0o600 });
      console.info(`Exported ${tables.length} tables. Treat this backup as private company data. Sessions are intentionally excluded.`);
    } else {
      const backup = JSON.parse(readFileSync(filename, "utf8")) as Backup;
      if (backup.format !== 1 || originalTables.some(t => !Array.isArray(backup.tables?.[t]))) throw new Error("Unsupported backup format");
      for (const table of tables) if (Number((await database.one(`SELECT COUNT(*) AS n FROM ${table}`))?.n)) throw new Error(`Import requires an empty destination: ${table} contains data`);
      await database.initialized;
      const client = database.pool ? await database.pool.connect() : null;
      const execute = async (sql: string, values: (string | number | null)[] = []) => { if (client) { let n = 0; await client.query(sql.replace(/\?/g, () => `$${++n}`), values); } else await database.query(sql, values); };
      try {
        await execute("BEGIN");
        for (const table of tables) for (const row of backup.tables[table] || []) {
          const columns = Object.keys(row);
          if (!columns.length || columns.some(c => !/^[a-z_]+$/.test(c))) throw new Error("Invalid backup columns");
          await execute(`INSERT INTO ${table}(${columns.join(",")}) VALUES(${columns.map(() => "?").join(",")})`, Object.values(row));
        }
        await execute("COMMIT"); console.info("Import complete. Existing users must log in again. Unverified users must request a fresh OTP.");
      } catch (error) { await execute("ROLLBACK"); throw error; } finally { client?.release(); }
    }
  } finally { await database.close(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
