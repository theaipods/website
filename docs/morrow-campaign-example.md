# Homepage: Morrow campaign example

The final homepage story scene contains actual downloadable creative and planning documents for a fictional Morrow Focus Notebook launch. These are original authored samples; the site does not generate a campaign at runtime. There are no live accounts, customer findings, spend, or measured results. The evidence register distinguishes supplied fictional specifications from assumptions.

## Sources and delivered files

- `lib/campaign-example.json`: shared brief, research notes, positioning, copy, calendar, metrics and approval checklist.
- `public/campaigns/morrow/product-concept.png`: AI-generated concept product photograph, used by the ad build script.
- `public/campaigns/morrow/launch-ad.png`: original 1080 × 1350 portrait ad, authored typography composed over the concept photograph.
- `public/campaigns/morrow/campaign-review.pdf`: six-page report containing the creative, research, positioning, schedule, email, measurement definitions and review checklist.
- `public/campaigns/morrow/campaign-copy.txt`: ad variants, social caption, and email copy.

The website report is also available as accessible HTML in a native dialog. It does not depend on an embedded PDF viewer. Downloads are static public files. The carousel and founder post in the schedule are proposed directions, not delivered image assets.

## Rebuild

Run from `web/` after editing the shared JSON or creative layout:

```powershell
node scripts/build-morrow-ad.mjs
python scripts/build-morrow-report.py
```

The ad builder uses the repository's Playwright dependency and an installed Chromium browser. The report builder requires Python with ReportLab. These are authoring tools, not runtime server dependencies. The PDF is also copied to ignored `output/pdf/` for review. Render all PDF pages with `pdftoppm`, inspect text wrapping and pagination, and verify six pages before replacing public files. Typography in the ad and PDF is authored as document content; the website UI continues to use canonical Satoshi.

## Image provenance

Generated with the built-in image-generation tool on 2026-10-27. The generated source remains in the Codex generated-images directory; a copy is retained in the public campaign folder. No third-party product photography is represented as owned or real. Replace the concept image with approved production photography before any real launch.

Prompt:

> Create a premium editorial product photograph for an original fictional stationery brand launch, Morrow Focus Notebook. Portrait 4:5 crop. One unbranded A5 warm ivory linen hardcover notebook, rounded corners, tiny copper foil circular mark only (no letters), lying at a slight diagonal on a pale warm stone desk with a single elegant dark brown pencil beside it. A second open notebook partly beneath shows blank warm white dot-grid pages. Afternoon sunlight from upper left casts long clean architectural shadows. Quiet sophisticated art direction, real tactile paper and cloth, restrained palette cream, terracotta, warm charcoal. Product in lower 65 percent, generous pale cream negative space upper 35 percent for a headline to be added in HTML. Photorealistic studio quality, sharp product detail, natural materials, no people, no hands, no plants, no screens, no decorative icons, absolutely no words or typography. This is a concept product photo for a clearly labeled fictional sample campaign.
