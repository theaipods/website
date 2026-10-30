# Model and tool adapter contract

The application works without model keys in **simulation** mode. Simulation assembles a labeled configuration brief from saved answers and selected source excerpts. It is deliberately not described as completed AI work.

## Provider selection

Set `AI_PROVIDER=nvidia`, `azure`, `bedrock`, or `legacy`. Values are case-insensitive. If absent, the existing legacy per-capability settings apply. Explicit selection overrides all legacy MODEL_URL/KEY/NAME/FORMAT settings for every capability; live Pod credentials never fall back across providers. Onboarding has the explicit opt-in credential chain below. Invalid selections and missing keys fail closed.

### NVIDIA (current local default)

```dotenv
AI_PROVIDER=nvidia
NVIDIA_API_KEY=
NVIDIA_CHAT_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
NVIDIA_CODE_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
NVIDIA_EMBEDDING_MODEL=nvidia/nemotron-3.5-embed-1b
NVIDIA_VISION_MODEL=nvidia/nemotron-3.5-super-vl-120b-a12b
```

Add your key from NVIDIA Build. Chat and code call `https://integrate.api.nvidia.com/v1/chat/completions` with bearer authentication, separate system/user messages, streaming off, and thinking disabled for the selected Lightning model. Only completed, non-refused text is accepted; truncated outputs, tool calls and errors block work. These are free prototyping endpoints, not a promise of unlimited free production service. Vision is a reserved model setting, not an enabled image-processing pipeline. Text embeddings use the same NVIDIA key with the separate embedding model below. Chat summarizes and drafts; embeddings retrieve stored knowledge. Free crawler mode makes no Firecrawl/Google API calls.

### Azure OpenAI / Foundry v1

```dotenv
AI_PROVIDER=azure
AZURE_OPENAI_ENDPOINT=https://YOUR-RESOURCE.openai.azure.com
AZURE_OPENAI_API_KEY=
AZURE_CHAT_DEPLOYMENT=
AZURE_CODE_DEPLOYMENT=
```

Use your actual deployment names, not assumed catalog model IDs. A resource root or base ending in `/openai/v1` is accepted. Requests use `/openai/v1/chat/completions`, `api-key` authentication and `max_completion_tokens`. No api-version is needed for this v1 contract. This implementation uses API keys, not Entra tokens. Select deployments supporting text chat completions and these parameters. See [Azure v1 API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/api-version-lifecycle).

### AWS Bedrock

```dotenv
AI_PROVIDER=bedrock
AWS_REGION=
AWS_BEDROCK_CHAT_MODEL=
AWS_BEDROCK_CODE_MODEL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
```

Use enabled Converse-compatible model IDs or inference-profile IDs/ARNs from your account. Temporary credentials require AWS_SESSION_TOKEN. Alternatively use AWS_PROFILE locally, or set BEDROCK_USE_DEFAULT_CREDENTIALS=true for an IAM role/default SDK chain. No NVIDIA/Azure keys or URLs are used. Provider-selected Bedrock defaults to thinking omitted so generic Converse models do not receive Claude-only fields. Set CHAT_BEDROCK_THINKING or CODE_BEDROCK_THINKING to adaptive/extended only for a compatible Claude model; existing effort mappings still apply. Azure/Bedrock usage follows those providers' billing, not NVIDIA's free offering.

Restart both web and worker after editing environment settings. Railway requires the same provider settings in both services. Never use NEXT_PUBLIC_ for credentials. Provider status reports configuration, not a live credential test. Unsupported media capabilities remain unconfigured even if their keys/names exist.

## Legacy chat and code gateways

Website research runs as a persisted background job. Chat creates evidence-backed profile fields; the embedding adapter indexes saved company text. Matched public sources can supplement blocked official pages. Model availability and source access are separate. See [research behavior](RESEARCH.md). Provider status means configured, not a successful live health check.

Set `CHAT_MODEL_URL`, `CHAT_MODEL_KEY`, `CHAT_MODEL_NAME` and/or the equivalent `CODE_` variables in `web/.env` or `.env.local`. Restart both the web server and worker after changing configuration. Every pod also uses chat for management, quality review and final delivery, so configure chat even for a code pod. Set `CHAT_MODEL_FORMAT=responses` (and `CODE_MODEL_FORMAT=responses`) for direct OpenAI Responses; `gateway` uses the contract below. An endpoint ending in `/responses` is inferred when FORMAT is absent.

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

