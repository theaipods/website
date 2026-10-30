# Independent marketing heroes

The homepage request-to-result scene belongs only to Home. Eleven other marketing pages have separate hero compositions and animation. Customer Experience, Solutions and Healthcare use `SolutionHeroScenes.tsx`; seven use `PageSpecificHeroes.tsx`; Events has its own `EventsSessionHero.tsx`.

## Source ownership

- `components/PageSpecificHeroes.tsx`: seven independent heroes plus shared timing, controls and portrait primitives. `components/SolutionHeroScenes.tsx` contains the conversation, solution collection and healthcare station compositions. Shared primitives are not a shared scene template.
- `components/EventsSessionHero.tsx` and `app/events-session-hero.css`: the independent question-to-takeaway Events preview. See `docs/events-hero.md`.
- `app/page-specific-heroes.css` and `app/solution-hero-scenes.css`: shared Satoshi typography and controls, followed by independently scoped geometry and responsive rules.
- `lib/workforce-hero-stories.ts`: rich homepage story plus compact page copy and CTA destinations. Obsolete non-home teams, requester messages and outcomes are removed.
- `components/HomeWorkforceHero.tsx`: homepage-only renderer; no selectable story or standalone wrapper.
- `docs/workforce-hero-artwork.md`: background provenance. Employee PNGs retain their approved identities.

## Compositions and interactions

| Page | Composition and animated sequence | Main destination |
| --- | --- | --- |
| Employee Experience | Ivory-and-sage welcome scene. Employee Assistant beside a letter rising from an envelope, access request, first-week plan and lifecycle baseline. | `#lifecycle` |
| Finance Operations | Dark reconciliation desk. Scan a fictional invoice, compare ledger evidence, flag an owner exception and prepare review. | `#invoice-workflow` |
| Sales & Marketing | Warm creative studio: audience signal, tilted poster, designer and outreach draft. Launch, Discovery and Growth change poster and audience copy. | `#sales-workflows` |
| Healthcare | Appointment station with an animated clock, coordination folio and staff tray. Appointments, Documents and Follow-up select local request examples. | `#healthcare-workflows` |
| Insurance | Evidence folder on the left, editorial headline on the right. Policy and evidence sheets rise, a gap is flagged and reviewer handoff is prepared beside the compliance owl. | `#insurance-workflows` |
| Book a Demo | Private walkthrough in a curved room window. Finance, People and Customer work change the character and sample agenda. | Existing Calendly panel, `#book` |
| Events | Front-row preview: choose a question, see a demonstration, hear the example follow-up, and finish with a takeaway. Three distinct topics; roughly nine seconds, then hold. No broadcast or recording is played. | `#featured`; secondary `#archive` |
| Integrations | Source-to-permission-to-briefing diagram. Slack, Google Drive, Notion and Salesforce selections change packet paths and the sample briefing. | `/workspace/settings#mcp`; secondary `#mcp` |
| Customer Experience | Conversation surface, context check and reviewable reply. Delivery, Product and Policy exception select fictional requests. | `#workflows` |
| Solutions | Wide editorial collection. Six keyboard-accessible tabs switch scenario, character, preparation steps and solution link. | `#find-solution` |
| Product | Centered headline above a four-node workbench: objective, specialists, context and human review. Nodes select and pause stages. | `#lifecycle` |

Book a Demo hero topic controls are local examples. Shared header and footer booking links open `/book-demo` at the top, without the calendar fragment. The page's explicit scheduling actions still use `#book`; the six focus cards farther down still supply Calendly UTM context. Product's preview dialog opens above its lifecycle selector. Product menu anchors for Build, Connect and Operate are unchanged. Event registration, archive filters, catalog drawers and solution previews remain independent functional sections.

## Timing and accessibility

Except for the Events preview described above, five stages use 700, 850, 950, 900 and 1900 milliseconds. Review arrives after 3.4 seconds, followed by a 1.9-second hold. Stage selection pauses playback; Replay resets the example. Reduced motion disables automatic progression. Hidden tabs and off-screen heroes stop progression. Product, Healthcare and Insurance retain existing page-level motion state. Healthcare and Insurance keep their previously requested removal of a visible pause button; their stage selectors still pause, and Replay resumes.

Layouts stack or recompose on mobile. Integration sources become a two-column selector over a vertical permission bridge; Product becomes a two-by-two workbench. Text and controls remain HTML. Character artwork is static PNGs, with whole-object motion and CSS/SVG effects, not skeletal animation or a real-time 3D engine.

## Capability boundaries

Heroes are illustrative. None submits objectives, connects accounts, sends outreach, publishes campaigns, pays invoices, accesses employee or patient records, processes claims or deploys workflows. Healthcare stays administrative; qualified staff retain clinical decisions. Authorized insurance and finance staff retain consequential decisions. Scheduling, event availability and registration continue through existing implementations.

## About workflow playback

The separate ApproachWorkflowSection in components/AboutRedesign.tsx waits for 15% of its section to enter the viewport before advancing its timeline. Only visible, foreground time counts. Scrolling away or hiding the tab pauses progress; returning resumes at the same stage. Manual stage selection and Replay remain available, and reduced-motion preferences prevent automatic progress. This is an illustrative sequence, not live workflow execution.

The About product showcase is a single connected story described in [About product story](about-product-story.md). It starts from the workforce when its visual enters view, then advances automatically through orchestration, concrete tool context, a draft, and human review. The former independent Three.js scenes and stage cycles have been removed.

## Book a Demo: conversation to plan

The section titled From conversation to real possibilities is owned by `components/DemoPossibilities.tsx` and `app/demo-possibilities.css`. It replaces the former illustrated background and character composition with a white Satoshi layout using the canonical sapphire/copper tokens. Four selectable stages update an illustrative session brief, with animated document transitions, checklist reveals, and a connecting signal. Automatic progression waits for 20% section visibility, pauses in hidden tabs or off-screen, and respects reduced-motion preferences. Choosing a stage pauses playback; the preview control resumes it (or advances manually with reduced motion). The booking link targets the existing `#book` calendar. The preview collects no data and executes no workflow. Retired dm-expect/dm-steps styles were removed from the booking stylesheet.
