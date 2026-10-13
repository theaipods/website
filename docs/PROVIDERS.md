# Model and tool adapter contract

The application works without model keys in **simulation** mode. Simulation assembles a labeled configuration brief from saved answers and selected source excerpts. It is deliberately not described as completed AI work.

## Chat and code gateways

Set `CHAT_MODEL_URL`, `CHAT_MODEL_KEY`, `CHAT_MODEL_NAME` and/or the equivalent `CODE_` variables in `web/.env.local`. Restart both the web server and worker after changing configuration. Every pod also uses chat for management, quality review and final delivery, so configure chat even for a code pod.

The worker sends a POST to the configured URL:

```http
Authorization: Bearer <server-side model key>
Content-Type: application/json
```

```json
{
  "model": "your-model-name",
  "capability": "chat",
  "instructions": "Role definition, evidence requirements and permission boundaries",
  "context": {
    "company": "the selected company's blueprint object",
    "brief": "pod questionnaire answers object",
    "evidence": [{ "id": "source:0", "name": "guidelines.txt", "text": "excerpt", "score": 2 }],
    "upstream": [{ "title": "Prior task", "output": "Reviewed output" }],
    "feedback": "Revision instructions"
  },
  "task": "Step title and objective",
  "acceptance": "Owner-defined acceptance criteria",
  "maxOutputTokens": 6000
}
```

Return HTTP 200 with `{ "text": "The actual deliverable, sources, assumptions and verification" }`. The text must be nonempty and at most 200,000 characters. Other statuses, invalid output and the 45-second timeout block the pod. The application never substitutes a simulation for a failed live call.

This is a **provider-neutral interface**, not a vendor-specific SDK request. Implement a small gateway for your chosen vendor, or replace `lib/server/providers.ts`. Keep the company context separate from governing instructions and treat retrieved documents as untrusted evidence. Gateway keys and URLs are never sent to the browser. Configure only trusted server endpoints.

`MAX_MODEL_CALLS_PER_POD` bounds attempts including retries. The budget in the questionnaire is context, not a billing integration. Token/currency accounting and provider-side cost ceilings must be implemented with the selected vendor. The final human review checks the output; a model review is not proof of correctness.

## Reserved capabilities

Embedding, image, video, audio and vision have named environment slots and status entries. Their execution is intentionally blocked until their adapters are implemented. Add typed media artifacts, storage, polling/cancellation for long jobs, usage accounting, and domain validation when integrating them. Setting keys alone does not make these adapters operational.

Retrieval currently ranks selected text chunks by lexical overlap. There is no embedding model, vector search, OCR, semantic interview or model-driven process discovery yet. Word/PDF/plain text/PowerPoint extraction works when readable; images and spreadsheets remain stored attachments.

## External tools

The tools selected during onboarding record requirements. They do not represent OAuth connections. Slack, ads platforms, repositories, finance systems and other external actions need dedicated adapters with scoped credentials, idempotency, audit records and authorization checks before execution. The current worker only drafts content. Human-only steps record manual work and approvals; the app does not independently verify an external action.

## Execution boundaries

Each job uses a pinned company version, selected evidence, sequential dependencies, a pod manager, chosen specialists and a consolidating orchestrator. The observer detects missing providers, failures, changed context and interrupted leases. Pause/stop checks discard in-flight output before saving; already-issued provider requests can still incur charges. A lease older than two minutes becomes blocked for explicit retry. External side effects are not implemented, so retries only re-draft text.

Human approval and rejected AI opportunities are enforced by the application. Free-text business rules are supplied to the model and reviewer; they are not executable policy predicates. Implement structured policy evaluation before adding side-effecting tools. Pods stop after the requested deliverable; recurring business monitoring needs scheduling and real metric integrations.
