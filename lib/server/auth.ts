import { randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { db } from "./db";

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export function passwordHash(password: string) { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`; }
export function passwordMatches(password: string, saved: string) { const [salt, key] = saved.split(":"); if (!salt || !key) return false; const actual = scryptSync(password, salt, 64); const expected = Buffer.from(key, "hex"); return actual.length === expected.length && timingSafeEqual(actual, expected); }
export const localDemo = () => process.env.ENABLE_DEMO_ADMIN === "true" || (process.env.NODE_ENV !== "production" && process.env.ENABLE_DEMO_ADMIN !== "false");
export async function seedAdmin() {
  if (localDemo()) {
    await db().query("INSERT INTO users(id,email,name,password,verified,created) VALUES(?,?,?,?,1,?) ON CONFLICT(email) DO NOTHING", [randomUUID(), "admin@local.test", "Admin", passwordHash("admin"), new Date().toISOString()]);
    const local = await db().one("SELECT id FROM users WHERE email=?", ["admin@local.test"]);
    if (local) await db().query("INSERT INTO admins(user_id,granted_by,created) VALUES(?,?,?) ON CONFLICT(user_id) DO NOTHING", [String(local.id), null, new Date().toISOString()]);
  }
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
  if (row?.email === "admin@local.test" && !localDemo()) return null;
  return row ? { id: String(row.id), email: String(row.email), name: String(row.name), role: row.role === "admin" ? "admin" : "owner" } : null;
}
export async function requireUser(request: Request) { const user = await sessionUser(request); if (!user) throw new ApiError(401, "Please log in to continue."); return user; }
export async function requireAdmin(request: Request) { const user = await requireUser(request); if (user.role !== "admin") throw new ApiError(403, "Admin access is required."); return user; }
export async function sessionCookie(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db().query("INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)", [hash(token), userId, new Date(Date.now() + 7 * 86400000).toISOString()]);
  return `workforce_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${process.env.COOKIE_SECURE === "true" ? "; Secure" : ""}`;
}
export async function rateLimit(key: string, max = 10, windowMs = 900000) {
  const now = new Date().toISOString();
  await db().query("DELETE FROM rate_limits WHERE expires<?", [now]);
  const result = await db().query("INSERT INTO rate_limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=rate_limits.count+1 RETURNING count", [key, new Date(Date.now() + windowMs).toISOString()]);
  if (Number(result.rows[0]?.count) > max) throw new ApiError(429, "Too many attempts. Please try again later.");
}
export async function sendOtp(userId: string, email: string) {
  const prior = await db().one("SELECT sent FROM verification WHERE user_id=?", [userId]);
  if (prior && Date.now() - Date.parse(String(prior.sent)) < 60000) throw new ApiError(429, "Wait 60 seconds before requesting another code.");
  await rateLimit(`otp-send:${userId}`, 5, 3600000);
  const code = String(randomInt(100000, 1000000));
  const at = new Date().toISOString();
  const dev = process.env.NODE_ENV !== "production" && process.env.MAIL_MODE !== "resend" && !process.env.RESEND_API_KEY;
  if (!dev && (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM)) throw new ApiError(503, "Verification email is not configured. Set RESEND_API_KEY and RESEND_FROM on the server.");
  // Reserve the resend window before network I/O. Concurrent requests cannot both rotate the code.
  const reserved = await db().query("INSERT INTO verification(user_id,hash,expires,attempts,sent) VALUES(?,?,?,0,?) ON CONFLICT(user_id) DO UPDATE SET hash=excluded.hash,expires=excluded.expires,attempts=0,sent=excluded.sent WHERE verification.sent<? RETURNING user_id", [userId, hash(`${userId}:${code}`), new Date(Date.now() + 600000).toISOString(), at, new Date(Date.now() - 60000).toISOString()]);
  if (!reserved.rows.length) throw new ApiError(429, "A verification code was just requested. Wait 60 seconds.");
  if (dev) console.info(`[LOCAL MAIL ONLY] Verification for ${email}: ${code}`);
  else {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.RESEND_FROM, to: [email], subject: "Verify your TheAI Pods account", text: `Your verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.` }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new ApiError(502, "The verification email could not be sent. Check the Resend configuration and resend after 60 seconds.");
  }
  return dev ? "Development email: find your code in the server terminal." : "A verification code has been sent to your email.";
}
export async function verifyOtp(userId: string, code: string) {
  const row = await db().one("SELECT * FROM verification WHERE user_id=?", [userId]);
  if (!row || String(row.expires) < new Date().toISOString() || Number(row.attempts) >= 5) throw new ApiError(400, "Code expired or attempt limit reached. Request a new code.");
  const attempt = await db().query("UPDATE verification SET attempts=attempts+1 WHERE user_id=? AND attempts<5 AND expires>? RETURNING hash", [userId, new Date().toISOString()]);
  if (!attempt.rows.length || hash(`${userId}:${code}`) !== attempt.rows[0].hash) throw new ApiError(400, "Invalid verification code.");
  const consumed = await db().query("DELETE FROM verification WHERE user_id=? AND hash=? RETURNING user_id", [userId, hash(`${userId}:${code}`)]);
  if (!consumed.rows.length) throw new ApiError(400, "Code was already used.");
  await db().query("UPDATE users SET verified=1 WHERE id=?", [userId]);
}
