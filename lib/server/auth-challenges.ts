import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { db } from "./db";
import { ApiError, hash, passwordHash, rateLimit, requireCompanyEmail } from "./auth";
import { deliverAuthCode, requireAuthMail, type OtpPurpose } from "./auth-email";

const invalidCode = () => new ApiError(400, "Code is incorrect, expired or already used. Request a new code if needed.");
const invalidGrant = () => new ApiError(400, "Verification has expired or was already used. Please verify your email again.");

export async function startAuthChallenge(email: string, purpose: OtpPurpose) {
  requireCompanyEmail(email);
  try { requireAuthMail(); } catch { throw new ApiError(503, "Email verification is not configured. Set RESEND_API_KEY and RESEND_FROM on the server."); }
  await rateLimit(`auth-send:${purpose}:${email}`, 5, 3600000);
  const id = randomUUID();
  const code = String(randomInt(100000, 1000000));
  const now = new Date().toISOString();
  const reserved = await db().query("INSERT INTO auth_challenges(email,purpose,id,hash,expires,attempts,sent) VALUES(?,?,?,?,?,0,?) ON CONFLICT(email,purpose) DO UPDATE SET id=excluded.id,hash=excluded.hash,expires=excluded.expires,attempts=0,sent=excluded.sent,grant_hash=NULL,grant_expires=NULL WHERE auth_challenges.sent<? RETURNING id", [email, purpose, id, hash(`${id}:${code}`), new Date(Date.now() + 600000).toISOString(), now, new Date(Date.now() - 60000).toISOString()]);
  if (!reserved.rows.length) throw new ApiError(429, "Wait 60 seconds before requesting another code.");
  const user = await db().one("SELECT verified FROM users WHERE email=?", [email]);
  const eligible = purpose === "reset" ? !!user?.verified : !user?.verified;
  if (eligible) {
    try { await deliverAuthCode(email, code, purpose); }
    catch {
      // No usable code or grant remains after failed delivery; retain the cooldown.
      await db().query("UPDATE auth_challenges SET hash='',expires=? WHERE id=?", [now, id]);
      throw new ApiError(502, "We couldn't send the code. Please try again after 60 seconds.");
    }
  } else {
    await db().query("UPDATE auth_challenges SET hash='',expires=? WHERE id=?", [now, id]);
  }
  // Same response and challenge shape whether or not an account is eligible.
  return { challengeId: id, message: purpose === "reset" ? "If this email has a verified account, a code is on its way. Check your inbox and spam folder." : "If this email can create an account, a code is on its way. Already registered? Log in or reset your password." };
}

export async function verifyAuthChallenge(email: string, purpose: OtpPurpose, id: string, code: string) {
  // Wrong guesses commit before validation. Resend rotates the ID and invalidates old codes.
  const attempt = await db().query("UPDATE auth_challenges SET attempts=attempts+1 WHERE email=? AND purpose=? AND id=? AND attempts<5 AND expires>? AND grant_hash IS NULL RETURNING hash", [email, purpose, id, new Date().toISOString()]);
  if (!attempt.rows.length || attempt.rows[0].hash !== hash(`${id}:${code}`)) throw invalidCode();
  const grant = randomBytes(32).toString("hex");
  const saved = await db().query("UPDATE auth_challenges SET hash='',grant_hash=?,grant_expires=? WHERE email=? AND purpose=? AND id=? AND hash=? AND grant_hash IS NULL AND expires>? RETURNING id", [hash(grant), new Date(Date.now() + 600000).toISOString(), email, purpose, id, hash(`${id}:${code}`), new Date().toISOString()]);
  if (!saved.rows.length) throw invalidCode();
  return { grant };
}

export async function finishAuthChallenge(email: string, purpose: OtpPurpose, grant: string, password: string, name?: string) {
  requireCompanyEmail(email);
  if (password.length < 10 || password.length > 128) throw new ApiError(400, "Choose a password between 10 and 128 characters.");
  const encoded = passwordHash(password);
  return db().transaction(async query => {
    const consumed = await query("DELETE FROM auth_challenges WHERE email=? AND purpose=? AND grant_hash=? AND grant_expires>? RETURNING id", [email, purpose, hash(grant), new Date().toISOString()]);
    if (!consumed.rows.length) throw invalidGrant();
    let user = (await query("SELECT id,verified FROM users WHERE email=?", [email])).rows[0];
    if (purpose === "reset") {
      if (!user?.verified) throw invalidGrant();
      await query("UPDATE users SET password=? WHERE id=?", [encoded, String(user.id)]);
      await query("DELETE FROM sessions WHERE user_id=?", [String(user.id)]);
    } else {
      if (user?.verified) throw new ApiError(409, "This account already exists. Please log in or reset your password.");
      if (!name?.trim() || name.trim().length > 120) throw new ApiError(400, "Enter your name (up to 120 characters).");
      if (user) {
        await query("UPDATE users SET name=?,password=?,verified=1 WHERE id=?", [name.trim(), encoded, String(user.id)]);
        await query("DELETE FROM sessions WHERE user_id=?", [String(user.id)]);
      } else {
        const id = randomUUID();
        const inserted = await query("INSERT INTO users(id,email,name,password,verified,created) VALUES(?,?,?,?,1,?) ON CONFLICT(email) DO NOTHING RETURNING id", [id, email, name.trim(), encoded, new Date().toISOString()]);
        if (!inserted.rows.length) throw new ApiError(409, "This account already exists. Please log in.");
        user = { id, verified: 1 };
      }
    }
    await query("DELETE FROM auth_challenges WHERE email=?", [email]);
    await query("DELETE FROM verification WHERE user_id=?", [String(user.id)]);
    return String(user.id);
  });
}
