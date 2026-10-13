# AI Pod visual design system

This is the approved light-theme direction for the public website, documentation, onboarding, workspace, and administration screens. The short navigation guide was the initial preview; the palette and typography now apply site-wide.

## Typography

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

### Product navigation

The Product menu uses three full-card links: **Build** in sapphire, **Connect** in copper, and **Operate** in teal (`#247B70`). Teal is a local navigation accent, not a new site-wide token. Each card has one destination and lists its included capabilities as non-interactive pointers. Keep the panel light, the card text white, and the same grouping when cards stack on mobile. The former Plan/Work/Review diagram is not part of this menu.

On hover-capable devices, the Product and Solutions menus open when the pointer enters their triggers, remain available while the pointer moves into the panel, and close after pointer exit. Opening one closes the other immediately. Click remains available for touch and keyboard users, Escape closes an open panel and restores focus to its trigger, and outside clicks close it.

### About cinematic scenes

### Book a Demo page

The public site uses one shared white header and dark navy footer from `components/SiteChrome.tsx`; Product and Solutions remain hoverable and keyboard accessible. The official TheAI Pods logo asset lives at `public/brand/official-logo.jpg`. The header, footer, and booking scenes keep the existing Satoshi and site tokens; their local navy, sapphire, and emerald styling does not replace the approved light-theme system. The Book a Demo page places the Calendly inline scheduler beside its introduction on desktop and stacks it on mobile. Focus cards are keyboard-accessible controls that pass the selected topic as Calendly UTM context. An invalid configured scheduler URL must show an honest setup state. The employee scenes and tool logos illustrate demo topics, not connected accounts. Keep reduced-motion handling and readable contrast.

The About page uses a contained navy, emerald, and white composition matched to the redesigned Integrations page. Its page-local `--au-*` aliases live in `app/about-redesign.css`; they do not replace the shared Satoshi type or site-wide sapphire/copper tokens. The dark workforce hero, approach scene, and closing call to action use `#071B2B` navy and restrained emerald lighting. White and `#F7FAFC` surfaces carry the belief, timeline, principles, and product-exploration sections. `#83F58B` marks dark-surface actions and active network states; `#137B59` marks light-surface emphasis. Third-party logos and the original 3D employee models retain their own colors.

The hero's five specialist images, central hub, connection paths, and product previews illustrate the intended workforce experience; they do not represent live tasks or connected accounts. Preserve the mobile composition, keyboard-accessible product tabs and menu, reduced-motion behavior, and readable content when JavaScript is unavailable. Published About copy remains sourced from the admin-managed content record.

### Integrations cinematic scenes

The Integrations page uses a contained navy, emerald, and white composition from its approved page reference. Its page-local `--ix-*` aliases live in `app/integrations-redesign.css`; they do not replace the shared Satoshi type or site-wide sapphire/copper tokens. The dark hero, directory, and closing CTA frame light MCP and workflow explanations. Green marks active navigation, filters, connection paths, and illustrative workflow progress. Catalog entries remain possible connections rather than installed accounts, and the page states that discovery is distinct from remote execution.

### Solutions cinematic scenes

The Solutions hub extends the contained navy, emerald, and white treatment used by About and Integrations. Its page-local `--sr-*` aliases live in `app/solutions-redesign.css`. Keep the dark workforce hero, workflow preview, governance section, and closing CTA balanced by white and soft-white finder, industry, tool, and catalogue sections. Green identifies active selection and example progress. Reuse the original AI employee artwork; do not imply that the hero, recommendation, workflow or tool strip represents a live deployment. The four function routes and two industry routes are the current catalogue, and filters must derive from the displayed integration entries. The shared Satoshi and site-wide sapphire/copper system remains unchanged outside this contained page.

### Finance Operations cinematic scenes

The Finance Operations detail page uses a contained navy, emerald, and white treatment in `app/finance-operations-redesign.css`. Its dark hero and operator section frame light invoice, reporting, and closing sections. Use the existing original 3D employee artwork to represent the three current finance registry roles. Green indicates the selected sample stage, role, workflow, month, or exception. Label the spend visualization as fictional and the workflow panels as local previews; the presentation does not imply a connected finance system or autonomous approval. Keep Satoshi and the canonical site-wide tokens unchanged outside this page.

### Employee Experience cinematic scenes

The Employee Experience detail page uses a contained navy, emerald, and white treatment in `app/employee-experience-redesign.css`. Its dark hero, HR employee selector, and closing CTA alternate with white lifecycle and knowledge sections and a pale analytics section. Reuse original 3D employee artwork. Green identifies the selected stage, registry role, workflow, knowledge category, or sample chart month. Keep the public knowledge question flow explicit about authentication and the support chart explicit about fictional data. The shared Satoshi typography and canonical site-wide tokens remain unchanged outside this page.

