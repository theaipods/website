import { lookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import ipaddr from 'ipaddr.js';
import robotsParser from 'robots-parser';
import { load } from 'cheerio';
import type { BrandFinding, ResearchReport, ResearchSource } from '../research-types';
import { analyzeResearchProfile, cleanResearchText, sameCompanyEvidence } from './research-profile';

const UA = 'TheAIPodsResearch/1.0';
const directories = ['linkedin.com', 'crunchbase.com', 'g2.com', 'capterra.com', 'clutch.co', 'wellfound.com', 'glassdoor.com', 'trustpilot.com', 'ycombinator.com', 'wikipedia.org', 'ambitionbox.com', 'justdial.com'];
export function publicUrl(value: string) {
  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || (url.port && !['80','443'].includes(url.port))) throw new Error('Use a public HTTP or HTTPS website without credentials or custom ports.');
  const host=url.hostname.replace(/^\[|\]$/g,'');
  if(host==='localhost'||host.endsWith('.localhost')||host.endsWith('.local')||ipaddr.isValid(host)&&!isPublicAddress(host))throw new Error('Private, local and reserved network addresses are not crawlable.');
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
  const brand: BrandFinding[] = [];
  const theme = $('meta[name="theme-color"]').attr('content');
  const css = $('style').map((_,e)=>$(e).text()).get().join('\n') + $('[style]').map((_,e)=>$(e).attr('style')).get().join('\n');
  const colors = [...new Set([theme, ...Array.from(css.matchAll(/(?:--[\w-]*(?:primary|brand|accent)[\w-]*|background-color|color)\s*:\s*(#[a-f\d]{6})\b/gi),m=>m[1])].filter((v): v is string=>!!v&&/^#[a-f\d]{6}$/i.test(v)))];
  colors.slice(0,2).forEach((value,i)=>brand.push({field:i?'secondary':'primary',value,source:url,method:i===0&&value===theme?'Theme-color metadata (candidate)':'Inline CSS color (candidate)'}));
  const font = /font-family\s*:\s*([^;}]+)/i.exec(css)?.[1]?.trim();
  if (font) brand.push({field:'typography',value:font.slice(0,200),source:url,method:'Inline CSS font-family'});
  const logo = $('img[alt*="logo" i]').first().attr('src') || $('link[rel="icon"]').first().attr('href');
  if (logo) try { brand.push({field:'logo',value:publicUrl(new URL(logo,url).href).href,source:url,method:'Public logo/icon link; not imported'}); } catch {}
  $('script,style,noscript,svg,nav,footer,header,form').remove();
  const headings = $('h1,h2,h3').map((_, el) => $(el).text().trim()).get();
  $('p,li,h1,h2,h3,section,div').append('\n');
  const text = $('body').text().replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim().slice(0, 35000);
  return { title, description, siteName, structured, links: [...new Set(links)].slice(0, 300), headings, text, brand };
}
export function directory(url: string) {
  const u = new URL(url); const host = u.hostname;
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return /^\/company\/[^/]+/i.test(u.pathname);
  return directories.some(d => host === d || host.endsWith(`.${d}`));
}
export function validateResearchContent(title: string, text: string) {
  if (/sign in to|sign up to|access denied|verify you are human|captcha|forbidden/i.test(title)) throw new Error('No accessible public content; login / challenge pages are not bypassed.');
  if (/tradingview.*widget|(?:chart|stock|market).*widget|^widget\b/i.test(title)) throw new Error('Embedded widget, not a company profile; excluded from evidence.');
  if (text.trim().length < 100) throw new Error('Too little readable page content to use as company evidence.');
}
export function researchOutcome(sources: ResearchSource[], hasRemaining: boolean): ResearchReport['outcome'] {
  if (!sources.some(s => s.status === 'Stored' && (s.kind === 'official' || s.identityMatched))) return 'failed';
  if (!sources.some(s=>s.kind==='official'&&s.status==='Stored'))return 'partial';
  return hasRemaining || sources.some(s => s.status !== 'Stored') ? 'partial' : 'complete';
}
async function apiRequest(endpoint: string, key: string, data: object) {
  const res = await fetch(`https://api.firecrawl.dev/v2/${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Crawler API returned ${res.status}`); return res.json();
}
export type ResearchInput = { website: string; name: string; extraUrls: string[]; render: boolean; mode: 'auto' | 'free' | 'api'; maxPages: number };
export async function researchWebsite(input: ResearchInput, progress: (stage:string,completed:number,total:number)=>Promise<void> = async()=>{}): Promise<ResearchReport> {
  const root = publicUrl(input.website); await resolvePublic(root);
  const report: ResearchReport = { at: new Date().toISOString(), website: root.href, sources: [], suggestions: [], warnings: [], discovered: 0, limit: input.maxPages, brand: [] };
  const deadline = Date.now() + 100000; const key = process.env.FIRECRAWL_API_KEY;
  if (input.mode === 'api' && !key) throw new Error('Set FIRECRAWL_API_KEY, or choose Automatic / Free crawler.');
  const officialHost = root.hostname.replace(/^www\./, '');
  const official = (u: string) => new URL(u).hostname.replace(/^www\./, '') === officialHost;
  const queue = [root.href, ...input.extraUrls.map(x => publicUrl(x).href)]; const seen = new Set<string>();
  const robots = new Map<string, Promise<ReturnType<typeof robotsParser>>>();
  async function allowed(url: string) {
    const u = publicUrl(url);
    if (!robots.has(u.origin)) {
      robots.set(u.origin, (async()=>{
        const r = await fetchPublic(`${u.origin}/robots.txt`, Math.min(deadline, Date.now() + 8000));
        if (r.status !== 404 && (r.status < 200 || r.status >= 300)) throw new Error(`Robots policy unavailable (${r.status}); skipped.`);
        return robotsParser(`${u.origin}/robots.txt`, r.status === 404 ? '' : r.text);
      })());
    }
    const rules = await robots.get(u.origin)!;
    if (rules.isAllowed(u.href, UA) === false) throw new Error('Blocked by robots.txt; no bypass attempted.');
    if ((rules.getCrawlDelay(UA) || 0) > 2) throw new Error('Site requires a longer crawl delay; use a scheduled crawler.');
    return rules;
  }
  let discoveryDone = false;
  const discoveredUrls = new Set<string>();
  const discover = (async () => { try {
    if (input.mode !== 'free' && process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
      const q = `"${officialHost}" company overview business employees headquarters`;
      const u = new URL('https://customsearch.googleapis.com/customsearch/v1'); u.search = new URLSearchParams({ key: process.env.GOOGLE_SEARCH_API_KEY!, cx: process.env.GOOGLE_SEARCH_ENGINE_ID!, q, num: '8' }).toString();
      try {
        const r = await fetch(u, { signal: AbortSignal.timeout(10000) }); if (!r.ok) throw new Error(`Google search returned ${r.status}`);
        const data = await r.json(); for (const item of data.items || []) addSearchResult(item.link,item.title,item.snippet,'Google Search');
      } catch(e) {
        report.warnings.push(`${(e as Error).message}. Trying Firecrawl discovery.`);
        if(key){const data=await apiRequest('search',key,{query:q,limit:6});for(const item of data.data?.web||[])addSearchResult(item.url,item.title,item.description,'Firecrawl Search');}
      }
    } else if (key && input.mode !== 'free') {
      const data = await apiRequest('search', key, { query: `"${officialHost}" company overview employees headquarters`, limit: 6 });
      for (const item of data.data?.web || []) addSearchResult(item.url,item.title,item.description,'Firecrawl Search');
    } else report.warnings.push('Directory discovery uses linked and supplied URLs. Configure a search API for broader public discovery.');
  } catch (e) { report.warnings.push(`Search discovery unavailable: ${(e as Error).message}. Continuing with supplied and linked pages.`); }
  finally {discoveryDone=true;} })();
  function addSearchResult(value:string,title='',snippet='',provider:string){
    try{
      if(!value)return;const url=publicUrl(value).href;
      if(/linkedin\.com/.test(new URL(url).hostname)&&!directory(url))return;
      discoveredUrls.add(url);queue.push(url);
      // Search snippets are fallback evidence, explicitly labeled, never whole pages.
      if(sameCompanyEvidence(officialHost,title,snippet)&&snippet.length>=100)
        report.sources.push({url,title,text:cleanResearchText(snippet),provider,kind:'directory',status:'Stored',identityMatched:true,snippet:true});
    }catch{}
  }
  let browser: import('playwright').Browser | undefined;
  const facts: (ReturnType<typeof extractPage> & { url: string })[] = [];
  try {
    const originStarts=new Map<string,number>();
    async function processPage(url:string) {
      const origin=new URL(url).origin;
      const start=Math.max(Date.now(),originStarts.get(origin)||0);originStarts.set(origin,start+2000);
      if(start>Date.now())await new Promise(r=>setTimeout(r,start-Date.now()));
      if(Date.now()>=deadline)return;
      const source: ResearchSource = { url, title: '', text: '', status: 'pending', provider: 'Free HTTP', kind: official(url) ? 'official' : 'directory' };
      try {
        if (!official(url) && !directory(url) && !discoveredUrls.has(url)) throw new Error('Only the company site and supported public company directories are included.');
        const rules = await allowed(url);
        if (url === root.href) {
          for (const sitemap of [...rules.getSitemaps(), `${root.origin}/sitemap.xml`].slice(0, 2)) {
            try { if (!official(sitemap)) continue; await allowed(sitemap); const r = await fetchPublic(sitemap, Math.min(deadline, Date.now() + 5000)); if (r.status === 200) { const $ = load(r.text, { xml: true }); $('url > loc').each((_, e) => { const loc = $(e).text(); try { if (official(loc) && queue.length < 200) queue.push(publicUrl(loc).href); } catch {} }); } } catch {}
          }
        }
        let html = ''; let markdown = ''; let pageUrl = url;
        let metadata: { title?: string; description?: string; ogSiteName?: string; statusCode?: number; url?: string; error?: string } = {};
        if (key && input.mode !== 'free') {
          try {
            const r = await apiRequest('scrape', key, { url, formats: ['html', 'markdown'], onlyMainContent: true });
            if (!r.success) throw new Error('No page returned');
            metadata = r.data?.metadata || {};
            if (metadata.error || (metadata.statusCode && metadata.statusCode >= 400)) throw new Error(`Crawler returned an inaccessible page (${metadata.statusCode || 'error'}).`);
            pageUrl = metadata.url ? publicUrl(metadata.url).href : url;
            if (pageUrl !== url) { await resolvePublic(publicUrl(pageUrl)); await allowed(pageUrl); }
            if (official(pageUrl) !== official(url) || (!official(pageUrl) && !directory(pageUrl) && new URL(pageUrl).hostname!==new URL(url).hostname)) throw new Error('Crawler returned a different source; excluded.');
            html = r.data?.html || ''; markdown = r.data?.markdown || ''; source.provider = 'Firecrawl API';
          }
          catch (e) { if (input.mode === 'api') throw e; report.warnings.push(`API fallback to free crawler for ${url}`); }
        }
        if (!html && !markdown) {
          const r = await fetchPublic(url, Math.min(deadline, Date.now() + 12000));
          if (r.url !== url) await allowed(r.url);
          if (!official(r.url) && !directory(r.url) && new URL(r.url).hostname!==new URL(url).hostname) throw new Error('Redirected outside supported research sources.');
          if (r.status !== 200) throw new Error(`Website returned ${r.status}; access restrictions are not bypassed.`);
          if (!/text\/html|application\/xhtml/.test(r.type)) throw new Error('Not an HTML page.'); html = r.text; pageUrl = r.url; metadata = {};
        }
        let page = extractPage(html, pageUrl);
        page.title ||= metadata.title || '';
        page.description ||= metadata.description || '';
        page.siteName ||= metadata.ogSiteName || '';
        // Firecrawl can return markdown without a usable HTML body.
        if (!page.text.trim()) page.text = markdown.slice(0, 35000);
        if (input.render && source.provider === 'Free HTTP' && source.kind === 'official' && (page.text.length < 500 || url === root.href) && Date.now() < deadline - 15000) {
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
              const tab = await context.newPage();
              await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
              await tab.waitForFunction(() => (document.body?.innerText.trim().length || 0) > 150, undefined, { timeout: 3500 }).catch(() => {});
              const rendered = extractPage(await tab.content(), url);
              if (rendered.text.length >= page.text.length) page = rendered;
              const computed = await tab.evaluate(() => ({ font: getComputedStyle(document.body).fontFamily, color: (()=>{const el=document.querySelector('button, a[class*="button"], a[class*="btn"]');return el?getComputedStyle(el).backgroundColor:'';})() }));
              if (computed.font) page.brand.push({field:'typography',value:computed.font,source:url,method:'Rendered body font'});
              const rgb=/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(computed.color);
              if(rgb) page.brand.push({field:'primary',value:'#'+rgb.slice(1).map(n=>Number(n).toString(16).padStart(2,'0')).join(''),source:url,method:'Rendered button background (candidate)'});
              source.provider = 'Free HTTP + Playwright';
            } finally { await context.close(); }
          } catch(e) { const missing=/executable doesn't exist|browser.*not found/i.test((e as Error).message); report.warnings.push(`Rendering unavailable for ${url}: ${missing?'Chromium is missing; run npx playwright install chromium.':'Navigation or rendering did not complete within its limit.'} Static content retained when available.`); }
        }
        validateResearchContent(page.title, markdown || page.text);
        source.title = page.title || new URL(url).hostname; source.text = cleanResearchText(markdown || page.text).slice(0, 35000);
        validateResearchContent(source.title,source.text); source.status = 'Stored';
        source.identityMatched=source.kind==='official'||sameCompanyEvidence(officialHost,source.title,source.text)||page.links.some(official);
        if(!source.identityMatched)throw new Error('Company identity could not be matched; excluded.');
        if(source.kind==='official')page.text=source.text;
        if (source.kind === 'official') {
          for (const finding of page.brand) if (!report.brand!.some(b=>b.field===finding.field&&b.value===finding.value)) report.brand!.push(finding);
          facts.push({ ...page, url });
          const links = [...page.links].sort((a,b) => Number(/about|product|service|company|contact|pricing/i.test(b)) - Number(/about|product|service|company|contact|pricing/i.test(a)));
          queue.unshift(...links.filter(u => official(u) && !seen.has(u)).slice(0, 30));
          queue.push(...links.filter(u => directory(u) && !seen.has(u)).slice(0, 10));
        }
      } catch (e) { source.status = (e as Error).message; }
      report.sources.push(source);
      await progress('Reading public sources',report.sources.filter(s=>!s.snippet).length,Math.min(input.maxPages,seen.size+queue.length));
    }
    await Promise.all(Array.from({length:4},async()=>{
      while(Date.now()<deadline&&seen.size<input.maxPages){
        const url=queue.shift();
        if(!url){if(discoveryDone)break;await new Promise(r=>setTimeout(r,100));continue;}
        if(seen.has(url))continue;seen.add(url);
        await processPage(url);
      }
    }));
    await discover;
  } finally { await browser?.close(); }
  report.discovered = new Set([...seen, ...queue]).size;
  const stored = report.sources.filter(s=>s.status==='Stored').length;
  report.outcome = researchOutcome(report.sources, queue.length > 0);
  if (!stored) report.warnings.unshift('No public pages were extracted. This attempt is not company evidence. Check the source errors or upload company documents.');
  else if (!facts.length) report.warnings.unshift('The official company website could not be read. Matched public-source results are used as a provisional profile. Verify them against company documents.');
  if (queue.length) report.warnings.push(`Partial crawl: ${seen.size} pages attempted out of ${report.discovered} discovered. Page/time limits apply; this is not the entire website.`);
  const first = facts[0]; const src = report.sources.find(s => s.kind === 'official' && s.status === 'Stored')?.url || root.href;
  if (first) {
    const orgPage = facts.find(p => p.structured.some(x => /Organization|Corporation|LocalBusiness|Store/.test(String(x['@type']))));
    const org = orgPage?.structured.find(x => /Organization|Corporation|LocalBusiness|Store/.test(String(x['@type'])));
    const name = String(org?.name || first.siteName || first.title.split(/\s[|—–-]\s/)[0] || '');
    const description = String(org?.description || first.description || '');
    if (name) report.suggestions.push({ field: 'name', value: name.slice(0,160), source: org?.name ? orgPage!.url : src, confidence: org?.name || first.siteName ? 'extracted' : 'suggested' });
    if (description.length >= 60 && !/\n.*\n.*\n/.test(description)) report.suggestions.push({ field: 'about', value: description.slice(0,700), source: org?.description ? orgPage!.url : src, confidence: org?.description || first.description ? 'extracted' : 'suggested' });
    const productPage = facts.find(p => p.structured.some(x => /Product|SoftwareApplication/.test(String(x['@type'])) && x.name));
    const products = (productPage?.structured || []).filter(x => /Product|SoftwareApplication/.test(String(x['@type']))).map(x => String(x.name || '')).filter(Boolean);
    if (products.length) report.suggestions.push({ field: 'products', value: [...new Set(products)].slice(0,5).join('\n').slice(0,700), source: productPage!.url, confidence: 'extracted' });
    else { const productPage = facts.find(p => p.headings.some(h => /product|solution|service|platform|software/i.test(h))); const headings = [...new Set(productPage?.headings || [])].filter(h => /product|solution|service|platform|software/i.test(h)).slice(0,6); if (headings.length) report.suggestions.push({ field: 'products', value: headings.join('\n'), source: productPage!.url, confidence: 'suggested' }); }
    const address = org?.address as Record<string, unknown> | undefined;
    if (typeof address?.addressCountry === 'string') report.suggestions.push({ field: 'geography', value: address.addressCountry, source: orgPage!.url, confidence: 'suggested' });
    const text = `${first.description} ${first.text}`.toLowerCase();
    const candidates = [[/software|saas|developer|cloud platform/, 'Technology & Software'], [/e-commerce|ecommerce|shop online/, 'Retail & E-commerce'], [/healthcare|hospital|medical/, 'Healthcare & Life Sciences'], [/education|learning|students/, 'Education & EdTech'], [/logistics|freight/, 'Transportation & Logistics'] ] as const;
    const category = candidates.find(([re]) => re.test(text)); if (category) report.suggestions.push({ field: 'industry', value: category[1], source: src, confidence: 'suggested' });
    if (/saas|software as a service/.test(text)) report.suggestions.push({ field: 'businessModel', value: /business|enterprise|teams/.test(text) ? 'B2B SaaS' : 'Subscription', source: src, confidence: 'suggested' });
  }
  report.warnings.push('Directory pages may refer to similarly named businesses. Matched third-party findings are provisional. Unknown headcount, revenue and market coverage are not guessed.');
  await progress('Preparing company profile',seen.size,seen.size);
  await analyzeResearchProfile(report);
  return report;
}

