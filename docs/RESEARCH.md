# Company research and onboarding studio

Analyze website saves a durable company-scoped research job and returns HTTP 202 immediately. Run `npm run dev` locally (web and worker), or run the production web and worker against the same database. `dev:web` alone cannot execute research. The worker keeps a heartbeat and can reclaim a job after ten minutes without one. Chapter navigation, page refresh and leaving the page do not cancel the job. The onboarding status banner polls `GET /api/companies/:id/research/status`; the existing GET research route returns the latest saved report.

Official crawling and search discovery start concurrently. Up to four page workers run with a two-second spacing per origin, a 100-second crawl budget and the selected page cap. Google is used when both search settings are populated; missing/failing Google uses Firecrawl search when configured. Results and snippets must match the current domain/company identity. Third-party evidence remains provisional, especially when the official site is blocked.

Chat receives up to eight matched page/snippet excerpts (6,000 characters each), prioritizing official sources. The application splits those excerpts into numbered passages. The model selects a supporting passage ID; the server attaches its original URL and text and rejects unknown IDs. This validates provenance, not truth. Unknown fields remain blank. Company size requires an explicit staff count, not customer numbers. Menus and image markdown are removed; descriptions and services are bounded and summarized.

Changing the domain clears the previous seven company profile fields in the current draft and updates the setup identity. Analyze saves that draft before starting work. Completed findings prefill fields that are empty or unchanged since submission; newer manual edits and results from a different domain are protected. Review and Save persist the prefilled company profile. Other setup configuration and uploaded documents are retained. Old-domain research is excluded from retrieval.

Reports and cleaned source text are stored under **Website research**. Text chunks and model-tagged embedding vectors are persisted in the same SQLite or PostgreSQL database. NVIDIA defaults to `nvidia/nemotron-3.5-embed-1b`; Azure accepts `AZURE_EMBEDDING_DEPLOYMENT`. The worker also indexes uploaded/connected text in bounded batches. Onboarding assistance and live Pod retrieval combine semantic similarity with keyword matching; simulation uses keywords only. Pod retrieval remains restricted to selected company-owned documents. There is no re-crawl at Pod execution time. Embedding failures retain readable text and fall back to keyword retrieval. The report exposes index status and indexed chunk count; background retry can improve the index after that report snapshot.

Vision/video generation and image understanding are not implemented in this flow. A text embedding model retrieves related saved passages; chat turns evidence into a readable overview. Neither bypasses a blocked source. Research has bounded crawl, chat and embedding calls, so indexing large reports can take several minutes.

## Free crawler

No API key is required. Install the browser once after `npm ci`:

```powershell
npx playwright install chromium
```

The free crawler follows same-site links, reads URL sitemaps, prioritizes business pages, and discovers supported directory links. Add known LinkedIn/company directory URLs in Research settings. Supported directories include LinkedIn, Crunchbase, G2, Capterra, Clutch, Wellfound, Glassdoor, Trustpilot, Y Combinator, Wikipedia, AmbitionBox and Justdial.

Playwright renders the official landing page and sparse, JavaScript-dependent pages. It uses a fresh browser context and routes requests through the public-address validator. Third-party resources and authenticated sessions are not used. Some sites therefore require a crawler API or a supplied document to obtain useful content. Navigation uses `domcontentloaded` with a 12-second limit, followed by a 3.5-second bounded content check. It does not wait for `networkidle`. Static content survives a render failure; missing Chromium and navigation failures have distinct messages.

This is the server-side **Playwright library**, not an MCP browser service. No Playwright MCP endpoint participates in website research. Profile MCP connections are a separate feature and are not required for the free crawler.

Verification on 2026-10-19: a one-page free crawl of `https://example.com` successfully used Chromium and produced two profile suggestions. The Apollo Hospitals URL shown in the onboarding reference returned HTTP 403 for its robots policy; the crawler correctly returned a failed outcome with zero evidence pages. A supplied company document is the fallback for that restriction. This is a site-access limitation, not evidence of missing browser binaries.

Reports include `outcome` (complete, partial, failed) and optional brand findings. Matched public evidence can produce a partial profile when official pages are blocked; no usable evidence produces a failed report. Widget pages, short empty responses, access errors and personal LinkedIn profiles are excluded. Firecrawl status and redirects are checked. API content is not rendered again through the free browser.

