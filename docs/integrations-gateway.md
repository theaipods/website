# Public integration gateway demonstration

`components/IntegrationGateway.tsx` renders the “One governed passage between intent and action” section at `/integrations#mcp`. Its styles live in `app/integration-gateway.css`. `IntegrationExperience.tsx` mounts it between the tool strip and catalog.

## Two outcomes, one boundary

The default example asks a research specialist to read one approved launch brief. Five chapters show the request, identity, tool-schema discovery, permission scope, and returned sample evidence. A second example requests `publish_update` against the same read-only connection: the third gate stays closed, the packet stops, and the result states that nothing was published. Outcome buttons invite visitors to compare the two cases.

These are local illustrative examples of a configured connection. They do not register an MCP server, authenticate a real specialist, read a document, execute a tool, publish anything, or change permissions. Schema discovery and execution remain separate capabilities; the existing integration catalog and authenticated settings retain their own availability rules. The technical MCP contracts are unchanged.

## Animation and access

- The first four chapters run for 1.3, 1.8, 2.1, and 2.6 seconds; the outcome holds until replay or a new example is selected.
- Playback starts when at least 30% of the demonstration panel is visible. It pauses off-screen and in hidden tabs without accumulating elapsed time.
- Chapter selection pauses playback. Play resumes; Replay and scenario selection reset the sequence. Reduced-motion mode disables automatic progression and decorative motion, with a Next control for manual progression.
- Controls are native buttons with accessible names, pressed/current state, and visible keyboard focus. All explanations remain HTML text.
- Perspective floors, beveled gate frames, sliding glass doors, scanning light, and a traveling request are CSS geometry, not a WebGL scene. On mobile the gate view sits above paired intent/outcome cards, with no horizontal overflow or scroll interception.

The section follows the canonical Satoshi, sapphire, and copper tokens. Copper also marks a held request; text and icons communicate the boundary independently of color. The rest of the integrations catalog, detail drawers, and workflow examples remain unchanged.

The former “Bring your stack. We’ll bring the team.” closing section, its `ix-final*` rules, and the unused `integrations-stack-team.webp` asset are removed. The retired `ix-gateway*` diagram and its packet/ring styles are also removed. Connection settings remain reachable from the page hero and catalog detail drawers.
