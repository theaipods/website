import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Database, db } from "../lib/server/db";
import { seedAdmin, passwordHash, passwordMatches, sessionCookie, sessionUser } from "../lib/server/auth";
import { startAuthChallenge, verifyAuthChallenge, finishAuthChallenge } from "../lib/server/auth-challenges";
import { bootstrapAdminEmail, bootstrapAdminPasswordHash } from "../lib/server/bootstrap-admin";
import { isCompanyEmail } from "../lib/company-email";

const folder = mkdtempSync(path.join(tmpdir(), "pods-auth-"));
process.env.DATABASE_URL = `file:${path.join(folder, "auth.sqlite")}`;
process.env.RESEND_API_KEY = "test-placeholder";
process.env.RESEND_FROM = "TheAIPods <security@theaipods.com>";

test("verified signup and account recovery security", async t => {
  const realFetch = globalThis.fetch;
  const mail: { to: string[]; text: string; html: string; attachments: { content_id: string; content: string }[] }[] = [];
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), "https://api.resend.com/emails");
    mail.push(JSON.parse(String(options?.body)));
    return Response.json({ id: "mock-delivery" });
  };
  const latestCode = () => mail.at(-1)!.text.match(/Your code: (\d{6})/)![1];
  const verify = async (email: string, purpose: "signup" | "reset") => {
    const result = await startAuthChallenge(email, purpose);
    return verifyAuthChallenge(email, purpose, result.challengeId, latestCode());
  };
  try {
    await t.test("one-time bootstrap migrates the legacy account and invalidates old sessions", async () => {
      await db().query("INSERT INTO users(id,email,name,password,verified,created) VALUES('legacy','admin@local.test','Admin',?,1,?)", [passwordHash("admin"), new Date().toISOString()]);
      await db().query("INSERT INTO admins(user_id,created) VALUES('legacy',?)", [new Date().toISOString()]);
      await sessionCookie("legacy");
      await Promise.all([seedAdmin(), seedAdmin()]);
      const user = await db().one("SELECT * FROM users WHERE email=?", [bootstrapAdminEmail]);
      assert.equal(user?.id, "legacy");
      assert.equal(user?.password, bootstrapAdminPasswordHash);
      assert.equal(await db().one("SELECT * FROM sessions WHERE user_id='legacy'"), undefined);
      assert.equal(await db().one("SELECT * FROM users WHERE email='admin@local.test'"), undefined);
    });
    await t.test("Resend email contains the embedded logo; account exists only after proof and password", async () => {
      const email = "first@company.test";
      const start = await startAuthChallenge(email, "signup"); const code = latestCode();
      assert.equal(await db().one("SELECT * FROM users WHERE email=?", [email]), undefined);
      assert.ok(mail.at(-1)!.html.includes('src="cid:theaipods-logo"'));
      assert.equal(mail.at(-1)!.attachments[0].content_id, "theaipods-logo");
      assert.ok(mail.at(-1)!.attachments[0].content.length > 0);
      const stored = await db().one("SELECT * FROM auth_challenges WHERE email=?", [email]);
      assert.notEqual(stored?.hash, code);
      await assert.rejects(verifyAuthChallenge(email, "reset", start.challengeId, code));
      await assert.rejects(verifyAuthChallenge("other@company.test", "signup", start.challengeId, code));
      const proof = await verifyAuthChallenge(email, "signup", start.challengeId, code);
      await assert.rejects(verifyAuthChallenge(email, "signup", start.challengeId, code));
      assert.notEqual((await db().one("SELECT grant_hash FROM auth_challenges WHERE email=?", [email]))?.grant_hash, proof.grant);
      await assert.rejects(finishAuthChallenge(email, "reset", proof.grant, "my-long-password"));
      const id = await finishAuthChallenge(email, "signup", proof.grant, "my-long-password", "First");
      assert.ok(passwordMatches("my-long-password", String((await db().one("SELECT password FROM users WHERE id=?", [id]))?.password)));
      await assert.rejects(finishAuthChallenge(email, "signup", proof.grant, "my-long-password", "First"));
    });
    await t.test("admin reset replaces the stored password, revokes sessions and survives restart/bootstrap", async () => {
      const cookie = await sessionCookie("legacy");
      const req = new Request("http://localhost", { headers: { cookie } });
      assert.equal((await sessionUser(req))?.role, "admin");
      const proof = await verify(bootstrapAdminEmail, "reset");
      const results = await Promise.allSettled([
        finishAuthChallenge(bootstrapAdminEmail, "reset", proof.grant, "new-test-password"),
        finishAuthChallenge(bootstrapAdminEmail, "reset", proof.grant, "other-test-password"),
      ]);
      assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
      assert.equal(await sessionUser(req), null);
      await assert.rejects(sessionCookie("legacy", bootstrapAdminPasswordHash), /password changed/);
      await seedAdmin();
      const reopened = new Database(process.env.DATABASE_URL);
      try {
        const saved = await reopened.one("SELECT password FROM users WHERE email=?", [bootstrapAdminEmail]);
        assert.notEqual(saved?.password, bootstrapAdminPasswordHash);
        assert.ok(passwordMatches("new-test-password", String(saved?.password)));
      } finally { await reopened.close(); }
    });
    await t.test("five guesses, expiry, resend cooldown and code replacement are enforced", async () => {
      const email = "limits@company.test";
      const start = await startAuthChallenge(email, "signup"); const code = latestCode();
      await assert.rejects(startAuthChallenge(email, "signup"), /60 seconds/);
      for (let i = 0; i < 5; i++) await assert.rejects(verifyAuthChallenge(email, "signup", start.challengeId, "000000"));
      await assert.rejects(verifyAuthChallenge(email, "signup", start.challengeId, code));
      await db().query("UPDATE auth_challenges SET sent='2000-01-01' WHERE email=?", [email]);
      const next = await startAuthChallenge(email, "signup"); const nextCode = latestCode();
      await assert.rejects(verifyAuthChallenge(email, "signup", start.challengeId, code));
      await db().query("UPDATE auth_challenges SET expires='2000-01-01' WHERE email=?", [email]);
      await assert.rejects(verifyAuthChallenge(email, "signup", next.challengeId, nextCode));
      const proof = await verify("proof@company.test", "signup");
      await db().query("UPDATE auth_challenges SET grant_expires='2000-01-01' WHERE email='proof@company.test'");
      await assert.rejects(finishAuthChallenge("proof@company.test", "signup", proof.grant, "my-long-password", "Name"));
    });
    await t.test("new code invalidates a verified but unused grant", async () => {
      const email = "rotate@company.test"; const proof = await verify(email, "signup");
      await db().query("UPDATE auth_challenges SET sent='2000-01-01' WHERE email=?", [email]);
      await startAuthChallenge(email, "signup");
      await assert.rejects(finishAuthChallenge(email, "signup", proof.grant, "my-long-password", "Name"));
    });
    await t.test("reset for an unknown email is generic and cannot verify; signup cannot overwrite an existing user", async () => {
      const count = mail.length;
      const start = await startAuthChallenge("missing@company.test", "reset");
      assert.ok(start.message.startsWith("If this email")); assert.equal(mail.length, count);
      await assert.rejects(verifyAuthChallenge("missing@company.test", "reset", start.challengeId, "123456"));
      const existing = await startAuthChallenge("first@company.test", "signup");
      assert.equal(mail.length, count);
      await assert.rejects(verifyAuthChallenge("first@company.test", "signup", existing.challengeId, "123456"));
    });
    await t.test("delivery failure never leaves a valid code; absent config never falls back to console", async () => {
      globalThis.fetch = async () => Response.json({ error: "rejected" }, { status: 403 });
      await assert.rejects(startAuthChallenge("failure@company.test", "signup"), /couldn't send/);
      assert.equal((await db().one("SELECT hash FROM auth_challenges WHERE email='failure@company.test'"))?.hash, "");
      delete process.env.RESEND_API_KEY;
      await assert.rejects(startAuthChallenge("config@company.test", "signup"), /not configured/);
      assert.equal(await db().one("SELECT id FROM auth_challenges WHERE email='config@company.test'"), undefined);
    });
    await t.test("personal, disposable and malformed emails are rejected", () => {
      for (const email of ["x@gmail.com", "x@sub.gmail.com", "x@mailinator.com", "x@y@company.com", "@company.com", "x y@company.com"]) assert.equal(isCompanyEmail(email), false, email);
      assert.equal(isCompanyEmail("person@theaipods.com"), true);
    });
  } finally { globalThis.fetch = realFetch; await db().close(); rmSync(folder, { recursive: true, force: true }); }
});
