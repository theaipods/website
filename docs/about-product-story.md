# About: one connected product story

The “See what we're building and how it all works together” section is implemented in `components/ProductsInActionSection.tsx`, styled by `app/about-product-story.css`, and mounted by `AboutRedesign.tsx`. It replaces the independent Three.js product scenes, scroll-driven tab changes, separate demo video, and obsolete `pia-*` styles.

## Narrative

One fictional objective persists across all four chapters: prepare a product-launch brief for Northstar, aimed at operations leaders and subject to human review.

1. **AI workforce:** introduce ten different canonical employee illustrations, a subset of the registry.
2. **Orchestration:** capture the user's objective, plan four tasks, and assign Research Agent, Marketing Agent, UI/UX Designer, and Project Manager. The remaining six roles are available for other work.
3. **Tool Connect:** sequentially show a Notion product brief, Google Drive brand guidance, and Slack launch notes contributing specific information to shared task context. Each source names its downstream recipient.
4. **Workflow in action:** combine the four task outputs into a draft, show a human reviewer correcting an unsupported savings claim, then display the corrected, reviewed brief. Publishing stays with the team.

All records, reads, task status changes, and the reviewer action are illustrative. No APIs, real messages, tool connections, review requests, or publishing actions are triggered by this component. It does not claim that every depicted adapter is operational.

## Playback

The story always initializes at the workforce, independently of the URL fragment. It starts automatically once at least 20% of the visual is visible. The visual itself is observed so the story does not run while a mobile viewer is still above it reading the introduction.

The ten beats advance automatically through all four chapters in about 18 seconds, then hold at the outcome. There is no automatic loop. A requestAnimationFrame clock counts only foreground, visible playback time; off-screen and hidden-tab intervals do not advance it. On viewports at least 1180px wide and 850px high, the story pins below the header for a bounded 80vh scroll runway. Native forward scrolling can advance beats sooner; it never rewinds a beat or intercepts wheel/touch events. Pause and manual chapter selection suspend both automatic and scroll-driven advancement. Replay and Play reset the scroll baseline. Smaller screens and reduced-motion mode use normal document flow without a runway.

Pause/Play, previous/next, chapter selection, and Replay are keyboard-accessible buttons. Manual step and chapter selection pauses playback for reading. Replay clears elapsed time and restarts at the workforce. With reduced motion, automatic progression and decorative animation stop; the controls allow manual exploration. Story controls do not move the page or change its URL. Separate Skip story links use a normal anchor to move directly below the scene.

## Visual implementation

Use Satoshi and the shared paper, sapphire, copper, ink, muted, and line tokens. Green is limited to review/completion states. Characters are existing static transparent assets rendered with `StaticEmployee`; the narrative, source details, task cards, and outcome are HTML with CSS transitions. A small CSS perspective cube, request-to-output signal rail, lightly raised cards, role-matching progress, task scans, source packets, and completion accents make activity visible immediately. Pointer movement adds a restrained perspective tilt on eligible desktop screens. These are CSS geometry and static artwork transforms, not rigged character or WebGL animation. Pause stops persistent decorative motion; reduced motion removes all animation. Entrance transitions retain readable content even before visibility activates playback. No new raster assets or 3D engine are required.

Desktop places narrative copy beside a consistently sized visual stage. Mobile stacks the narrative above the stage, uses a two-column workforce roster and assignment grid, and stacks tool sources over context. Persistent chapter indicators, example title, source labels, and upcoming-step copy keep transitions understandable.

Relevant public documentation is in `lib/docs-content.ts`; visual guidelines are in `docs/design-system.md`.