Return HTTP 200 with `{ "text": "The actual deliverable, sources, assumptions and verification" }`. The text must be nonempty and at most 200,000 characters. Other statuses, invalid output and the 120-second timeout block the task. The application never substitutes a simulation for a failed live call.

The `gateway` format is **provider-neutral**. The `responses` format sends instructions, structured context as input, a maximum token budget, `store:false` and optional reasoning effort to a direct Responses endpoint. Only completed text output is accepted. NVIDIA and Azure use the direct adapters above; other vendors need a gateway. Demo tasks request medium/high/xhigh according to declared complexity; explicit `CHAT_REASONING_XHIGH=high` (or corresponding CODE setting) maps unsupported effort levels. `omit` suppresses effort for models without that capability. The selected model must support the supplied settings. Keep evidence separate from governing instructions. Keys and URLs are never sent to the browser. Configure only trusted endpoints. See the [official reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).

`MAX_MODEL_CALLS_PER_POD` bounds attempts including retries. The budget in the questionnaire is context, not a billing integration. Token/currency accounting and provider-side cost ceilings must be implemented with the selected vendor. The final human review checks the output; a model review is not proof of correctness.

## Legacy per-capability AWS Bedrock Claude

Set the capability's MODEL_FORMAT to `bedrock`, MODEL_NAME to the enabled model/inference-profile ID, and AWS_REGION (or CODE_AWS_REGION / CHAT_AWS_REGION). Authentication uses the AWS SDK credential chain: environment credentials, AWS_PROFILE, or an explicitly enabled default runtime chain via BEDROCK_USE_DEFAULT_CREDENTIALS=true. No model URL/key is needed for this format. The adapter invokes Converse, accepts only completed text, excludes reasoning blocks, and does not automatically retry charged calls. IAM needs bedrock:InvokeModel for the selected model/profile.

MODEL capability prefixes also select BEDROCK_THINKING: adaptive, extended, or omit. Adaptive requires a compatible model and sends output_config.effort separately from thinking. Explicitly map xhigh to a supported Sonnet effort, for example CODE_REASONING_XHIGH=high. Extended mode uses a task-based token budget. Full setup is in [LOCAL_DEMO.md](LOCAL_DEMO.md).

## Structured form responses

Onboarding and profile extraction request JSON-object responses from NVIDIA/Azure chat completions. Other adapters keep the prompt contract. A quote-aware parser accepts fenced JSON or a short preface, and one additional model call retries malformed JSON. It never evaluates code or alters field values to force parsing. Validation still rejects unsupported fields, ungrounded findings, and unsafe configuration changes. Provider/auth failures are not retried by this formatter.

## Reserved media capabilities

Image, video, audio and vision have named environment slots and status entries. Their execution is intentionally blocked until their adapters are implemented. Add typed media artifacts, storage, polling/cancellation for long jobs, usage accounting, and domain validation when integrating them. Setting keys alone does not make these adapters operational.

## Saved knowledge embeddings

NVIDIA calls `POST https://integrate.api.nvidia.com/v1/embeddings` using NVIDIA_API_KEY and NVIDIA_EMBEDDING_MODEL (default `nvidia/nemotron-3.5-embed-1b`). Passage embeddings index text; query embeddings retrieve it. Azure uses AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_EMBEDDING_DEPLOYMENT. Bedrock/legacy embedding adapters are not implemented; they retain keyword retrieval. Provider keys never cross providers.

Vectors, content hashes and provider/model identity are saved in `chunk_embeddings`, scoped through company-owned chunks. This portable implementation computes cosine similarity in the application, not a dedicated vector database. Live Pod retrieval respects selected document IDs and excludes research for an old company domain. Onboarding assistance retrieves from the current company's knowledge. Simulation never calls embeddings. Changing the model creates a separate index; old vectors are not mixed. The background worker indexes new uploaded/connected text, at most 64 chunks per sweep. Retries retain stored text. Large corpora should migrate to a database vector index.

