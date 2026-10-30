export type DocsGroup = "Start here" | "Build your workforce" | "Operate & review" | "Connect & extend" | "Administration" | "Reference";
export type DocsArticle = { slug:string; group:DocsGroup; title:string; summary:string; body:string; updated:string };
const updated="October 9, 2026";
const doc=(group:DocsGroup,slug:string,title:string,summary:string,body:string):DocsArticle=>({group,slug,title,summary,body:body.trim(),updated});

export const docsArticles:DocsArticle[]=[
doc("Start here","local-demo","Run a founder demo","Five editable briefs, Starter allowances, models and persistent review queues.",`
## Before you present
Complete and activate company onboarding, save your company rules, and select readable evidence. Website research is stored separately; review and apply findings, then save the onboarding form. The 19-step form persists when you use Save draft, Save & continue or Save & exit.

Sending a demo brief rechecks onboarding completeness, including older records marked active. Complete missing fields before submitting; the check does not consume a project allowance.

Start the web app and worker together with npm run dev. Both load .env.local followed by .env; existing environment values take precedence. Configure chat credentials, plus code credentials for the development template, and restart both processes. Direct OpenAI Responses and the provider-neutral text gateway are supported. A configured flag is not a live connectivity test.

For the current demo, use OpenAI Responses for both CHAT and CODE with your accessible GPT API model. Bedrock is an optional future adapter. Set CHAT_MAX_OUTPUT_TOKENS and CODE_MAX_OUTPUT_TOKENS to a model-supported allowance; reasoning also consumes this budget. Incomplete responses block for retry instead of counting as completed work.

## Five ready-to-send briefs
Open [Demo briefs](/workspace/demo). Marketing launch, sales pipeline, finance close, development build, and customer onboarding/retention are editable prompts. Sending creates one project and one Pod with a saved dependency graph and assigned specialists. Templates do not create fake completed work. Live mode calls your configured models; simulation is a labeled rehearsal only.

## Plans
Every account, including founders and local administrators, starts on Starter: $0, one project and one Pod. Founders is $499 plus GST per month with ten projects and ten Pods. Enterprise has custom pricing and no fixed application quota. All five templates are visible on every plan. An administrator must explicitly change account allowance; billing/checkout is not automated. Existing Pods count toward the account limit. Creating companies does not bypass it.

## Approvals and estimates
Manual reviews every draft. Decide for me uses the template's declared commitment and sign-off checkpoints. Auto-approve completes drafts without review. These modes do not grant external permissions. Up to three independent tasks run together. Pending approvals stay saved; only dependent work waits. Revisions rerun the selected draft, preserving unrelated completed work. The task board shows states, outputs, selected reasoning and an estimated remaining work duration; review wait time and provider latency are not guaranteed.

Simple tasks request medium reasoning, moderate tasks high, and complex tasks xhigh. Model support varies. Operators can explicitly map unsupported efforts with CHAT_REASONING_XHIGH or CODE_REASONING_XHIGH; use omit for models without that parameter. No unsupported setting is silently downgraded.

Retry blocked tasks requeues failed branches without clearing completed work or pending approvals. Paused projects must also be resumed. Changing the blueprint requires a new project rather than mixing context versions.

## Connections and real-world boundaries
Use [MCP & integrations](/workspace/settings) to save profile-level public HTTPS connections. Discover tools, review schemas, explicitly enable trusted read-only tools, and import results into the selected company's evidence library. Select those records before sending the brief. Bearer tokens require MCP_SECRET_KEY and are encrypted at rest. The worker drafts from imported evidence; it does not autonomously execute MCP tools. OAuth, stdio, external writes and arbitrary code execution remain unimplemented.

Company-domain filtering and mailbox verification are required for signup. Common personal and disposable domains are blocked; administrators may extend the blocklist. This filter does not prove employment or exhaustively identify every personal domain.
`),
doc("Start here","introduction","Introduction","What AI Pod is, what a Pod does, and how to read these docs.",`
## What AI Pod is
AI Pod is a workspace for organizing specialized AI employees around a business objective. A company blueprint supplies approved context. A Pod defines the outcome, specialists, knowledge, controls and review points. The workspace shows planned and completed work, decisions, and deliverables.

The public product and solution pages include illustrative animations. Those previews are not connected to your company data. This documentation distinguishes saved application behavior from examples and future integration concepts.

## Finding public resources
All public pages share one footer with product, resource and company links and a Book a demo action. Its employee artwork is decorative and does not represent active workers.

The documentation index pairs section names with category icons. Product benefits, event resources and demo plans use the same supplementary visual cues; the text labels remain the source of meaning. Icons do not indicate a connected service or completed setup. The public integrations workflow offers Research brief, Financial review and Engineering release scenarios, pairing the corresponding employee artwork with tool, output and human-review icons. These are explanatory animations, not live tool calls.

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

Open [the sign-in page](/login). This page keeps the site header and omits the marketing footer so the focus stays on signing in. The development command starts the web app and background worker. Leave the terminal running while testing Pod execution.

## First run
Create or sign in to an account, create a company, complete the onboarding sections, activate the company, and create a simulation Pod. Registration starts with a work email, followed by a Resend verification code, then a name and password. Configure Resend in both local development and production; codes are never printed to the terminal.

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
- File upload, readable-text extraction, hybrid semantic/keyword retrieval and selected evidence for Pods.
- Specialist registry, persistent Pod plans, dependent tasks, human gates, revisions, audit history and result downloads.
- Simulation mode and provider-neutral live text generation when a compatible gateway is configured.
- Public website research with a bounded free crawler; optional search/crawl APIs require keys.
- MCP endpoint registration and tool-schema discovery for a company, with discovered tools disabled.

## Illustrative or not yet connected
The marketing animations, solution finder and customer demo use local sample data. Selecting a tool during onboarding does not authorize or connect that tool. The public integrations catalog describes possibilities, not installed connectors. MCP tool execution, OAuth provider connections, external publishing, messaging, payments and repository changes need separate adapters. Image, video, audio and vision execution remain reserved. Text embeddings support saved knowledge retrieval.

## What to verify in your environment
Live gateway behavior, email delivery, PostgreSQL hosting and any external integration must be tested with your own services. No certification or business-impact metric is asserted by these docs.
`),
doc("Start here","navigation","Find your way around","The public site, onboarding, workspace and admin area.",`
## Public pages
The homepage desktop display headings and supporting copy use a larger scale consistent with the other marketing pages. Its Questions and contact section is visible after the closing call to action, with individual FAQ disclosures and a separate contact form card; the whole section is not hidden behind a closed disclosure.
Submitting the homepage contact form sends an interest notification through Resend to CONTACT_LEADS_TO (default contact@theaipods.com) and uses the visitor's email as Reply-To. Configure RESEND_API_KEY and a verified-domain RESEND_FROM on the server. Until those settings work, the form shows an error and links visitors to the direct email address instead of claiming the message was sent.
The [home page](/), [Product](/product), [Solutions](/solutions), [Integrations](/integrations), [Events](/events), [About](/about) and [Book a Demo](/book-demo) pages explain the platform. Product and Solutions navigation panels open on hover-capable devices, remain clickable on touch and keyboard, and do not remain open together. Product previews are labeled as examples. The About page presents the mission, story and published product milestones, then explains the platform through one automatically sequenced product story. The published principles follow that showcase. Its supplied futuristic eco-tech command-center image forms the full-bleed hero background, darkened on the left to keep the headline readable. A client-rendered Three.js workforce scene layers in front with a heavy, multi-tier Orchestrator machine, a transparent spherical chamber with structural ribs, a suspended energy core, a rotating mechanical ring assembly, and six thick orbital platforms. Every specialist link is a curved 3D cable with a visible physical socket; eight staggered packets travel outbound and back along each of the six routes continuously, with cable and endpoint light pulses. The hero presents one larger Explore AI Pods call to action and more legible workforce benefit labels without the former secondary See how it works link. The six specialists are the approved high-definition transparent PNG illustrations, positioned on the platforms with contact shadows; procedural mascot meshes and retired model renders are not used. The cinematic machinery uses perspective, physically based materials, shadows, reflections and atmospheric lighting. The scene contains no interface panels or decorative labels. This is illustrative: no workflow runs and no tool connects. Reduced-motion preferences stop the animation and off-screen scenes pause rendering. The About workflow titled Build your AI team starts at its first stage only when at least 15% of that section enters the viewport. Its timeline pauses while off-screen or in a hidden browser tab, then resumes without skipping stages; stage selection and Replay remain available. The product showcase titled See what we are building follows one fictional Northstar product-launch brief through ten beats: ten example employees, an objective, a plan, four assigned specialists, three tool-context arrivals, a draft, a human review, and a reviewed outcome. The four chapters advance automatically in about 18 seconds without tab clicks. On large desktop viewports, the story stays below the header during a bounded native scroll sequence; scrolling forward advances the workflow. Skip story links go directly below it. Mobile, short viewports, and reduced-motion mode keep normal page flow. Playback begins with the workforce only when the visual is at least 20% visible, pauses off-screen or in hidden tabs, and holds on the completed outcome. Pause, previous/next, chapter selection, and Replay remain available. Selecting a chapter or step pauses playback; reduced-motion preferences require manual progression. Notion, Google Drive, and Slack supply labeled fictional context, not live reads. The review shows an example correction to an unsupported claim. No tool is connected, no reviewer is actually contacted, and nothing is published. The hero summary reports 28 roles from the employee registry and the six specialists shown, alongside human-guided and governance principles; it does not claim unverified performance statistics. The product story uses static canonical employee artwork with HTML/CSS transitions, not a real-time 3D engine. Its ten-role example is a subset of the registry, not a change to the total role count. Mission, story, milestones, and principles come from the admin-managed About content. Unpublished milestones and principles are omitted.

The home page hero uses the supplied office-and-city background and a progressive eight-scene campaign story. It begins with the empty room, then a woman and laptop arrive, her marketing-campaign request appears, and one Workforce Orchestrator receives it. The plan takes focus, five named specialists enter one by one, their contributions are collected, and a single review-ready package remains. Future actors and output cards are not present before their scene; the duplicate intake bot and persistent connector diagram have been removed. Canonical specialist names and illustrations are unchanged. The sequence takes roughly fourteen seconds after assets are ready, starts when 30% of its viewport is visible, pauses off-screen or in hidden tabs, and holds the final package until Replay. Previous/next and direct chapter controls pause playback; the hero’s own pause control does not change the separate workflow example below it. Reduced-motion mode advances manually without entrance animation. A fixed-height mobile storyboard replaces the old long vertical composition. The expandable gallery still exposes all current registry roles. Each specialist now shows a different contribution to the fictional Morrow Focus Notebook launch: brief inputs and hypotheses, marketing copy, an original ad, a proposed seven-day calendar, and measurement definitions. Select a specialist to pause and inspect their work. The final package offers Creative, Copy, and Plan previews; Open the campaign displays a full scrollable report. Visitors can download the original ad PNG, six-page campaign PDF, and launch copy TXT. The product picture is an AI-generated concept; copy and reports are authored sample artifacts, not the output of a live agent run. No campaign results are claimed. This demonstration never runs a campaign, submits an objective, or connects tools. Three distinct character cards lead to creating a pod, exploring solutions, and learning about the product. The five-stage workflow demonstration supports play, pause, replay, and direct stage selection; it changes only the example UI and never updates an external system. Reduced-motion preferences disable automatic animation; the separate workflow example remains usable through manual stage controls. Ambient character motion and demonstration playback pause while their sections are outside the viewport, and automatic demonstration playback pauses in a hidden browser tab. The previous multi-objective simulator and full registry explorer remain available in expandable panels. Filterable employee cards and the registry count come from the current agent definitions; the catalog count comes from the public catalog, whose entries require configuration and are not installed accounts. The Everything the pod needs to work section demonstrates a customer handoff or launch brief using authored Google Drive, Notion, and Slack excerpts. Four stages show selected sources, an example access policy, source-linked context assembly, and human review. The 5.4-second sequence starts when 30% of the resulting brief panel is visible, pauses off-screen or in hidden tabs, and holds at completion. Source inspection and chapter selection pause playback; reduced motion advances manually. The examples never read connected accounts, change permissions, or send messages. Solution cards link to the six current solution routes. The autonomy selector describes illustrative operating levels, and the governance panel presents configurable concepts, not a claim that every control is active in a visitor's workspace. The closing call to action opens booking; questions and contact remain available below it.

The Product navigation opens three single-action cards: **Build** links to [the lifecycle](/product#lifecycle), **Connect** links to [Integrations & MCP on the Product page](/product#integrations), and **Operate** links to [deliverables](/product#deliverables). Explore product opens the Product overview. The bullet points explain each route; they are not separate controls.

The Product hero presents a centered workforce workbench: an objective, two specialists, approved context and human review. Selecting a node pauses at that stage. Lifecycle, capability, integration, employee, activity, request, knowledge, document and deliverable controls remain local demonstrations. The button above the lifecycle selector opens the existing preview dialog. Counters and charts are fictional. Hero playback reaches review after 3.4 seconds, with manual controls and reduced-motion support; no workflow is deployed.

## Demo booking behavior
The public Book a Demo page embeds a Calendly event type using the configured HTTPS event URL, which defaults to https://calendly.com/contact-theaipods/30min. NEXT_PUBLIC_CALENDLY_URL can override it. Calendly supplies availability, invitee fields, time-zone handling, confirmation, and any calendar or meeting integrations configured in that Calendly account. AI Pod does not create or confirm a reservation until Calendly reports calendly.event_scheduled. When the configured URL is invalid, the page shows a setup state. The older internal demo scheduler and its API remain in the codebase for existing direct integrations, but this public page does not submit to them.

The public Book a Demo page opens with a private walkthrough scene. Header and footer Book a demo links open the top of this page; the in-page scheduling actions move to the calendar. Finance, People and Customer work selections change the employee and sample agenda in that hero only. The primary action opens the Calendly panel below; the existing six focus cards pass their topic as Calendly UTM context. Visitors enter details and choose a time in Calendly. The From conversation to real possibilities section uses an image-free, four-stage conversation-to-plan preview: challenge, workflow, review checkpoints, and next steps. Selecting a stage changes an illustrative brief and pauses automatic progression. Playback waits until the section is visible and pauses off-screen, in hidden tabs, or for reduced-motion preferences; manual selection remains available. The Bring your use case link returns to the booking calendar. The tools strip and closing booking action remain. Illustrations do not connect accounts or execute work.

The public Events page opens with an interactive front-row session preview. Choose a product-demonstration, hands-on-workshop, or human-review question; each follows a question, a concrete example, an audience follow-up, and a takeaway. The preview advances in about nine seconds once its visual enters the viewport, pauses off-screen or in hidden tabs, and holds on the takeaway. Pause, chapter selection, and Replay remain available; reduced-motion preferences use manual chapters. It is an illustrative HTML/CSS presentation, not a live broadcast, recording, or executed workflow. Light mint, blue and white sections and the supplied From the stage conference artwork follow. Its hero actions scroll to the featured event or archive. The page includes a featured event, archive filtered by the years and event types present in the data, past-session cards, resource links, private-session booking action, and FAQ. Featured registration uses the existing event registration form. A past-session card says **Watch recording** only when that event has a recording URL; otherwise it opens event details as **View session**. The current seeded events are sample events and their past sessions do not yet have playable recordings. Minimal finance, enterprise-design and human-approval illustrations each use one distinct mascot, a simple prop and a pale background. These and the featured television scene are illustrative event artwork. The conference artwork is decorative and does not imply a video is available; the “Watch past sessions” action opens the archive. The news destination currently announces future updates rather than published articles. Event detail pages and registration management remain available. The removed upcoming catalog, live-series duplicate, speaker showcase, and topic browser are not part of this page.

## Application pages
After signing in, **Onboarding** saves company context. Its 19 steps are grouped into six chapters: Discover, Understand, Connect, Configure, Simulate and Launch. Select a chapter to reveal its steps; switching steps keeps the current in-memory draft. Save draft or Save & exit persists changes. Each step has a contextual blueprint preview, and readiness is calculated from actual setup requirements rather than steps visited. **Help me fill this step** requests editable AI suggestions for eligible fields using the configured chat provider. Customize AI help supplies additional context or targets a field; Draft complete onboarding prepares suggestions across eligible sections. Review and accept fields individually, then save. Website research remains available on Company. AI does not grant permissions, invent actual headcounts or activate the company. **Workspace** contains the command center, Pods, Results, Decisions, Company blueprint, AI employees, Work & activity, and MCP & integrations settings.

## Admin
The platform-owner admin console is separate from a company owner’s workspace and restricted to authorized administrator accounts. Its overview shows account, company, file and administrator totals. **Manage owners** opens Accounts; select an account to inspect its companies. The older /admin#owners link also opens Accounts.

**Files** opens a company directory labeled by website. Select a company to see only its uploaded files. Search beside the file totals filters company websites before selection, then filenames, categories and statuses within the selected company. Files remain stored against their company, not a shared global folder. Text indexing extracts readable content into saved chunks. The worker creates model-tagged embeddings with configured NVIDIA or Azure credentials. Live retrieval combines semantic similarity and keywords; missing or failed embeddings fall back to keywords.

**Settings** contains Edit About and homepage team visibility. **Events** remains in the sidebar with its existing editors; neither editor is an overview shortcut. **Change password** and **Log out** are below the administrator profile in the sidebar. The standalone admin Pods view has been removed; operational work remains in Workspace. Refresh failures display an inline error while retaining loaded records.
`),
doc("Build your workforce","core-concepts","Core concepts","The records and boundaries that make up an AI workforce.",`
## Company, blueprint and Pod
A company is the ownership boundary. Its blueprint records business facts, goals, processes, brand guidance, rules, permissions and selected knowledge. A Pod is created from that context for one objective. Each Pod records the company blueprint version used at creation.

## Specialists and platform roles
Specialists have definitions for mission, inputs, outputs, tools and quality. Platform roles include Pod Manager, Workforce Orchestrator and Workforce Observer. Registry definitions are not proof of a connected model or tool; execution depends on the selected mode and available providers.

## Tasks and controls
A Pod plan contains dependent tasks. Tasks may be planned, running, completed, blocked, rejected, cancelled or waiting for approval. Human-only and approval-controlled steps remain visible to the owner. A task may be revised with feedback and a new version.

## Evidence and result
Selected company text chunks use semantic/keyword retrieval when embeddings are configured, with keyword fallback. The result records its mode and review state. Owners should verify claims, sources and assumptions before using an output externally.
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

## AI assistance you review
Use **Fill with AI** beside an eligible section heading to add optional context and draft its fields, or **Draft complete onboarding** to request a broader set of suggestions. The server uses your current form and up to eight matching passages from indexed company knowledge. Configured onboarding chat providers are tried in order. If they are unavailable or return unusable fields, clearly labeled built-in starter proposals can fill the gaps. Suggestions are proposals, not verified facts; inspect their source references, edit them, then accept or reject each field. Accepted suggestions and their review provenance are retained when you save. Missing or invalid suggestions do not replace your draft.

**Create custom teams with AI** adds editable, distinct team cards from company context; existing teams are preserved. Save draft keeps the generated teams. Template cards toggle on and off with a visible selected background. Goals accepts multiple measurable outcomes, each with its own metric, baseline, target and timeframe. Each outcome also has its own Fill with AI control. AI can propose metrics, timeframes, baselines and targets; suggested numbers are labeled planning estimates, not observed performance. Readiness checks every outcome, and the business blueprint displays them all.

Company size and team staffing can be suggested as planning estimates. Actual measurements should replace estimates before live use. Regular section assistance cannot change permissions or activation. Human-only checkpoints cannot be removed by an AI suggestion. If you edit a field after generation, regenerate before accepting a suggestion for it. Collection suggestions display editable subfields; review existing entries before replacing a collection. When new departments are suggested, accept those first, then generate their processes and recommendations.

## Saving and activation
Save actions persist to the company record; this is not automatic background saving. Edits made during a save remain in the form and still need saving. Readiness items link to the section that needs attention. Activation stays unavailable until required information is complete, and the server rechecks it. Activation does not require model credentials or run external work. A failed request preserves the form for correction or retry; cross-session conflicts require reconciling with the latest saved record.

## Editing later
You can reopen onboarding from **Company blueprint**. A Pod created against an older blueprint version is blocked from using changed context; create a replacement Pod from the updated blueprint.
`),
doc("Build your workforce","website-research","Analyze a company website","How public research becomes reviewable onboarding context.",`
## Analyze, review, apply
Analyze website saves a background job. Run web and worker together; progress remains available across chapters, navigation and refresh. Official crawling and search discovery start together, with up to four page workers. Chat summarizes up to eight matched excerpts into concise editable company fields. Source matching validates provenance, not truth. Findings prefill empty or unchanged fields; later manual edits are protected. Review and Save persist the profile.

Changing the website clears the previous profile fields in the draft, updates the setup identity, and is saved when Analyze starts. Old-domain research is excluded from retrieval. A blocked official site can use matched third-party evidence marked provisional. Unknown facts remain blank; company size needs explicit staff-count evidence. Source restrictions are respected. Reports separate crawling, chat and indexing results; readable text survives model failure. Vision/video understanding is not part of this flow.

## Free crawler
The bounded crawler follows same-site links and sitemaps, prioritizes business pages and can use Playwright for sparse JavaScript-rendered pages. It attempts 5, 15 or 30 pages within an approximate 100-second budget. Robots restrictions, login walls and challenges are reported rather than bypassed. This does not guarantee every page or directory entry.

## Optional APIs and directories
Firecrawl can be used for scraping when configured, with free crawling as the automatic fallback. Google Custom Search can assist discovery for eligible existing customers. Directory URLs may be supplied or discovered from public links; LinkedIn and directory content can be incomplete or unavailable without access. Third-party facts remain unverified until a person confirms them.

## Saved evidence
Reports are stored as Website research knowledge with URLs, timestamps, coverage and failures, and can be downloaded as JSON. See [research setup](/docs/research-configuration) for optional keys and boundaries.

The report distinguishes complete, partial and failed attempts. Zero-page attempts are retained for diagnosis but do not produce searchable evidence chunks. A report from a different website is flagged before applying fields. The crawler uses the Playwright browser library directly, not a Playwright MCP server. Rendering waits for the document and a bounded content check rather than waiting indefinitely for network silence.

## Brand candidates
The Brand step shows color, font and logo-link candidates from website metadata, inline styles and rendered body/button styles when available. Review the source and extraction method before applying colors or fonts. Logo links are not imported automatically; upload an approved asset. Color customization is optional, and the preview protects text contrast. These settings guide company outputs and do not replace the application's shared visual theme.
`),
doc("Build your workforce","knowledge","Knowledge and evidence","Upload, index, select and review company information.",`
## Supported files
The application accepts TXT, MD, CSV, JSON, PDF, DOCX, PPTX, XLSX and PNG/JPG/WEBP. Readable text is extracted from plain text, Word, PowerPoint and PDFs. Images and XLSX files are stored, but their content is not currently extracted for retrieval. Scanned PDFs require OCR that is not implemented here.

## Limits and retrieval
Each file is limited to 8 MB; a company can have up to 100 files. Extracted text is capped at one million characters per file. Text is split into chunks; retrieval stays limited to selected company-owned evidence. Configured NVIDIA/Azure embeddings are stored beside chunks and used for hybrid semantic/keyword retrieval. Worker indexing continues in bounded batches; failures retain keyword retrieval.

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
Book Demo’s What to expect section uses the supplied pastel hologram illustration at its original proportions behind accessible HTML content and describes four informational walkthrough stages: goals, use cases, tailored demo and next steps. Book Demo presents its three plans in illustrated cards; the Recommended Founders badge is a presentation recommendation, not measured popularity. Its closing banner uses Starry Friends artwork, distinct from the Explorers footer. Its mobile footer separates artwork from navigation and copyright. The shared public footer uses five supplied backgrounds selected by page group across public pages, with a clean boundary and no gradient transition band. Its embedded character group replaces the separate footer portraits. The invitation and demo button sit beneath the logo, clear of the artwork. All 28 employee characters use the approved static reference artwork. Marketing ensembles, employee profiles, compact avatars, integration examples and the footer share the same stable employee-ID mapping. No exported employee 3D models or Blender renders are loaded. Shared marketing groups space each character in its own lane and use gentle staggered CSS motion. Hover pauses the group, and reduced-motion preferences disable animation. This movement is decorative and does not represent live employee activity.

The 28 employee characters use individual high-definition transparent PNG illustrations in **web/public/ai-workforce/avatars-hd/**. Stable registry IDs select each image through StaticEmployee, and each illustration preserves its role-specific character and props. The retired cropped tile images are no longer used. The [Pod Manager preview](/characters/pod-manager) shows the crowned lion. Characters and their idle motion are presentation assets, not live workers.

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
Live mode uses the selected server-side provider for chat/code: AI_PROVIDER=nvidia, azure, bedrock, or legacy. NVIDIA uses NVIDIA_API_KEY with Lightning chat/code models by default; Azure uses its resource endpoint, API key and deployment names; Bedrock uses AWS credentials, region and model/inference-profile IDs. Explicit provider selection ignores legacy credentials, and no provider fallback occurs. Restart web and worker after changes. NVIDIA free endpoints are for prototyping and subject to provider limits. Vision/media execution remains unimplemented; embeddings support knowledge retrieval. Legacy mode calls the existing provider-neutral gateway or Responses adapter. Chat is also needed for management, quality review and final delivery, even if a code capability is requested. The worker sends instructions, company context, selected evidence, upstream outputs, task and acceptance criteria to the gateway.

## When a provider is unavailable
The Pod blocks and reports the missing or failed provider. The application does not silently replace a failed live call with simulation. A blocked Pod can be retried after the cause is addressed.

## Reserved capabilities
Image, video, audio and vision have configuration slots but no execution adapter. NVIDIA/Azure text embeddings use the separate knowledge retrieval adapter. Supplying a key alone does not activate them. See [model gateways](/docs/model-gateways).
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

See the [public integrations experience](/integrations) for the visual concept, and [MCP settings](/docs/mcp) for the implemented boundary. The Integrations page has a light source-to-permission hero, an interactive MCP permission-gate demonstration, a searchable and category-filterable catalog, illustrative workflow scenarios, and a connection-settings link. In the gateway demonstration, a sample read request crosses identity, tool-schema, and scope checks before returning fictional evidence; switching to a publishing request closes the permission gate and shows that nothing was published. The roughly eight-second sequence starts when the panel enters view, pauses off-screen or in hidden tabs, and holds on its outcome. Pause, chapter selection, and Replay are available; reduced-motion mode advances manually. These CSS gates and sample results do not connect an account, execute a tool, or grant permission. The former closing Bring your stack section has been removed. Catalog cards open detail drawers showing each entry's current availability and required connection path; they do not authorize or connect an account. Workflow scenarios animate an explanation only and do not call an external tool. The gateway explanation remains available at [/integrations#mcp](/integrations#mcp), and the catalog at [/integrations#catalog](/integrations#catalog).
`),
doc("Connect & extend","mcp","MCP endpoint discovery","Register a server safely and understand the current limit.",`
## Register a server
In **Workspace → MCP & integrations**, a company owner can register a public HTTPS MCP endpoint, discover tool schemas and remove the server. Endpoint validation rejects private, loopback, link-local and reserved IP addresses. DNS answers are pinned for the outbound connection, and redirects are revalidated.

## Tool state
Legacy company-scoped connections remain discovery-only. The profile connections panel supports anonymous or encrypted bearer-authenticated public HTTPS servers, paginated discovery, explicit read-tool grants, and user-triggered tools/call imports into company evidence. Rediscovery resets grants. The worker uses selected imported evidence rather than invoking tools autonomously. Per-agent grants, OAuth, stdio and external write execution are not implemented.

## Design for a future adapter
Map each tool to a narrow action and risk level. Add credentials, authorization, execution and audit behavior only after the policy boundary is defined. For actions that alter external systems, make retries idempotent and keep an approval point where needed.

> **Security note:** Only register endpoints you trust. A public-address check is not a substitute for service-level authorization or an outbound network policy in production.
`),
doc("Connect & extend","model-gateways","Model gateways","Configure compatible text generation without exposing credentials.",`
## Provider-neutral contract
Set CHAT_MODEL_URL, CHAT_MODEL_KEY and CHAT_MODEL_NAME for chat. Equivalent CODE_ variables configure code text. The worker sends a POST with model, capability, instructions, context, task, acceptance criteria and a maximum output length. The gateway should return HTTP 200 with a nonempty text field.

## Important boundaries
Set CHAT_MODEL_FORMAT=responses for direct OpenAI Responses, bedrock for AWS Converse, or gateway for the text contract above. Equivalent CODE_ settings allow Claude Sonnet coding alongside OpenAI coordination. Bedrock needs a model/inference-profile ID, AWS region and AWS SDK credentials; it does not use MODEL_URL/KEY. Configure BEDROCK_THINKING for the selected Claude version and explicitly map unsupported effort names. Other vendor formats need a trusted gateway. Credentials stay on the server. Configure chat even for code Pods because management, review and final steps use it.

## Failure and usage
Invalid output, non-200 status or the 45-second timeout blocks the Pod. MAX_MODEL_CALLS_PER_POD bounds attempts, but the Pod budget is only context. Token and currency billing controls require a provider-specific adapter.

## Other modalities
Image, video, audio and vision slots are reserved. Text embeddings support company knowledge retrieval with NVIDIA or Azure. They need typed artifacts, storage, polling/cancellation, usage accounting and validation before they can run. The full adapter contract is in web/docs/PROVIDERS.md in the source repository.
`),
doc("Connect & extend","research-configuration","Research configuration","Free crawling, optional APIs and source-coverage limits.",`
## Free rendering
Install Chromium once after npm ci if you want Playwright rendering:

~~~powershell
npx playwright install chromium
~~~

The free crawler follows same-site links and sitemaps, respects access restrictions, uses a fresh browser context and does not reuse authenticated sessions. A page cap and crawl time budget keep runs bounded.

## Optional server-side keys
Add FIRECRAWL_API_KEY for API scraping. GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID can assist discovery for eligible existing customers. Automatic mode falls back to the free crawler when an API scrape fails. API-only mode requires Firecrawl and does not use HTTP fallback. Local robots checks apply in every mode. Configure AI_PROVIDER and its chat credentials separately for profile analysis after retrieval. Free crawler avoids search/crawl API calls but can still call the configured chat provider. Vision/video names remain reserved. NVIDIA_EMBEDDING_MODEL defaults to nvidia/nemotron-3.5-embed-1b; Azure uses AZURE_EMBEDDING_DEPLOYMENT. Persisted research and indexing require the worker.

## Coverage is not completeness
Some directories block automated access or require accounts. Directory facts are marked unverified. A source report includes attempted URLs, status and failures; review those before using a suggestion in the blueprint.

## Security
Research mutations require the company owner session, enforce same-origin requests and rate-limit runs. Private or reserved destination addresses are rejected and redirects are revalidated. A paid crawler is a separate external-service boundary.
`),
doc("Administration","accounts-security","Accounts and security","Sessions, ownership, verification and practical safeguards.",`
## Authentication
Passwords are stored as salted hashes. Create account starts with a work email, sends a six-digit Resend code, then asks for a name and password after verification. A short success transition opens the workspace. Common personal and disposable domains are blocked, including subdomains; BLOCKED_EMAIL_DOMAINS adds deployment-specific exclusions. This is a domain blocklist, not proof of employment. Sessions use expiring HttpOnly cookies and mutations check origin.

## Password changes and recovery
Choose Forgot password on [Login](/login), or Change password from the admin or workspace navigation. The [password recovery page](/reset-password) works for admins and owners, including signed-in users. Verify the email code, choose and confirm a new password, then log in again. All existing sessions for that account are invalidated. The saved database hash is authoritative; restarting cannot restore a bootstrap password.

Codes expire in 10 minutes, allow five guesses, and have a 60-second resend cooldown and hourly send limit. Signup and reset codes cannot be interchanged. Verification produces a single-use, ten-minute token for setting the password. Resending replaces the old code and token. No account is created until verified signup completes. Reset requests use a generic response that does not disclose whether an account exists.

## Email and environments
RESEND_API_KEY and RESEND_FROM are required on the Node server for both local development and production. Emails include an embedded TheAIPods logo, so they do not require public access to localhost. Delivery failures do not claim success. Codes are never returned to the browser or printed to the terminal. The same flow uses local SQLite or hosted PostgreSQL via DATABASE_URL. Different databases hold separate accounts and passwords.

Cloudflare may proxy the Node/Railway server. Use the public HTTPS origin for APP_URL and COOKIE_SECURE=true in production. This repository is not a direct Cloudflare Workers/D1 deployment. The small envelope-and-X error indicator animates once, retains accessible text, and respects reduced-motion preferences.

## Company isolation
Companies, knowledge and Pods are scoped to their owner. The API checks ownership on reads and writes, including selected knowledge and downloads. The admin role has a separate authorized console.

## Controls are not certification
The app contains permission fields, approval gates, audit history and an execution stop control. These implementation features do not constitute a SOC 2, ISO, HIPAA or GDPR certification. Production use needs deployment-specific review, backups, monitoring, secret management and integration testing.

## Sensitive data
Only upload information you are permitted to use. A live gateway receives selected company context and evidence, so evaluate the gateway’s data handling before connecting it. Public demo examples use fictional content.
`),
doc("Administration","data-storage","Data, uploads and deletion","Persistence, transfer, limits and owner-controlled removal.",`
## Local storage
SQLite persists accounts, companies, knowledge, Pods, approvals and results by default. Files are saved with their database records; extracted text and model-tagged embedding vectors are stored for company-scoped retrieval. Session and OTP records are managed separately from the export/import flow.

## PostgreSQL
The app includes a PostgreSQL adapter selected with DATABASE_URL. Against one hosted CockroachDB cluster, its TLS connection, automatic schema creation, and a transactional insert/read/upsert check passed. This does not verify the full application on every PostgreSQL-compatible service. A URL beginning with file: selects SQLite; use the unprefixed postgresql:// URL for CockroachDB. An existing SQLite database is not migrated by changing the URL.

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

On Railway, create two services from the GitHub repository with Root Directory / (or leave it blank) and Node.js 24 or newer. The local checkout is named web, but package.json is at the GitHub repository root. Set the web service Build Command to npm run build and Start Command to npx next start --hostname 0.0.0.0 --port $PORT, then generate its public domain. Set the private worker service Start Command to npm run worker:production and do not give it a public domain. Add the same database and model variables to both services through Railway Variables. The worker's tsx loader is a production dependency. Optional browser-rendered research requires Chromium and Linux browser dependencies in the worker image; ordinary HTTP research can run without the browser.

## Required production choices
Set APP_URL to the HTTPS origin and COOKIE_SECURE=true. INITIAL_ADMIN_EMAIL can grant admin access to an additional registered, verified work account. The previous admin/admin login is retired. Configure email with RESEND_API_KEY and RESEND_FROM; signup and recovery require Resend locally and in production. Set DATABASE_URL to the complete unprefixed postgresql:// URL with TLS options. If its TLS configuration names a CA certificate file, that path must exist inside both deployed services; a Windows path from local development will not work there. Use managed secrets, backups, monitoring and provider-side usage controls. Changing the database URL does not migrate existing SQLite data.

## Operational limitations
An HTTP-only deployment cannot run background jobs. Document parsing should be isolated appropriately for your environment. Production behavior of external mail, gateways and PostgreSQL must be tested with those services. The application is not presented as security certified.
`),
doc("Administration","admin-console","Admin console","What administrators can manage separately from company owners.",`
## Purpose
The admin area provides authorized operators with searchable account, company, Pod, and knowledge-file views, plus task visibility. Overview, Accounts, Companies, Pods, Files, Events, Workspace, Admins, Billing & Plan, and Settings open as views inside one shared admin workspace. The overview includes platform totals and owner work details. Admins can grant and remove access, assign account plan allowances, and control homepage team visibility. The Events view includes the event catalog and editor, speaker profiles, registration list and CSV export, and event analytics; the legacy /admin/events address redirects to that view. The Workspace view links into operational tasks, Pods, and approvals. Administrators can end their session from the shared dashboard. These administrative actions require an authorized admin session.

## Access
An administrator must sign in with an authorized account. Admins and owners can change passwords through email verification. Initial account provisioning runs once per database and preserves existing saved passwords. Company ownership remains the normal boundary for application records.

## Change discipline
Treat admin actions as operational changes. Check the saved result and audit history. Do not use public documentation as a place to expose user records, credentials or internal secrets.
`),
doc("Reference","api-reference","API reference","A practical map of the current application API and its scope.",`
## API shape
Application endpoints live under /api. Most require an authenticated owner session and same-origin mutation requests. The API validates input and returns an error object for rejected requests. Use the browser application for normal work; this reference is for integration and testing.

## Main routes
- **GET /api/auth/session:** current session and user state.
- **POST /api/auth/register, /api/auth/resend, /api/auth/verify, /api/auth/complete-signup:** work-email verification followed by account creation. Verification returns a single-use grant, not a session.
- **POST /api/auth/password-reset, /api/auth/reset-password:** request a recovery code, then save a new password using its verified grant. See [accounts and security](/docs/accounts-security).
- **POST /api/auth/login, /api/auth/logout:** session lifecycle.
- **GET /api/state:** owner-scoped companies, Pods, provider status and recent audit items.
- **POST /api/companies; PUT /api/companies/:id:** save a draft or update a company. Activation validates required onboarding information.
- **GET/POST /api/companies/:id/knowledge:** list or upload company files.
- **GET /api/companies/:id/research:** read the latest saved report.
- **POST /api/companies/:id/research:** enqueue research; returns HTTP 202 with a persisted job.
- **GET /api/companies/:id/research/status:** recover the latest job, progress, result and any error.
- **POST /api/companies/:id/pods:** create a Pod from an active company.
- **POST /api/pods/:id/run, /pause, /decision:** control work and record human decisions.
- **GET /api/pods/:id/download:** download the Markdown result.
- **GET/POST /api/mcp/servers:** manage discovered MCP endpoints through the company-scoped API.

## Safety and versioning
Company edits use version checks. API callers must supply valid company-owned IDs for selected files and Pods. Do not treat documented paths as permission to bypass the application’s authentication and review flow.
`),
doc("Reference","solutions","Solutions and public demos","How to interpret the six solution experiences.",`
## Discovery
The [Solutions hub](/solutions) begins with a six-tab solution collection: People, Customers, Finance, Growth, Healthcare and Insurance. Tabs switch a local scenario, employee illustration, preparation steps and destination link; arrow keys, Home and End also select tabs. Below it is a local finder for four business functions and two industries. Choosing an area selects that page; with **Any area**, the objective determines the example match. Team size is collected only as conversation context and does not affect the match. Matching is deterministic frontend logic and does not call an LLM. Each recommendation links to a dedicated page with workflow selectors and visual examples. The hub also offers a five-stage interactive workflow preview, category-filtered example tools from the integrations catalog, and links to the available industry and function pages. These interactions are local demonstrations, not live executions or connected provider accounts.

## Dedicated pages
Employee Experience, Customer Experience, Finance Operations, Sales & Marketing, Healthcare and Insurance have dedicated solution pages with illustrative workflows and controls.

Solution heroes have independent visual stories: an employee welcome pack, invoice reconciliation desk, campaign studio, healthcare appointment station and insurance evidence folder. They share timing and controls, not the homepage composition. Five stages complete after 3.4 seconds and hold for 1.9 seconds before replay. Manual selection, replay, reduced-motion, off-screen and hidden-tab handling are available. Customer Experience offers selectable conversation drafts; the Solutions hub offers an interactive six-area collection. All stories are local illustrations.

The [Finance Operations page](/solutions/finance-operations) presents a six-stage invoice journey, three finance roles currently in the employee registry (Finance Agent, Audit Agent, Approval Router), and five selectable example workflows. Its monthly spend chart uses fictional values, and its exception path is an interactive sample. Selections change the local preview only; they do not connect a ledger, process a payment, issue an approval, or execute a workflow. Authorized people retain review and approval decisions.

The [Customer Experience page](/solutions/customer-experience) opens with a conversation-focused hero. Delivery, Product and Policy exception buttons select fictional requests. A five-stage animation gathers approved context, prepares a reply and ends at team review; exceptions explicitly go to a human specialist. Selecting a stage pauses; Replay restarts, and reduced-motion mode supports manual stepping. No message is sent, no CRM is queried and no task count implies production activity. Actual actions depend on configured connections, permissions and approval rules.

The [Healthcare page](/solutions/healthcare) includes three selectable administrative workflow previews, a local Try this workflow sequence ending at staff review, five administrative stages, and five illustrative responsibility cards. Its appointment-station hero offers Appointments, Documents and Follow-up examples. The clock and schedule are fictional, and the coordination folio ends in a staff-review tray without booking an appointment. Hero and operational stages animate locally, with manual selection, off-screen, hidden-tab and reduced-motion handling. Static character artwork is not rigged animation. The role cards are scenario responsibilities, not additional registry employees. No patient data or hospital systems are connected by this page, and the explicit human decision boundary remains visible.

The [Employee Experience page](/solutions/employee-experience) has a selectable seven-stage lifecycle with distinct illustrative employee artwork for each stage, the two current HR registry roles (HR Agent and Employee Assistant), five separate local workflow previews, knowledge-source examples, and a fictional support-volume dashboard followed by the shared footer. The former closing workflow call-to-action section has been removed; demo booking remains available in the shared site navigation. The page uses spacious, responsive light mint sections matching the Integrations page’s heading and spacing scale, with larger preview cards, an interactive assistant preview and a pale-blue illustrative analytics section. Its ivory-and-sage hero pairs the Employee Assistant with a rising welcome letter, access request and first-week plan. Workflow pills and the registered-role selector update the preview; submitting a sample assistant request directs users to sign in, without generating an AI response. Resolution time is fictional example data. Public knowledge questions demonstrate routing only: this page does not search private company documents or provide policy answers. Company knowledge and access rules belong to the authenticated workspace, and people retain sensitive HR decisions.

The [Sales & Marketing page](/solutions/sales-marketing) presents a six-step fictional prospect demo, a white “The next step” call to action immediately before the workflow selector, the six workflow definitions in the solution catalog, and a fictional prospect-volume dashboard. The demo and workflow interface update locally; they do not contact a CRM, enrich a real lead, send outreach, publish a campaign, or create a proposal in a connected system. People review consequential actions before execution.

The [Healthcare page](/solutions/healthcare) presents three selectable administrative workflow examples from the solution catalog, a five-stage document-routing preview, four illustrative scenario responsibilities, and a five-stage process strip. These controls update the page locally and do not access patient records, connect clinical systems, or execute tasks. The illustrated responsibilities are not additional employee-registry entries. The examples do not diagnose, treat, or prescribe; qualified staff make clinical and consequential decisions.

The [Insurance page](/solutions/insurance) presents all six catalog workflows (FNOL, Quote & Underwrite, Policy Administration, Claims, Settlement, and Command Center) in selectable local previews. Try this workflow advances only the illustrated task rows and ends at staff review. A fictional review package, selectable evidence checkpoints, and selectable review stages illustrate evidence organization and human review. The hero opens policy and evidence sheets from a folder beside the compliance owl, flags missing information and prepares a reviewer handoff. Character artwork is static. Decorative motion stops off-screen, in hidden tabs and for reduced-motion preferences; manual stages and replay remain available. These visuals do not process real claims, connect policy systems, or make coverage, underwriting, approval, or settlement decisions. The scenario roles are not additional employee-registry entries; authorized people retain consequential decisions.

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
Both local and production require RESEND_API_KEY and a verified sender in RESEND_FROM. Check spam, the sender domain verification and delivery status in Resend. Restricted test senders cannot deliver to arbitrary work emails. Wait 60 seconds before resending. Codes are not printed in logs. If delivery fails, request a new code.

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
AI employee illustrations use individual high-definition transparent PNGs in public/ai-workforce/avatars-hd/, framed consistently by the shared StaticEmployee component. Preserve the distinct character identities, colors and role props. Do not reintroduce tiled crops, 3D models or Blender-rendered substitutes.

The homepage request-to-review composition is exclusive to Home. Eleven other marketing routes use distinct layouts and animated objects, including a conversation scene and solution collection: a welcome letter, invoice scanner, creative poster, appointment coordination folio, evidence folder, demo agenda, theater screen, permission bridge and product workbench. Text and controls remain HTML. Approved static characters and optional room backgrounds are decorative; examples never execute work or connect accounts.
`),
doc("Reference","release-notes","What’s new","A concise record of the recent public and product additions.",`
## October 2026
- Eleven marketing heroes now have independent compositions and fast five-stage animations, including the conversation scene, solution collection and appointment station. The copied homepage layout is removed; existing booking, event, integration, product and solution controls remain available.
- Repository maintenance removed unreachable legacy UI, unused stylesheet selectors and animations, duplicate character assets, and obsolete artwork. Existing routes, saved records, registry characters and active showreels remain available. The About workflow illustration no longer requests an absent video file; native video requires a configured, served asset.
- The [Satoshi and sapphire/copper design system](/docs/visual-design), first previewed on the navigation guide, now applies across the public site and application.
- Shared workforce scenes use 28 approved static reference characters. The About hero combines the six correct transparent avatars with a code-rendered Three.js Orchestrator and continuously animated illustrative energy routes; retired mascot model files remain removed.
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

For repository maintenance, run npm run audit:unused, npm run typecheck, npm test, and npm run build from the web application directory. TypeScript rejects unused locals and parameters. The unused-code audit includes routes, tests, worker scripts and Remotion authoring; asset deletion additionally requires checking dynamic URLs and stored public-content references. Never infer that a database, uploaded document, manual authoring entry point or reference guide is unused merely because it has no import.
`),
];

export const docsGroups:DocsGroup[]=["Start here","Build your workforce","Operate & review","Connect & extend","Administration","Reference"];
export const docsBySlug=Object.assign(Object.create(null) as Record<string,DocsArticle>,Object.fromEntries(docsArticles.map(article=>[article.slug,article])));
export const docsHref=(slug:string)=>`/docs/${slug}`;
