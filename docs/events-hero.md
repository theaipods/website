# Events front-row preview

The Events landing hero is implemented in `components/EventsSessionHero.tsx`, styled by `app/events-session-hero.css`, and mounted by `components/EventsLanding.tsx`. It replaces the old generated stage background and employee-host composition. The rest of the Events page, catalog, registration, archive, recordings, and FAQ are unchanged.

## Story and interactions

The headline invites visitors to come with a question and leave with a useful idea. Three question buttons select separate illustrative examples:

- Product demonstration: a support request becomes a draft for human review.
- Workshop: a new-hire access request becomes a workflow outline with owners.
- Expert conversation: a proposed refund stops for an authorized decision.

Each preview proceeds through four chapters: the opening question, an example on the stage, an audience follow-up with an answer, and a three-point takeaway. The first three chapters run for 1.8, 3.6, and 3.2 seconds. The final takeaway remains visible until the visitor replays or chooses another question. No automatic looping or scroll interception is used.

Playback starts when at least 20% of the visual enters the viewport. Off-screen visibility and hidden browser tabs pause the elapsed clock. Chapter selection pauses playback; Play resumes, while Replay and selecting a question reset it. Reduced-motion mode disables autoplay and decorative animation and provides a Next chapter control. All selectors and controls are native buttons with accessible names and visible keyboard focus.

## Presentation and boundaries

The light Satoshi, sapphire, and copper composition uses the canonical site tokens. A local dark presentation screen sits in CSS perspective with a beveled frame and stage base. Moving spotlights, sequential raised blocks, a conversation bubble, and a paper takeaway provide different motion for each chapter. These are HTML/CSS objects, not a real-time 3D scene or video. Mobile stacks the copy, question selectors, and screen without horizontal overflow.

The preview is explicitly illustrative. It does not play an event recording, claim a live broadcast is running, read customer data, execute a workflow, or send a reply. “Find a session” links to `#featured`; “Explore past events” links to `#archive`. Event availability and registration remain governed by the existing event records.

The retired `EventsTheaterHero`, its `pet-*` styles, unused Events story configuration, and generated stage asset have been removed.
