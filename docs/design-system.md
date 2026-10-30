# AI Pod visual design system

This is the approved light-theme direction for the public website, documentation, onboarding, workspace, and administration screens. The short navigation guide was the initial preview; the palette and typography now apply site-wide.

## Typography

### Account access

Login, signup and password recovery use Satoshi, white forms, a soft sapphire/paper/copper story panel, and shared token colors. Email errors use a 38px envelope with a small copper X alongside readable alert text. Appear, shake once, settle and stop; never loop or replace the message with an icon alone. A brief verified-access transition precedes navigation. Disable both effects for reduced motion. Recovery uses the same footer-free layout as login. Styles are scoped in `app/account-auth.css`.

### Onboarding studio

The six chapters use local sapphire, lavender, teal, copper, sky and sage tints in `app/onboarding-research.css`. Sapphire remains the primary action color and Satoshi remains the font. Chapter accents identify location rather than completion. Research uses an honest indeterminate progress track, a persistent activity banner, a compact profile grid and collapsed evidence/diagnostics. Counts reflect actual sources and stored chunks; unknown fields stay blank. Reduced motion stops progress movement while retaining status text.

All 19 onboarding steps share the guided journey in `app/onboarding-journey.css`, layered over the studio and field styles. Use six chapter groups with only the current chapter’s steps expanded. Keep the current step explicit; readiness reflects setup requirements, not navigation history. Satoshi, sapphire actions, warm paper, and restrained copper accents remain canonical.

A tinted chapter header contains a layered blueprint illustration with step-specific content. These are decorative previews, not generated results or completed checks. Fields use spacious white cards and quiet tinted inputs, with clear focus outlines. Choice cards lift briefly on hover; header sheets enter once. Reduced-motion preferences disable effects. Mobile uses horizontally scrollable chapter navigation and stacked panels; footer controls return to document flow.

Use TheAIPods as one word in branding and page titles. Use a short hyphen or comma in visible copy instead of an em dash.

Eligible section headings have a right-aligned Fill with AI action with an inline context and review panel. Team templates use a sapphire tinted background, border and selected text; selection remains reversible. Outcome editors are individually removable cards with their own measurement fields.

The AI assistant gives eligible steps a primary “Help me fill this step” action. Field targeting and whole-setup drafting use progressive disclosure. Drafts stay reviewable and individually accepted; the explicit Create teams action adds editable draft cards immediately, which the user saves after review; permissions and activation remain explicit human decisions. Do not imply that a model is configured or results have been generated before a successful response.

Use **Satoshi** throughout the interface. Weights 400, 500 and 700 load through the official Fontshare CSS API in `app/layout.tsx`; `--font-satoshi` in `app/globals.css` is the shared family token. Keep the type clear and spacious: documentation headings are 32 px / 1.2, section headings 24 px / 1.3, and reading text 15 px / 1.7. Marketing display headings can be larger, but should retain Satoshi. Use Geist Mono only for code, technical identifiers, or deliberate data labels.

