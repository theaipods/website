import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { db } from "./db";
import { bootstrapAdminEmail, bootstrapAdminPasswordHash } from "./bootstrap-admin";
import { isCompanyEmail, companyEmailMessage } from "../company-email";

export function requireCompanyEmail(email: string) {
  if (!isCompanyEmail(email, (process.env.BLOCKED_EMAIL_DOMAINS || "").split(","))) throw new ApiError(400, companyEmailMessage);
}

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export function passwordHash(password: string) { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`; }
export function passwordMatches(password: string, saved: string) { const [salt, key] = saved.split(":"); if (!salt || !key) return false; const actual = scryptSync(password, salt, 64); const expected = Buffer.from(key, "hex"); return actual.length === expected.length && timingSafeEqual(actual, expected); }
export async function seedAdmin() {
  // The marker, account migration and role grant commit together across processes.
  await db().transaction(async query => {
    const now = new Date().toISOString();
    const inserted = await query("INSERT INTO site_settings(key,value) VALUES('auth-bootstrap-v2','done') ON CONFLICT(key) DO NOTHING RETURNING key");
    if (!inserted.rows.length) return;
    const existing = (await query("SELECT id FROM users WHERE email=?", [bootstrapAdminEmail])).rows[0];
    const legacy = (await query("SELECT id FROM users WHERE email='admin@local.test'")).rows[0];
    let id = existing ? String(existing.id) : legacy ? String(legacy.id) : randomUUID();
    if (existing) {
      // Never overwrite a saved password, including a password imported from another environment.
      await query("UPDATE users SET verified=1 WHERE id=?", [id]);
    } else if (legacy) {
      await query("UPDATE users SET email=?,password=?,verified=1 WHERE id=?", [bootstrapAdminEmail, bootstrapAdminPasswordHash, id]);
    } else {
      await query("INSERT INTO users(id,email,name,password,verified,created) VALUES(?,?,?,?,1,?)", [id, bootstrapAdminEmail, "Ram", bootstrapAdminPasswordHash, now]);
    }
    if (legacy) {
      await query("DELETE FROM sessions WHERE user_id=?", [String(legacy.id)]);
      if (String(legacy.id) !== id) await query("DELETE FROM admins WHERE user_id=?", [String(legacy.id)]);
    }
    await query("INSERT INTO admins(user_id,granted_by,created) VALUES(?,?,?) ON CONFLICT(user_id) DO NOTHING", [id, null, now]);
  });
  const bootstrap = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  if (bootstrap) {
    const account = await db().one("SELECT id FROM users WHERE email=? AND verified=1", [bootstrap]);
    if (account) await db().query("INSERT INTO admins(user_id,granted_by,created) VALUES(?,?,?) ON CONFLICT(user_id) DO NOTHING", [String(account.id), null, new Date().toISOString()]);
  }
}
export type User = { id: string; email: string; name: string; role: "admin" | "owner" };
export async function sessionUser(request: Request): Promise<User | null> {
  const token = request.headers.get("cookie")?.split(";").map(x => x.trim()).find(x => x.startsWith("workforce_session="))?.slice(18);
  if (!token) return null;
  const row = await db().one("SELECT u.id,u.email,u.name,CASE WHEN a.user_id IS NULL THEN 'owner' ELSE 'admin' END AS role FROM users u JOIN sessions s ON s.user_id=u.id LEFT JOIN admins a ON a.user_id=u.id WHERE s.token=? AND s.expires>? AND u.verified=1", [hash(token), new Date().toISOString()]);
  if (row?.email === "admin@local.test") return null;
  if (row && !isCompanyEmail(String(row.email), (process.env.BLOCKED_EMAIL_DOMAINS || "").split(","))) return null;
  return row ? { id: String(row.id), email: String(row.email), name: String(row.name), role: row.role === "admin" ? "admin" : "owner" } : null;
}
export async function requireUser(request: Request) { const user = await sessionUser(request); if (!user) throw new ApiError(401, "Please log in to continue."); return user; }
export async function requireAdmin(request: Request) { const user = await requireUser(request); if (user.role !== "admin") throw new ApiError(403, "Admin access is required."); return user; }
export async function sessionCookie(userId: string, expectedPassword?: string) {
  const token = randomBytes(32).toString("hex");
  await db().transaction(async query => {
    // Lock the credential row before issuing a session. A concurrent reset either
    // rejects this stale login or deletes its session after this transaction commits.
    if (expectedPassword) {
      const current = await query("UPDATE users SET password=password WHERE id=? AND password=? AND verified=1 RETURNING id", [userId, expectedPassword]);
      if (!current.rows.length) throw new ApiError(401, "Your password changed. Please log in again.");
    }
    await query("INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)", [hash(token), userId, new Date(Date.now() + 7 * 86400000).toISOString()]);
  });
  return `workforce_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${process.env.COOKIE_SECURE === "true" ? "; Secure" : ""}`;
}
export async function rateLimit(key: string, max = 10, windowMs = 900000) {
  const now = new Date().toISOString();
  await db().query("DELETE FROM rate_limits WHERE expires<?", [now]);
  const result = await db().query("INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=rate_limits.count+1 RETURNING count", [key, new Date(Date.now() + windowMs).toISOString()]);
  if (Number(result.rows[0]?.count) > max) throw new ApiError(429, "Too many attempts. Please try again later.");
}
