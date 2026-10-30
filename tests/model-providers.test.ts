import test from 'node:test';
import assert from 'node:assert/strict';
import {generate,providerStatus,type ModelRequest} from '../lib/server/providers';
import {bedrockRequest} from '../lib/server/bedrock';
import {modelConfig} from '../lib/server/model-config';
const input:ModelRequest={capability:'chat',instructions:'Use approved evidence.',context:{source:'fixture'},task:'Draft onboarding',acceptance:'Accurate',maxOutputTokens:2000};
test('selected model providers isolate credentials and validate completed output',async()=>{
 const saved={...process.env};const original=globalThis.fetch;
 try {
  process.env.AI_PROVIDER='NVIDIA';process.env.NVIDIA_API_KEY='nvidia-fixture';
  process.env.CHAT_MODEL_KEY='legacy-secret';process.env.CHAT_MODEL_NAME='legacy-model';process.env.CHAT_MODEL_FORMAT='bedrock';
  delete process.env.NVIDIA_CHAT_MODEL;
  assert.equal(providerStatus().find(p=>p.capability==='chat')?.configured,true);
  assert.equal(providerStatus().find(p=>p.capability==='vision')?.configured,false);
  globalThis.fetch=async(url,init)=>{assert.equal(String(url),'https://integrate.api.nvidia.com/v1/chat/completions');assert.equal(new Headers(init?.headers).get('authorization'),'Bearer nvidia-fixture');const payload=JSON.parse(String(init?.body));assert.equal(payload.model,'nvidia/nemotron-3.5-lightning-30b-a3b');assert.equal(payload.messages[0].role,'system');assert.equal(payload.chat_template_kwargs.enable_thinking,false);assert.equal(payload.max_tokens,2000);return Response.json({choices:[{finish_reason:'stop',message:{content:'Completed draft'}}]});};
  assert.equal(await generate(input),'Completed draft');
  for(const finish_reason of ['length','content_filter','tool_calls']){globalThis.fetch=async()=>Response.json({choices:[{finish_reason,message:{content:'Partial'}}]});await assert.rejects(generate(input),/incomplete|declined/);}
  globalThis.fetch=async()=>Response.json({choices:[{finish_reason:'stop',message:{content:''}}]});await assert.rejects(generate(input),/invalid result/);
  delete process.env.NVIDIA_API_KEY;assert.equal(providerStatus().find(p=>p.capability==='chat')?.configured,false);await assert.rejects(generate(input),/configuration/);
  process.env.AI_PROVIDER='azure';process.env.AZURE_OPENAI_ENDPOINT='https://fixture.openai.azure.com/';process.env.AZURE_OPENAI_API_KEY='azure-fixture';process.env.AZURE_CHAT_DEPLOYMENT='my-deployment';
  globalThis.fetch=async(url,init)=>{assert.equal(String(url),'https://fixture.openai.azure.com/openai/v1/chat/completions');const headers=new Headers(init?.headers);assert.equal(headers.get('api-key'),'azure-fixture');assert.equal(headers.has('authorization'),false);const payload=JSON.parse(String(init?.body));assert.equal(payload.model,'my-deployment');assert.equal(payload.max_completion_tokens,2000);assert.equal(payload.chat_template_kwargs,undefined);return Response.json({choices:[{finish_reason:'stop',message:{content:'Azure draft'}}]});};
  assert.equal(await generate(input),'Azure draft');process.env.AZURE_OPENAI_ENDPOINT='https://fixture.openai.azure.com/openai/v1/';assert.equal(modelConfig('chat').url,'https://fixture.openai.azure.com/openai/v1/chat/completions');
  process.env.AI_PROVIDER='bedrock';process.env.AWS_REGION='us-east-1';process.env.AWS_BEDROCK_CHAT_MODEL='bedrock-model';process.env.AWS_ACCESS_KEY_ID='fixture';process.env.AWS_SECRET_ACCESS_KEY='fixture';delete process.env.CHAT_BEDROCK_THINKING;
  assert.equal(providerStatus().find(p=>p.capability==='chat')?.configured,true);assert.equal(bedrockRequest(input).modelId,'bedrock-model');assert.deepEqual(bedrockRequest(input).additionalModelRequestFields,{});
  process.env.AI_PROVIDER='typo';await assert.rejects(generate(input),/Unsupported provider/);
  process.env.AI_PROVIDER='nvidia';await assert.rejects(generate({...input,capability:'embedding'}),/not implemented/);
 } finally {globalThis.fetch=original;for(const key of Object.keys(process.env))if(!(key in saved))delete process.env[key];Object.assign(process.env,saved);}
});
