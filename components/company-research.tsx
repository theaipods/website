"use client";
import {useState} from 'react';
import {Globe2,ScanSearch,ArrowUpRight,CheckCircle2,Database,FileSearch,Sparkles} from 'lucide-react';
import type {CompanyInput} from '@/lib/workforce';
import type {ResearchController} from './use-company-research';
import {researchHost} from '@/lib/research-state';
import {Button,Field,Notice} from './platform-ui';
const labels:Record<string,string>={name:'Company',about:'Company overview',products:'Products & services',industry:'Industry',size:'Company size',businessModel:'Business model',geography:'Primary geography'};

export function CompanyResearch({company,prepare,websiteChange,research}:{company:CompanyInput;prepare:()=>Promise<string|undefined>;websiteChange:(v:string)=>void;research:ResearchController}){
 const [extra,setExtra]=useState(''),[mode,setMode]=useState('auto'),[render,setRender]=useState(true),[limit,setLimit]=useState('15');
 const {report,job,running,error}=research;
 const matching=report&&researchHost(report.website)===researchHost(company.website);
 const pages=report?.sources.filter(s=>s.status==='Stored'&&!s.snippet).length||0;
 const snippets=report?.sources.filter(s=>s.status==='Stored'&&s.snippet).length||0;
 const noProfile=matching&&!report.suggestions.length;
 const analyze=()=>research.start(company,prepare,{mode,render,maxPages:Number(limit),extraUrls:extra.split('\n').map(s=>s.trim()).filter(Boolean)});
 return <div className="research-box research-studio">
  <div className="research-intro"><span className="research-glyph"><Globe2 size={24}/></span><div><b>Your website. A head start.</b><p>We gather sources, build your company profile and save the knowledge for your workforce.</p></div><span className="studio-tag">AI-assisted setup</span></div>
  <div className="research-input"><Field label="Website" value={company.website} onChange={websiteChange}/><Button disabled={!company.website.trim()||(running&&research.sameWebsite(company.website))} onClick={()=>void analyze()}><ScanSearch size={17}/>{running&&research.sameWebsite(company.website)?'Research in progress':'Analyze website'}</Button></div>
  <details className="research-settings"><summary>Sources & research settings</summary><div className="wf-grid mt-4"><label className="wf-field">Crawler<select value={mode} onChange={e=>setMode(e.target.value)}><option value="auto">Automatic</option><option value="free">Free crawler</option><option value="api">Firecrawl API</option></select></label><Field label="Maximum pages" value={limit} onChange={setLimit} options={['5','15','30']}/></div><Field label="Additional company sources" area value={extra} onChange={setExtra} hint="Public company profiles, one URL per line."/><label className="wf-check"><input type="checkbox" checked={render} onChange={e=>setRender(e.target.checked)}/>Render JavaScript pages when needed</label><p>Official pages and search discovery run together. Access restrictions are respected; matched third-party sources are labeled for review.</p></details>
  {error&&<Notice error>{error}</Notice>}
  {running&&<div className="research-run" role="status"><div className="research-run-heading"><span className="research-pulse"/><b>{job?.stage||'Preparing your research'}</b><small>{job?.completed||0} sources checked</small></div><div className="research-run-track"><span/></div><div className="research-run-steps"><span><FileSearch size={18}/>Find evidence</span><span><Sparkles size={18}/>Build profile</span><span><Database size={18}/>Remember it</span></div><p>You can move to any chapter or leave this page. Your research continues on the server.</p>{job?.status==='queued'&&Date.now()-Date.parse(job.created)>20000&&<p>Waiting for the background worker. Start both the web app and worker with npm run dev.</p>}</div>}
  {report&&matching&&!running&&<section className="research-result">
   <header><div><span className="research-result-eyebrow">COMPANY INTELLIGENCE</span><h3>{report.suggestions.find(s=>s.field==='name')?.value||researchHost(report.website)}</h3><p>{noProfile?'We need more accessible company evidence.':'Supported details are prefilled where possible. Your newer edits are kept. Review the form below.'}</p></div><CheckCircle2 size={28}/></header>
   <div className="research-result-stats"><span><b>{pages}</b>Pages read</span><span><b>{snippets}</b>Search excerpts</span><span><b>{report.suggestions.length}</b>Profile fields</span><span><b>{report.index?.indexed||0}</b>Indexed chunks</span></div>
   {noProfile&&<Notice error>{report.sources.find(s=>s.status!=='Stored')?.status||'No reliable fields found.'} Upload documents in Knowledge or enter the details below.</Notice>}
   <div className="research-profile-grid">{report.suggestions.map(item=><article key={item.field} className={item.field==='about'||item.field==='products'?'wide':''}><span>{labels[item.field]}</span><p>{item.value}</p><details><summary>Evidence & source <ArrowUpRight size={12}/></summary>{item.evidence&&<blockquote>{item.evidence}</blockquote>}<a href={item.source} target="_blank" rel="noreferrer">Open source</a><small>{report.sources.find(s=>s.url===item.source)?.kind==='directory'?'Third-party evidence · verify before relying on it':'Official website evidence'}</small></details></article>)}</div>
   <details className="research-diagnostics"><summary>Research details & coverage</summary><p>{report.analysis?.detail||'Extraction-only report.'}</p><p>{report.index?.detail||'This older report has no semantic index status.'}</p>{report.sources.map((s,i)=><div className="research-source" key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title||s.url}</a><small>{s.provider} · {s.snippet?'Search excerpt':s.kind} · {s.status}</small></div>)}{report.warnings.map((w,i)=><p key={i}>{w}</p>)}</details>
  </section>}
  {report&&!matching&&!running&&<Notice>The previous report belongs to {researchHost(report.website)}. Analyze this website to build its own profile.</Notice>}
 </div>;
}
