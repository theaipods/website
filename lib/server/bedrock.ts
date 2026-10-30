import {BedrockRuntimeClient,ConverseCommand,type ConverseCommandInput} from "@aws-sdk/client-bedrock-runtime";
import type {ModelRequest} from "./providers";
import {outputBudget} from "./providers";
import {modelConfig} from "./model-config";
import {ApiError} from "./auth";

export function bedrockRequest(input:ModelRequest):ConverseCommandInput {
  const prefix=input.capability.toUpperCase();const model=modelConfig(input.capability).model;
  if(!model) throw new ApiError(503,`${input.capability} Bedrock model/inference profile ID is missing.`);
  const requested=input.reasoningEffort||"high";
  const effort=process.env[`${prefix}_REASONING_${requested.toUpperCase()}`]||requested;
  const thinking=process.env[`${prefix}_BEDROCK_THINKING`]||(modelConfig(input.capability).provider === "bedrock" ? "omit" : "adaptive");
  const additional:NonNullable<ConverseCommandInput["additionalModelRequestFields"]>=thinking==="adaptive"?{thinking:{type:"adaptive"},...(effort!=="omit"?{output_config:{effort}}:{})}:thinking==="extended"?{thinking:{type:"enabled",budget_tokens:requested==="medium"?2048:requested==="high"?4096:8192}}:{};
  if(!["adaptive","extended","omit"].includes(thinking)) throw new ApiError(503,"Bedrock thinking must be adaptive, extended, or omit.");
  return {modelId:model,system:[{text:input.instructions}],messages:[{role:"user",content:[{text:JSON.stringify({task:input.task,acceptance:input.acceptance,context:input.context})}]}],inferenceConfig:{maxTokens:Math.max(outputBudget(input),thinking==="extended"?12000:outputBudget(input))},additionalModelRequestFields:additional};
}
export async function generateBedrock(input:ModelRequest) {
  const region=modelConfig(input.capability).region;
  if(!region) throw new ApiError(503,"Set AWS_REGION for the Bedrock runtime.");
  const client=new BedrockRuntimeClient({region,maxAttempts:1});
  try {
    const response=await client.send(new ConverseCommand(bedrockRequest(input)),{abortSignal:AbortSignal.timeout(120000)});
    if(response.stopReason!=="end_turn") throw new ApiError(502,`Bedrock did not complete the artifact (${response.stopReason || "unknown"}). No result was marked complete.`);
    const text=(response.output?.message?.content||[]).map(part=>"text" in part?part.text||"":"").join("\n");
    if(!text.trim()||text.length>200000) throw new ApiError(502,"Bedrock returned no valid text artifact.");
    return text;
  } catch(e) {
    if(e instanceof ApiError) throw e;
    const name=e instanceof Error?e.name:"UnknownError";
    throw new ApiError(502,`Bedrock request failed (${name}). Verify AWS credentials, region, model access and inference profile. No task was marked complete.`);
  } finally {client.destroy();}
}
