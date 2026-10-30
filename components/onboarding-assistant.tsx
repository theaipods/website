"use client";
import { useRef, useState, type ReactNode } from 'react';
import { Sparkles, Check, X, RefreshCw, ChevronDown } from 'lucide-react';
import { appendCustomTeams, assistanceFields, validateSuggestion, type AssistanceResult, type OnboardingSuggestion } from '@/lib/onboarding-assistance';
import type { CompanyInput } from '@/lib/workforce';
import { api } from './platform-context';
import { SectionAssistanceContext } from './section-assistance-context';
import { Button, Notice } from './platform-ui';

const label = (s: string) => s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
function ValueEditor({ value, onChange, name }: { value: unknown; onChange: (v: unknown)=>void; name: string }) {
  if (typeof value === 'string') return <textarea aria-label={name} value={value} onChange={e=>onChange(e.target.value)} rows={value.length>100?4:2}/>;
  if (typeof value === 'boolean') return <label><input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)}/>{name}</label>;
  if (Array.isArray(value)) {
    if (value.every(v=>typeof v==='string')) return <textarea aria-label={name} value={value.join('\n')} onChange={e=>onChange(e.target.value.split('\n').filter(Boolean))} rows={4} placeholder="One item per line"/>;
    return <div className="suggestion-fields">{value.map((v,i)=><details key={i}><summary>{(v as {name?:string}).name || `Item ${i+1}`}</summary><ValueEditor value={v} name={`${name} ${i+1}`} onChange={next=>onChange(value.map((old,n)=>n===i?next:old))}/></details>)}</div>;
  }
  if (value && typeof value==='object') return <div className="suggestion-fields">{Object.entries(value).filter(([k])=>!['id','logoId','agentId','accepted'].includes(k)).map(([k,v])=><div key={k}><span>{label(k)}</span>{k==='control'?<select aria-label={`${name} ${k}`} value={String(v)} onChange={e=>onChange({...value,[k]:e.target.value})}>{['AI recommends','Human approves','Human only'].map(c=><option key={c}>{c}</option>)}</select>:<ValueEditor name={`${name} ${label(k)}`} value={v} onChange={next=>onChange({...value,[k]:next})}/>}</div>)}</div>;
  return <span>Not provided</span>;
}
function readable(value: unknown): string {
  if (typeof value === 'string') return value || 'Not provided';
  if (Array.isArray(value)) return value.map(readable).join('\n\n');
  if (value&&typeof value==='object') return Object.entries(value).filter(([k])=>!['id','logoId','agentId','accepted'].includes(k)).map(([k,v])=>`${label(k)}: ${readable(v)}`).join('\n');
  return String(value ?? 'Not provided');
}
export function OnboardingAssistant({ draft, step, prepare, apply, disabled, compact=false, scopeFields, autoApply=false, sectionTitle }: {
  compact?:boolean; scopeFields?:(keyof CompanyInput)[]; autoApply?:boolean; sectionTitle?:string;
  draft: CompanyInput; step: number; prepare: () => Promise<string | undefined>; disabled: boolean;
  apply: (suggestion: OnboardingSuggestion, original: unknown, model: string) => boolean;
}) {
  const [busy,setBusy] = useState(false), [error,setError] = useState('');
  const [result,setResult] = useState<AssistanceResult | null>(null), [instruction,setInstruction] = useState('');
  const [field,setField] = useState(''), [edits,setEdits] = useState<Record<string,unknown>>({});
  const [accepted,setAccepted] = useState<string[]>([]), [rejected,setRejected] = useState<string[]>([]);
  const snapshot = useRef<CompanyInput>(draft), lock = useRef(false);
  const fields = scopeFields || assistanceFields(step);
  async function generate(all = false) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    snapshot.current = structuredClone(draft);
    try {
      const id = await prepare(); if (!id) return;
      const data = await api<AssistanceResult>(`companies/${id}/assist`, 'POST', { draft: snapshot.current, section: all ? 'all' : step, field: all ? undefined : field || undefined, fields:all?undefined:scopeFields, instruction:sectionTitle?`Focus on the section: ${sectionTitle}. Preserve unrelated values and entries. ${instruction}`.slice(0,2000):instruction });
      setResult(data); setAccepted([]); setRejected([]);
      if(autoApply){
        const acceptedFields:string[]=[];
        for(const item of data.suggestions){
          if(item.field==='teams')item.value=appendCustomTeams(snapshot.current.teams,item.value as CompanyInput['teams']);
          if(!validateSuggestion(item.field,item.value,snapshot.current)&&apply(item,snapshot.current[item.field],data.model))acceptedFields.push(item.field);
        }
        setAccepted(acceptedFields);
        if(data.suggestions.length&&!acceptedFields.length)setError('Your information changed during generation. Review the suggestions before accepting.');
      }
      setEdits(Object.fromEntries(data.suggestions.map(s => [s.field, s.value])));
    } catch(e) { setError((e as Error).message); }
    finally { lock.current = false; setBusy(false); }
  }
  function accept(s: OnboardingSuggestion) {
    try {
      const value = edits[s.field];
      const issue = validateSuggestion(s.field,value,draft); if (issue) throw new Error(issue);
      if (!apply({...s,value}, snapshot.current[s.field], result!.model)) throw new Error('This field changed after generation. Regenerate to preserve your latest edits.');
      setAccepted(p=>[...p,s.field]); setError('');
    } catch(e) { setError((e as Error).message); }
  }
  return <section className={`onboarding-assistant ${compact?'assistant-inline':''}`} aria-label="AI onboarding assistant" aria-busy={busy}>
    <div className="assistant-toolbar"><span className="assistant-icon"><Sparkles size={21}/></span><div><strong>{autoApply?'Create custom teams with AI':compact?'Fill this section with AI':'A little help, a head start'}</strong><p>Let AI prepare an editable first draft from your company context.</p></div>
      <Button disabled={busy || disabled || !fields.length} onClick={()=>void generate()}><Sparkles size={16}/>{busy?'Preparing your draft…':fields.length?(autoApply?'Create teams from company context':compact?'Generate suggestions':'Help me fill this step'):'Your decision to make'}</Button>
    </div>
    <details open={compact||undefined}><summary>Customize AI help <ChevronDown size={14}/></summary>
      {fields.length ? <div className="assistant-controls"><label>What should AI help with?<select value={fields.includes(field as keyof CompanyInput)?field:''} onChange={e=>setField(e.target.value)}><option value="">All fields in this section</option>{fields.map(f=><option key={f} value={f}>{label(f)}</option>)}</select></label>
        <label>Additional context<textarea value={instruction} onChange={e=>setInstruction(e.target.value)} maxLength={2000} placeholder="Describe what you want to improve or supply missing facts."/></label>
        <Button disabled={busy || disabled} onClick={()=>void generate()}><Sparkles size={15}/>{result?'Regenerate suggestions':'Suggest this section'}</Button></div> : <p className="assistant-note">This step uses your reviewed configuration. Permissions and activation remain your decisions.</p>}
    </details>
    {!compact&&<details className="assistant-bulk"><summary>Want a draft for the whole setup?</summary><p className="assistant-note">Prepare suggestions across eligible sections. Review each field before accepting; nothing is applied automatically.</p><Button secondary disabled={busy || disabled} onClick={()=>void generate(true)}>Draft complete onboarding</Button></details>}
    {autoApply&&<p className="assistant-note">Create editable team cards using your company profile and indexed knowledge. Optional context can guide the result. Review the created teams, then save your draft.</p>}
    {busy&&<p role="status" className="assistant-working"><RefreshCw size={15}/> Reading company context and preparing a reviewable draft…</p>}
    {error&&<Notice error>{error}</Notice>}
    {result&&<div className="assistant-results" aria-live="polite"><h3>Review your suggestions <small>{result.suggestions.length} fields · {result.model}</small></h3>
      {!result.suggestions.length&&<p>These fields already have values. Describe the changes you want in Additional context, or edit the fields directly.</p>}
      {result.suggestions.map(s=>{
        const done = accepted.includes(s.field), dismissed = rejected.includes(s.field);
        const changed = !done && JSON.stringify(draft[s.field]) !== JSON.stringify(snapshot.current[s.field]);
        return <details className="assistant-suggestion" key={s.field} open={!done&&!dismissed}><summary>{label(s.field)}<span>{done?'Accepted · save to keep':dismissed?'Rejected':changed?'Your value changed':s.kind==='evidence'?'Evidence-backed · review':'Proposed · review required'}</span></summary>
          <p>{s.reason}</p><small>Sources: {s.sources.join(', ') || 'Model proposal; confirm with your team'}</small>
          <div className="suggestion-comparison"><div><b>Current value</b><pre>{readable(draft[s.field])}</pre></div><div><b>Proposed value · editable</b><ValueEditor name={`Proposed ${label(s.field)}`} value={edits[s.field]} onChange={value=>setEdits(p=>({...p,[s.field]:value}))}/></div></div>
          <div className="assistant-actions"><Button disabled={done||dismissed||changed||disabled} onClick={()=>accept(s)}><Check size={14}/>Accept field</Button><Button secondary disabled={done||dismissed} onClick={()=>setRejected(p=>[...p,s.field])}><X size={14}/>Reject</Button></div>
        </details>;
      })}
      {result.warnings.length>0&&<details><summary>Missing context and validation notes ({result.warnings.length})</summary><ul>{result.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul></details>}
    </div>}
  </section>;
}

