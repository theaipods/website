import type { Capability } from "../workforce";
export function modelConfig(capability: Capability, override?: string) {
  const p = capability.toUpperCase();
  const provider = (override || process.env.AI_PROVIDER || "legacy").trim().toLowerCase();
  const supported = capability === "chat" || capability === "code";
  const hosted: Record<string, [string,string,string]> = {
    groq: ['GROQ','https://api.groq.com/openai/v1/chat/completions','llama-3.3-70b-versatile'],
    openrouter: ['OPENROUTER','https://openrouter.ai/api/v1/chat/completions','openrouter/free'],
    huggingface: ['HUGGINGFACE','https://router.huggingface.co/v1/chat/completions','openai/gpt-oss-120b:cheapest'],
  };
  if (hosted[provider]) {
    const [env,url,fallback] = hosted[provider];
    return {provider,supported,format:'chat-completions',model:process.env[`${env}_${p}_MODEL`]||fallback,url,key:process.env[`${env}_API_KEY`]||(provider==='huggingface'?process.env.HF_TOKEN:'')||'',region:''};
  }
  if (provider === "nvidia") return { provider, supported, format: "chat-completions", model: process.env[`NVIDIA_${p}_MODEL`] || (supported ? "nvidia/nemotron-3.5-lightning-30b-a3b" : ""), url: "https://integrate.api.nvidia.com/v1/chat/completions", key: process.env.NVIDIA_API_KEY || "", region: "" };
  if (provider === "azure") {
    const endpoint = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
    return { provider, supported, format: "chat-completions", model: process.env[`AZURE_${p}_DEPLOYMENT`] || "", url: endpoint ? `${endpoint.endsWith("/openai/v1") ? endpoint : `${endpoint}/openai/v1`}/chat/completions` : "", key: process.env.AZURE_OPENAI_API_KEY || "", region: "" };
  }
  if (provider === "bedrock") return { provider, supported, format: "bedrock", model: process.env[`AWS_BEDROCK_${p}_MODEL`] || "", region: process.env.AWS_REGION || "", url: "", key: "" };
  if (provider !== "legacy") return { provider, supported: false, format: "invalid", model: "", url: "", key: "", region: "" };
  const url = process.env[`${p}_MODEL_URL`] || "";
  return { provider, supported, format: process.env[`${p}_MODEL_FORMAT`] || (url.endsWith("/responses") ? "responses" : "gateway"), model: process.env[`${p}_MODEL_NAME`] || "", url, key: process.env[`${p}_MODEL_KEY`] || "", region: process.env[`${p}_AWS_REGION`] || process.env.AWS_REGION || "" };
}
