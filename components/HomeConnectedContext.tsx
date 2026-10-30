"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, FileText, Layers3, LockKeyhole, Pause, Play, RotateCcw, ShieldCheck } from "lucide-react";
import { ToolLogo } from "@/components/tool-logo";
import "@/app/home-connected-context.css";

const examples = [
  {
    label: "Customer handoff", objective: "Prepare Northstar’s customer handoff.", title: "Northstar / Handoff brief", owner: "Customer Success", next: "Confirm the kickoff date with the account owner.",
    sources: [
      { tool: "Google Drive", title: "Kickoff notes", detail: "Goals & success criteria", excerpt: "Northstar wants one shared onboarding checklist. The initial rollout covers the customer success team; confirm the kickoff date before sharing a timeline.", result: "Start with the customer success team.", tag: "Rollout scope" },
      { tool: "Notion", title: "Onboarding playbook", detail: "Approved team process", excerpt: "Assign an account owner, confirm the rollout scope, and prepare the kickoff checklist. External communication requires the account owner’s review.", result: "Assign an owner and prepare the kickoff checklist.", tag: "Next steps" },
      { tool: "Slack", title: "#northstar-handoff", detail: "Selected thread only", excerpt: "The account owner is Maya. She will confirm the kickoff date. Keep the customer welcome message as a draft until she has reviewed it.", result: "Maya reviews the welcome draft before it is sent.", tag: "Review owner" },
    ],
  },
  {
    label: "Launch brief", objective: "Bring the Morrow launch brief together.", title: "Morrow / Launch context", owner: "Marketing", next: "Ask the product owner to confirm specifications and approve the creative.",
    sources: [
      { tool: "Google Drive", title: "Product brief", detail: "Supplied concept details", excerpt: "Morrow Focus Notebook: A5 format, dot-grid pages, linen cover. Introduce the product and invite visitors to explore. Price and availability still need confirmation.", result: "Lead with the A5 notebook and dot-grid pages.", tag: "Product facts" },
      { tool: "Notion", title: "Brand voice", detail: "Messaging guidelines", excerpt: "Use calm, concrete language. Give one idea room to breathe. Do not make unsupported productivity claims or manufacture urgency.", result: "Use a calm message without productivity promises.", tag: "Voice & boundaries" },
      { tool: "Slack", title: "#morrow-launch", detail: "Selected thread only", excerpt: "Prepare the portrait ad and launch copy for the product owner. Nothing should be published until specifications, imagery, and the destination URL are approved.", result: "Prepare ad and copy for product-owner approval.", tag: "Approval checkpoint" },
    ],
  },
];
const steps = [
  { title: "Find the context", detail: "Three relevant sources, selected for one objective." },
  { title: "Check the scope", detail: "Use selected documents and a single thread. Keep external actions out of scope." },
  { title: "Bring it together", detail: "Turn separate details into one brief, with a source beside every point." },
  { title: "Ready for review", detail: "Your workforce has the context. A person decides what happens next." },
];