Failed attempts are stored as diagnostics, but only successfully extracted page text creates evidence chunks. Theme-color metadata, named inline CSS colors, inline/computed fonts and rendered button backgrounds produce reviewable candidates. Logo/icon URLs are recorded without downloading or applying an unverified asset.

A run attempts 5, 15 or 30 pages within a roughly 100-second crawl budget, with a 2 MB response cap and per-page delays. Coverage is reported explicitly. This is bounded research, not a guarantee of every page or every company detail. Without a search API, directory discovery comes from supplied URLs and links on the company website. Robots restrictions, login walls and challenges are reported rather than bypassed.

## Optional APIs

Set these server-only variables in `web/.env.local`, then restart the application:

```dotenv
FIRECRAWL_API_KEY=
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
```

**Automatic** uses Firecrawl v2 scrape when configured and falls back to the free crawler on API failure. Firecrawl search discovers additional directory pages when Google search is not configured. **Free crawler** makes no paid search/crawl API calls. **API only** requires a Firecrawl key and reports scrape failures without falling back to HTTP content extraction. Public robots checks still happen locally in every mode.

Google Custom Search JSON API is an optional discovery adapter for existing eligible customers, not Googlebot. Google says it is closed to new customers and existing customers must transition by January 1, 2027. See [Google's overview](https://developers.google.com/custom-search/v1/overview) and [REST usage](https://developers.google.com/custom-search/v1/using_rest). Firecrawl's integration follows its [scrape contract](https://docs.firecrawl.dev/api-reference/endpoint/scrape). Provider plans, quotas and charges apply. Free crawler mode avoids search/crawl API calls, but optional chat analysis still uses the configured model provider. See [provider configuration](PROVIDERS.md).

Verification on 2026-10-29: NVIDIA Lightning returned a successful live chat response; Firecrawl authentication/credit lookup succeeded. A one-page API crawl of example.com returned readable content and completed chat analysis. Apollo's robots endpoint still returned 403 from Azure Application Gateway, so the official site remains unavailable to this crawler. No access restriction was bypassed and no company records were changed by these service checks.

Research endpoints require the company's owner session, enforce same-origin mutations and rate-limit runs. Private, loopback, link-local and reserved IPs are rejected; DNS answers are pinned for each HTTP connection and redirects are revalidated. Provider crawling is an external service boundary; use provider controls and an egress policy when deploying.

## Onboarding changes

- 20 industries and 20 business models, geography choices and custom entries.
- Ten editable team templates, icons for all 14 departments/pods, goal-driven metrics.
- Two interview examples per question, complete department examples and editable starter processes/roles.
- Interview, tool inventory and SOP documentation are all required. No-existing-tools is an explicit answer; SOPs can be uploaded or written inline.
- Expanded tool catalog with local brand assets, font multi-select, brand guideline chips and business-rule templates.
- Human-review presets, selectable AI opportunities, and one/multiple/all pod selection persisted with the company.
- Three illustrative rehearsal scenarios, readiness cards and a visual business blueprint.

Templates are examples to review, not researched facts. Tool selections do not connect external accounts. Selected pods form a saved starting lineup; activation opens the outcome brief for the first selected pod.

## Reviewed AI drafts

`POST /api/companies/:id/assist` accepts a validated `draft`, `section` (0–18 or `all`), optional top-level `field`, and an optional instruction. Owner authorization, origin checks and a 60/hour user limit apply. It uses the onboarding-only provider chain with the chat capability and includes company-local knowledge excerpts. Configure the selected provider's chat credentials; see PROVIDERS.md. Assistance retrieves company-scoped stored evidence using embeddings when available. No keys are sent to the browser.

Form calls request JSON-object output. Fenced/prose-wrapped JSON is accepted by a quote-aware parser. One configured provider gets one format/schema repair attempt; multiple providers are tried in order. Invalid findings are discarded individually. No entered fields change on failure. Goals generation uses the product's goal/metric choices and labels recommendations as proposals.

The response contains individually validated suggestions, warnings, model and timestamp. Invalid fields are discarded while valid fields remain reviewable. Permissions, status and automatic execution grants are not eligible for section assistance. Company size, staffing, baselines and targets can be explicitly labeled planning estimates; existing human-only steps cannot be removed. Accepted review records persist in optional `assistanceHistory`, preserving compatibility with older company records. This history records review provenance, not proof of factual correctness.

The UI compares each proposal with the generation snapshot, blocks acceptance after a newer edit, and validates edited proposals again. Accepted values still require Save. Whole-draft generation can return partial proposals; new departments should be accepted before generating their process mappings. The provider has a bounded request timeout. Missing configuration and malformed responses return clearly labeled built-in starter proposals where possible. They do not silently modify the draft.

## Activation diagnosis

Activation uses the existing company POST/PUT persistence path, with `status: active`, optimistic version checking, ownership and `companyGaps` validation. It does not call a model or create/run Pods. Incomplete goals/interviews/SOPs explain readiness blockers; missing model keys do not explain a disabled activation button. Readiness details now link to the corresponding section, and the activation panel explicitly states why it is waiting. Save responses merge around newer in-flight edits and do not navigate away from those unsaved edits. A synchronous request lock prevents duplicate clicks in the same form.

## Brand assets

Department symbols use Lucide. Tool SVGs come from Simple Icons (current and v11 legacy catalogs); seven missing brands use checked-in official-site favicons. Assets are served locally, with no icon CDN requests from a user's session. Regenerate catalog SVGs with `node --import tsx scripts/tool-icons.mjs`; checked-in favicon PNGs are retained. Brand names/logos belong to their respective owners and identify tools, not partnerships or connected accounts.

## Section assistance, teams and outcomes

Eligible form sections have a right-aligned **Fill with AI** control. Expand it to add optional context or generate suggestions using the current draft and retrieved company knowledge. Section assistance cannot grant permissions or activate. Size, headcounts, baselines and targets can be proposed as labeled estimates; actual measured values remain user-supplied. Invalid model output is retried once in JSON mode; failures do not overwrite a draft.

Organization includes **Create custom teams with AI**. Explicitly creating teams adds validated editable team cards to the draft. Existing teams are preserved; duplicate names and IDs are not appended. Review and Save draft persists them. Template cards toggle on/off and use a sapphire selected background and a text indicator.

Goals supports up to 20 outcome objects, each with id, metric, baseline, target and timeframe. AI proposes metric names, timeframes and labeled baseline/target estimates, preserving existing measurements. Each outcome is checked for readiness and shown in the blueprint. Old single-metric records load as one outcome; the first outcome mirrors the legacy metric/baseline/target/timeframe fields for existing consumers. The outcomes array is stored in the company's JSON record with no destructive migration.

## One-click trial setup and chapter progress

POST /api/companies/:id/quickstart accepts a companySchema draft and requires company-owner authorization and the standard same-origin check (6 requests/hour). It returns a validated proposed draft, actual model/starter attribution, warnings and a local checked-step count. The route itself does not persist or activate; the explicit Fill all with AI client action subsequently saves through the normal optimistic-version company PUT with status active. It fills gaps without replacing entered values, limits permissions to read/draft, preserves Human only checkpoints, and ensures a final human checkpoint. It never connects accounts or starts Pod execution.

The client reuses current-domain research or enqueues a durable research job, waits for that job ID, then generates against a snapshot. A changed website, replaced job or intervening edits aborts application. Leaving the onboarding route does not cancel research, but the trial-generation UI must be restarted when returning. Research waits at most six minutes before asking the user to return after it finishes.

Missing facts use explicitly labeled trial examples. Staffing defaults are 8-10 for small teams, 15-20 for medium businesses and 30-50 for large enterprises. Selected outcome IDs and real baseline/target values are preserved. Optional uploads and credentials are intentionally never fabricated. A complete trial is a valid configuration, not a factual audit.

Optional trialCheck in company JSON stores timestamp, checked-step count and a deterministic configuration fingerprint. Each chapter derives completion from field values. Simulate requires a fresh local check; Launch requires complete readiness and active company status. Changing context invalidates the check. The fingerprint is a freshness marker, not an authorization mechanism. Older records remain compatible.
