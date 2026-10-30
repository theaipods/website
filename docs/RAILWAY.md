# Railway deployment

This repository runs as two Node.js 24+ processes. Deploy the **website** and **background worker** as separate Railway services from the same GitHub repository. Set each service's Root Directory to `/` (or leave the root setting blank). The local checkout happens to be named `web`, but its `package.json` is at the GitHub repository root. The worker has no public domain.

| Service | Build command | Start command |
| --- | --- | --- |
| Website | `npm run build` | `npx next start --hostname 0.0.0.0 --port $PORT` |
| Worker | Default Node install; no Next build needed | `npm run worker:production` |

The worker starts TypeScript with `tsx`, which is a production dependency. Keep the worker running: `npm start` serves HTTP but does not execute queued Pod jobs. A public Railway domain belongs only on the website service.

In each service's **Variables → RAW Editor**, enter the server configuration rather than committing or uploading the local `.env` file. Configure the same `DATABASE_URL` in both services. For CockroachDB, use the complete unprefixed `postgresql://` URL with TLS parameters. One hosted CockroachDB cluster passed connection, schema initialization and transactional insert/read/upsert checks, but a Railway deployment and every app workflow have not yet been tested. If the URL contains `sslrootcert`, its file must exist inside each service's Linux container; a local Windows certificate path will fail there. Changing `DATABASE_URL` does not move data from the local SQLite file.

For the website, set `APP_URL` to its final public HTTPS origin (including a Cloudflare-proxied custom domain) and `COOKIE_SECURE=true`. The requested initial admin is provisioned once per database without overwriting saved passwords. `INITIAL_ADMIN_EMAIL` optionally grants another registered, verified account admin access. Signup and password recovery require `RESEND_API_KEY` and `RESEND_FROM` in both local and production; authentication never uses console codes. See [authentication setup](AUTHENTICATION.md). The homepage contact form also uses Resend: verify the sending domain, use a sender address from that domain for `RESEND_FROM`, and optionally set `CONTACT_LEADS_TO` (defaults to `contact@theaipods.com`). Set the relevant `CHAT_MODEL_*` and `CODE_MODEL_*` gateway variables in both services for live Pod execution; simulation mode does not require them. The public Calendly link defaults to `https://calendly.com/contact-theaipods/30min`; set `NEXT_PUBLIC_CALENDLY_URL` before the build only if changing it.

Deploy the website first, generate its public domain in Railway Networking, update `APP_URL`, and redeploy. Deploy the worker with matching database and model settings. Check both services' logs and visit `/login`; use the provisioned admin or register and verify an additional administrator. Test Forgot password with a mailbox you control. Run a simulation Pod to confirm the worker processes queued jobs. Optional browser-rendered company research needs Chromium and Linux dependencies in the worker image; ordinary HTTP research can run without them.

Do not expose the worker publicly. Do not paste a database password into support messages or Git. Back up any existing SQLite data before a separate migration. Railway environment changes must be deployed to take effect.
