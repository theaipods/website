'use client';
import {useEffect,useRef,useState} from 'react';
import {Sparkles,ArrowRight,WandSparkles} from 'lucide-react';
import type {Business,CompanyInput} from '@/lib/workforce';
import type {ResearchJob} from '@/lib/research-types';
import {setupSignature} from '@/lib/onboarding-starter';
import {prefillResearch,researchHost} from '@/lib/research-state';
import type {ResearchController} from './use-company-research';
import {api} from './platform-context';
import {Button,Notice} from './platform-ui';

type Props={visible:boolean;disabled:boolean;research:ResearchController;getDraft:()=>CompanyInput;prepare:()=>Promise<Business|undefined>;apply:(draft:CompanyInput)=>Promise<boolean>};
export function OnboardingQuickstart(props:Props) {
  const latest=useRef(props);latest.current=props;
  const mounted=useRef(true),lock=useRef(false);
  const [stage,setStage]=useState(''),[error,setError]=useState(''),[done,setDone]=useState('');
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  async function start() {
    if(lock.current)return;lock.current=true;setError('');setDone('');setStage('Saving your website');
    try {
      const website=latest.current.getDraft().website;
      const url=new URL(/^https?:/i.test(website)?website:'https://'+website);
      if(!url.hostname.includes('.'))throw new Error('Enter a valid company website first.');
      const company=await latest.current.prepare();
      if(!company)throw new Error('Save your latest changes before preparing the trial.');
      let draft=latest.current.getDraft();
      const research=latest.current.research;
      if(researchHost(research.report?.website||'')!==researchHost(website)) {
        setStage('Reading your website and storing company context');
        let job=research.running&&research.sameWebsite(website)?research.job:await research.start(company,async()=>company.id,{mode:'auto',render:true,maxPages:6,extraUrls:[]});
        if(!job)throw new Error('Website research could not start. Check its status and retry.');
        const expected=job.id,deadline=Date.now()+360000;
        while(job.status==='queued'||job.status==='running') {
          if(!mounted.current)return;
          if(Date.now()>deadline)throw new Error('Research is still running on the server. Return to Fill all when it finishes.');
          await new Promise(r=>setTimeout(r,2000));
          const polled:ResearchJob|null=await api('companies/'+company.id+'/research/status');
          if(!polled||polled.id!==expected)throw new Error('Another research request replaced this one. Retry with the latest website.');
          job=polled;setStage(job.stage||'Reading company context');
        }
        draft=latest.current.getDraft();
        if(job.report)draft=prefillResearch(draft,{...draft,...job.input.snapshot},job.report);
      }
      if(!mounted.current)return;
      if(researchHost(latest.current.getDraft().website)!==researchHost(website))throw new Error('The website changed. Run Fill all for the new website.');
      const snapshot=setupSignature(latest.current.getDraft());
      setStage('Preparing six chapters, estimates and process checks');
      const result=await api<{draft:CompanyInput;model:string;warnings:string[];checkedSteps:number}>('companies/'+company.id+'/quickstart','POST',{draft});
      if(!mounted.current)return;
      if(setupSignature(latest.current.getDraft())!==snapshot)throw new Error('Your fields changed during generation. Your edits are safe; run Fill all again to use them.');
      setStage('Saving your trial setup');
      if(await latest.current.apply(result.draft))setDone(`${result.checkedSteps} process steps checked locally. Trial setup saved. ${result.model}. Estimates and example answers are editable; no external work ran.`);
    }catch(e){if(mounted.current)setError((e as Error).message);}
    finally{lock.current=false;if(mounted.current)setStage('');}
  }
  return <>{props.visible&&<section className="quickstart-card"><span className="quickstart-mark"><WandSparkles size={26}/></span><div><span className="studio-tag">QUICK START</span><h2>One website. A complete starting point.</h2><p>Fill all six chapters, check the process, and activate a draft-only trial. Existing answers are kept. Missing facts use labeled examples; tools stay unconnected.</p></div><Button disabled={props.disabled||!!stage||!props.getDraft().website.trim()} onClick={()=>void start()}><Sparkles size={17}/>{stage?'Preparing…':'Fill all with AI'}<ArrowRight size={16}/></Button></section>}{stage&&<div className="quickstart-progress" role="status"><Sparkles size={18}/><span>{stage}<small>You can browse the chapters while we prepare your setup.</small></span></div>}{error&&<Notice error>{error}</Notice>}{done&&<Notice>{done}</Notice>}</>;
}
