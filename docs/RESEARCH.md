# Company research and onboarding studio

The Analyze website button creates a saved, company-scoped research report. It extracts public website content, metadata and structured organization/product information, and offers editable profile suggestions. Each finding records its source and whether it was extracted or inferred. Existing fields change only when selected and applied. Save the profile after reviewing the findings.

Reports are stored in company knowledge under **Website research**, including page text, URLs, timestamp, provider, coverage and failures. The report is also downloadable as JSON. Third-party directory content remains unverified research: it is not automatically treated as company identity or headcount.

## Free crawler

No API key is required. Install the browser once after `npm ci`:

```powershell
npx playwright install chromium
```

The free crawler follows same-site links, reads URL sitemaps, prioritizes business pages, and discovers supported directory links. Add known LinkedIn/company directory URLs in Research settings. Supported directories include LinkedIn, Crunchbase, G2, Capterra, Clutch, Wellfound, Glassdoor, Trustpilot, Y Combinator, Wikipedia, AmbitionBox and Justdial.

Playwright renders sparse, JavaScript-dependent pages on the official website. It uses a fresh browser context and routes requests through the public-address validator. Third-party resources and authenticated sessions are not used. Some sites therefore require a crawler API or a supplied document to obtain useful content.

A run attempts 5, 15 or 30 pages within a roughly 100-second crawl budget, with a 2 MB response cap and per-page delays. Coverage is reported explicitly. This is bounded research, not a guarantee of every page or every company detail. Without a search API, directory discovery comes from supplied URLs and links on the company website. Robots restrictions, login walls and challenges are reported rather than bypassed.

## Optional APIs

Set these server-only variables in `web/.env.local`, then restart the application:

```dotenv
FIRECRAWL_API_KEY=
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
```

**Automatic** uses Firecrawl v2 scrape when configured and falls back to the free crawler on API failure. Firecrawl search discovers additional directory pages when Google search is not configured. **Free crawler** makes no paid search/crawl API calls. **API only** requires a Firecrawl key and reports scrape failures without falling back to HTTP content extraction. Public robots checks still happen locally in every mode.

Google Custom Search JSON API is an optional discovery adapter for existing eligible customers, not Googlebot. Google says it is closed to new customers and existing customers must transition by January 1, 2027. See [Google's overview](https://developers.google.com/custom-search/v1/overview) and [REST usage](https://developers.google.com/custom-search/v1/using_rest). Firecrawl's integration follows its [official API project](https://github.com/firecrawl/firecrawl). Provider plans, quotas and charges apply. The paid adapters require credentials and have not been tested against a live paid account in this workspace.

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

## Brand assets

Department symbols use Lucide. Tool SVGs come from Simple Icons (current and v11 legacy catalogs); seven missing brands use checked-in official-site favicons. Assets are served locally, with no icon CDN requests from a user's session. Regenerate catalog SVGs with `node --import tsx scripts/tool-icons.mjs`; checked-in favicon PNGs are retained. Brand names/logos belong to their respective owners and identify tools, not partnerships or connected accounts.