Word/PDF/plain-text/PowerPoint extraction remains text-based; OCR, video analysis and spreadsheet/image understanding are not enabled by the embedding model. NVIDIA's current [embedding API contract](https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3_5-embed-1b-infer) supports this text request shape. Live passage and query calls returned 2,048-dimensional vectors on 2026-10-29. Older E5 service returned 410 and is not the configured default.

## External tools

The tools selected during onboarding record requirements, not OAuth connections. Profile MCP connections can import real results from explicitly enabled read tools into company evidence. The current worker drafts content from selected evidence; it does not autonomously invoke tools. External writes still need adapters with scoped credentials, idempotency and authorization. Human-only steps record manual work and approvals; the app does not independently verify them. See [LOCAL_DEMO.md](LOCAL_DEMO.md).

## Execution boundaries

Each job uses a pinned company version, selected evidence, a Pod manager, specialists and a consolidating orchestrator. Standard Pods use sequential dependencies. Demo templates use branching dependencies with up to three concurrent tasks; reviews hold only dependent branches. Per-task merge checks preserve concurrent approvals. The observer detects failures, changed context and interrupted leases. Pause/stop discards in-flight output; issued requests can still incur charges. Standard leases older than two minutes and demo leases older than three minutes block for explicit retry. External side effects are not implemented, so retries only re-draft text.

Human approval and rejected AI opportunities are enforced by the application. Free-text business rules are supplied to the model and reviewer; they are not executable policy predicates. Implement structured policy evaluation before adding side-effecting tools. Pods stop after the requested deliverable; recurring business monitoring needs scheduling and real metric integrations.

## Onboarding-only fallback chain

Website profile analysis, section autofill and trial setup use these server-only settings:

```dotenv
ONBOARDING_AI_PROVIDERS=primary,groq,openrouter,huggingface
GROQ_API_KEY=
GROQ_CHAT_MODEL=llama-3.3-70b-versatile
OPENROUTER_API_KEY=
OPENROUTER_CHAT_MODEL=openrouter/free
HUGGINGFACE_ENABLED=false
HUGGINGFACE_API_KEY=
HUGGINGFACE_CHAT_MODEL=openai/gpt-oss-120b:cheapest
```

`primary` resolves to AI_PROVIDER (currently NVIDIA). Only configured entries are attempted, in order, at most four providers. Remove entries to restrict where onboarding context can be sent. Keys are isolated per request and are never returned to the client. No global environment mutation occurs during failover. Existing company knowledge and current form values are included in requests to the chosen fallback services.

403/401 access errors, 429 throttling, server errors, network timeouts, invalid JSON and unusable schemas move to the next configured provider. The UI reports the actual provider/model and concise failure notes, without upstream bodies or credentials. Model refusals stop the chain. Calls have a 45-second per-provider timeout and a 100-second overall generation window. A single configured provider may get one JSON/schema repair attempt. Empty/invalid section fields can be supplemented with labeled built-in starters; these are not presented as AI results. Research profile extraction instead retains grounded extraction results and does not invent facts. Application rate limits still apply separately.

OpenRouter defaults to its [free-model router](https://openrouter.ai/openrouter/free), which selects currently available free models supporting the requested features. Groq uses [Llama 3.3 70B Versatile](https://console.groq.com/docs/model/llama-3.3-70b-versatile); account quotas apply. Hugging Face uses the [OpenAI-compatible inference router](https://huggingface.co/docs/inference-providers/en/index). As checked October 30, 2026, its [pricing page](https://huggingface.co/docs/inference-providers/en/pricing) states free accounts must purchase credits; therefore HUGGINGFACE_ENABLED defaults to false. Enabling it requires explicit configuration and available credits. `:cheapest` is a routing preference, not free usage or a spending cap. No hosted provider promises unlimited availability. Model choices remain configurable.

This chain does not switch live Pod models or embedding models. Existing vectors stay compatible with their recorded embedding identity. Add keys to web/.env locally and Railway secrets for both web and worker, then restart both processes. Never use NEXT_PUBLIC_ for provider keys.
