import { capabilities, type Capability } from "../workforce";
import { ApiError } from "./auth";
import { modelConfig } from "./model-config";
import { embeddingConfig, embeddingReady } from './embeddings';

// Provider-neutral gateway contract. No vendor keys ever leave this module.
// Implement a gateway using the contract in docs/PROVIDERS.md, or replace generate().
export function providerStatus() {
  return capabilities.map(capability => {
    if(capability==='embedding')return {capability,configured:embeddingReady(),model:embeddingConfig().model||'Not configured'};
    const config=modelConfig(capability); const bedrock=config.format==="bedrock";
    const auth=!!(process.env.AWS_ACCESS_KEY_ID&&process.env.AWS_SECRET_ACCESS_KEY||process.env.AWS_PROFILE||process.env.BEDROCK_USE_DEFAULT_CREDENTIALS==="true");
    return {capability,configured:!!(config.supported && config.model && (bedrock ? config.region&&auth : config.url&&config.key)),model:config.model||"Not configured"};
  });
}
export type ModelRequest = { capability: Capability; instructions: string; context: unknown; task: string; acceptance: string; maxOutputTokens: number; reasoningEffort?: "medium" | "high" | "xhigh"; json?: boolean };
export function outputBudget(input:ModelRequest) {
  const value=Number(process.env[`${input.capability.toUpperCase()}_MAX_OUTPUT_TOKENS`]||input.maxOutputTokens);
  if(!Number.isInteger(value)||value<1024||value>128000) throw new ApiError(503,"Model output budget must be an integer between 1024 and 128000.");
  return value;
}
export class ProviderFailure extends ApiError {
  constructor(public provider: string, public providerStatus: number, public refused = false) {
    super(502, refused ? 'The model declined this request.' : `${provider} request failed (${providerStatus}).`);
  }
}
export async function generate(input: ModelRequest, options: {provider?:string; timeoutMs?:number} = {}): Promise<string> {
  const prefix = input.capability.toUpperCase();
  const config = modelConfig(input.capability, options.provider);
  const { url, key, model, format } = config;
  if (!config.supported) throw new ApiError(503, "Unsupported provider or generation capability. Chat/code use the selected provider; embeddings use the separate knowledge-retrieval adapter. Media generation is not implemented.");
  if (format === "bedrock") {
    const { generateBedrock } = await import("./bedrock"); return generateBedrock(input, options.timeoutMs);
  }
  if (!url || !key || !model) throw new ApiError(503, `${input.capability} provider needs configuration.`);
  if (!["responses", "gateway", "chat-completions"].includes(format)) throw new ApiError(503, "Unsupported model API format.");
  if (config.provider === "azure" && new URL(url).protocol !== "https:") throw new ApiError(503, "Azure requires HTTPS.");
  const effort = process.env[`${prefix}_REASONING_${(input.reasoningEffort || "high").toUpperCase()}`] || input.reasoningEffort;
  const payload = format === "chat-completions" ? {
    model, messages: [{role: "system", content: input.instructions}, {role: "user", content: JSON.stringify({task: input.task, acceptance: input.acceptance, context: input.context})}], stream: false,
    ...(config.provider === "azure" ? {max_completion_tokens: outputBudget(input)} : {max_tokens: outputBudget(input)}),
    ...(config.provider === "nvidia" ? {chat_template_kwargs: {enable_thinking: false}} : {}),
    ...(input.json ? {response_format:{type:'json_object'}} : {}),
  } : format === "responses" ? { model, instructions: input.instructions, input: JSON.stringify({ task: input.task, acceptance: input.acceptance, context: input.context }), max_output_tokens: outputBudget(input), store: false, ...(effort && effort !== "omit" ? { reasoning: { effort } } : {}) } : { ...input, model, maxOutputTokens: outputBudget(input) };
  const response = await fetch(url, { method: "POST", headers: { ...(config.provider === "azure" ? {"api-key": key} : {Authorization: `Bearer ${key}`}), "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(options.timeoutMs || 120000), redirect: "error" });
  if (!response.ok) throw new ProviderFailure(config.provider,response.status);
  const data = await response.json();
  if (format === "chat-completions") {
    const choice = data.choices?.[0];
    if(choice?.message?.refusal || choice?.finish_reason==='content_filter') throw new ProviderFailure(config.provider,422,true);
    if (choice?.finish_reason !== "stop" || choice.message?.refusal || choice.message?.tool_calls?.length) throw new ApiError(502, "Model response was incomplete, refused, or requested unsupported tools. No result was marked complete.");
    data.text = choice.message?.content;
  }
  if (format === "responses") {
    if (data.status !== "completed") throw new ApiError(502, "Model response was incomplete. Review the output-token budget or provider configuration before retrying.");
    data.text = (data.output || []).flatMap((item: { type?: string; content?: { type?: string; text?: string }[] }) => item.type === "message" ? (item.content || []).filter(part => part.type === "output_text").map(part => part.text || "") : []).join("\n");
  }
  if (typeof data.text !== "string" || !data.text.trim() || data.text.length > 200000) throw new ApiError(502, "Provider returned an invalid result. Expected a nonempty text artifact under 200,000 characters.");
  return data.text;
}
