# TheAI Pods web application

Public product documentation is available at [http://localhost:3000/docs](http://localhost:3000/docs). Keep `lib/docs-content.ts` and the relevant repository guides updated whenever product behavior, setup, integrations, controls or public claims change.

The approved light-theme typography and palette are recorded in [docs/design-system.md](docs/design-system.md). Shared color tokens live in `app/globals.css`; Satoshi loads through Fontshare's CSS API in the root layout.

See [the repository README](../README.md) for complete setup, features, model integration, Resend, database transfer and validation.

For Railway deployment from the GitHub repository, see [the Railway setup guide](docs/RAILWAY.md). The web service and the background worker are separate services, both rooted at `/` in that repository and using the same hosted database URL. Railway Variables hold the settings; the local `.env` file stays uncommitted.

Quick start: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`.

The public header and footer are shared across marketing, docs, events, login, and demo pages. Public demo scheduling uses `https://calendly.com/contact-theaipods/30min` by default. Set `NEXT_PUBLIC_CALENDLY_URL` in `.env.local` and restart Next.js only if the event link changes. The Book a Demo page embeds Calendly's scheduler and only confirms a booking after Calendly reports a scheduled event. If the configured link is invalid, it displays a setup message rather than claiming a reservation. The older internal demo-booking API remains available but is not called by this public page.

Open http://localhost:3000/login and use **admin / admin** locally.

Choose **Admin login** for the admin console. It can show or hide the homepage team, promote verified accounts as partner admins, and inspect owners, companies, pods and tasks. The team is hidden by default. In production, set `INITIAL_ADMIN_EMAIL` to a registered, verified account; the local demo login is disabled when `ENABLE_DEMO_ADMIN=false`.

The homepage includes an interactive objective preview. The standalone Remotion film remains at `http://localhost:3000/showreel`; the previous film remains at `http://localhost:3000/showreel/legacy`. To edit the new composition with the Remotion timeline, run `npx remotion studio remotion/index.ts --no-open --port 3001` and open `http://localhost:3001`.

The public agent registry is at `http://localhost:3000/agents`. The former AI Employees marketing route and the Professional Services solution page have been removed. Registry search uses `GET /api/agents` with query filters; the redundant `/api/agents/search` alias has been removed.

Generated local folders such as `.next`, `node_modules`, `.playwright-cli`, and `.tmp-video` are ignored by Git and can be regenerated. Keep `data` and `output` because they can contain persistent workspace data and deliverables. The `assets/ai-workforce` Blender scenes, models, and master renders are editable sources for the 28 employee characters; `public/ai-workforce` contains the browser copies. Temporary QA screenshots and obsolete local-storage prototype components are not part of the application.
`npm run typecheck` regenerates Next.js route types first, so it also works after clearing `.next`.

The public integrations experience is at `http://localhost:3000/integrations`. It is a structured catalog and visual product story; catalog entries are prospective connector concepts, not connected accounts. Original procedural Three.js workers are defined in `components/WorkerScene.tsx` and rendered only near the viewport to limit WebGL contexts.

In **Workspace → Models & integrations**, a company owner can register a public HTTPS MCP endpoint, discover its tool schemas and remove the server. The endpoint is checked against private/reserved addresses and outbound requests pin DNS to a validated public address. Discovered tools are stored disabled. Authentication-backed MCP servers, provider OAuth/API connectors, per-agent tool grants, and `tools/call` execution are not yet implemented. Model gateway configuration remains server-side; onboarding tool selections remain company context only.
