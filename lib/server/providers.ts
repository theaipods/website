import { capabilities, type Capability } from "../workforce";
import { ApiError } from "./auth";

// Provider-neutral gateway contract. No vendor keys ever leave this module.
// Implement a gateway using the contract in docs/PROVIDERS.md, or replace generate().
export function providerStatus() {
  return capabilities.map(capability => ({ capability, configured: !!(process.env[`${capability.toUpperCase()}_MODEL_URL`] && process.env[`${capability.toUpperCase()}_MODEL_KEY`] && process.env[`${capability.toUpperCase()}_MODEL_NAME`]), model: process.env[`${capability.toUpperCase()}_MODEL_NAME`] || "Not configured" }));
}
export type ModelRequest = { capability: Capability; instructions: string; context: unknown; task: string; acceptance: string; maxOutputTokens: number };
export async function generate(input: ModelRequest): Promise<string> {
  const prefix = input.capability.toUpperCase();
  const url = process.env[`${prefix}_MODEL_URL`];
  const key = process.env[`${prefix}_MODEL_KEY`];
  const model = process.env[`${prefix}_MODEL_NAME`];
  if (!url || !key || !model) throw new ApiError(503, `${input.capability} provider needs configuration.`);
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ ...input, model }), signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new ApiError(502, `${input.capability} provider failed (${response.status}). No result was marked complete.`);
  const data = await response.json();
  if (typeof data.text !== "string" || !data.text.trim() || data.text.length > 200000) throw new ApiError(502, "Provider returned an invalid result. Expected a nonempty text artifact under 200,000 characters.");
  return data.text;
}
