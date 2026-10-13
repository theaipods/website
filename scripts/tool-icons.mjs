// Store only the catalog's brand SVGs locally; no browsing data goes to an icon CDN.
import * as current from 'simple-icons';
import * as legacy from 'simple-icons-legacy';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
const groups = await import('../lib/tool-catalog.ts');
const aliases = { 'AWS': 'amazonaws', 'LinkedIn Ads': 'linkedin', 'Microsoft Teams': 'microsoftteams', 'Help Scout': 'helpscout', 'Google BigQuery': 'googlebigquery' };
mkdirSync('public/tool-icons', { recursive: true });
const missing = [];
for (const name of Object.values(groups.integrations).flat()) {
  // These brands use their checked-in official website favicon instead of a substitute logo.
  if (existsSync(`public/tool-icons/${groups.toolSlug(name)}.png`)) continue;
  const slug = aliases[name] || groups.toolSlug(name);
  const icon = Object.values(current).find(i => i.slug === slug) || Object.values(legacy).find(i => i.slug === slug);
  if (!icon) { missing.push(name); continue; }
  writeFileSync(`public/tool-icons/${groups.toolSlug(name)}.svg`, icon.svg.replace('<svg ', `<svg fill="#${icon.hex}" `));
}
console.log({ missing });
