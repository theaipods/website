export type DocsGroup = "Start here" | "Build your workforce" | "Operate & review" | "Connect & extend" | "Administration" | "Reference";
export type DocsArticle = { slug:string; group:DocsGroup; title:string; summary:string; body:string; updated:string };
const updated="October 9, 2026";
const doc=(group:DocsGroup,slug:string,title:string,summary:string,body:string):DocsArticle=>({group,slug,title,summary,body:body.trim(),updated});

export const docsArticles:DocsArticle[]=[
doc("Start here","introduction","Introduction","What AI Pod is, what a Pod does, and how to read these docs.",`
## What AI Pod is
AI Pod is a workspace for organizing specialized AI employees around a business objective. A company blueprint supplies approved context. A Pod defines the outcome, specialists, knowledge, controls and review points. The workspace shows planned and completed work, decisions, and deliverables.

The public product and solution pages include illustrative animations. Those previews are not connected to your company data. This documentation distinguishes saved application behavior from examples and future integration concepts.

## The working model
- **Company:** the owner-scoped record for goals, departments, process maps, rules, permissions and knowledge.
- **Pod:** an outcome-driven team with a plan, selected specialists, evidence and execution mode.
- **AI employee:** a defined specialist with a mission, inputs, outputs, instructions and quality criteria.
- **Orchestrator:** coordinates dependencies, specialists and the final result.
- **Human checkpoint:** a decision that the application leaves to an authorized person.

## A good first path
1. [Create a company](/docs/first-workspace) and complete onboarding.
2. Upload the knowledge the Pod may use.
3. Create a Pod in simulation mode and inspect the plan.
4. Configure a live model gateway only when you are ready to test actual generated text.
5. Review decisions and the final deliverable before using it outside AI Pod.

> **Scope:** AI Pod does not claim that a drafted campaign was published, a payment was sent, a repository was changed, or a business metric improved unless a real adapter and evidence support that action.
`),
doc("Start here","quickstart","Quickstart","Install, run and explore the local application.",`
## Requirements
The local app requires Node.js 24 or newer and npm. SQLite is built into Node; a separate database server is not needed for local development.

## Start the app
Run these commands from the repository root:

~~~powershell
cd web
npm ci
Copy-Item .env.example .env.local
npm run dev
~~~

Open [the sign-in page](/login). The development command starts the web app and background worker. Leave the terminal running while testing Pod execution.

## First run
Create or sign in to an account, create a company, complete the onboarding sections, activate the company, and create a simulation Pod. Development verification codes appear in the server terminal if a mail provider is not configured. Production does not use console mail.

## Where data lives
The default local database is web/data/workforce.sqlite. Accounts, companies, uploaded knowledge, Pods, decisions and results persist across reloads. Back up the database before replacing it.
`),
doc("Start here","first-workspace","Your first workspace","From a company profile to a reviewed result.",`
## 1. Create a company
Open onboarding and enter company basics, goals, departments and the people responsible for work. The 19-step flow is saved, so you can leave and resume. Required information is checked before activation.

## 2. Map how work happens
Interview responses, tool inventory and SOP/documentation all contribute to the blueprint. Edit starter examples rather than treating them as facts about your company. Confirm the process order, owners, decision makers and human checkpoints.

## 3. Review the blueprint
The final onboarding views summarize what was provided. Review any website research before applying it to company fields. Rehearsal scenes are illustrative and do not run external work.

## 4. Create a Pod
Use **Workspace → Create pod** to state an objective, acceptance criteria, timeframe, budget context, constraints, specialists and selected evidence. Begin with simulation mode. It produces a labeled configuration brief, not an AI-generated business deliverable.

## 5. Inspect the outcome
Once a Pod runs, inspect task states, pending decisions and its result. Approve or request changes where needed. Download a result as Markdown from the Pod or Results view.
`),
doc("Start here","platform-status","What is available today","A candid feature-status map for builders and buyers.",`
## Implemented in the application
- Owner accounts, verification, expiring sessions and company-scoped records.
- Saved 19-section onboarding, editable blueprint, process mapping and readiness checks.
- File upload, readable-text extraction, lexical retrieval and selected evidence for Pods.
- Specialist registry, persistent Pod plans, dependent tasks, human gates, revisions, audit history and result downloads.
- Simulation mode and provider-neutral live text generation when a compatible gateway is configured.
- Public website research with a bounded free crawler; optional search/crawl APIs require keys.
- MCP endpoint registration and tool-schema discovery for a company, with discovered tools disabled.

## Illustrative or not yet connected
The marketing animations, solution finder and customer demo use local sample data. Selecting a tool during onboarding does not authorize or connect that tool. The public integrations catalog describes possibilities, not installed connectors. MCP tool execution, OAuth provider connections, external publishing, messaging, payments and repository changes need separate adapters. Image, video, audio, vision and embedding execution are reserved slots, not operational adapters.

## What to verify in your environment
Live gateway behavior, email delivery, PostgreSQL hosting and any external integration must be tested with your own services. No certification or business-impact metric is asserted by these docs.
`),
doc("Start here","navigation","Find your way around","The public site, onboarding, workspace and admin area.",`
## Public pages
The [home page](/), [Product](/product), [Solutions](/solutions), [Integrations](/integrations), [Events](/events), [About](/about) and [Book a Demo](/book-demo) pages explain the platform. Product and Solutions navigation panels open on hover-capable devices, remain clickable on touch and keyboard, and do not remain open together. Product previews are labeled as examples. The About page presents the mission, story, published product milestones and principles, an interactive product explorer, and calls to action. Its navy and emerald workforce scene uses existing 3D employee artwork to illustrate five specialists around an orchestration hub. The scene and four product previews are local illustrations: selecting a specialist highlights it, and selecting a product tab changes the preview; neither action runs a workflow, connects a tool, or shows live activity. Mission, story, milestones, and principles come from the admin-managed About content. Unpublished milestones and principles are omitted.

The home page now leads with a cinematic workforce illustration, a catalog-example logo strip, three entry routes, and a five-stage local workflow simulation. The simulation's play/replay and stage controls change only the example UI; no external system is updated. The previous multi-objective simulator and full registry explorer remain available in expandable panels. Employee cards and the registry count come from the current agent definitions; integration names and the catalog count come from the public catalog, whose entries require configuration and are not installed accounts. Solution cards link to the six current solution routes. The governance panel presents configurable concepts, not a claim that every control is active in a visitor's workspace.

The Product navigation opens three single-action cards: **Build** (AI Pods, Orchestrator, workflow execution), **Connect** (integrations and company knowledge), and **Operate** (deliverables and documentation). The bullet points explain each route; they are not separate controls.

## Demo booking behavior
The public Book a Demo page embeds a Calendly event type using the configured HTTPS event URL, which defaults to https://calendly.com/contact-theaipods/30min. NEXT_PUBLIC_CALENDLY_URL can override it. Calendly supplies availability, invitee fields, time-zone handling, confirmation, and any calendar or meeting integrations configured in that Calendly account. AI Pod does not create or confirm a reservation until Calendly reports calendly.event_scheduled. When the configured URL is invalid, the page shows a setup state. The older internal demo scheduler and its API remain in the codebase for existing direct integrations, but this public page does not submit to them.

The public Book a Demo page has a workforce introduction, a Calendly booking panel, a four-step explanation of the walkthrough, an example tools strip, six demo focus cards, and a final booking link. Selecting a focus card passes that topic through Calendly UTM context and scrolls to the booking panel. Visitors enter details and select a time in Calendly's form. The tool logos and employee scenes illustrate potential demo topics; they do not connect accounts or run work. The shared public header and footer use the official TheAI Pods logo and consistent navigation across marketing, docs, events, login, and booking routes.

The public Events page has a cinematic AI workforce introduction, a featured event, an archive filtered by the years and event types present in the data, past-session cards, resource links, a private-session booking action, and FAQ. The hero registration action and featured card use the existing event registration form. A past-session card says **Watch recording** only when that event has a recording URL; otherwise it opens event details as **View session**. The current seeded events are sample events and their past sessions do not yet have playable recordings. The news destination currently announces future updates rather than published articles. Event detail pages and registration management remain available. The removed upcoming catalog, live-series duplicate, speaker showcase, and topic browser are not part of this page.

## Application pages
After signing in, **Onboarding** saves company context. **Workspace** contains the command center, Pods, Results, Decisions, Company blueprint, AI employees, Work & activity, and MCP & integrations settings.

## Admin
The admin console is separate from a company owner’s workspace. It includes owner and company visibility, settings and management of public About and Events content. Admin access is restricted to authorized accounts.
`),
doc("Build your workforce","core-concepts","Core concepts","The records and boundaries that make up an AI workforce.",`
## Company, blueprint and Pod
A company is the ownership boundary. Its blueprint records business facts, goals, processes, brand guidance, rules, permissions and selected knowledge. A Pod is created from that context for one objective. Each Pod records the company blueprint version used at creation.

## Specialists and platform roles
Specialists have definitions for mission, inputs, outputs, tools and quality. Platform roles include Pod Manager, Workforce Orchestrator and Workforce Observer. Registry definitions are not proof of a connected model or tool; execution depends on the selected mode and available providers.

## Tasks and controls
A Pod plan contains dependent tasks. Tasks may be planned, running, completed, blocked, rejected, cancelled or waiting for approval. Human-only and approval-controlled steps remain visible to the owner. A task may be revised with feedback and a new version.

## Evidence and result
Selected text chunks are retrieved lexically for context. The result records its mode and review state. Owners should verify claims, sources and assumptions before using an output externally.
`),
doc("Build your workforce","onboarding","Company onboarding","What the 19 saved sections collect and why.",`
## Discover
Capture company identity, website, industry, business model, markets, products, description, goals, teams and departments. Industry and model presets are editable. Goal choices suggest metrics; the owner confirms actual baseline and target.

## Understand
Interviews map each selected team’s process, inputs, outputs, tools, owners and approvals. Starter answers and sample processes accelerate entry, but must be checked against the real operation. Interview, existing-tool inventory and SOP/documentation answers are required. "No existing tools" is an explicit answer.

## Connect and configure
Record the tools used, upload or write knowledge, set brand guidance, business rules, permissions, AI opportunities and preferred Pods. Tool choices describe requirements; they do not connect accounts. Human review presets should match actual decision authority.

## Simulate and launch
Rehearsal examples help you inspect the process. The business blueprint and readiness view expose gaps before activation. Activation saves the company as active and opens the path to Pod creation.

## Editing later
You can reopen onboarding from **Company blueprint**. A Pod created against an older blueprint version is blocked from using changed context; create a replacement Pod from the updated blueprint.
`),
doc("Build your workforce","website-research","Analyze a company website","How public research becomes reviewable onboarding context.",`
## Analyze, review, apply
The Analyze website action creates a company-scoped research report. It extracts public page content, metadata and structured organization/product information, then suggests editable fields. Every finding records a source and whether it was extracted or inferred. Existing company fields change only when selected and applied.

## Free crawler
The bounded crawler follows same-site links and sitemaps, prioritizes business pages and can use Playwright for sparse JavaScript-rendered pages. It attempts 5, 15 or 30 pages within an approximate 100-second budget. Robots restrictions, login walls and challenges are reported rather than bypassed. This does not guarantee every page or directory entry.

## Optional APIs and directories
Firecrawl can be used for scraping when configured, with free crawling as the automatic fallback. Google Custom Search can assist discovery for eligible existing customers. Directory URLs may be supplied or discovered from public links; LinkedIn and directory content can be incomplete or unavailable without access. Third-party facts remain unverified until a person confirms them.

## Saved evidence
Reports are stored as Website research knowledge with URLs, timestamps, coverage and failures, and can be downloaded as JSON. See [research setup](/docs/research-configuration) for optional keys and boundaries.
`),
doc("Build your workforce","knowledge","Knowledge and evidence","Upload, index, select and review company information.",`
## Supported files
The application accepts TXT, MD, CSV, JSON, PDF, DOCX, PPTX, XLSX and PNG/JPG/WEBP. Readable text is extracted from plain text, Word, PowerPoint and PDFs. Images and XLSX files are stored, but their content is not currently extracted for retrieval. Scanned PDFs require OCR that is not implemented here.

## Limits and retrieval
Each file is limited to 8 MB; a company can have up to 100 files. Extracted text is capped at one million characters per file. Text is split into chunks and selected chunks are ranked by lexical overlap. There is no vector or embedding search today.

## Use in a Pod
Select only the files the Pod should consider. The worker receives excerpts from those files and the saved company blueprint. Retrieved content is evidence, not governing instructions. Review the resulting citations, assumptions and unresolved questions before approval.

## Ownership
Files are company-scoped. The API checks that a selected knowledge ID belongs to the company. Removing a company deletes its associated documents, Pods and results.
`),
doc("Build your workforce","blueprint","The business blueprint","A reusable, versioned description of how a company works.",`
## What it contains
The blueprint combines company profile, goals and metrics, selected departments, team structure, process interviews, responsibility matrices, tools, knowledge, brand guidance, rules, permissions, AI opportunities and selected Pods.

## Why versioning matters
Pods pin a blueprint version at creation. Changing the company context invalidates work planned against the old version. This avoids silently applying new rules or evidence to an old plan. Create a new Pod from the revised blueprint when the operating context changes.

## Keep it useful
Write concrete process steps, owner names or roles, approval conditions and acceptance criteria. Treat sample responses as drafting aids. Confirm research findings before using them as company facts.
`),
doc("Build your workforce","ai-employees","AI employees and roles","How specialists are defined, selected and supervised.",`
## Registry definitions
The registry is available through the workspace and the public [Agent Registry](/agents). Its GET /api/agents endpoint accepts query filters. It includes specialists across marketing, sales, finance, engineering, product, design, support, success, HR, IT, operations, data and legal work. Each definition lists its mission, instructions, inputs, outputs, quality checks and conceptual tool boundary. Platform roles coordinate and review the work.

## Creature character library
The shared workforce scenes use distinct Blender creature models for the current registry records. Every employee has a separate editable .blend scene, exported GLB, transparent PNG master and optimized WebP render. The species silhouettes, poses, embedded color gradients and three-dimensional props distinguish the roles. Shared marketing scenes load optimized renders or individual GLBs where an interactive view is available.

The source GLBs, Blender scene, generated previews and complete stable-ID mapping are maintained in **web/assets/ai-workforce/**. These characters are presentation assets; they do not represent a live employee, a model provider or a connected tool. The registry remains the authority for role definition and operational state.

## Assigning specialists
Choose specialists when creating a Pod. A Pod must have at least one and can have at most 25. Before execution begins, a specialist can be added or removed and the task plan refreshes. The application checks category-related company permissions for certain finance, legal and production tasks.

## Operational status
The workspace derives employee state from persisted Pod tasks: idle, planning, working, waiting, blocked, awaiting approval, completed or error. These are work states, not a claim of autonomous external activity.

## What a role cannot imply
A role card does not itself connect Slack, a CRM, a repository or a finance system. In live mode, compatible text-model gateways can draft text. External side effects need explicit adapters, scoped credentials and authorization.
`),
doc("Build your workforce","pods","Create and configure Pods","Turn one objective into a team, plan and reviewable outcome.",`
## Define the outcome
State the objective and provide acceptance criteria, baseline and target context, deadline, budget context and constraints. These fields guide planning and review; budget text is not provider-side billing enforcement.

## Choose the team and evidence
Select the process domain, specialists and company knowledge. Choose autonomy and requested capabilities, then select simulation or live mode. The system builds dependent tasks using the company process and the selected specialists.

## Start and adjust
The company must be active before Pod creation. A new Pod can be inspected before running. Specialists can be changed while tasks are still planned. Running, paused, blocked and approval-waiting states are visible in the Pod view.

## Boundaries
A Pod finishes at its requested deliverable. Recurring monitoring, publishing or system changes require scheduling and integration-specific execution that is not included in the current worker.
`),
doc("Build your workforce","simulation-live","Simulation and live mode","Know what each execution mode actually produces.",`
## Simulation
Simulation works without model credentials. It assembles a labeled configuration brief from the saved company answers and selected evidence. It is useful for validating the plan and controls. It is not presented as AI-generated business work or proof of business impact.

## Live text mode
Live mode calls a configured provider-neutral HTTP gateway for chat and/or code text. Chat is also needed for management, quality review and final delivery, even if a code capability is requested. The worker sends instructions, company context, selected evidence, upstream outputs, task and acceptance criteria to the gateway.

## When a provider is unavailable
The Pod blocks and reports the missing or failed provider. The application does not silently replace a failed live call with simulation. A blocked Pod can be retried after the cause is addressed.

## Reserved capabilities
Embedding, image, video, audio and vision have configuration slots but no execution adapter. Supplying a key alone does not activate them. See [model gateways](/docs/model-gateways).
`),
doc("Operate & review","execution","How execution works","Dependencies, context checks, worker leases and final assembly.",`
## Plan and queue
The Orchestrator creates dependent tasks. Starting a Pod queues work for the background worker. The worker runs eligible tasks only when their dependencies and required human gates are satisfied.

## Context and evidence
Each job checks the pinned company version and selected evidence. A provider receives the role instructions, a scoped context object, upstream task outputs and any revision feedback. The Workforce Orchestrator checks acceptance criteria, sources, rules and assumptions before final consolidation.

## Pausing and interruption
Pause or Stop all pods prevents in-flight output from being saved after the control changes. A provider request already sent can still incur charges. An expired worker lease becomes blocked after two minutes and can be explicitly retried.

## Final result
The result keeps a review status. A person should inspect it before using it externally. The current worker drafts text; it does not verify a manual external action or execute publishing, payment or deployment.
`),
doc("Operate & review","decisions","Human decisions and approvals","Approve, request changes or reject consequential work.",`
## Where decisions appear
Open **Workspace → Decisions** or the Pod detail page to inspect tasks marked Needs approval. The task shows the draft, context and review state.

## Available actions
- **Approve:** record that the reviewed draft may advance.
- **Request changes:** provide feedback and create a new revision for the task.
- **Reject:** stop that path and record the decision.

## Human-only work
Some process steps are deliberately human-owned. The application records the handoff and decision; it does not claim to have completed a real-world action outside the system.

## High-impact boundaries
Financial transactions, production changes, sensitive employee actions, clinical decisions, underwriting and legal advice should remain with qualified people unless a future adapter and policy system explicitly support a narrower authorized action.
`),
doc("Operate & review","monitoring","Monitor tasks and Pods","Read current state, dependencies, alerts and audit events.",`
## Command center
The workspace overview shows Pods, results ready, decisions needed and blocked work. The Pod page shows task status, dependencies, assigned specialists, activity and the consolidated result.

## Work & activity
The Work view groups planned, completed, rejected and approval-waiting tasks. The audit trail records application actions. Operational status is derived from saved tasks and Pods rather than fabricated progress metrics.

## Controls
Owners can pause a Pod or use the workspace Stop all pods control. Stopping work is a control on subsequent execution and saved output; it cannot undo a call already made to a model provider.

## Alerts and recovery
The Observer checks missing providers, failures, changed context and interrupted leases. Resolve the cause, inspect the plan, then retry a blocked Pod. Do not assume a retry is safe for future side-effecting adapters without idempotency controls.
`),
doc("Operate & review","deliverables","Results and deliverables","Inspect, approve and download the final artifact.",`
## Result states
Results distinguish simulation, draft and approved output. A simulated brief is labeled as a configuration preview. A live draft is model-produced text that still needs human verification.

## Inspect before use
Check the acceptance criteria, factual claims, source excerpts, assumptions, unresolved issues and required approvals. A model quality pass is not proof of correctness. Do not interpret the configured target metric as measured impact.

## Download
Open a Pod or **Workspace → Results** and download the Markdown result. The download endpoint is protected by the owner session and returns no-store content.

## Revision path
If a task needs changes, request a revision from Decisions and provide specific feedback. The Pod retains the revised task state and activity history.
`),
doc("Connect & extend","integrations","Integrations overview","How tool selections, catalogs and real connections differ.",`
## Three different things
**Onboarding selections** record tools the company says it uses. **The public catalog** illustrates integration categories and possible workflow designs. **Registered MCP endpoints** save a company-scoped server and discover tool schemas. None of these alone grants an agent permission to execute a remote action.

## What is connected today
The application can register a public HTTPS MCP endpoint, perform safe discovery and store returned tool definitions disabled. Model gateways can be configured server-side for text generation. There are no built-in OAuth connections for Slack, Salesforce, Google Drive or other catalog providers in this build.

## Before adding side effects
An adapter needs scoped credentials, explicit permissions, policy checks, idempotency, audit records, error handling and human approval where required. A marketing diagram is never proof that a provider is connected.

See the [public integrations experience](/integrations) for the visual concept, and [MCP settings](/docs/mcp) for the implemented boundary. The Integrations page has a navy and green hero with an existing 3D AI employee model, a governed MCP diagram, a searchable and category-filterable catalog, illustrative workflow scenarios, and a connection-settings link. Catalog cards open detail drawers showing each entry's current availability and required connection path; they do not authorize or connect an account. Workflow scenarios animate an explanation only and do not call an external tool. The gateway explanation remains available at [/integrations#mcp](/integrations#mcp), and the catalog at [/integrations#catalog](/integrations#catalog).
`),
doc("Connect & extend","mcp","MCP endpoint discovery","Register a server safely and understand the current limit.",`
## Register a server
In **Workspace → MCP & integrations**, a company owner can register a public HTTPS MCP endpoint, discover tool schemas and remove the server. Endpoint validation rejects private, loopback, link-local and reserved IP addresses. DNS answers are pinned for the outbound connection, and redirects are revalidated.

## Tool state
Discovered tools are saved disabled. This is inventory, not permission to execute. Authentication-backed MCP servers, per-agent tool grants and tools/call execution are not yet implemented.

## Design for a future adapter
Map each tool to a narrow action and risk level. Add credentials, authorization, execution and audit behavior only after the policy boundary is defined. For actions that alter external systems, make retries idempotent and keep an approval point where needed.

> **Security note:** Only register endpoints you trust. A public-address check is not a substitute for service-level authorization or an outbound network policy in production.
`),
doc("Connect & extend","model-gateways","Model gateways","Configure compatible text generation without exposing credentials.",`
## Provider-neutral contract
Set CHAT_MODEL_URL, CHAT_MODEL_KEY and CHAT_MODEL_NAME for chat. Equivalent CODE_ variables configure code text. The worker sends a POST with model, capability, instructions, context, task, acceptance criteria and a maximum output length. The gateway should return HTTP 200 with a nonempty text field.

## Important boundaries
This is not a direct OpenAI, Anthropic or other vendor SDK request. Use a small trusted adapter for the vendor’s actual API. Gateway URLs and keys remain on the server and are never delivered to the browser. Configure chat even for code Pods because management, review and final steps use it.

## Failure and usage
Invalid output, non-200 status or the 45-second timeout blocks the Pod. MAX_MODEL_CALLS_PER_POD bounds attempts, but the Pod budget is only context. Token and currency billing controls require a provider-specific adapter.

## Other modalities
Embedding, image, video, audio and vision slots are reserved. They need typed artifacts, storage, polling/cancellation, usage accounting and validation before they can run. The full adapter contract is in web/docs/PROVIDERS.md in the source repository.
`),
doc("Connect & extend","research-configuration","Research configuration","Free crawling, optional APIs and source-coverage limits.",`
## Free rendering
Install Chromium once after npm ci if you want Playwright rendering:

~~~powershell
npx playwright install chromium
~~~

The free crawler follows same-site links and sitemaps, respects access restrictions, uses a fresh browser context and does not reuse authenticated sessions. A page cap and crawl time budget keep runs bounded.

## Optional server-side keys
Add FIRECRAWL_API_KEY for API scraping. GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID can assist discovery for eligible existing customers. Automatic mode falls back to the free crawler when an API scrape fails. API-only mode requires Firecrawl and does not use HTTP fallback.

## Coverage is not completeness
Some directories block automated access or require accounts. Directory facts are marked unverified. A source report includes attempted URLs, status and failures; review those before using a suggestion in the blueprint.

## Security
Research mutations require the company owner session, enforce same-origin requests and rate-limit runs. Private or reserved destination addresses are rejected and redirects are revalidated. A paid crawler is a separate external-service boundary.
`),
doc("Administration","accounts-security","Accounts and security","Sessions, ownership, verification and practical safeguards.",`
## Authentication
Passwords are hashed. Registration uses email verification with expiring codes, attempt limits and resend cooldown. Sessions use expiring HttpOnly cookies. Mutations require same-origin checks. Development console email is not used as a production fallback.

## Company isolation
Companies, knowledge and Pods are scoped to their owner. The API checks ownership on reads and writes, including selected knowledge and downloads. The admin role has a separate authorized console.

## Controls are not certification
The app contains permission fields, approval gates, audit history and an execution stop control. These implementation features do not constitute a SOC 2, ISO, HIPAA or GDPR certification. Production use needs deployment-specific review, backups, monitoring, secret management and integration testing.

## Sensitive data
Only upload information you are permitted to use. A live gateway receives selected company context and evidence, so evaluate the gateway’s data handling before connecting it. Public demo examples use fictional content.
`),
doc("Administration","data-storage","Data, uploads and deletion","Persistence, transfer, limits and owner-controlled removal.",`
## Local storage
SQLite persists accounts, companies, knowledge, Pods, approvals and results by default. Files are saved with their database records; extracted text is chunked for lexical retrieval. Session and OTP records are managed separately from the export/import flow.

## PostgreSQL
The app includes a PostgreSQL adapter selected with DATABASE_URL. The schema initializes automatically, but a hosted PostgreSQL deployment must be verified with your actual service and TLS configuration.

## Transfer and backups
Stop both the web server and worker before exporting and importing. The export refuses to overwrite a backup; import requires an empty destination and uses a transaction. Backup files contain private documents and password hashes: secure them and never commit them.

## Deletion
Company deletion requires typing its exact name and cascades to its documents, Pods and results. A deleted result or document cannot be downloaded through its old owner route.
`),
doc("Administration","deployment","Deploy and operate","Web process, worker process and production checks.",`
## Two processes
Build and start the website, then run the background worker as a separate persistent process:

~~~powershell
cd web
npm run build
npm start
# In another terminal:
npm run worker:production
~~~

Both processes must share the same database and configuration. npm start alone does not execute queued Pods.

## Required production choices
Set APP_URL to the HTTPS origin, enable secure cookies, disable the local demo admin, and configure mail, database and model gateways. Use managed secrets, backups, monitoring and provider-side usage controls.

## Operational limitations
An HTTP-only deployment cannot run background jobs. Document parsing should be isolated appropriately for your environment. Production behavior of external mail, gateways and PostgreSQL must be tested with those services. The application is not presented as security certified.
`),
doc("Administration","admin-console","Admin console","What administrators can manage separately from company owners.",`
## Purpose
The admin area provides authorized operators with account, company, Pod and task visibility. It can manage certain public-site content, including About and Events, and account-level admin settings.

## Access
An administrator must sign in with an authorized account. The local demo admin route is a development convenience and should be disabled in production. Company ownership remains the normal boundary for application records.

## Change discipline
Treat admin actions as operational changes. Check the saved result and audit history. Do not use public documentation as a place to expose user records, credentials or internal secrets.
`),
doc("Reference","api-reference","API reference","A practical map of the current application API and its scope.",`
## API shape
Application endpoints live under /api. Most require an authenticated owner session and same-origin mutation requests. The API validates input and returns an error object for rejected requests. Use the browser application for normal work; this reference is for integration and testing.

## Main routes
- **GET /api/auth/session:** current session and user state.
- **POST /api/auth/register, /api/auth/verify, /api/auth/login, /api/auth/logout:** account lifecycle.
- **GET /api/state:** owner-scoped companies, Pods, provider status and recent audit items.
- **POST /api/companies; PUT /api/companies/:id:** save a draft or update a company. Activation validates required onboarding information.
- **GET/POST /api/companies/:id/knowledge:** list or upload company files.
- **GET/POST /api/companies/:id/research:** read the latest website research or start a run.
- **POST /api/companies/:id/pods:** create a Pod from an active company.
- **POST /api/pods/:id/run, /pause, /decision:** control work and record human decisions.
- **GET /api/pods/:id/download:** download the Markdown result.
- **GET/POST /api/mcp/servers:** manage discovered MCP endpoints through the company-scoped API.

## Safety and versioning
Company edits use version checks. API callers must supply valid company-owned IDs for selected files and Pods. Do not treat documented paths as permission to bypass the application’s authentication and review flow.
`),
doc("Reference","solutions","Solutions and public demos","How to interpret the six solution experiences.",`
## Discovery
The [Solutions hub](/solutions) has a local finder for four business functions and two industries. Choosing an area selects that page; with **Any area**, the objective determines the example match. Team size is collected only as conversation context and does not affect the match. Matching is deterministic frontend logic and does not call an LLM. Each recommendation links to a dedicated page with workflow selectors and visual examples. The hub also offers a five-stage interactive workflow preview, category-filtered example tools from the integrations catalog, and links to the available industry and function pages. These interactions are local demonstrations, not live executions or connected provider accounts.

## Dedicated pages
Employee Experience, Customer Experience, Finance Operations, Sales & Marketing, Healthcare and Insurance have dedicated solution pages with illustrative workflows and controls.

The [Finance Operations page](/solutions/finance-operations) presents a six-stage invoice journey, three finance roles currently in the employee registry (Finance Agent, Audit Agent, Approval Router), and five selectable example workflows. Its monthly spend chart uses fictional values, and its exception path is an interactive sample. Selections change the local preview only; they do not connect a ledger, process a payment, issue an approval, or execute a workflow. Authorized people retain review and approval decisions.

The [Employee Experience page](/solutions/employee-experience) has a selectable seven-stage lifecycle, the two current HR registry roles (HR Agent and Employee Assistant), five separate local workflow previews, knowledge-source examples, and a fictional support-volume dashboard. Public knowledge questions demonstrate routing only: this page does not search private company documents or provide policy answers. Company knowledge and access rules belong to the authenticated workspace, and people retain sensitive HR decisions.

The [Sales & Marketing page](/solutions/sales-marketing) presents a six-step fictional prospect demo, the six workflow definitions in the solution catalog, and a fictional prospect-volume dashboard. The demo and workflow interface update locally; they do not contact a CRM, enrich a real lead, send outreach, publish a campaign, or create a proposal in a connected system. People review consequential actions before execution.

The [Healthcare page](/solutions/healthcare) presents three selectable administrative workflow examples from the solution catalog, a five-stage document-routing preview, four illustrative scenario responsibilities, and a five-stage process strip. These controls update the page locally and do not access patient records, connect clinical systems, or execute tasks. The illustrated responsibilities are not additional employee-registry entries. The examples do not diagnose, treat, or prescribe; qualified staff make clinical and consequential decisions.

The [Insurance page](/solutions/insurance) presents all six catalog workflows (FNOL, Quote & Underwrite, Policy Administration, Claims, Settlement, and Command Center) in a synchronized local preview. A fictional review package, selectable evidence checkpoints, scenario-role network, and five-stage process illustrate intake, organization, routing, human review, and recording outcomes. These visuals do not process real claims, connect policy systems, or make coverage, underwriting, approval, or settlement decisions. The scenario roles are not additional employee-registry entries; authorized people retain consequential decisions.

## What is illustrative
The diagrams, customer support modal, integration networks and outcome language are demonstrations. They do not use company records or call an external platform. Healthcare examples cover administrative coordination only; finance and insurance examples keep consequential decisions with people.

## Next step
Use [Book a Demo](/book-demo) to discuss a real workflow, then validate capabilities and required adapters against the current platform status in these docs.
`),
doc("Reference","glossary","Glossary","Short definitions for the terms used throughout AI Pod.",`
## Platform terms
- **AI employee:** a defined specialist role with task instructions, inputs, outputs and quality checks.
- **Pod:** a team configured around one objective and process.
- **Orchestrator:** platform role that coordinates dependent work and the final result.
- **Blueprint:** saved, versioned business context for a company.
- **Knowledge:** company-owned uploaded files and indexed text chunks.
- **Evidence:** selected excerpts supplied as context and cited or checked in a result.
- **Simulation:** labeled configuration preview without a model call.
- **Live mode:** text execution through a configured compatible gateway.
- **Human gate:** a step waiting for an authorized person’s decision.
- **MCP:** a protocol for discovering tools and context; execution is not enabled in the current integration boundary.
- **Provider gateway:** a trusted server endpoint that accepts AI Pod’s neutral request and returns text.
- **Illustrative preview:** a local product demonstration with fictional data.
`),
doc("Reference","troubleshooting","Troubleshooting","Common causes of blocked work, missing evidence and setup issues.",`
## The Pod is blocked
Check provider status, company blueprint version, task dependencies and pending decisions. A live Pod needs a compatible chat gateway. Fix the cause, then retry the blocked Pod. An expired worker lease also blocks for explicit recovery.

## A file has no searchable text
Images and XLSX files are stored but not extracted. A scanned PDF needs OCR. Check the file’s extraction status and upload a readable source where possible.

## A tool does not run
An onboarding tool selection or discovered MCP schema does not enable execution. Check [integrations](/docs/integrations) and whether a dedicated adapter exists.

## No verification email arrives
Development mode may write OTPs to the server terminal. Production requires a configured mail provider and verified sender. Check the server logs without exposing codes to the browser.

## Work does not start in production
Verify the persistent worker process is running against the same database as the web process. npm start serves HTTP; it does not start the worker.
`),
doc("Reference","visual-design","Visual design","The shared AI Pod type and color system used across the site and application.",`
## Typography
AI Pod uses Satoshi for the public site, documentation, onboarding, workspace and admin screens. Documentation reading text is 15 px with generous line spacing. Larger display text keeps the same family. Monospace is reserved for code and technical labels.

## Light-theme palette
- **Sapphire #3459A6:** primary actions, links and selected states.
- **Deep sapphire #244784:** hover states and darker surfaces.
- **Soft sapphire #E7EEFB:** quiet selection backgrounds.
- **Copper #A94F35:** restrained labels and secondary emphasis.
- **Paper #FAF9F6, ink #1D2940, muted #5D6678 and line #DDE2EA:** the reading surface and interface structure.

Status colors retain their meaning. Decorative illustrations and cinematic media may use supporting colors without changing the UI palette. The implementation source of truth is the shared token block in app/globals.css; the full maintenance guide is in the repository's web/docs/design-system.md.

## AI employee characters
AI employee illustrations are transparent renders of the individually modelled Blender creatures. Keep expressive faces, recognizable species silhouettes, graduated role colors and real geometric role props; do not reduce the collection to one shared body with recolored accessories. Grids and marketing scenes use WebP renders; employee profile views use the corresponding GLB. The 28 editable source scenes, contact sheet, stable-ID manifest and regeneration instructions are in **web/assets/ai-workforce/**.
`),
doc("Reference","release-notes","What’s new","A concise record of the recent public and product additions.",`
## October 2026
- The [Satoshi and sapphire/copper design system](/docs/visual-design), first previewed on the navigation guide, now applies across the public site and application.
- Shared workforce scenes use 28 distinct Blender creature sculptures, with transparent renders, individual GLBs and a seven-by-four contact sheet retained as source assets.
- A dedicated Solutions ecosystem with six department and industry pages, deterministic discovery, local workflow previews and a shared navigation menu.
- A Product experience, specialist workforce presentation, public integrations catalog, demo booking and events experiences.
- An onboarding studio with website research, presets, process interviews, pod selection and blueprint review.
- A persistent multi-company workspace with Pods, specialist definitions, decisions, knowledge and downloadable results.

## Reading this page
This list describes application features and public presentation work. Integration catalogs and animated demos are examples until a live adapter is explicitly described in its reference page.
`),
doc("Reference","documentation-policy","Keeping these docs current","The documentation rule for future changes to AI Pod.",`
## Update with the change
When a feature, route, integration, data model, workflow, control, limitation or user-facing behavior changes, update the relevant article in this documentation area in the same work. Add a new article when the topic cannot fit naturally into an existing one.

## Describe the real state
Say whether a capability is implemented, configurable, illustrative or planned. Keep screenshots and examples fictional. Never inherit a competitor’s certification, ROI figure or clinical/financial claim.

## Verify
Check navigation, search, deep links, mobile layout and copied Markdown after significant docs changes. Verify technical statements against the source code and tests, and update setup commands when they change.
`),
];

export const docsGroups:DocsGroup[]=["Start here","Build your workforce","Operate & review","Connect & extend","Administration","Reference"];
export const docsBySlug=Object.assign(Object.create(null) as Record<string,DocsArticle>,Object.fromEntries(docsArticles.map(article=>[article.slug,article])));
export const docsHref=(slug:string)=>`/docs/${slug}`;
