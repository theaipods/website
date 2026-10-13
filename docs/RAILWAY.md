# Railway deployment

This repository runs as two Node.js 24+ processes. Deploy the **website** and **background worker** as separate Railway services from the same GitHub repository. Set each service's Root Directory to `/` (or leave the root setting blank). The local checkout happens to be named `web`, but its `package.json` is at the GitHub repository root. The worker has no public domain.

| Service | Build command | Start command |
| --- | --- | --- |
| Website | `npm run build` | `npx next start --hostname 0.0.0.0 --port $PORT` |
| Worker | Default Node install; no Next build needed | `npm run worker:production` |

The worker starts TypeScript with `tsx`, which is a production dependency. Keep the worker running: `npm start` serves HTTP but does not execute queued Pod jobs. A public Railway domain belongs only on the website service.

In each service's **Variables → RAW Editor**, enter the server configuration rather than committing or uploading the local `.env` file. Configure the same `DATABASE_URL` in both services. For CockroachDB, use the complete unprefixed `postgresql://` URL with TLS parameters. One hosted CockroachDB cluster passed connection, schema initialization and transactional insert/read/upsert checks, but a Railway deployment and every app workflow have not yet been tested. If the URL contains `sslrootcert`, its file must exist inside each service's Linux container; a local Windows certificate path will fail there. Changing `DATABASE_URL` does not move data from the local SQLite file.

For the website, also set `APP_URL` to its final `https://` Railway or custom domain, `COOKIE_SECURE=true`, `ENABLE_DEMO_ADMIN=false`, and `INITIAL_ADMIN_EMAIL` to the email address you intend to register and verify. Production signup needs `MAIL_MODE=resend`, `RESEND_API_KEY`, and `RESEND_FROM`; console verification codes are disabled in production. Set the relevant `CHAT_MODEL_*` and `CODE_MODEL_*` gateway variables in both services if you want live Pod execution; simulation mode does not require them. The public Calendly link defaults to `https://calendly.com/contact-theaipods/30min`; set `NEXT_PUBLIC_CALENDLY_URL` before the website build only if changing it.

Deploy the website first, generate its public domain in Railway Networking, update `APP_URL`, and redeploy. Deploy the worker with the matching database and model settings. Check both services' deployment logs and visit `/login`; register and verify the bootstrap admin email. Run a simulation Pod to confirm the worker processes queued jobs. Optional browser-rendered company research needs Chromium and Linux browser dependencies installed in the worker image; the ordinary HTTP research path can run without them.

Do not expose the worker publicly. Do not paste a database password into support messages or Git. Back up any existing SQLite data before a separate migration. Railway environment changes must be deployed to take effect.
