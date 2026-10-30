import test from 'node:test';
import assert from 'node:assert/strict';
import {parseModelObject,generateModelObject} from '../lib/server/model-json';

test('JSON parsing preserves quoted braces and escaped text inside wrapped responses',()=>{
 const value={suggestions:[{field:'about',value:'A {useful} company with "quoted" wording.\nSecond line.'}],warnings:[]};
 assert.deepEqual(parseModelObject('Here is your draft:\n```json\n'+JSON.stringify(value)+'\n```'),value);
 assert.throws(()=>parseModelObject('{"suggestions":['),/Incomplete/);
 assert.throws(()=>parseModelObject('{"value": undefined}'));
 assert.throws(()=>parseModelObject('No JSON here'));
});
test('AI form calls request JSON and retry formatting once without retrying auth failures',async()=>{
 const env={...process.env};const fetch=globalThis.fetch;
 try{process.env.AI_PROVIDER='nvidia';process.env.NVIDIA_API_KEY='fixture';let calls=0;
 globalThis.fetch=async(_url,init)=>{calls++;const payload=JSON.parse(String(init?.body));assert.deepEqual(payload.response_format,{type:'json_object'});return Response.json({choices:[{finish_reason:'stop',message:{content:calls===1?'Not JSON':'{"suggestions":[],"warnings":[]}'}}]});};
 const input={capability:'chat' as const,instructions:'Return JSON with suggestions and warnings.',context:{},task:'Draft goals',acceptance:'Valid JSON',maxOutputTokens:2000};
 assert.deepEqual(await generateModelObject(input),{suggestions:[],warnings:[]});assert.equal(calls,2);
 calls=0;globalThis.fetch=async()=>{calls++;return Response.json({},{status:401});};await assert.rejects(generateModelObject(input),/401/);assert.equal(calls,1);
 }finally{globalThis.fetch=fetch;for(const k of Object.keys(process.env))if(!(k in env))delete process.env[k];Object.assign(process.env,env);}
});