type AssistanceProps=Parameters<typeof OnboardingAssistant>[0];
const sectionFields:Record<string,(keyof CompanyInput)[]>={
 'Company essentials':['name','industry','size','businessModel','geography','products','about'],
 'Choose your business goals':['goals'], 'Make the outcomes measurable':['outcomes'],
 'Start with a common team':['teams'], 'Which departments should we map?':['domains'],
};
export function SectionHelp({title,...props}:AssistanceProps&{title:ReactNode}){
 const [open,setOpen]=useState(false);
 const fields=String(title).startsWith('Outcome:')?['outcomes'] as (keyof CompanyInput)[]:sectionFields[String(title)]||assistanceFields(props.step);
 if(!fields.length||title==='Three ingredients. One complete picture.'||title==='Logo & brand assets')return null;
 return <div className="section-ai-control"><button type="button" className="section-ai-button" aria-expanded={open} onClick={()=>setOpen(!open)}><Sparkles size={15}/>Fill with AI</button>{open&&<div className="section-ai-panel"><OnboardingAssistant {...props} compact scopeFields={fields} sectionTitle={String(title)}/></div>}</div>;
}
export function OnboardingHelpProvider({children,...props}:AssistanceProps&{children:ReactNode}){
 return <SectionAssistanceContext.Provider value={title=><SectionHelp key={`${props.step}:${String(title)}`} {...props} title={title}/>}>{children}</SectionAssistanceContext.Provider>;
}
