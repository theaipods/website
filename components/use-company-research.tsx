"use client";
import {useEffect,useRef,useState} from 'react';
import type {CompanyInput} from '@/lib/workforce';
import type {ResearchJob,ResearchReport} from '@/lib/research-types';
import {api} from './platform-context';
import {researchHost} from '@/lib/research-state';

export function useCompanyResearch(companyId:string|undefined,onComplete:(report:ResearchReport,snapshot:Record<string,string>)=>void){
 const [job,setJob]=useState<ResearchJob|null>(null),[report,setReport]=useState<ResearchReport|null>(null),[starting,setStarting]=useState(false),[error,setError]=useState('');
 const complete=useRef(onComplete);complete.current=onComplete;
 const applied=useRef(new Set<string>());
 useEffect(()=>{let disposed=false;setJob(null);setReport(null);setError('');if(companyId)void api<ResearchReport|null>(`companies/${companyId}/research`).then(report=>{if(!disposed)setReport(report);}).catch(()=>{});return()=>{disposed=true;};},[companyId]);
 useEffect(()=>{
  if(!companyId)return;let disposed=false;let timer:ReturnType<typeof setTimeout>;
  const poll=async()=>{try{const next=await api<ResearchJob|null>(`companies/${companyId}/research/status`);if(disposed)return;setJob(next);setError('');if(next?.report){setReport(next.report);if(!applied.current.has(next.id)){applied.current.add(next.id);complete.current(next.report,next.input.snapshot||{});}}if(next?.status==='failed')setError(next.error);if(!next||next.status==='queued'||next.status==='running')timer=setTimeout(poll,2000);}catch{if(!disposed){setError('Connection interrupted. Research continues on the server; reconnecting…');timer=setTimeout(poll,4000);}}};
  void poll();return()=>{disposed=true;clearTimeout(timer);};
 },[companyId,job?.id]);
 async function start(company:CompanyInput,prepare:()=>Promise<string|undefined>,options:{mode:string;render:boolean;maxPages:number;extraUrls:string[]}){
  setStarting(true);setError('');
  try{const id=await prepare();if(!id)return;const next=await api<ResearchJob>(`companies/${id}/research`,'POST',{website:company.website,...options});setJob(next);setReport(null);return next;}
  catch(e){setError((e as Error).message);}finally{setStarting(false);}
 }
 const running=starting||job?.status==='queued'||job?.status==='running';
 return {job,report,error,running,starting,start,sameWebsite:(website:string)=>researchHost(job?.website||'')===researchHost(website)};
}
export type ResearchController=ReturnType<typeof useCompanyResearch>;

export function ResearchActivity({research,open}:{research:ResearchController;open:()=>void}){
 if(!research.running)return null;
 const job=research.job;
 return <button className="research-activity" onClick={open}><span className="research-pulse"/><span><b>{job?.stage||'Starting company research'}</b><small>{job?researchHost(job.website):'Saving your company'} · Continue setting up while we research</small></span><span>{job?.completed||0} sources checked →</span></button>;
}
