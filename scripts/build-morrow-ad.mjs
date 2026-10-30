// Rebuild the authored campaign creative from the concept photograph and shared copy.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const campaign = JSON.parse(await readFile(resolve(root, 'lib/campaign-example.json'), 'utf8'));
const photograph = (await readFile(resolve(root, 'public/campaigns/morrow/product-concept.png'))).toString('base64');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>
  *{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#352d26}article{position:relative;width:1080px;height:1350px;overflow:hidden;background:#efe6d7}img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.copy{position:absolute;top:64px;left:74px;right:74px}.brand{font-size:28px;letter-spacing:8px;text-transform:uppercase}.edition{float:right;font-size:12px;letter-spacing:2px;margin-top:12px}h1{font-size:82px;line-height:1.02;font-weight:500;letter-spacing:-4px;max-width:750px;margin:60px 0 22px}p{font-size:24px;letter-spacing:.3px;margin:0}.foot{position:absolute;bottom:40px;left:54px;right:54px;display:flex;justify-content:space-between;align-items:center;background:#fbf7eeeb;border:1px solid #fff9;padding:22px 25px;border-radius:4px;font-size:17px}.foot strong{font-weight:500}.foot span{font-size:14px;color:#675647}.sample{position:absolute;right:56px;bottom:13px;font-size:10px;letter-spacing:1.2px;color:#50483f}
  </style></head><body><article><img src="data:image/png;base64,${photograph}" alt=""><div class="copy"><span class="brand">Morrow</span><span class="edition">THE FOCUS NOTEBOOK / 01</span><h1>Make room for<br>one good idea.</h1><p>${campaign.subhead}</p></div><div class="foot"><strong>${campaign.cta} &nbsp; ↗</strong><span>A5 · Dot-grid pages · Linen cover</span></div><small class="sample">FICTIONAL BRAND · ORIGINAL CONCEPT CREATIVE</small></article></body></html>`);
  await page.screenshot({path: resolve(root, 'public/campaigns/morrow/launch-ad.png')});
} finally { await browser.close(); }
