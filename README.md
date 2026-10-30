# TheAI Pods web application

Public product documentation is available at [http://localhost:3000/docs](http://localhost:3000/docs). Keep `lib/docs-content.ts` and the relevant repository guides updated whenever product behavior, setup, integrations, controls or public claims change.

The approved light-theme typography and palette are recorded in [docs/design-system.md](docs/design-system.md). Shared color tokens live in `app/globals.css`; Satoshi loads through Fontshare's CSS API in the root layout.

See [the repository README](../README.md) for complete setup, features, model integration, Resend, database transfer and validation.

For Railway deployment from the GitHub repository, see [the Railway setup guide](docs/RAILWAY.md). The web service and the background worker are separate services, both rooted at `/` in that repository and using the same hosted database URL. Railway Variables hold the settings; the local `.env` file stays uncommitted.

Quick start: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`.

For the pre-funding founder demo, follow [LOCAL_DEMO.md](docs/LOCAL_DEMO.md) and open `/workspace/demo`. Five editable briefs create projects only when sent. All accounts begin on Starter (one project and Pod); administrators explicitly grant Founders (ten each, $499 + GST/month) or Enterprise allowances. The Book Demo page displays these plans. Both `.env.local` and `.env` are loaded by the local launcher and worker; restart after changes.

The public header and footer are shared across marketing, docs, events, login, and demo pages. Public demo scheduling uses `https://calendly.com/contact-theaipods/30min` by default. Set `NEXT_PUBLIC_CALENDLY_URL` in `.env.local` and restart Next.js only if the event link changes. The Book a Demo page embeds Calendly's scheduler and only confirms a booking after Calendly reports a scheduled event. If the configured link is invalid, it displays a setup message rather than claiming a reservation. The older internal demo-booking API remains available but is not called by this public page.

Open http://localhost:3000/login. The old admin/admin login is retired. Use the provisioned admin work email and initially supplied password, then **Forgot password** to verify a Resend code and save a new password. See [authentication setup](docs/AUTHENTICATION.md).

Company onboarding includes reviewed AI field/section drafts and whole-onboarding proposals. Configure the selected provider's chat credentials to enable generation; manual onboarding and activation work without a model. Website analysis uses the local Playwright library (install Chromium with `npx playwright install chromium`), not a browser MCP connection. See [research and onboarding setup](docs/RESEARCH.md) for validation, review, save behavior, extraction limits, and activation troubleshooting.

Choose **Admin login** for the admin console. It can show or hide the homepage team, promote verified accounts as partner admins, and inspect owners, companies, pods and tasks. The team is hidden by default. The initial admin is provisioned once per database without overwriting saved passwords. `INITIAL_ADMIN_EMAIL` can grant admin access to another registered, verified account. Resend is required for signup and password recovery locally and in production.

The homepage includes an interactive objective preview. The standalone Remotion film remains at `http://localhost:3000/showreel`; earlier films remain at `/showreel/previous` and `/showreel/legacy`. To edit the registered compositions with the Remotion timeline, run `npm run video:studio -- --no-open --port 3001` and open `http://localhost:3001`. The entry point is `remotion/index.tsx`.

The public agent registry is at `http://localhost:3000/agents`. The former AI Employees marketing route and the Professional Services solution page have been removed. Registry search uses `GET /api/agents` with query filters; the redundant `/api/agents/search` alias has been removed.

Generated local folders such as `.next`, `node_modules`, `.playwright-cli`, and `.tmp-video` are ignored by Git and can be regenerated. Keep `data`: it contains persistent workspace records and uploads. Inspect `output` before cleaning it; temporary QA screenshots and scripts can be deleted, but exported deliverables must be preserved. Employee artwork uses 28 high-definition transparent PNGs in `public/ai-workforce/avatars-hd/`; the unused About copies have been removed. Temporary QA screenshots and obsolete local-storage prototype components are not part of the application.
`npm run typecheck` regenerates Next.js route types first, so it also works after clearing `.next`.

Run `npm run audit:unused` to check unused files, exports and dependencies. `knip.json` includes Next.js routes, tests, worker scripts and the Remotion entry point; standalone routes and authoring utilities are intentional entry points. TypeScript also checks unused locals and parameters. `npm run assets:icons` regenerates catalog SVGs, and `npm run assets:score` regenerates the showreel score. See [the cleanup audit](docs/cleanup-audit.md) for the verified removals and asset-reference checks. Static analysis does not by itself prove a public asset is unused; check generated URLs and saved public-content records before deleting it.

The homepage contact form sends interest notifications through Resend to `contact@theaipods.com` (or `CONTACT_LEADS_TO`). Configure `RESEND_API_KEY` and a verified sender in `RESEND_FROM` on the website service. See [contact lead setup](docs/contact-leads.md).

The public integrations experience is at `http://localhost:3000/integrations`. It is a structured catalog and visual product story; catalog entries are prospective connector concepts, not connected accounts. Static reference characters are laid out by `components/WorkerScene.tsx`; no WebGL context is required.

In **Workspace → MCP & integrations**, profile connections support public HTTPS discovery, encrypted bearer tokens, read-tool grants, and user-triggered `tools/call` imports into selected company evidence. Legacy company connections remain discovery-only. Private/reserved endpoints and redirects are rejected; outbound DNS is pinned. OAuth, stdio, per-agent grants, worker-driven tool execution and external writes remain unimplemented. Model configuration stays server-side. See [LOCAL_DEMO.md](docs/LOCAL_DEMO.md).

Model setup: `AI_PROVIDER=nvidia` is the configured development default. Add `NVIDIA_API_KEY` to the existing `.env`; Lightning chat/code model names are filled in. Switch to `azure` or `bedrock` with their own credentials and deployments/model IDs. Restart web and worker. See [provider setup](docs/PROVIDERS.md). NVIDIA text embeddings use NVIDIA_EMBEDDING_MODEL=nvidia/nemotron-3.5-embed-1b. Vision/video execution remains reserved. Run web and worker together with npm run dev; persisted research and knowledge indexing require the worker in both local and hosted environments.

Onboarding stores multiple measurable outcomes in the company JSON record, with the first mirrored to legacy measurement fields. Section-level AI suggestions and explicit custom-team creation use the configured chat provider and company-scoped knowledge retrieval. See [research and onboarding](docs/RESEARCH.md).

Onboarding now includes **Fill all with AI** for an editable, draft-only trial setup from a company URL, plus per-chapter completion. Configure `ONBOARDING_AI_PROVIDERS` and optional Groq/OpenRouter keys for chat fallback. Hugging Face is available but disabled by default because hosted inference requires credits. See [provider setup](docs/PROVIDERS.md) and [trial behavior](docs/RESEARCH.md). Optional company JSON `trialCheck` records a local configuration check; no separate database migration is required.
