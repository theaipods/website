# Local founder demonstration

This stage needs the web app, database, background worker and model credentials. It does not require the future production infrastructure in `infra/`.

## Start

1. In `web/.env` or `.env.local`, configure `DATABASE_URL` (SQLite or PostgreSQL), `APP_URL=http://localhost:3000`, and model settings below. Keep environment files out of Git. Process variables override files; `.env.local` takes precedence over `.env`.
2. Run `npm run dev` from `web`. It starts Next.js and the queue worker. Keep the terminal running. Restart after changing environment values.
3. Configure Resend, enter a work email, verify the emailed code, then choose a name/password. The old admin/admin login is retired; use the provisioned admin account. Signup and recovery require Resend even locally. All accounts start on Starter. See [authentication](AUTHENTICATION.md).
4. Complete onboarding, save the full blueprint and activate it. Website research findings require review and explicit application followed by Save. Upload source documents with readable text.
5. Open `/workspace/demo`, choose a brief, select evidence, choose review policy and press Send. The project and Pod are created at that point, with persistent tasks and specialist assignments.

## Model setup

Set `CHAT_MODEL_URL`, `CHAT_MODEL_KEY`, `CHAT_MODEL_NAME`, `CHAT_MODEL_FORMAT`. Development also needs equivalent `CODE_` variables. Use `responses` with `https://api.openai.com/v1/responses`; use `gateway` with the contract in [PROVIDERS.md](PROVIDERS.md). Supply a model your account can access. Every project needs chat for management/review even when specialists use code.

Simple/moderate/complex tasks request medium/high/xhigh. If your chosen model does not support xhigh, explicitly set `CHAT_REASONING_XHIGH=high` and/or `CODE_REASONING_XHIGH=high`. `omit` suppresses the parameter for models without effort control. Responses must finish successfully; incomplete or empty results block the task instead of masquerading as finished work. Calls time out at 120 seconds. `MAX_MODEL_CALLS_PER_POD` bounds attempts including retries. Token/currency billing is not implemented.

### OpenAI for the current demo

Use OpenAI for both chat and code now. Set both `CHAT_MODEL_FORMAT` and `CODE_MODEL_FORMAT` to `responses`, both model URLs to `https://api.openai.com/v1/responses`, and both model names to the GPT API model enabled for your account. Put your API credential in each corresponding MODEL_KEY locally. Bedrock below is optional future configuration, not required for this demo.

Reasoning uses the output token allowance too. For complex briefs, configure `CHAT_MAX_OUTPUT_TOKENS=32000` and `CODE_MAX_OUTPUT_TOKENS=32000` if supported by your model. Overrides accept 1,024–128,000 tokens per call; larger allowances can increase cost. Incomplete responses block for review/retry instead of being marked complete.

### Future option: OpenAI chat + Claude Sonnet on Bedrock

For GPT-5.6 coordination, use `CHAT_MODEL_FORMAT=responses`, `CHAT_MODEL_URL=https://api.openai.com/v1/responses`, your OpenAI API key in `CHAT_MODEL_KEY`, and an accessible GPT-5.6 API model such as `gpt-5.6-sol` in `CHAT_MODEL_NAME`. A ChatGPT subscription/session is not an API credential.

For Sonnet coding, set `CODE_MODEL_FORMAT=bedrock`, `CODE_MODEL_NAME` to your enabled Bedrock model ID or inference-profile ARN, and `AWS_REGION` to its runtime region. Use an AWS CLI profile (`AWS_PROFILE`) or `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` (+ `AWS_SESSION_TOKEN` for temporary credentials). On an IAM-role runtime, explicitly set `BEDROCK_USE_DEFAULT_CREDENTIALS=true`; the SDK uses the default credential chain. CODE_MODEL_URL/KEY are unnecessary for Bedrock.