The font source is [Fontshare Satoshi](https://www.fontshare.com/fonts/satoshi). Its [license](https://www.fontshare.com/licenses/sil-ofl) permits using Fontshare's API for web delivery and restricts redistribution of the font files in a repository. Keep the API integration unless the license terms change.

## Color tokens

The source of truth is the `:root` token block in `app/globals.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--brand-sapphire` | `#3459A6` | Primary actions, links, selected states |
| `--brand-sapphire-deep` | `#244784` | Hover states and dark blue surfaces |
| `--brand-sapphire-soft` | `#E7EEFB` | Quiet highlights and selected backgrounds |
| `--brand-copper` | `#A94F35` | Small emphasis, labels, and secondary accents |
| `--brand-copper-soft` | `#F7EBE6` | Soft copper backgrounds |
| `--brand-ink` | `#1D2940` | Headings and primary text |
| `--brand-muted` | `#5D6678` | Supporting text |
| `--brand-paper` | `#FAF9F6` | Page backgrounds |
| `--brand-line` | `#DDE2EA` | Borders and separators |

Use white or near-white cards over the warm paper background. Sapphire is the dominant accent; copper should be restrained. Preserve semantic green, amber, and red where they communicate status or risk. Keep the public site in a light theme. Dark surfaces are appropriate inside cinematic media or diagrams when legibility requires them, not as a separate site theme.

### Homepage workforce hero

The homepage hero uses the supplied office/city WebP unchanged as a cinematic background. Page-local `hwh-*` styles in `app/home-workforce-hero.css` retain Satoshi and the shared site tokens. White display type and a cyan-to-violet emphasis sit on a localized navy overlay; cyan routes indicate intake, warm gold identifies the Workforce Orchestrator, distinct specialist accents indicate delegation, and green indicates a prepared result. Labels, request text, controls, and output rows remain accessible HTML. Reuse canonical character PNGs with restrained contact shadows and illuminated platforms; do not recolor their identities or flatten the entire scene into an image.

The homepage uses a progressive eight-scene storyboard, not an always-visible workforce diagram. The visual starts as an empty room, the woman and laptop enter, her live-text campaign request appears, and one Orchestrator receives it. The requester then leaves the visual as a three-part plan takes focus. Five canonical specialists arrive at 160ms intervals. A focused work desk shows their distinct contributions, and the final review-ready output becomes the sole focal object. Future scenes are conditionally mounted; a duplicate intake bot and persistent connector web are removed. The supplied requester and employee artwork is reused, The campaign deliverable uses a newly generated concept product photograph, with authored ad typography.

The automatic sequence takes roughly fourteen seconds after assets are available and holds its final package until replay. Playback begins when 30% of the story viewport is visible, pauses off-screen or in hidden tabs, and waits for the requester image before advancing her entrance. Hero-only pause, previous/next, eight chapter buttons, and Replay are keyboard accessible. Reduced motion provides manual Next scene progression with no entrance motion. At narrow widths, use a fixed-height story viewport with compact specialist selectors above a focused work panel; do not stack all chapters into a long vertical diagram. All registry roles remain in the expandable gallery. These are illustrative transitions and outputs, not live campaign execution.

### Distinct marketing hero compositions

Eleven non-home heroes have independent compositions in `PageSpecificHeroes.tsx`, `SolutionHeroScenes.tsx`, and `EventsSessionHero.tsx`, with corresponding scoped stylesheets. Only timing, controls, typography and small primitives are shared. Customer Experience uses a conversation and reply scene; Solutions presents a six-chapter collection; Healthcare uses an appointment station and coordination folio. The other seven page heroes retain their own designs; Events uses a separate front-row question-to-takeaway preview. Preserve Satoshi, sapphire actions and restrained local semantic accents. Do not copy the homepage requester, Orchestrator and specialist-row composition. The shared five-stage scenes reach review after 3.4 seconds, then hold for 1.9 seconds. Events uses a separate roughly nine-second sequence and holds the final takeaway. See `docs/workforce-story-heroes.md`.

### Product workforce showcase

The Product page uses the approved reference composition in `app/product-showcase.css` and `components/ProductExperience.tsx`: a centered headline above a four-node workforce workbench, a lifecycle selector, a connected capability diagram, a dark Integrations & MCP band, distinct employee cards, and compact activity, request, context, document, deliverable and FAQ sections. Satoshi and the canonical sapphire/copper tokens remain shared. Mint, lavender and peach are contained decorative accents; teal highlights selected copy and sample progress. Use white cards with restrained borders and soft shadows over warm, light wave backgrounds. The interactive workspace preview opens from the lifecycle section. Keep the shared header and footer unchanged.

Looping motion is limited to decorative character floats, connection paths and orbital light. Entry and selection transitions are short. Honor reduced-motion preferences and the page pause control; pause ambient animation off-screen. All controls remain usable without motion, touch targets remain visible, and layouts stack on narrow screens. Keep scenario illustrations and sample statistics explicit. Preserve the `lifecycle`, `integrations`, and `deliverables` anchors for the Product menu. The local request walkthrough is a fixed demonstration, not an AI execution endpoint.

### Product menu behavior

The Product menu uses three full-card links: **Build** in sapphire, **Connect** in copper, and **Operate** in teal (`#247B70`). Build, Connect, and Operate deep-link to the Product page’s lifecycle, Integrations & MCP, and deliverables sections respectively. Teal is a local navigation accent, not a new site-wide token. Each card has one destination and lists its included capabilities as non-interactive pointers. Keep the panel light, the card text white, and the same grouping when cards stack on mobile. The former Plan/Work/Review diagram is not part of this menu.

On hover-capable devices, the Product and Solutions menus open when the pointer enters their triggers, remain available while the pointer moves into the panel, and close after pointer exit. Opening one closes the other immediately. Click remains available for touch and keyboard users, Escape closes an open panel and restores focus to its trigger, and outside clicks close it.

### About cinematic scenes

### Book a Demo page

The public site uses one shared white header and dark navy footer from `components/SiteChrome.tsx`. The login route retains the header but omits the entire footer, including its artwork and links; Product and Solutions remain hoverable and keyboard accessible. The official TheAI Pods logo asset lives at `public/brand/official-logo.jpg`. The header, footer, and booking scenes keep the existing Satoshi and site tokens; their local navy, sapphire, and emerald styling does not replace the approved light-theme system. The Book a Demo page places the Calendly inline scheduler beside its introduction on desktop and stacks it on mobile. Focus cards are keyboard-accessible controls that pass the selected topic as Calendly UTM context. An invalid configured scheduler URL must show an honest setup state. The employee scenes and tool logos illustrate demo topics, not connected accounts. Keep reduced-motion handling and readable contrast.

The About page uses a contained navy, emerald, and white composition matched to the redesigned Integrations page. Its page-local `--au-*` aliases live in `app/about-redesign.css`; they do not replace the shared Satoshi type or site-wide sapphire/copper tokens. The hero uses the supplied futuristic eco-tech command-center WebP as a full-bleed room background, with a dark left-side overlay to preserve headline contrast; the real-time Three.js scene is layered in front. The scene is built from real-time geometry: a heavy multi-tier Orchestrator plinth with machined-metal armor, fasteners and counter-rotating mechanical rings; a transparent spherical chamber with metallic ribs; a suspended rotating energy core; and six thick orbital platforms with illuminated rims. Every specialist route uses a curved 3D cable terminating at a physical port, with eight staggered luminous packets continuously traveling outbound and back on each of the six routes, plus animated cable and endpoint lights. The hero has one prominent Explore AI Pods CTA; its secondary See how it works link is removed, and the CTA and three benefit labels use larger readable type. The six specialists use the approved HD transparent PNGs from `public/ai-workforce/avatars-hd/`, selected to match the Research, Finance, HR, Sales, Engineering and Operations roles and placed at the deck surface with contact shadows. No procedural mascot meshes, old model renders, labels or interface panels appear in the hero. The scene uses perspective, physically based materials for its machinery, shadows, reflections, atmospheric lighting and restrained motion; it is an illustration only and does not run tasks or connect tools. Desktop uses a capped pixel ratio, mobile lowers it and the scene's effects remain modest; intersection visibility pauses off-screen rendering. Reduced-motion preferences show a static frame. Four hero summary items use the current registry count (28 roles), the six visible specialists, and the existing human-guided/governance principles rather than unsupported performance statistics. White and `#F7FAFC` surfaces carry the belief and timeline sections. The product story in `ProductsInActionSection.tsx` and `app/about-product-story.css` uses warm paper, white panels, canonical sapphire selections, and restrained copper narrative accents. It is a single ten-beat Northstar launch-brief story with a persistent objective, four chapter indicators, a narrative column, and a changing visual. Ten static employee illustrations introduce the workforce; later scenes show assignment cards, concrete source-to-context transfers, a draft, a human correction, and a reviewed brief. No dark 3D orbit, separate demo video, or independent cycling tabs remain in this section. Desktop keeps the narrative beside the visual; mobile stacks them with readable cards. Playback starts when 20% of the visual enters view, pauses off-screen or in hidden tabs, respects reduced motion, and holds at completion. Manual chapter/step controls pause playback and Replay restarts at the workforce. The approximately 18-second sequence adds a CSS perspective cube, traveling packets, matching indicators, task scans, and restrained pointer tilt. At 1180px width and 850px height or above, a bounded 80vh native scroll runway pins the scene below the header; scrolling advances the story while explicit Skip links let visitors leave. Smaller viewports and reduced-motion mode do not pin. The principles section follows the showcase. `#83F58B` marks dark-surface actions and active network states; `#137B59` marks light-surface emphasis. Third-party logos and the approved static employee images retain their own colors.

The hero's six approved HD transparent character illustrations, central hub, connection paths, and product previews illustrate the intended workforce experience; the moving packets are illustrative and do not represent live tasks or connected accounts. Preserve the mobile composition, keyboard-accessible specialist selection, reduced-motion behavior, and readable content when JavaScript is unavailable. Published About copy remains sourced from the admin-managed content record.

### Integrations cinematic scenes

The Integrations page uses a contained white, emerald, and navy composition from its approved page reference. Its page-local `--ix-*` aliases live in `app/integrations-redesign.css`; they do not replace the shared Satoshi type or site-wide sapphire/copper tokens. A light horizontal source-to-permission-to-briefing hero introduces approved context. Selecting a source changes only the local example. The “One governed passage” section is now an interactive permission-gate demonstration in `components/IntegrationGateway.tsx` and `app/integration-gateway.css`. It uses the canonical light Satoshi, sapphire, and copper system: beveled CSS gates slide open in sequence, a request packet travels across a perspective floor, and a restricted write leaves the permission gate closed. Read and restricted-action examples end in evidence or a held request. The roughly eight-second story starts when 30% of the panel is visible, pauses off-screen or in hidden tabs, supports manual chapters and replay, and disables autoplay under reduced motion. It holds the outcome rather than looping. This is local sample data, not a working connector. The closing “Bring your stack. We’ll bring the team.” section and its unused artwork have been removed. See `docs/integrations-gateway.md`. Green marks active navigation, filters, connection paths, and illustrative workflow progress. Catalog entries remain possible connections rather than installed accounts, and the page states that discovery is distinct from remote execution.

### Solutions cinematic scenes

The Solutions hub begins with a light editorial collection in `SolutionHeroScenes.tsx`. Its six tabs change the scenario, approved mascot, preparation steps, review artifact and destination. Use generous headings, white cards, subtle paper surfaces and restrained category colors within the Satoshi/sapphire system. The local finder, industry cards, workflow preview, tool catalog and governance section keep their existing implementations. These examples do not represent live deployments.

### Finance Operations cinematic scenes

The Finance Operations detail page uses a contained navy, emerald, and white treatment in `app/finance-operations-redesign.css`. Its dark hero and operator section frame light invoice, reporting, and closing sections. Use the existing approved static employee artwork to represent the three current finance registry roles. Green indicates the selected sample stage, role, workflow, month, or exception. Label the spend visualization as fictional and the workflow panels as local previews; the presentation does not imply a connected finance system or autonomous approval. Keep Satoshi and the canonical site-wide tokens unchanged outside this page.

### Employee Experience cinematic scenes

The Employee Experience detail page uses a contained navy, emerald, and white treatment in `app/employee-experience-redesign.css`. Its ivory-and-sage hero pairs the Employee Assistant with an animated welcome letter, access request and first-week plan. Lower lifecycle, workforce, knowledge and analytics sections remain separate. The page ends after analytics, followed by the shared footer. Reuse approved static employee artwork. Green identifies the selected stage, registry role, workflow, knowledge category, or sample chart month. Keep the public knowledge question flow explicit about authentication and the support chart explicit about fictional data. The shared Satoshi typography and canonical site-wide tokens remain unchanged outside this page.

### Sales & Marketing cinematic scenes

The Sales & Marketing detail page extends the contained navy, emerald, and white treatment in `app/sales-marketing-redesign.css`, building on the Employee Experience page's scoped visual foundation. Its warm creative-studio hero offers three selectable campaign directions, a poster and an outreach draft. Retain approved static employee artwork and the light prospect, workflow and analytics sections. The “The next step” CTA uses a white background with navy copy and sits immediately before the workflow selector. Green identifies the selected prospect step or fictional chart month; navy identifies the selected workflow. Label the local prospect sequence, workflow mockup, and chart as illustrations, not connected sales activity. Keep Satoshi and site-wide tokens unchanged outside this page.

### Healthcare cinematic scenes

The Healthcare detail page uses a contained navy, emerald, white, and pale-blue treatment in `app/healthcare-redesign.css`, with the shared Satoshi typography and existing approved static creature artwork. A mint appointment station pairs an animated clock with a coordination folio, an approved security character and a staff-review tray. Three administrative request types change its fictional context. Lower workflow, administrative timeline, role map and closing sections remain separate. Green marks selected local stages and roles. Make the human decision boundary prominent: the page depicts administrative coordination only, with no patient records, connected clinical systems, diagnosis, treatment, or prescribing. Scenario responsibilities are not new registry employees. Keep the page-local colors from replacing the canonical site-wide sapphire/copper tokens.

### Insurance cinematic scenes

The Insurance detail page extends the same contained navy, emerald, white, and pale-blue system in `app/insurance-redesign.css`, reusing the shared Satoshi type, existing approved static creature artwork, and scoped solution-page primitives. The ivory hero places an animated evidence folder and compliance owl left of the headline. The six-workflow selector, review package and closing call to action follow; the retired role-network and process-strip sections remain removed. Green identifies active tabs, review stages, evidence checkpoints, roles, and process steps. Explicitly label the previews as local illustrations; they do not process claims or make underwriting, coverage, approval, or settlement decisions. Keep scenario roles distinct from the employee registry and retain the site's canonical sapphire/copper tokens outside this page.

### Homepage cinematic scenes

The homepage uses a contained navy, emerald, white, and pale-blue composition in `app/home-redesign.css`, with Satoshi and the approved static character artwork. Its hero is implemented separately in components/HomeWorkforceHero.tsx and app/home-workforce-hero.css, following the request-to-result story described above; the former six capability cards and chart ornaments have been removed. Light sections use subtle pastel corner waves, generous character panels, distinct artwork for the three entry routes, a five-stage interactive demonstration, current registry roles, a branded tool orbit, solution routes, governance concepts, and a closing character scene. Supporting card accents may echo the supplied character colors without changing the shared tokens. Green marks the selected workflow stage and connection. Keep animation gentle: one-time section reveals, small character float, and slow energy motion, with a page-level pause control and reduced-motion support. Content must remain visible before observation and without animation. Preserve the announcement bar, working navigation, autonomy-level selector, original objective simulator, registry explorer, FAQ, and contact form. Label catalog entries as requiring setup and workflow activity as illustrative. These page-local colors do not replace the canonical site-wide sapphire/copper tokens. See `docs/homepage-ui.md` for implementation details.

The homepage uses the same readable display scale as the other marketing routes, with larger desktop headlines and supporting copy. Its Questions and contact section is always present in the page flow, with openable individual FAQ answers and a separate contact card; do not hide the entire section behind one closed disclosure.

### Events cinematic scenes

The Events landing page uses a light mint, blue, and white editorial layout in `app/events-redesign.css`. The hero uses a light Satoshi/sapphire/copper composition in `app/events-session-hero.css`, with a dimensional HTML/CSS presentation screen, three selectable questions, moving stage lights, raised workflow blocks, audience conversation, and a final paper takeaway. It starts in view, pauses off-screen, and supports manual chapters, pause/replay, and reduced motion. No mascot or background image is needed. See `docs/events-hero.md`; `public/events-conference-stage.webp` supports the “From the Stage” section; shared header/footer and Satoshi typography remain unchanged. Emerald identifies section labels and benefits, while blue supports actions. Keep sample event labels visible, derive archive years and event types from records, and show a play affordance only when a recording URL exists. The hero actions scroll to the featured section or archive; the featured registration flow remains connected to the event registration form. These page-local colors do not change the site-wide tokens in `app/globals.css`.

## AI employee creature system

Use the original AI Pod creature library for workforce presentation instead of generic robots or copied mascot art. Keep the species silhouettes genuinely different: marine bodies, birds with shaped wings, foxes with sweeping tails, branching antlers, domed shells, tentacles and long legs should not share one generic torso. Give each role a readable geometric prop, expressive face and graduated color treatment. Keep the studio lighting bright and calm, with a near-white card background and a low soft shadow.

All 28 registry employees use individual high-definition transparent PNG illustrations through `StaticEmployee`. Stable employee IDs select the matching species and role artwork in `public/ai-workforce/avatars-hd/`. Each character keeps its distinctive silhouette, face, palette and role props; the former tiled crops have been removed. Marketing scenes, employee profiles, workspace avatars and the showreel share this artwork. Blender sources, model exports and generated model previews are retired.

## Maintenance

The October 2026 repository cleanup removed selectors and keyframes for retired page layouts, headers, footers, model renderers and ornaments. Active visual tokens and rendered page designs are unchanged. Future section removals should remove their unreachable components, timers, positive CSS selectors and assets together, while preserving dynamic class names and shared styles. See `docs/cleanup-audit.md`.

Page-level CSS may define local aliases for these tokens, but new components should refer to the shared tokens directly. Do not reintroduce an unrelated purple or orange UI palette. Review desktop and mobile contrast and verify representative pages after a palette change. Update this document, the public documentation, and the relevant CSS in the same change.

### Public-page category icons
Use the existing Lucide outline icons as supplementary cues in text-heavy public sections: product benefits, documentation categories, event resources, demo plans, and news. `PublicFeatureIcon` keeps their 1.75 stroke and sapphire-soft badges consistent. Keep visible labels; these icons are decorative, hidden from assistive technology, and never the only indication of a category or action. Do not add competing badges to mascot-led cards or already illustrated heroes. The compact variant accompanies documentation links. This treatment does not change onboarding.

The public header uses the alpha-transparent `public/brand/header-logo-transparent.png`; the dark footer retains its backed wordmark for contrast. Integration workflow scenarios use exact reference-grid artwork for the Research Agent, Finance Agent and Frontend Developer, with Lucide process/output/reviewer symbols and existing tool logos. Artwork is decorative beside persistent step labels. The three scenarios remain illustrative, not live tool execution.

### Shared footer environment

### Static character assets

### Workforce ensemble motion
Shared `WorkerScene` groups give each static portrait an equal-width lane, with staggered vertical placement to keep faces and props separate. Each portrait has a subtle independent 12px idle lift and 2-degree sway. Hover pauses the group; reduced-motion preferences disable it. This is decorative CSS motion of static artwork, not a rigged 3D model or live agent activity.

### Book Demo closing and plans
Book Demo uses a compact illustrated closing banner followed by three character-accented plan cards. Founders carries a Recommended badge (not an unverified popularity claim), monthly $499 + GST pricing and a green CTA; Starter and Enterprise retain blue actions. Pricing and allowances still derive from the plan registry. Page-scoped mobile footer styles give the supplied artwork its own strip below the CTA and place copyright beneath it. These adjustments do not change other pages.

### Current supplied artwork
All 28 employee IDs resolve to high-definition transparent PNGs in `public/ai-workforce/avatars-hd/`, selected by the shared `StaticEmployee` component. The illustrations follow the supplied character grid and retain each character's role props. The former cropped tile PNGs are retired. Shared ensemble motion remains subtle and respects reduced-motion preferences.
Five original WebP footer backgrounds live in `public/brand/footers/`: explorers for Book Demo/integrations; aurora for solutions/about; neon-skies for product/agents; neon-stars for docs; starry-friends for home/events/news/investors/showreels. All use one shared footer with a dedicated mobile art strip below links. Book Demo uses starry-friends for its closing banner, distinct from its explorers footer. No generated replacements or transition fade bands.
The superseded atlas and former footer file have been deleted. Legacy 3D source/model directories remain unused because recursive cleanup was blocked by local policy.

The shared footer invitation headline, supporting copy and demo button sit directly beneath the wordmark in the left column. Reserve the right/bottom artwork area for characters. On mobile, the art strip follows the full link grid rather than the invitation.

Book Demo’s What to expect section follows the supplied two-column reference: a coral-accented heading and approved character lineup on the left, four numbered white cards with coral/blue/green/purple icons and a connecting timeline on the right. These are informational steps, not clickable controls. Mobile stacks the introduction and list. The accent colors are local to this section.

Book Demo’s What to expect section is an image-free conversation-to-plan preview (`DemoPossibilities.tsx`, `demo-possibilities.css`). Use a white section, Satoshi typography, sapphire selections and copper conversation accents from the canonical tokens. Four numbered agenda buttons sit beside an animated document preview; mobile stacks the agenda above the preview. It contains no employee artwork or background image. Document transitions and a traveling signal run only while the section is visible, with pause, manual selection, hidden-tab and reduced-motion handling.

The What to expect background uses `cover` sizing anchored left/bottom to preserve the supplied image aspect ratio and fill the section without a blank edge. On desktop, the step column shifts right by up to 60px within available side margins; tablet and mobile retain their normal alignment.

On wide Book Demo layouts, the four expectation cards shift farther right while the eyebrow, heading, and subtitle move up 46px to avoid overlap with the embedded illustration. The character image position remains unchanged; tablet and mobile layouts keep their stacked alignment.

The Book Demo hero uses a curved demo-suite window, one topic-specific employee and a three-item agenda. Finance, People and Customer work buttons change only this local preview. The main action scrolls to the unchanged Calendly panel, and the six focus cards below still pass scheduling context. The shared five-specialist hero is retired.

### Administration dashboard

The platform-owner console uses Satoshi and the canonical sapphire/copper light-theme tokens in `app/admin/owner-console.css`. Use the official site logo, a compact white sidebar, a warm paper canvas, aligned white panels, and restrained tinted metric cards. Avoid mascots, floating ornaments and decorative animation in management views. Overview contains totals, an owners table and concise settings/allowance shortcuts; Workspace, Homepage and Refresh are its header actions. Accounts, Companies, Files, Events, Workspace, Admin access, Plan allowances and Settings are sidebar views. About editing belongs in Settings; Change password and Log out sit below the sidebar profile. There is no standalone admin Pods view.

Files begins with website-labeled company cards and opens a file table only after company selection. Put contextual search beside file totals; other directories have their own local search. Keep actual API counts, keyboard focus indicators and inline refresh errors. Events retains its existing editors and `/admin/events` redirect. On narrow screens, navigation scrolls horizontally, panels stack, and wide tables scroll within their panels. Only subtle hover transitions remain, disabled for reduced-motion preferences.

Events cards use minimal generated illustrations for finance (bull), enterprise Pod design (husky), and human approval (deer): one mascot, a simple prop, soft matte materials and a pale pastel background. The featured event retains its futuristic television artwork. The hero now uses the independent front-row session preview, with no background artwork. The supplied conference artwork remains in From the stage with its responsive crop. These images are illustrative, not recordings.

### Employee Experience light reference

The Employee Experience route uses a scoped mint, white, cyan and navy treatment requested for this page, retaining Satoshi and leaving canonical sapphire/copper tokens unchanged. Its compact white shared header receives a route-scoped green-to-blue demo action. Seven lifecycle cards, the independent welcome-pack hero, an assistant preview beside the mascot, a six-source knowledge panel and a pale-blue analytics section follow a consistent 1160px container. Mobile uses a scrollable lifecycle row and stacked panels; controls retain focus indicators and reduced-motion support. Assistant and knowledge inputs are illustrative and require sign-in for company information. Chart volume and resolution time are explicitly sample data, not customer metrics. The shared footer remains intact.

Employee Experience sections use a larger marketing scale: a 1320px desktop content cap, an adaptive cinematic hero, 110px section padding, and fluid section headings up to 70px matching Integrations and enlarged cards, mascot previews and chart labels. Tablet and mobile retain adaptive spacing and stacked layouts.

### Customer Experience working hero

The Customer Experience hero uses `xc-*` styles in `solution-hero-scenes.css`: warm white, faint blue-lavender light, Satoshi and sapphire controls. A tilted conversation surface contains the customer request, approved context and response draft. The approved penguin stands outside the readable text area; a separate receipt communicates human review. Three sample-topic controls and shared motion controls replace the old central employee UI card, tool network and counter. All messages are fictional; no reply is sent.

### Healthcare reference refinement

Healthcare uses an independent appointment-coordination hero in `SolutionHeroScenes.tsx`, followed by its existing human-decision boundary and lower workflow sections. Appointments, Documents and Follow-up change the sample request and staff note. The illustrated clock and time are not real scheduling availability. Keep the mascot clear of text, preserve Satoshi and keep clinical decisions explicitly with staff. Manual stage selection pauses the scene; Replay resumes. Reduced-motion and visibility handling remain available.

### Insurance reference refinement

Insurance uses an independent ivory evidence-folder hero, followed by its white human-decision boundary, pale workflow preview, aqua evidence/review stages and light Your Team CTA. The compliance owl accompanies policy and evidence sheets rising from a folder; this replaces the copied multi-character scene. Preserve Satoshi and site tokens outside the scoped illustration. Motion remains optional and pauses off-screen, in hidden tabs and for reduced motion. These visuals never imply connected claims or automated decisions.

### Homepage campaign artifacts

Use a light paper work surface inside the existing dark cinematic hero. Five specialist selectors reveal evidence, copy, design, calendar, and measurement contributions. The final package pairs an actual portrait creative with concise preview tabs and a prominent Open the campaign action. The native modal report uses Satoshi, sapphire actions, copper labels, generous reading spacing, a sticky close control, and responsive stacked sections. Preserve keyboard focus return and body scroll restoration. The warm ivory product art belongs to the fictional Morrow campaign, not a new site-wide palette. Generated concept imagery and authored sample deliverables must be identified clearly; do not suggest live execution or measured results.

### Homepage connected context

The “Everything the pod needs to work” section uses white and pale sapphire surfaces, Satoshi text, sapphire actions, and restrained copper chapter accents. A single bordered work surface holds an objective, a two-option scenario selector, source cards with readable excerpts, a CSS gateway with thickness and soft contact shadow, and a document with linked source references. Motion explains context transfer: packets move only during scope-check and assembly stages; findings enter in sequence; the final review state holds. Pause off-screen and in hidden tabs, honor reduced motion, and keep manual controls visible. Preserve the `#platform` anchor. Do not reinstate the retired floating-logo orbit or introduce character artwork in this section.

### Trial completion indicators

Chapter navigation displays percentages computed from current required fields, with a semantic green background and check icon at 100%. Clicking an incomplete chapter opens the first missing step. Green denotes configuration completeness, not verified business facts. Simulate also requires a fresh local process check; subsequent edits invalidate it. Use the shared Satoshi/sapphire typography and tokens, with green only for completion. The Company quickstart card uses a restrained sapphire-to-paper background, a clear single action and honest stage text, never a fabricated timed percentage. Its caption explains estimates, draft-only activation and unconnected tools.