export function HomeConnectedContext({ motion }: { motion: boolean }) {
  const [example, setExample] = useState(0);
  const [step, setStep] = useState(0);
  const [source, setSource] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const data = examples[example];
  const running = motion && visible && playing && step < 3;
  const selectStep = (index: number) => { elapsed.current = 0; setStep(index); setPlaying(false); };
  const inspectSource = (index: number) => { setSource(index); setPlaying(false); };
  const replay = () => { elapsed.current = 0; setStep(0); setPlaying(true); };

  useEffect(() => {
    if (!board.current) return;
    let inView = false;
    const sync = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting && entry.intersectionRatio >= .3; sync(); }, { threshold: .3 });
    observer.observe(board.current.querySelector(".hcc-result") ?? board.current); document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last !== null) elapsed.current += now - last;
      last = now;
      if (elapsed.current >= [1700, 1800, 1900][step]) { elapsed.current = 0; setStep(value => value + 1); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, step]);

  return <section className="hm-section hcc" id="platform" aria-labelledby="hcc-title" data-step={step} data-running={running}>
    <div className="hm-shell">
      <div className="hcc-heading"><div><span className="hcc-eyebrow"><i/> EVERYTHING CONNECTED</span><h2 id="hcc-title">Everything the pod<br/><em>needs to work.</em></h2></div><div><p>Your tools hold the details.<br/>Give your workforce the context to use them well.</p><Link href="/integrations">Explore integrations & MCP <ArrowUpRight size={17}/></Link></div></div>
      <div ref={board} className="hcc-board">
        <div className="hcc-command"><div><span className="hcc-objective-icon"><Layers3 size={20}/></span><div><small>ONE OBJECTIVE</small><strong>{data.objective}</strong></div></div><div className="hcc-scenarios" role="group" aria-label="Context examples">{examples.map((item,index) => <button type="button" key={item.label} aria-pressed={example === index} onClick={() => { setExample(index); setSource(0); elapsed.current = 0; setStep(0); setPlaying(true); }}>{item.label}</button>)}</div></div>
        <div className="hcc-workspace">
          <div className="hcc-sources"><div className="hcc-column-label"><span>01 / YOUR SOURCES</span><small>3 selected</small></div><div className="hcc-source-list">{data.sources.map((item,index) => <button type="button" key={item.title} aria-pressed={source === index} aria-label={`Inspect ${item.tool}: ${item.title}`} aria-controls="hcc-source-preview" onClick={() => inspectSource(index)}><span className="hcc-tool"><ToolLogo name={item.tool} size={24}/></span><span><b>{item.title}</b><small>{item.tool} · {item.detail}</small></span><ChevronRight size={15}/></button>)}</div><div id="hcc-source-preview" aria-live="polite" className="hcc-excerpt" key={`${example}-${source}`}><span><FileText size={13}/> SOURCE PREVIEW</span><p>“{data.sources[source].excerpt}”</p><small>Authored example · no account connected</small></div></div>
          <div className="hcc-boundary"><div className="hcc-column-label"><span>02 / DEFINED ACCESS</span></div><div className="hcc-machine" aria-hidden="true"><div className="hcc-stream hcc-stream-in"><i/><i/><i/></div><div className="hcc-machine-platform"/><div className="hcc-machine-core"><ShieldCheck size={37}/><span>CONTEXT<br/>GATEWAY</span><i/></div><div className="hcc-stream hcc-stream-out"><i/><i/><i/></div></div><div className="hcc-policy"><span>EXAMPLE ACCESS POLICY</span><div><Check size={14}/><span>Read selected sources</span></div><div><Check size={14}/><span>Keep source references</span></div><div><LockKeyhole size={14}/><span>No external send or write</span></div></div><p className="hcc-gate-status">{step === 0 ? "Context starts with clear boundaries." : step === 1 ? "Checking the example’s access scope…" : "Selected context. Defined boundaries."}</p></div>
          <div className="hcc-result"><div className="hcc-column-label"><span>03 / SHARED CONTEXT</span><small>{step >= 3 ? "Prepared" : "Preview"}</small></div><div className="hcc-document"><div className="hcc-doc-heading"><span><FileText size={18}/></span><small>WORKFORCE BRIEF</small><span className="hcc-doc-dots">···</span></div><h3>{data.title}</h3><p className="hcc-doc-subtitle">Useful context, with its sources attached.</p><div className="hcc-findings">{step >= 2 ? data.sources.map((item,index) => <div className="hcc-finding" key={`${example}-${index}`} style={{ "--arrival": `${index * .18}s` } as CSSProperties}><span>{item.tag}</span><p>{item.result}</p><button type="button" aria-controls="hcc-source-preview" onClick={() => { inspectSource(index); board.current?.querySelector(".hcc-excerpt")?.scrollIntoView({ block: "nearest", behavior: motion ? "smooth" : "instant" }); }} aria-label={`Read source for ${item.tag}`}><ToolLogo name={item.tool} size={12}/>{item.title}<ArrowUpRight size={11}/></button></div>) : <div className="hcc-document-pending"><Layers3 size={30}/><b>{step === 0 ? "The details are in your tools." : "The scope comes first."}</b><p>{step === 0 ? "Watch the sources become a brief your workforce can use." : "Only the selected context belongs in this example."}</p><div><i/><i/><i/></div></div>}</div><div className="hcc-next" data-ready={step === 3}><ShieldCheck size={17}/><div><b>{step === 3 ? `${data.owner} review` : "Human review stays in the workflow"}</b><small>{step === 3 ? data.next : "No message sent. No system updated."}</small></div></div></div></div>
        </div>
        <div className="hcc-story"><div className="hcc-story-caption" aria-live="off"><span>0{step+1}</span><div><strong>{steps[step].title}</strong><p>{steps[step].detail}</p></div></div><button type="button" className="hcc-play" onClick={() => { if (step === 3) replay(); else if(!motion) selectStep(step+1); else setPlaying(value => !value); }}>{step === 3 ? <RotateCcw size={15}/> : !motion ? <ArrowRight size={15}/> : playing ? <Pause size={15}/> : <Play size={15}/>} {step === 3 ? "Replay example" : !motion ? "Next context step" : playing ? "Pause example" : "Play example"}</button></div>
        <div className="hcc-steps" role="group" aria-label="Context walkthrough steps">{steps.map((item,index) => <button type="button" key={item.title} aria-pressed={step === index} data-complete={step > index} onClick={() => selectStep(index)}><span>{step > index ? <Check size={13}/> : `0${index+1}`}</span>{item.title}<i/></button>)}</div>
      </div>
      <div className="hcc-bottom"><p><LockKeyhole size={14}/> Illustrative walkthrough. Real tools require connection and permission setup.</p><Link href="/integrations">Find your tools <ArrowRight size={16}/></Link></div>
    </div>
  </section>;
}
