import {companySchema,companyGaps,domains,interview,type CompanyInput} from './workforce';
import {companyOutcomes,withOutcomes} from './company-outcomes';
import {exampleAnswers,starterProcess,teamTemplates,metricOptions,ruleTemplates} from './onboarding-options';

const present=(v:unknown)=>typeof v==='string'&&!!v.trim();
const example=(v:string)=>`${v} (planning estimate)`;
export function teamSizeEstimate(size:string) {
  if(/1,?000\+|multinational|MNC|enterprise/i.test(size))return example('30-50');
  if(/201|51[–-]/.test(size))return example('15-20');
  return example('8-10');
}
export function metricEstimate(metric:string) {
  const m=metric.toLowerCase();
  const values=/satisfaction|csat/.test(m)?['75%','85%']:/acquisition|cost/.test(m)?['100 cost units per acquisition','80 cost units per acquisition']:/release frequency/.test(m)?['2 releases per month','4 releases per month']:/time|hours|days/.test(m)?['10 hours per request','8 hours per request']:/rate|coverage|accuracy|availability|retention/.test(m)?['80%','90%']:['100 units per month','120 units per month'];
  return {baseline:example(values[0]),target:example(values[1]),timeframe:'90 days'};
}
// Every generated gap is an editable planning example, never an assertion about the business.
export function starterDraft(input:CompanyInput):CompanyInput {
  let c=structuredClone(input);
  const context=[c.industry,c.about,c.products,c.website].join(' ');
  const commerce=/retail|commerce|marketplace|flipkart|amazon/i.test(context);
  let host='Your company';try{host=new URL(/^https?:/i.test(c.website)?c.website:`https://${c.website}`).hostname.replace(/^www\./,'');}catch{}
  c.name ||= host;
  c.industry ||= commerce?'Retail & E-commerce':'Professional Services (trial assumption)';
  c.businessModel ||= commerce?'E-commerce':'Professional services (trial assumption)';
  c.geography ||= 'Global (trial scope, confirm actual markets)';
  c.products ||= commerce?'Trial scope: product discovery, order support and customer service.':'Trial scope: customer requests, service delivery and operational reporting.';
  c.about ||= `Trial workspace for ${c.name}. Explore how an AI workforce can triage requests, prepare useful drafts and coordinate human review. This example is not a verified company description.`;
  c.size = !c.size||c.size==='Prefer to confirm later'?example(/multinational|MNC|global enterprise/i.test(context)?'1,000+':'11-50'):c.size;
  c.goals=c.goals.length?c.goals:['Improve customer experience','Reduce operational workload'];
  const selected=companyOutcomes(c);
  c=withOutcomes(c,(selected.length?selected:c.goals.slice(0,3).map((g,i)=>({id:`trial-outcome-${i}`,metric:metricOptions[g]?.[0]||'Quality acceptance rate',baseline:'',target:'',timeframe:''}))).map(o=>{
    const metric=o.metric||'Quality acceptance rate', estimate=metricEstimate(metric);
    return {...o,metric,baseline:o.baseline||estimate.baseline,target:o.target||estimate.target,timeframe:o.timeframe||estimate.timeframe};
  }));
  c.domains=c.domains.length?c.domains:c.teams.filter(t=>domains.some(d=>d.id===t.id)).map(t=>t.id);
  if(!c.domains.length)c.domains=commerce?['support','marketing','ops']:['ops','success'];
  c.discovery=['Interview','Existing tools','SOPs / documents'];
  const teams=c.teams.length?c.teams:c.domains.map(id=>teamTemplates.find(t=>t.id===id)||{id,name:domains.find(d=>d.id===id)!.name,lead:'Department lead',count:'',people:'Process owner, reviewer',responsibilities:'Coordinate requests and review',outputs:'Reviewed work and handoff'});
  c.teams=teams.map(t=>({...t,name:t.name||'Custom team',count:t.count||teamSizeEstimate(c.size),lead:t.lead||'Department lead (proposed role)',people:t.people||'Process owner, specialist, reviewer',responsibilities:t.responsibilities||'Triage requests, prepare drafts, escalate exceptions',outputs:t.outputs||'Reviewed deliverables and progress reports'}));
  for(const id of c.domains) {
    const sample=exampleAnswers(id);
    // Avoid inheriting the marketing template's unrelated audience/location example.
    for(const q of domains.find(d=>d.id===id)!.questions)sample[q.id]=`Trial proposal for ${c.name}: ${q.label} Use the approved company brief and selected knowledge; the department lead confirms the details before live use.`;
    c.answers[id]={...Object.fromEntries(Object.entries(sample).map(([key,v])=>[key,`Trial proposal: ${v}`])),...Object.fromEntries(Object.entries(c.answers[id]||{}).filter(([,v])=>present(v)))};
    const existing=c.processes[id]?.length?c.processes[id]:starterProcess(id,c.answers[id]);
    c.processes[id]=existing.map((p,i)=>({...p,name:p.name||`Prepare step ${i+1}`,owner:p.owner||c.answers[id].people,approver:p.approver||c.answers[id].approver,support:p.support||'Assigned specialist (proposed)',tools:p.tools||'Company knowledge and draft workspace',output:p.output||'Draft with sources and review notes',duration:!p.duration||p.duration==='To confirm'?example('30 minutes'):p.duration}));
    if(!input.processes[id]?.length&&!c.processes[id].some(p=>p.control.startsWith('Human')))c.processes[id][c.processes[id].length-1].control='Human approves';
  }
  // This records a starter inventory only. It never connects an external account.
  if(!c.tools.length&&!c.noExistingTools)c.tools=['Internal draft workspace (trial)'];
  c.processDocumentation ||= `TRIAL SOP - review before live use\nCompany: ${c.name}\n${c.domains.map(id=>`${domains.find(d=>d.id===id)!.name}:\n${c.processes[id].map(p=>p.name).join(' > ')}. Use the owners, review checkpoints and outputs in the process blueprint.`).join('\n')}\nExceptions: pause and ask the department lead. No external actions.`;
  c.brand={...c.brand,tagline:c.brand.tagline||'Useful work, thoughtfully coordinated.',tone:c.brand.tone||'Clear & professional',typography:c.brand.typography||'Satoshi',always:c.brand.always||'Cite sources; label assumptions; request review before publishing.',never:c.brand.never||'Never invent verified claims, share secrets or publish without approval.'};
  c.rules=(c.rules.length?c.rules:ruleTemplates.filter(r=>['Approval','Privacy','Quality'].includes(r.category)).map((r,i)=>({...r,id:`trial-rule-${i}`}))).map(r=>({...r,category:r.category||'Review',instruction:r.instruction||'Ask the owner before consequential actions.',applies:r.applies||'All departments',exception:r.exception||'None'}));
  c.recommendedPods=c.recommendedPods.filter(id=>c.domains.includes(id));if(!c.recommendedPods.length)c.recommendedPods=[...c.domains];
  return companySchema.parse(c);
}

