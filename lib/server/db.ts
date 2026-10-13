import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

type Value = string | number | null;
type Row = Record<string, string | number | null>;
const schema = [
  `CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, verified INTEGER NOT NULL DEFAULT 0, created TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS verification (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, hash TEXT NOT NULL, expires TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, sent TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, data TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, created TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS knowledge (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, size INTEGER NOT NULL, type TEXT NOT NULL, category TEXT NOT NULL, status TEXT NOT NULL, content TEXT NOT NULL, blob TEXT NOT NULL, created TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS chunks (id TEXT PRIMARY KEY, knowledge_id TEXT NOT NULL REFERENCES knowledge(id) ON DELETE CASCADE, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, content TEXT NOT NULL, ordinal INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS pods (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, data TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, created TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS agent_settings (company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, agent_id TEXT NOT NULL, autonomy INTEGER NOT NULL, manager TEXT NOT NULL, updated TEXT NOT NULL, PRIMARY KEY(company_id,agent_id))`,
  `CREATE TABLE IF NOT EXISTS audit (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, company_id TEXT, action TEXT NOT NULL, at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS controls (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, killed INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS admins (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, granted_by TEXT, created TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS mcp_servers (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, name TEXT NOT NULL, endpoint TEXT NOT NULL, status TEXT NOT NULL, health TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL, last_health_check TEXT)`,
  `CREATE TABLE IF NOT EXISTS mcp_tools (id TEXT PRIMARY KEY, server_id TEXT NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT NOT NULL, input_schema TEXT NOT NULL, risk TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 0, discovered TEXT NOT NULL, UNIQUE(server_id,name))`,
  `CREATE TABLE IF NOT EXISTS mcp_events (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, server_id TEXT NOT NULL REFERENCES mcp_servers(id) ON DELETE CASCADE, type TEXT NOT NULL, detail TEXT NOT NULL, at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS demo_leads (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, source TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS demo_bookings (id TEXT PRIMARY KEY, lead_id TEXT NOT NULL REFERENCES demo_leads(id), first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL, job_title TEXT NOT NULL, industry TEXT NOT NULL, company_size TEXT NOT NULL, primary_goal TEXT NOT NULL, current_tools TEXT NOT NULL, areas_of_interest TEXT NOT NULL, additional_context TEXT NOT NULL, scheduled_at TEXT NOT NULL, timezone TEXT NOT NULL, duration INTEGER NOT NULL, meeting_type TEXT NOT NULL, provider TEXT NOT NULL, external_event_id TEXT, status TEXT NOT NULL, manage_token_hash TEXT NOT NULL, slot_key TEXT UNIQUE, recommendation TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS demo_booking_events (id TEXT PRIMARY KEY, booking_id TEXT REFERENCES demo_bookings(id) ON DELETE CASCADE, type TEXT NOT NULL, detail TEXT NOT NULL, at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS demo_analytics (id TEXT PRIMARY KEY, event TEXT NOT NULL, path TEXT NOT NULL, detail TEXT NOT NULL, at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, type TEXT NOT NULL, start_at TEXT NOT NULL, end_at TEXT NOT NULL, featured INTEGER NOT NULL DEFAULT 0, visibility TEXT NOT NULL DEFAULT 'PUBLIC', created TEXT NOT NULL, updated TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS event_speakers (id TEXT PRIMARY KEY, data TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS event_registrations (id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE, email TEXT NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL, manage_token_hash TEXT NOT NULL, created TEXT NOT NULL, updated TEXT NOT NULL, UNIQUE(event_id,email))`,
  `CREATE TABLE IF NOT EXISTS event_analytics (id TEXT PRIMARY KEY, event TEXT NOT NULL, path TEXT NOT NULL, detail TEXT NOT NULL, at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS companies_owner ON companies(owner_id)`,
  `CREATE INDEX IF NOT EXISTS pods_company ON pods(company_id)`,
  `CREATE INDEX IF NOT EXISTS chunks_company ON chunks(company_id)`,
  `CREATE INDEX IF NOT EXISTS mcp_servers_company ON mcp_servers(company_id)`,
  `CREATE INDEX IF NOT EXISTS mcp_events_company ON mcp_events(company_id,at)`,
  `CREATE INDEX IF NOT EXISTS demo_bookings_email ON demo_bookings(email,created)`,
  `CREATE INDEX IF NOT EXISTS demo_booking_events_booking ON demo_booking_events(booking_id,at)`,
  `CREATE INDEX IF NOT EXISTS demo_analytics_event ON demo_analytics(event,at)`,
  `CREATE INDEX IF NOT EXISTS events_start ON events(start_at,status)`,
  `CREATE INDEX IF NOT EXISTS event_registrations_event ON event_registrations(event_id,created)`,
  `CREATE INDEX IF NOT EXISTS event_analytics_event ON event_analytics(event,at)`,
];
export class Database {
  sqlite?: DatabaseSync;
  pool?: Pool;
  initialized: Promise<void>;
  constructor(url = process.env.DATABASE_URL || "file:./data/workforce.sqlite") {
    if (url.startsWith("postgres")) this.pool = new Pool({ connectionString: url });
    else {
      const filename = url === ":memory:" ? url : path.resolve(url.replace(/^file:/, ""));
      if (filename !== ":memory:") mkdirSync(path.dirname(filename), { recursive: true });
      this.sqlite = new DatabaseSync(filename);
      this.sqlite.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
    }
    this.initialized = this.initialize();
  }
  private async raw(sql: string, values: Value[] = []): Promise<{ rows: Row[]; changes: number }> {
    if (this.pool) {
      let i = 0;
      const result = await this.pool.query(sql.replace(/\?/g, () => `$${++i}`), values);
      return { rows: result.rows, changes: result.rowCount || 0 };
    }
    const stmt = this.sqlite!.prepare(sql);
    if (/^\s*(SELECT|WITH)|\bRETURNING\b/i.test(sql)) return { rows: stmt.all(...values) as Row[], changes: 0 };
    const result = stmt.run(...values);
    return { rows: [], changes: Number(result.changes) };
  }
  private async initialize() {
    for (const sql of schema) await this.raw(sql);
    await this.raw("INSERT INTO schema_migrations(version,applied) VALUES(1,?) ON CONFLICT(version) DO NOTHING", [new Date().toISOString()]);
    await this.raw("INSERT INTO schema_migrations(version,applied) VALUES(2,?) ON CONFLICT(version) DO NOTHING", [new Date().toISOString()]);
  }
  async query(sql: string, values: Value[] = []) { await this.initialized; return this.raw(sql, values); }
  async all(sql: string, values: Value[] = []) { return (await this.query(sql, values)).rows; }
  async one(sql: string, values: Value[] = []) { return (await this.all(sql, values))[0]; }
  async close() { await this.initialized; this.sqlite?.close(); await this.pool?.end(); }
}
const globalDb = globalThis as unknown as { workforceDb?: Database };
export function db() { return globalDb.workforceDb ??= new Database(); }