### Sales & Marketing cinematic scenes

The Sales & Marketing detail page extends the contained navy, emerald, and white treatment in `app/sales-marketing-redesign.css`, building on the Employee Experience page's scoped visual foundation. Use original 3D employee artwork, a dark hero and closing CTA, and light prospect, workflow, and analytics sections. Green identifies the selected prospect step or fictional chart month; navy identifies the selected workflow. Label the local prospect sequence, workflow mockup, and chart as illustrations, not connected sales activity. Keep Satoshi and site-wide tokens unchanged outside this page.

### Healthcare cinematic scenes

The Healthcare detail page uses a contained navy, emerald, white, and pale-blue treatment in `app/healthcare-redesign.css`, with the shared Satoshi typography and existing original 3D creature artwork. The dark hero and workflow strip frame light workflow, administrative timeline, illustrative-role map, and closing sections. Green marks selected local stages and roles. Make the human decision boundary prominent: the page depicts administrative coordination only, with no patient records, connected clinical systems, diagnosis, treatment, or prescribing. Scenario responsibilities are not new registry employees. Keep the page-local colors from replacing the canonical site-wide sapphire/copper tokens.

### Insurance cinematic scenes

The Insurance detail page extends the same contained navy, emerald, white, and pale-blue system in `app/insurance-redesign.css`, reusing the shared Satoshi type, existing original 3D creature artwork, and scoped solution-page primitives. The dark hero and process strip frame a light six-workflow selector, fictional review package, illustrative-role network, and closing call to action. Green identifies active tabs, review stages, evidence checkpoints, roles, and process steps. Explicitly label the previews as local illustrations; they do not process claims or make underwriting, coverage, approval, or settlement decisions. Keep scenario roles distinct from the employee registry and retain the site's canonical sapphire/copper tokens outside this page.

### Homepage cinematic scenes

The homepage uses a contained navy, emerald, white, and pale-blue composition in `app/home-redesign.css`, with Satoshi and the existing 3D creature assets. The dark hero introduces one objective and a connected workforce; the logo strip and light sections present real catalog entries, current registry roles, solution routes, governance concepts, and a local workflow simulation. Green marks the selected workflow stage and connection. Preserve the announcement bar, working navigation, autonomy-level selector, original objective simulator, registry explorer, FAQ, and contact form. Label catalog entries as requiring setup and workflow activity as illustrative. These page-local colors do not replace the canonical site-wide sapphire/copper tokens.

### Events cinematic scenes

The Events landing page uses a contained navy and emerald hero, then white and pale-blue archive surfaces in `app/events-redesign.css`. It reuses the existing `EventVisual` 3D mascot family, Satoshi typography, and functional registration form. The page-local emerald accent marks the opening event scene, while blue supports event actions on light surfaces. Keep sample event labels visible, derive archive years and event types from records, and show a play affordance only when a recording URL exists. These page-local colors do not change the site-wide tokens in `app/globals.css`.

## AI employee creature system

Use the original AI Pod creature library for workforce presentation instead of generic robots or copied mascot art. Keep the species silhouettes genuinely different: marine bodies, birds with shaped wings, foxes with sweeping tails, branching antlers, domed shells, tentacles and long legs should not share one generic torso. Give each role a readable geometric prop, expressive face and graduated color treatment. Keep the studio lighting bright and calm, with a near-white card background and a low soft shadow.

Each of the 28 registry employees has its own editable geometry and stable assignment in `assets/ai-workforce/manifest.json`. Species construction is maintained in `assets/ai-workforce/source/blender/species_v2.py`; the Blender generator adds embedded gradient textures and role props. Directory artwork stages add a light role-tinted gradient without altering the global sapphire/copper UI palette. Cards and dense grids use the transparent WebP render of that employee's Blender model from `public/ai-workforce/employees/previews/`. PNG masters, editable Blender scenes, and GLB exports are kept in `assets/ai-workforce/employees/`. Shared `WorkerScene` instances use these renders for efficient marketing scenes, while the employee profile opens that person's GLB for live 3D viewing. Keep the supplied seven-by-four character reference's species, palette, prop and silhouette assignments when refining the models. Regenerate the manifest and contact sheet whenever registry IDs or character assignments change.

## Maintenance

Page-level CSS may define local aliases for these tokens, but new components should refer to the shared tokens directly. Do not reintroduce an unrelated purple or orange UI palette. Review desktop and mobile contrast and verify representative pages after a palette change. Update this document, the public documentation, and the relevant CSS in the same change.