// Completion is derived from values, not time spent on a tab. Signature invalidates
// rehearsal after any operating-context edit; it is a UI freshness marker, not auth.
export function setupSignature(c:CompanyInput) {
  const {status,onboardingStep,assistanceHistory,trialCheck,...config}=c;void status;void onboardingStep;void assistanceHistory;void trialCheck;
  const stable=(v:unknown):unknown=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,val])=>[k,stable(val)])):v;
  const text=JSON.stringify(stable(config));let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);
  return `${text.length}-${(h>>>0).toString(16)}`;
}
export function checkTrial(c:CompanyInput) {
  const missing=companyGaps(c); const steps=c.domains.flatMap(id=>c.processes[id]||[]);
  return {ready:!missing.length&&!!steps.length&&steps.every(p=>present(p.output)&&present(p.approver)),missing,steps:steps.length,signature:setupSignature(c)};
}
export function chapterProgress(c:CompanyInput,documents=0) {
  const checks:{step:number;label:string;done:boolean}[]=[];
  const add=(step:number,label:string,done:unknown)=>checks.push({step,label,done:!!done});
  for(const k of ['name','website','industry','size','businessModel','geography','products','about'] as const)add(0,k,present(c[k]));
  add(1,'Business goals',c.goals.length);add(1,'Choose an outcome',companyOutcomes(c).length);
  companyOutcomes(c).forEach(o=>{for(const k of ['metric','baseline','target','timeframe'] as const)add(1,`${o.metric||'Outcome'}: ${k}`,present(o[k]));});
  add(2,'Choose teams',c.teams.length);c.teams.forEach(t=>{for(const k of ['name','lead','count','people','responsibilities','outputs'] as const)add(2,`${t.name||'Team'}: ${k}`,present(t[k]));});
  add(3,'Select departments',c.domains.length);add(3,'Discovery methods',c.discovery.length===3);
  c.domains.forEach(id=>{
    [...interview,...domains.find(d=>d.id===id)!.questions].forEach(q=>add(4,`${id}: ${q.label}`,present(c.answers[id]?.[q.id])));
    add(5,`${id}: process steps`,c.processes[id]?.length);
    (c.processes[id]||[]).forEach(p=>{for(const k of ['name','tools','output','duration'] as const)add(5,`${p.name}: ${k}`,present(p[k]));for(const k of ['owner','support','approver'] as const)add(6,`${p.name}: ${k}`,present(p[k]));});
  });
  add(7,'Tool inventory',c.tools.length||c.noExistingTools);add(8,'Process knowledge',documents||present(c.processDocumentation));
  for(const k of ['tagline','tone','typography','always','never'] as const)add(9,`Brand ${k}`,present(c.brand[k]));
  add(10,'Review rules',c.rules.length&&c.rules.every(r=>present(r.instruction)&&present(r.applies)&&present(r.exception)));
  add(11,'Decision checkpoints',c.domains.length&&c.domains.every(id=>c.processes[id]?.length&&c.processes[id].some(p=>p.control.startsWith('Human'))));
  add(12,'Permission boundaries',Object.values(c.permissions).every(v=>typeof v==='boolean'));
  add(13,'AI opportunities',c.domains.length&&c.domains.every(id=>c.processes[id]?.length));
  add(14,'Select starter pods',c.recommendedPods.length&&c.recommendedPods.every(id=>c.domains.includes(id)));
  add(15,'Run local process check',c.trialCheck?.signature===setupSignature(c)&&checkTrial(c).ready);
  add(16,'Resolve readiness gaps',!companyGaps(c,documents).length);add(17,'Prepare business blueprint',c.domains.length&&c.teams.length&&present(c.about));add(18,'Activate company setup',c.status==='active'&&!companyGaps(c,documents).length);
  return [[0,2],[3,6],[7,9],[10,14],[15,15],[16,18]].map(([start,end])=>{
    const items=checks.filter(c=>c.step>=start&&c.step<=end);const missing=items.filter(c=>!c.done);
    return {percent:Math.floor((items.length-missing.length)/items.length*100),missing,step:missing[0]?.step??start};
  });
}