The adapter uses AWS Converse with `bedrock:InvokeModel` permission. Set `CODE_BEDROCK_THINKING=adaptive` for supported newer Sonnet models or `extended` for Sonnet 4/4.5. For Sonnet models without xhigh, explicitly set `CODE_REASONING_XHIGH=high`; do not assume all providers accept identical effort names. Extended mode uses 2,048/4,096/8,192 thinking tokens for medium/high/xhigh tasks. The app does not provision AWS services or change IAM policy. Verify model access and the exact inference profile in Bedrock first. See [AWS adaptive thinking](https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-adaptive-thinking.html) and [GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol).

## Account allowances

All accounts start on Starter: one Pod and one project, $0. Founders permits ten of each at $499 + GST/month. Enterprise uses custom pricing with no fixed application limit. Templates are available to every plan; each submission consumes one project and Pod allowance, including simulations. Quotas are checked atomically across companies. Completed Pods still count. Admin → Account plan allowance is the explicit upgrade mechanism; it does not charge a payment method or silently upgrade a demo account.

## Five use cases and evidence

| Brief | Useful evidence | Optional read MCP |
|---|---|---|
| Marketing launch | Product, positioning, audience, brand rules | Research, analytics, documents |
| Sales pipeline | Real accounts, ICP, pricing constraints | CRM, account research |
| Finance close | Ledger/invoice/bank text or structured exports | Accounting, spreadsheet read |
| Development build | Stack, API contracts, repository files | Repository read |
| Customer onboarding/retention | Customer commitments, support/product policies | CRM/support/analytics read |

Missing inputs are disclosed. Finance has no fabricated balances; outreach is not claimed sent; generated code is not claimed tested. The initial deliverable is text/Markdown (including code file contents), not an executable deployment or generated slide file.

## MCP through the UI

Workspace → MCP & integrations → Your profile connections. Register a trusted public HTTPS Streamable HTTP server (port 443). Optional bearer tokens are AES-256-GCM encrypted using `MCP_SECRET_KEY`: generate 32 random bytes as 64 hex characters once and preserve that secret across restarts/backups. Tokens are not returned to the browser. Remove and recreate a connection to rotate its token.

Discover tools, inspect each JSON schema, and enable only tools you have independently verified as read-only. Enter an argument object and click Read & import into selected company. Successful text/structured results are indexed with source and retrieval time. Choose the imported evidence in your demo brief. Company switching does not share evidence; profile connection credentials remain scoped to the signed-in owner. Discovery resets grants to disabled.

MCP servers enforce their own input schemas and permissions. Tool annotations are not trusted as authorization. Public-address checks and DNS pinning reject private endpoints and redirects. Authentication supports anonymous or bearer tokens, not OAuth sign-in/stdio. Worker-driven tool planning, writes, publishing, payments, deployment and sandbox code execution are **not implemented**. A connected read server is enough to bring real context into the local drafting demo.

## Queue and review

Up to three independent tasks run concurrently within a demo Pod. Manual queues every draft for approval. Decide for me uses static, reviewable template checkpoints, not an opaque prediction of whether the owner will say yes. Auto-approve applies to drafts only. Approvals stay in the database while independent work progresses; completed tasks do not replay after approval. Request changes regenerates that draft. Rejection stops the project.

The task board estimates work duration from remaining dependency paths; this is not a measured SLA and excludes review waiting. Interrupted leases block for explicit retry. Pause/stop discards in-flight output, but a request already sent to a model can still cost money. Changing the company blueprint blocks old-context work; no automatic mixing of versions occurs.

Use Retry blocked tasks to requeue failed branches while another draft awaits approval. Existing approvals and completed outputs remain intact. A paused project stays paused until resumed.

## Before showing founders

- Verify your actual account has an activated company; passing tests does not populate your company.
- Configure chat/code and run one live brief with your real provider. Configuration flags alone do not prove connectivity.
- Import source evidence, inspect the generated artifacts, approve a checkpoint and reload to confirm persistence.
- Keep both server and worker running. Keep the account Starter unless an administrator explicitly upgrades it.

References: [OpenAI reasoning](https://developers.openai.com/api/docs/guides/reasoning), [MCP tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools).
