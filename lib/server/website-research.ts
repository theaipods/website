import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import ipaddr from 'ipaddr.js';
import robotsParser from 'robots-parser';
import { load } from 'cheerio';
import type { ResearchReport, ResearchSource } from '../research-types';

const UA = 'TheAIPodsResearch/1.0';
const directories = ['linkedin.com', 'crunchbase.com', 'g2.com', 'capterra.com', 'clutch.co', 'wellfound.com', 'glassdoor.com', 'trustpilot.com', 'ycombinator.com', 'wikipedia.org', 'ambitionbox.com', 'justdial.com'];
export function publicUrl(value: string) {
  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || (url.port && !['80','443'].includes(url.port))) throw new Error('Use a public HTTP or HTTPS website without credentials or custom ports.');
  url.hash = ''; return url;
}
export function isPublicAddress(address: string) { try { return ipaddr.process(address).range() === 'unicast'; } catch { return false; } }
async function resolvePublic(url: URL) {
  const records = await lookup(url.hostname.replace(/^\[|\]$/g, ''), { all: true });
  if (!records.length || records.some(r => !isPublicAddress(r.address))) throw new Error('Private, local and reserved network addresses are not crawlable.');
  return records[0];
}
// Pin each connection to its validated DNS answer, including every redirect.
export async function fetchPublic(value: string, deadline = Date.now() + 12000, redirects = 0): Promise<{ text: string; url: string; type: string; status: number }> {
  if (redirects > 4 || Date.now() >= deadline) throw new Error('Website request timed out or redirected too many times.');
  const url = publicUrl(value); const address = await resolvePublic(url);
  return new Promise((resolve, reject) => {
    const req = (url.protocol === 'https:' ? https : http).get(url, { family: address.family, headers: { 'User-Agent': UA, Accept: 'text/html,application/xml,text/plain' }, lookup: (_host, _options, callback) => callback(null, address.address, address.family) }, res => {
      const status = res.statusCode || 500;
      if (status >= 300 && status < 400 && res.headers.location) { res.resume(); fetchPublic(new URL(res.headers.location, url).href, deadline, redirects + 1).then(resolve, reject); return; }
      const chunks: Buffer[] = []; let bytes = 0;
      res.on('data', chunk => { bytes += chunk.length; if (bytes > 2_000_000) { res.destroy(new Error('Page exceeds the 2 MB crawl limit.')); return; } chunks.push(chunk); });
      res.on('error', reject); res.on('end', () => resolve({ text: Buffer.concat(chunks).toString('utf8'), url: url.href, type: String(res.headers['content-type'] || ''), status }));
    });
    const timer = setTimeout(() => req.destroy(new Error('Website request timed out.')), Math.max(1, deadline - Date.now()));
    req.on('close', () => clearTimeout(timer)); req.on('error', reject);
  });
}
export function extractPage(html: string, url: string) {
  const $ = load(html); const title = $('title').first().text().trim(); const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
  const siteName = $('meta[property="og:site_name"]').attr('content') || '';
  const structured: Record<string, unknown>[] = [];
  $('script[type="application/ld+json"]').each((_, el) => { try { const data = JSON.parse($(el).text()); const values = Array.isArray(data) ? data : [data, ...(data['@graph'] || [])]; for (const v of values) if (v && typeof v === 'object' && /Organization|Corporation|LocalBusiness|Store|SoftwareApplication|Product/.test(String(v['@type']))) structured.push(v); } catch {} });
  const links: string[] = [];
  $('a[href]').each((_, el) => { try { const u = publicUrl(new URL($(el).attr('href')!, url).href); if (!u.search && !/\.(pdf|png|jpg|jpeg|zip|webp|svg|mp4|css|js)$/i.test(u.pathname)) links.push(u.href); } catch {} });
  $('script,style,noscript,svg,nav,footer,header,form').remove();
  const headings = $('h1,h2,h3').map((_, el) => $(el).text().trim()).get();
  $('p,li,h1,h2,h3,section,div').append('\n');
  const text = $('body').text().replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim().slice(0, 35000);
  return { title, description, siteName, structured, links: [...new Set(links)].slice(0, 300), headings, text };
}
function directory(url: string) { const host = new URL(url).hostname; return directories.some(d => host === d || host.endsWith(`.${d}`)); }
async function apiRequest(endpoint: string, key: string, data: object) {
  const res = await fetch(`https://api.firecrawl.dev/v2/${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Crawler API returned ${res.status}`); return res.json();
}
export async function researchWebsite(input: { website: string; name: string; extraUrls: string[]; render: boolean; mode: 'auto' | 'free' | 'api'; maxPages: number }): Promise<ResearchReport> {
  const root = publicUrl(input.website); await resolvePublic(root);
  const report: ResearchReport = { at: new Date().toISOString(), website: root.href, sources: [], suggestions: [], warnings: [], discovered: 0, limit: input.maxPages };
  const deadline = Date.now() + 100000; const key = process.env.FIRECRAWL_API_KEY;
  if (input.mode === 'api' && !key) throw new Error('Set FIRECRAWL_API_KEY, or choose Automatic / Free crawler.');
  const officialHost = root.hostname.replace(/^www\./, '');
  const official = (u: string) => new URL(u).hostname.replace(/^www\./, '') === officialHost;
  const queue = [root.href, ...input.extraUrls.map(x => publicUrl(x).href)]; const seen = new Set<string>();
  const robots = new Map<string, ReturnType<typeof robotsParser>>();
  async function allowed(url: string) {
    const u = publicUrl(url);
    if (!robots.has(u.origin)) {
      const r = await fetchPublic(`${u.origin}/robots.txt`, Math.min(deadline, Date.now() + 8000));
      if (r.status !== 404 && (r.status < 200 || r.status >= 300)) throw new Error(`Robots policy unavailable (${r.status}); skipped.`);
      robots.set(u.origin, robotsParser(`${u.origin}/robots.txt`, r.status === 404 ? '' : r.text));
    }
    const rules = robots.get(u.origin)!;
    if (rules.isAllowed(u.href, UA) === false) throw new Error('Blocked by robots.txt; no bypass attempted.');
    if ((rules.getCrawlDelay(UA) || 0) > 2) throw new Error('Site requires a longer crawl delay; use a scheduled crawler.');
    return rules;
  }
  try {
    if (input.mode !== 'free' && process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
      const q = `"${input.name || officialHost}" company (site:linkedin.com/company OR site:crunchbase.com OR site:g2.com OR site:clutch.co OR site:wellfound.com)`;
      const u = new URL('https://customsearch.googleapis.com/customsearch/v1'); u.search = new URLSearchParams({ key: process.env.GOOGLE_SEARCH_API_KEY, cx: process.env.GOOGLE_SEARCH_ENGINE_ID, q, num: '10' }).toString();
      const r = await fetch(u, { signal: AbortSignal.timeout(10000) }); if (!r.ok) throw new Error(`Google search returned ${r.status}`);
      const data = await r.json(); for (const item of data.items || []) if (item.link && directory(item.link)) queue.push(item.link);
    } else if (key && input.mode !== 'free') {
      const data = await apiRequest('search', key, { query: `${input.name || officialHost} company LinkedIn Crunchbase G2 Clutch`, limit: 5 });
      for (const item of data.data?.web || []) if (item.url && directory(item.url)) queue.push(item.url);
    } else report.warnings.push('Directory discovery uses links from the official website and the profile URLs you supply. Add a search API for broader web discovery.');
  } catch (e) { report.warnings.push(`Search discovery unavailable: ${(e as Error).message}. Continuing with supplied and linked pages.`); }
  let browser: import('playwright').Browser | undefined;
  const facts: (ReturnType<typeof extractPage> & { url: string })[] = [];
  try {
    while (queue.length && seen.size < input.maxPages && Date.now() < deadline) {
      const url = queue.shift()!; if (seen.has(url)) continue; seen.add(url);
      const source: ResearchSource = { url, title: '', text: '', status: 'pending', provider: 'Free HTTP', kind: official(url) ? 'official' : 'directory' };
      try {
        if (!official(url) && !directory(url)) throw new Error('Only the company site and supported public company directories are included.');
        const rules = await allowed(url);
        if (url === root.href) {
          for (const sitemap of [...rules.getSitemaps(), `${root.origin}/sitemap.xml`].slice(0, 2)) {
            try { if (!official(sitemap)) continue; await allowed(sitemap); const r = await fetchPublic(sitemap, Math.min(deadline, Date.now() + 5000)); if (r.status === 200) { const $ = load(r.text, { xml: true }); $('url > loc').each((_, e) => { const loc = $(e).text(); try { if (official(loc) && queue.length < 200) queue.push(publicUrl(loc).href); } catch {} }); } } catch {}
          }
        }
        let html = ''; let markdown = '';
        if (key && input.mode !== 'free') {
          try { const r = await apiRequest('scrape', key, { url, formats: ['html', 'markdown'], onlyMainContent: false }); if (!r.success) throw new Error('No page returned'); html = r.data?.html || ''; markdown = r.data?.markdown || ''; source.provider = 'Firecrawl API'; }
          catch (e) { if (input.mode === 'api') throw e; report.warnings.push(`API fallback to free crawler for ${url}`); }
        }
        if (!html && !markdown) {
          const r = await fetchPublic(url, Math.min(deadline, Date.now() + 12000));
          if (r.url !== url) await allowed(r.url);
          if (!official(r.url) && !directory(r.url)) throw new Error('Redirected outside supported research sources.');
          if (r.status !== 200) throw new Error(`Website returned ${r.status}; access restrictions are not bypassed.`);
          if (!/text\/html|application\/xhtml/.test(r.type)) throw new Error('Not an HTML page.'); html = r.text;
        }
        let page = extractPage(html, url);
        if (input.render && source.kind === 'official' && page.text.length < 500 && Date.now() < deadline - 15000) {
          try {
            const { chromium } = await import('playwright'); browser ??= await chromium.launch({ headless: true });
            const context = await browser.newContext({ serviceWorkers: 'block', userAgent: UA });
            try {
              // Every browser network request is fulfilled through the pinned public-IP fetcher.
              // No browser-direct requests, WebSockets, forms, workers, images or auth sessions.
              await context.route('**/*', async route => {
                try { const req = route.request(); if (req.method() !== 'GET' || !['document','script','xhr','fetch','stylesheet'].includes(req.resourceType()) || !official(req.url())) return await route.abort(); await allowed(req.url()); const r = await fetchPublic(req.url(), Math.min(deadline, Date.now() + 6000)); if (!official(r.url)) return await route.abort(); await route.fulfill({ status: r.status, contentType: r.type, body: r.text }); } catch { await route.abort(); }
              });
              await context.routeWebSocket('**/*', socket => socket.close());
              const tab = await context.newPage(); await tab.goto(url, { waitUntil: 'networkidle', timeout: 12000 }); page = extractPage(await tab.content(), url); source.provider = 'Free HTTP + Playwright';
            } finally { await context.close(); }
          } catch { report.warnings.push(`Rendering unavailable for ${url}. Install Chromium with: npx playwright install chromium. Static content retained.`); }
        }
        if (/sign in to|sign up to|access denied|verify you are human|captcha/i.test(page.title) || (!page.text && !markdown)) throw new Error('No accessible public content; login / challenge pages are not bypassed.');
        source.title = page.title || new URL(url).hostname; source.text = (markdown || page.text).slice(0, 35000); source.status = 'Stored';
        if (source.kind === 'official') {
          facts.push({ ...page, url });
          const links = [...page.links].sort((a,b) => Number(/about|product|service|company|contact|pricing/i.test(b)) - Number(/about|product|service|company|contact|pricing/i.test(a)));
          queue.push(...links.filter(u => official(u) && !seen.has(u)).slice(0, 30));
          queue.unshift(...links.filter(u => directory(u) && !seen.has(u)).slice(0, 10));
        }
      } catch (e) { source.status = (e as Error).message; }
      report.sources.push(source);
      // A conservative minimum per-page delay; robots policies may request up to two seconds.
      if (queue.length && Date.now() < deadline) await new Promise(r => setTimeout(r, 2000));
    }
  } finally { await browser?.close(); }
  report.discovered = new Set([...seen, ...queue]).size;
  if (queue.length) report.warnings.push(`Partial crawl: ${seen.size} pages attempted out of ${report.discovered} discovered. Page/time limits apply; this is not the entire website.`);
  const first = facts[0]; const src = report.sources.find(s => s.kind === 'official' && s.status === 'Stored')?.url || root.href;
  if (first) {
    const orgPage = facts.find(p => p.structured.some(x => /Organization|Corporation|LocalBusiness|Store/.test(String(x['@type']))));
    const org = orgPage?.structured.find(x => /Organization|Corporation|LocalBusiness|Store/.test(String(x['@type'])));
    const name = String(org?.name || first.siteName || first.title.split(/\s[|—–-]\s/)[0] || '');
    const description = String(org?.description || first.description || first.text.slice(0, 600));
    if (name) report.suggestions.push({ field: 'name', value: name.slice(0,160), source: org?.name ? orgPage!.url : src, confidence: org?.name || first.siteName ? 'extracted' : 'suggested' });
    if (description) report.suggestions.push({ field: 'about', value: description.slice(0,2000), source: org?.description ? orgPage!.url : src, confidence: org?.description || first.description ? 'extracted' : 'suggested' });
    const productPage = facts.find(p => p.structured.some(x => /Product|SoftwareApplication/.test(String(x['@type'])) && x.name));
    const products = (productPage?.structured || []).filter(x => /Product|SoftwareApplication/.test(String(x['@type']))).map(x => String(x.name || '')).filter(Boolean);
    if (products.length) report.suggestions.push({ field: 'products', value: [...new Set(products)].join('\n').slice(0,3000), source: productPage!.url, confidence: 'extracted' });
    else { const productPage = facts.find(p => p.headings.some(h => /product|solution|service|platform|software/i.test(h))); const headings = [...new Set(productPage?.headings || [])].filter(h => /product|solution|service|platform|software/i.test(h)).slice(0,6); if (headings.length) report.suggestions.push({ field: 'products', value: headings.join('\n'), source: productPage!.url, confidence: 'suggested' }); }
    const address = org?.address as Record<string, unknown> | undefined;
    if (typeof address?.addressCountry === 'string') report.suggestions.push({ field: 'geography', value: address.addressCountry, source: orgPage!.url, confidence: 'suggested' });
    const text = `${first.description} ${first.text}`.toLowerCase();
    const candidates = [[/software|saas|developer|cloud platform/, 'Technology & Software'], [/e-commerce|ecommerce|shop online/, 'Retail & E-commerce'], [/healthcare|hospital|medical/, 'Healthcare & Life Sciences'], [/education|learning|students/, 'Education & EdTech'], [/logistics|freight/, 'Transportation & Logistics'] ] as const;
    const category = candidates.find(([re]) => re.test(text)); if (category) report.suggestions.push({ field: 'industry', value: category[1], source: src, confidence: 'suggested' });
    if (/saas|software as a service/.test(text)) report.suggestions.push({ field: 'businessModel', value: /business|enterprise|teams/.test(text) ? 'B2B SaaS' : 'Subscription', source: src, confidence: 'suggested' });
  }
  report.warnings.push('Directory pages may refer to similarly named businesses. Their content is saved as unverified research and does not overwrite the official profile. Headcount, revenue and market coverage are not guessed.');
  return report;
}

