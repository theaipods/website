import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Database } from "../lib/server/db";

test("database export/import preserves records and refuses overwrite or nonempty destination", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "aipods-transfer-"));
  const sourceUrl = `file:${path.join(directory, "source.sqlite")}`; const targetUrl = `file:${path.join(directory, "target.sqlite")}`; const filename = path.join(directory, "backup.json");
  const run = (action: string, url: string) => spawnSync(process.execPath, ["--import", "tsx", "scripts/db-transfer.ts", action, filename], { cwd: process.cwd(), encoding: "utf8", env: { ...process.env, DATABASE_URL: url } });
  try {
    const source = new Database(sourceUrl);
    await source.query("INSERT INTO users(id,email,name,password,verified,created) VALUES(?,?,?,?,?,?)", ["u", "test@example.test", "Test", "hash", 1, "2026-01-01"]);
    await source.query("INSERT INTO companies(id,owner_id,data,created) VALUES(?,?,?,?)", ["c", "u", '{"name":"Persisted"}', "2026-01-01"]);
    await source.query("INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)", ["secret-session", "u", "2027-01-01"]); await source.close();
    const exported = run("export", sourceUrl); assert.equal(exported.status, 0, exported.stderr); assert.doesNotMatch(readFileSync(filename, "utf8"), /secret-session/);
    assert.notEqual(run("export", sourceUrl).status, 0);
    const imported = run("import", targetUrl); assert.equal(imported.status, 0, imported.stderr);
    const target = new Database(targetUrl); assert.equal((await target.one("SELECT data FROM companies WHERE id=?", ["c"]))?.data, '{"name":"Persisted"}'); await target.close();
    const repeat = run("import", targetUrl); assert.notEqual(repeat.status, 0); assert.match(repeat.stderr, /empty destination/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
