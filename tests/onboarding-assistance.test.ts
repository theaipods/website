import test from 'node:test';
import assert from 'node:assert/strict';
import { appendCustomTeams, assistanceFields, brandTextColor, mergeSavedDraft, validateSuggestion } from '../lib/onboarding-assistance';
import { companySchema, defaultCompany, companyGaps } from '../lib/workforce';
import { companyOutcomes, withOutcomes, outcomesComplete } from '../lib/company-outcomes';
import { starterProcess } from '../lib/onboarding-options';
import { extractPage } from '../lib/server/website-research';

test('assistance cannot grant permissions, activate or supply unlabeled headcounts',()=>{
  const c=defaultCompany();
  for(const field of ['permissions','status','baseline','target','size','__proto__']) assert.ok(validateSuggestion(field,{},c));
  assert.ok(validateSuggestion('teams',[{id:'sales',name:'Sales',count:'25',lead:'',people:'',responsibilities:'',outputs:''}],c));
  assert.deepEqual(assistanceFields(12),[]);
  assert.equal(validateSuggestion('about','Company description',c),undefined);
  assert.equal(validateSuggestion('size','1,000+ (planning estimate)',c),undefined);
  assert.equal(validateSuggestion('teams',[{id:'sales',name:'Sales',count:'30-50 (planning estimate)',lead:'',people:'',responsibilities:'',outputs:''}],c),undefined);
});
test('review preserves human-only checkpoints and rejects unselected recommendations',()=>{
  const c=defaultCompany();c.domains=['finance'];c.processes.finance=starterProcess('finance');
  c.processes.finance[0].control='Human only';
  const next=structuredClone(c.processes);next.finance[0].control='AI recommends';
  assert.match(validateSuggestion('processes',next,c)!,/Human-only/);
  assert.match(validateSuggestion('processes',{},c)!,/Human-only/);
  assert.match(validateSuggestion('recommendedPods',['marketing'],c)!,/selected/);
  assert.equal(validateSuggestion('processes',c.processes,c),undefined);
});
test('save response preserves edits made while saving and retains persisted metadata',()=>{
  const submitted=defaultCompany();submitted.name='Acme';
  const current={...submitted,about:'New edit while saving'};
  const persisted={...submitted,onboardingStep:3,assistanceHistory:[]};
  const result=mergeSavedDraft(current,submitted,persisted);
  assert.equal(result.about,current.about);assert.equal(result.onboardingStep,3);
  assert.deepEqual(result.assistanceHistory,[]);
});

test('multiple outcomes survive schema persistence and readiness checks every outcome',()=>{
 const old={...defaultCompany(),name:'Example',metric:'Revenue',baseline:'100',target:'120',timeframe:'90 days'};
 assert.equal(companyOutcomes(old)[0].metric,'Revenue');
 const first=companyOutcomes(old)[0];
 const multiple=withOutcomes(old,[first,{id:'second',metric:'Retention',baseline:'80%',target:'85%',timeframe:'6 months'}]);
 const saved=companySchema.parse(JSON.parse(JSON.stringify(multiple)));
 assert.equal(companyOutcomes(saved).length,2);assert.equal(saved.metric,'Revenue');assert.ok(outcomesComplete(saved));
 saved.outcomes![1].baseline='';assert.equal(outcomesComplete(saved),false);
 assert.ok(companyGaps(saved).some(g=>g==='Outcomes: Retention - baseline'));
 assert.equal(withOutcomes(saved,[]).metric,'');assert.deepEqual(companyOutcomes(withOutcomes(saved,[])),[]);
 assert.match(validateSuggestion('outcomes',[{...first,baseline:'Invented 900'}],old)!,/baselines/);
 assert.equal(validateSuggestion('outcomes',[first,{id:'new',metric:'Satisfaction',baseline:'',target:'',timeframe:'90 days'}],old),undefined);
});

test('custom team creation appends distinct teams without replacing edited teams',()=>{
 const team={id:'sales',name:'Sales',lead:'Actual lead',count:'5',people:'',responsibilities:'My edits',outputs:''};
 const added={...team,id:'returns',name:'Returns operations',count:'',lead:''};
 const result=appendCustomTeams([team],[{...team,responsibilities:'AI rewrite'},{...added,id:'copy',name:' SALES '},added]);
 assert.deepEqual(result,[team,added]);
 assert.ok(validateSuggestion('teams',[added,added],defaultCompany()));
});
test('brand extraction records source and method without importing remote logos',()=>{
  assert.equal(brandTextColor('#ffffff'),'#000000');assert.equal(brandTextColor('#000000'),'#ffffff');
  const p=extractPage('<html><head><meta name="theme-color" content="#3459a6"><style>body{font-family:Satoshi,sans-serif;--brand-accent:#a94f35}</style></head><body><img alt="Acme logo" src="/logo.svg"><p>Company description</p></body></html>','https://example.com');
  assert.equal(p.brand.find(b=>b.field==='primary')?.value,'#3459a6');
  assert.equal(p.brand.find(b=>b.field==='typography')?.value,'Satoshi,sans-serif');
  assert.equal(p.brand.find(b=>b.field==='logo')?.value,'https://example.com/logo.svg');
  assert.ok(p.brand.every(b=>b.source==='https://example.com'&&b.method));
});
