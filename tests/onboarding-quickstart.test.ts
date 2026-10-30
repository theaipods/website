import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultCompany,companySchema,companyGaps,domains} from '../lib/workforce';
import {starterDraft,chapterProgress,checkTrial,teamSizeEstimate,setupSignature} from '../lib/onboarding-starter';
import {checkedSuggestions,prepareTrial,suggestOnboarding} from '../lib/server/onboarding-assistance';
import {onboardingObject,onboardingProviders} from '../lib/server/onboarding-model';
import {Database} from '../lib/server/db';

const input={capability:'chat' as const,instructions:'JSON',context:{},task:'Draft',acceptance:'valid',maxOutputTokens:2048};
const completion=(value:unknown)=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]});
function envRestore(old:NodeJS.ProcessEnv){for(const k of Object.keys(process.env))if(!(k in old))delete process.env[k];Object.assign(process.env,old);}

test('starter covers every department, all outcome values and six chapters when activated',()=>{
  const original={...defaultCompany(),website:'https://example.org',domains:domains.map(d=>d.id),outcomes:[{id:'one',metric:'Customer satisfaction',baseline:'',target:'',timeframe:''},{id:'two',metric:'Cost per acquisition',baseline:'',target:'',timeframe:''},{id:'three',metric:'Release frequency',baseline:'',target:'',timeframe:''}]};
  const c=starterDraft(original);assert.deepEqual(companyGaps(c),[]);assert.equal(c.outcomes?.length,3);
  for(const o of c.outcomes!){assert.match(o.baseline,/estimate/);assert.match(o.target,/estimate/);}
  const checked=checkTrial(c);assert.equal(checked.ready,true);
  c.trialCheck={signature:checked.signature,at:new Date().toISOString(),steps:checked.steps};c.status='active';
  assert.deepEqual(chapterProgress(c).map(x=>x.percent),[100,100,100,100,100,100]);
  assert.equal(original.about,'');assert.deepEqual(companySchema.parse(JSON.parse(JSON.stringify(c))),c);
  c.outcomes![1].baseline='';assert.ok(chapterProgress(c)[0].percent<100);assert.equal(chapterProgress(c)[0].step,1);assert.equal(chapterProgress(c)[4].percent,0);
});
test('starter preserves existing inputs and uses size-based staffing estimates',()=>{
  const base=starterDraft({...defaultCompany(),name:'Example',website:'https://example.org',size:'1,000+'});
  assert.equal(teamSizeEstimate('1,000+'),'30-50 (planning estimate)');assert.equal(teamSizeEstimate('11–50'),'8-10 (planning estimate)');
  assert.ok(base.teams.every(t=>/30-50/.test(t.count)));
  base.teams[0].count='12';base.outcomes![0].baseline='91%';base.brand.tagline='My tagline';
  const next=starterDraft(base);assert.equal(next.teams[0].count,'12');assert.equal(next.outcomes![0].baseline,'91%');assert.equal(next.brand.tagline,'My tagline');
  assert.equal(setupSignature(base),setupSignature({...base,onboardingStep:18,status:'active'}));
});
test('numeric suggestions fill blanks, label estimates and preserve actual values',()=>{
  const c=starterDraft({...defaultCompany(),name:'Example',website:'https://example.org'});c.outcomes![0].baseline='93%';c.outcomes![0].target='';
  const result=checkedSuggestions({suggestions:[{field:'outcomes',value:[{...c.outcomes![0],baseline:'20%',target:'99%'}]},{field:'size',value:'1,000+'}]},['outcomes','size'],c,[]);
  const values=result!.suggestions[0].value as NonNullable<typeof c.outcomes>;
  assert.equal(values[0].baseline,'93%');assert.equal(values[0].target,'99% (planning estimate)');assert.equal(result!.suggestions[1].kind,'proposal');
});
test('fallback isolates credentials across all four services and skips HF unless enabled',async()=>{
  const saved={...process.env},fetch=globalThis.fetch;try{
    process.env.AI_PROVIDER='nvidia';process.env.ONBOARDING_AI_PROVIDERS='nvidia,groq,openrouter,huggingface';
    process.env.NVIDIA_API_KEY='fixture-n';process.env.GROQ_API_KEY='fixture-g';process.env.OPENROUTER_API_KEY='fixture-o';process.env.HUGGINGFACE_API_KEY='fixture-h';process.env.HUGGINGFACE_ENABLED='true';
    const calls:string[]=[];
    globalThis.fetch=async(url,init)=>{const host=new URL(String(url)).hostname;calls.push(host);const key=new Headers(init?.headers).get('authorization');
      if(host==='integrate.api.nvidia.com'){assert.equal(key,'Bearer fixture-n');return new Response('',{status:429});}
      if(host==='api.groq.com'){assert.equal(key,'Bearer fixture-g');return new Response('',{status:403});}
      if(host==='openrouter.ai'){assert.equal(key,'Bearer fixture-o');return completion({wrong:'shape'});}
      assert.equal(key,'Bearer fixture-h');return completion({ok:true});};
    const result=await onboardingObject(input,v=>(v as {ok?:boolean}).ok?v:undefined);
    assert.ok(result.value);assert.match(result.model,/huggingface/);assert.equal(calls.length,4);assert.match(result.warnings.join(' '),/rate limit.*access denied.*usable fields/);
    process.env.HUGGINGFACE_ENABLED='false';assert.equal(onboardingProviders().includes('huggingface'),false);
    assert.equal(process.env.AI_PROVIDER,'nvidia');
  }finally{globalThis.fetch=fetch;envRestore(saved);}
});
test('model refusal stops fallback, while malformed JSON repairs with one configured provider',async()=>{
  const saved={...process.env},fetch=globalThis.fetch;try{
    process.env.ONBOARDING_AI_PROVIDERS='nvidia';process.env.NVIDIA_API_KEY='fixture';
    let calls=0;globalThis.fetch=async()=>{calls++;return calls===1?Response.json({choices:[{finish_reason:'stop',message:{content:'{invalid'}}]}):completion({ok:true});};
    assert.ok((await onboardingObject(input,x=>x)).value);assert.equal(calls,2);
    calls=0;globalThis.fetch=async()=>{calls++;return Response.json({choices:[{finish_reason:'content_filter',message:{refusal:'Declined'}}]});};
    await assert.rejects(onboardingObject(input,x=>x),/declined/);assert.equal(calls,1);
  }finally{globalThis.fetch=fetch;envRestore(saved);}
});
test('empty model output produces an honest usable starter and quickstart checks without external permissions',async()=>{
  const saved={...process.env},fetch=globalThis.fetch;const d=new Database(':memory:');
  const global=globalThis as unknown as {workforceDb?:Database};const previous=global.workforceDb;global.workforceDb=d;
  try{
    process.env.ONBOARDING_AI_PROVIDERS='nvidia';process.env.NVIDIA_API_KEY='fixture';
    const draft={...defaultCompany(),name:'Example',website:'https://example.org',domains:['finance'],size:'1,000+'};
    await d.query("INSERT INTO users(id,email,name,password,created) VALUES('trial','trial@example.org','Trial','unused','now')");
    await d.query('INSERT INTO companies(id,owner_id,data,created) VALUES(?,?,?,?)',['trial','trial',JSON.stringify(draft),'now']);
    globalThis.fetch=async()=>completion({suggestions:[],warnings:[]});
    const result=await suggestOnboarding('trial',{draft,section:4});assert.equal(result.model,'Built-in starter');assert.equal(result.suggestions[0].field,'answers');assert.match(result.suggestions[0].reason,/not.*AI-generated/);
    draft.permissions.external=true;draft.permissions.financial=true;
    const trial=await prepareTrial('trial',{draft});assert.deepEqual(companyGaps(trial.draft),[]);assert.equal(trial.draft.permissions.external,false);assert.equal(trial.draft.permissions.financial,false);
    assert.equal(trial.draft.status,'draft');assert.ok(trial.draft.trialCheck);assert.ok(trial.checkedSteps>0);
  }finally{global.workforceDb=previous;await d.close();globalThis.fetch=fetch;envRestore(saved);}
});
