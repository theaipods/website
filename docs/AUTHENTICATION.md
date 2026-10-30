# Authentication and password recovery

## Configure Resend locally and on Railway

1. Verify your sending domain in Resend and create an API key with send permission.
2. Add these private server variables to `web/.env.local` locally and Railway **Variables** in production:

   ```dotenv
   RESEND_API_KEY=your-private-resend-key
   RESEND_FROM=TheAIPods <security@theaipods.com>
   ```

   Use your verified sending domain. Restricted test senders cannot email arbitrary new users. Never use a `NEXT_PUBLIC_` prefix or commit these secrets.
3. Locally use `APP_URL=http://localhost:3000`, `COOKIE_SECURE=false`, and persistent SQLite via `DATABASE_URL=file:./data/workforce.sqlite`.
4. On Railway use the public HTTPS origin for `APP_URL`, `COOKIE_SECURE=true`, and the hosted PostgreSQL connection string for `DATABASE_URL`. Cloudflare proxies this Node server; it does not replace the database. The trusted ingress must replace client-supplied `x-forwarded-for` headers for IP rate limits.
5. Restart the local server or redeploy Railway, then verify delivery to a mailbox you control. Codes are never logged or returned by the API. Missing configuration and failed delivery produce explicit errors.

Emails contain HTML and text, and embed `public/brand/official-logo.jpg` as a CID attachment. The recipient need not reach localhost. Next file tracing includes the logo for the API; preserve this asset in deployments. See [Resend inline attachments](https://resend.com/changelog/embed-images-using-cid).

## Admin initialization and changes

The requested initial admin email is `ram@theaipods.com`. Its supplied initial password is represented by a salted server-side verifier in `lib/server/bootstrap-admin.ts`, never plaintext or client code. `seedAdmin()` atomically records `auth-bootstrap-v2` in `site_settings` on first initialization per database. It renames the legacy local admin when possible, preserves its ID/company relationships, and revokes old sessions. `admin/admin` is retired. If the requested email already exists, its saved password is preserved. `INITIAL_ADMIN_EMAIL` optionally grants admin access to another registered, verified work account.

Choose **Admin login** on `/login`. To change a password, use **Forgot password**, or **Change password** in the admin toolbar/workspace navigation. `/reset-password` works while signed in too. Enter the account's work email, verify its code, choose and confirm a new password, then log in again. Password update, token consumption and session revocation commit together. Restarting/redeploying cannot restore the bootstrap password. The temporary bootstrap verifier is provisioning material; rotate the account through recovery before public production use.

Local SQLite and hosted PostgreSQL hold separate accounts unless both environments deliberately point at the same database. Changing one does not change the other. Back up the database; never remove its bootstrap marker to reset credentials. Database transfers preserve saved user password hashes, including the admin's changed password.

This repository runs on Node 24+ with SQLite/PostgreSQL. Cloudflare in front of Node/Railway fits this architecture. Direct Workers/Pages Functions/D1 deployment is not implemented or tested.

## New users and feedback

**Work email → six-digit code → name/password → workspace.** No account or session is created until verification and password setup complete. Old unverified registrations can finish through this flow. Verified users must log in or recover their password. Personal/disposable email domains and their subdomains are blocked using `lib/company-email.ts`; `BLOCKED_EMAIL_DOMAINS` adds exclusions. This cannot prove employment or detect every disposable provider.

Errors keep readable alert text alongside a 38px envelope/X that appears, shakes once, settles and stops. Successful login/signup briefly confirms access before navigation. Reduced-motion users get static feedback. Login and recovery have no marketing footer.

## API and storage

All mutations are same-origin JSON POST requests under `/api`:

| Endpoint | Input | Result |
| --- | --- | --- |
| `auth/register` | `email` | Signup challenge ID and generic delivery message |
| `auth/password-reset` | `email` | Reset challenge ID and generic delivery message |
| `auth/resend` | `email`, `purpose: signup/reset` | New challenge; old code/grant invalidated |
| `auth/verify` | `email`, `purpose`, `challengeId`, `code` | Single-use password-setting grant; no session |
| `auth/complete-signup` | `email`, `grant`, `name`, `password` | Verified account and HttpOnly session |
| `auth/reset-password` | `email`, `grant`, `password` | Password replaced; existing sessions revoked |

`auth_challenges` stores code hashes, hashed grants, purpose, expiry and attempt/cooldown metadata. No plaintext codes, grants or passwords are stored. Codes expire in 10 minutes, allow five guesses, and can be resent after 60 seconds, up to five send requests per purpose/email/hour. IP rate limits also apply. Grants expire in ten minutes and are consumed atomically with the password write. Resending invalidates the prior grant. Failed delivery invalidates the code but retains cooldown. Unknown reset emails and existing signup emails get the same start-response shape and cannot obtain a grant. The legacy `verification` table remains for database compatibility but is no longer read by authentication.

`auth/register` previously accepted name/password and created an unverified user. That contract is replaced by the email-first flow. External callers must update. `ENABLE_DEMO_ADMIN` and `MAIL_MODE=console` no longer enable old credentials or terminal OTPs. Authentication always uses Resend; `MAIL_MODE` may still configure other email features.

## Validation

`tests/auth-security.test.ts` uses temporary SQLite and mocked Resend to check bootstrap migration, persistence, role preservation, session revocation, single use/concurrency, purpose/email binding, cooldown, expiry, guess limits, revoked grants, failed delivery and email filtering. `tests/platform.test.ts` checks the new API and application permissions. Real mailbox delivery and hosted PostgreSQL need environment-level verification; local tests do not claim those services were exercised.
