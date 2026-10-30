# Product page UI

The public `/product` page is implemented in `components/ProductExperience.tsx`, styled by the scoped `app/product-showcase.css` import in `app/product/page.tsx`. The existing `app/product.css` still supplies the interactive preview dialog and its workspace mockup. `lib/product-demo.ts` contains the illustrative lifecycle, capability, connection, document, deliverable and FAQ data.

## Sections and navigation

The page begins with a centered headline and a four-node workforce workbench: objective, specialists, context and human review. Selecting a node pauses its illustrative stage. Lifecycle, capabilities, Integrations & MCP, employee cards, activity, request walkthrough, context, document intelligence, deliverables and FAQ follow. The shared SiteChrome supplies navigation and footer.

Keep `/product#lifecycle`, `/product#integrations`, and `/product#deliverables` stable. These are the Product menu's Build, Connect, and Operate destinations. The integration section's Explore integrations CTA intentionally opens the separate catalog.

## Interaction contract

- Lifecycle, capability, integration, employee-category, month, knowledge and output controls change local state only.
- Employee artwork uses canonical registry IDs and the approved HD originals through a page-local `EmployeeArtwork` wrapper around Next.js Image. Responsive sizes and lazy loading reduce card image downloads; hero characters load eagerly. Each employee card opens `/agents`; the cards describe illustrative responsibilities rather than a deployed team.
- The objective field is local and unsaved. Submit replays a fixed five-stage explanation. There is no API call, remote action, arbitrary objective analysis or live execution. Stages can also be selected individually.
- The chart and counters contain fictional sample values, not measured outcomes. Connections require configuration and do not become authorized by selecting a logo.
- The button above the lifecycle selector opens the existing four-scene preview dialog. Escape closes it; focus is contained and returns to its trigger.
- The FAQ shows six questions initially, with a control to reveal the full existing list.

## Motion and responsive behavior

CSS drives soft character floats, orbital lights, energy paths and selection transitions. An intersection observer pauses ambient motion off-screen; the request timer also pauses when the document is hidden or the section is outside the viewport. Reduced-motion preferences and the page-level pause control stop decorative motion. Text remains present when JavaScript is unavailable. On small screens, sections stack, lifecycle tabs scroll horizontally, and employee cards use two columns. Do not replace these interactive elements with a screenshot of the design reference.
