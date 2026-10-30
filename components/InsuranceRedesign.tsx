"use client";
import { InsuranceEvidenceHero } from "@/components/PageSpecificHeroes";

import type { Solution } from "@/lib/solutions";
import { ArrowRight,ClipboardCheck,FileText,FolderSearch,ShieldCheck,UsersRound } from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";

const reviewStages = [
  { name: "Notice received", description: "Initial claim information is captured for the file.", icon: ClipboardCheck },
  { name: "Information organized", description: "Details and policy context are brought together.", icon: FileText },
  { name: "Missing details", description: "Gaps are flagged before review.", icon: FolderSearch },
  { name: "Staff notified", description: "The assigned reviewer receives the case.", icon: UsersRound },
  { name: "Review status", description: "Ownership and progress remain visible.", icon: ShieldCheck },
];
const evidenceRows = [
  { label: "Evidence", value: "Documents gathered", detail: "Available claim documents are organized for review." },
  { label: "Exception", value: "Missing detail flagged", detail: "An information gap is visible to the assigned reviewer." },
  { label: "Owner", value: "Adjuster review required", detail: "An authorized person retains the decision." },
];



function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="ex-eyebrow"><i/>{children}</span>; }
function Action({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="ex-action">{children}<ArrowRight size={16}/></Link>; }
function Intro({ label, title, copy }: { label: string; title: React.ReactNode; copy: string }) { return <div className="ex-intro"><div><Eyebrow>{label}</Eyebrow><h2>{title}</h2></div><p>{copy}</p></div>; }

export function InsuranceRedesign({ item }: { item: Solution }) {
  
  const [workflowIndex, setWorkflowIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [paused,setPaused] = useState(false);
  const [reduced,setReduced] = useState(false);
  const [previewStep,setPreviewStep] = useState(2);
  const [previewRunning,setPreviewRunning] = useState(false);
  useEffect(()=>{const media=matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReduced(media.matches);update();media.addEventListener("change",update);return()=>media.removeEventListener("change",update);},[]);
  useEffect(()=>{if(!previewRunning)return;const timer=setInterval(()=>setPreviewStep(v=>{if(v>=item.workflows[workflowIndex].steps.length-1){setPreviewRunning(false);return v;}return v+1;}),1200);return()=>clearInterval(timer);},[previewRunning,workflowIndex,item.workflows]);
  const flow = item.workflows[workflowIndex];
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .06 });
    document.querySelectorAll(".in-page .ex-reveal").forEach(node => observer.observe(node));
    document.querySelector(".in-page")?.classList.add("ex-motion-ready");
    return () => observer.disconnect();
  }, []);
  return <div className={`ex-page in-page ${paused||reduced?"in-motion-paused":""}`}>
    
    <main>
      <InsuranceEvidenceHero motion={!paused && !reduced} onToggleMotion={() => setPaused(value => !value)}/>
      <div className="in-boundary"><div className="ex-shell"><ShieldCheck size={24}/><div><strong>HUMAN DECISION BOUNDARY</strong><p>Claims, underwriting, coverage, and settlement decisions remain with authorized people.</p></div></div></div>
      <section className="in-workflows ex-section ex-reveal" id="insurance-workflows"><div className="ex-shell"><Intro label="01 / EXPLORE THE WORK" title={<>One command view across <em>the insurance journey.</em></>} copy="Select a workflow to see a local, illustrative preview. No real claims or external systems are connected."/><div className="sm-workflow-tabs" role="tablist" aria-label="Insurance workflow examples">{item.workflows.map((entry, index) => <button key={entry.name} type="button" role="tab" id={`in-tab-${index}`} aria-controls="in-panel" aria-selected={workflowIndex === index} tabIndex={workflowIndex === index ? 0 : -1} className={workflowIndex === index ? "active" : ""} onClick={() => {setWorkflowIndex(index);setPreviewStep(2);setPreviewRunning(false);}} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const next = (workflowIndex + (event.key === "ArrowRight" ? 1 : -1) + item.workflows.length) % item.workflows.length; setWorkflowIndex(next); document.getElementById(`in-tab-${next}`)?.focus(); } }}>{String(index + 1).padStart(2, "0")} <span>{entry.name}</span></button>)}</div><div className="sm-workflow-panel" id="in-panel" role="tabpanel" aria-labelledby={`in-tab-${workflowIndex}`} key={workflowIndex}><div className="sm-workflow-copy"><Eyebrow>WORKFLOW {String(workflowIndex + 1).padStart(2, "0")}</Eyebrow><h3>{flow.name}</h3><p>{flow.description}</p><ol>{flow.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol><button className="ex-action in-try" onClick={()=>{setPreviewStep(reduced ? flow.steps.length - 1 : 0);setPreviewRunning(!reduced);}}>Try this workflow <ArrowRight size={16}/></button><small>Local demonstration · authorized human review remains required.</small></div><div className="sm-ui"><div className="sm-ui-header"><span><i/><i/><i/></span><b>THEAIPODS / INSURANCE</b><small>ILLUSTRATIVE PREVIEW</small></div><div className="sm-ui-body"><aside><small>WORKSPACE</small><span>Overview</span><b>Workflows</b><span>Records</span><span>Documents</span><span>Review</span></aside><div className="sm-ui-main"><small>INSURANCE / {flow.name.toUpperCase()}</small><h4>{flow.name}</h4><p>{flow.description}</p>{flow.steps.map((step, index) => <div className={`sm-ui-row ${index<previewStep?"complete":index===previewStep?"current":""}`} key={step}><span><FileText size={16}/></span><b>{step}</b><small>{index < previewStep ? "Completed" : index === previewStep ? index === flow.steps.length-1 ? "Awaiting staff" : "In progress" : "Pending"}</small></div>)}</div></div></div></div></div></section>
      <section className="in-admin ex-section ex-reveal"><div className="ex-shell"><Intro label="02 / HUMAN-CENTERED DECISIONS" title={<>Evidence first. <em>Decisions with people.</em></>} copy="The sample claim file collects evidence, flags gaps, and makes the next owner clear. It does not make a coverage or settlement decision."/><div className="in-admin-track">{reviewStages.map((stage, index) => { const Icon = stage.icon; return <button type="button" key={stage.name} className={reviewIndex === index ? "active" : ""} aria-pressed={reviewIndex === index} onClick={() => setReviewIndex(index)}><span className="in-stage-icon"><Icon size={23}/></span><span className="in-stage-body"><small>{String(index + 1).padStart(2, "0")}</small><b>{stage.name}</b><span>{stage.description}</span></span><ArrowRight size={15}/></button>; })}</div><div className="in-review-package"><div className="in-review-summary"><small>CLAIM FILE / FICTIONAL EXAMPLE</small><h3>Review package</h3><p>Notice, documents, policy context, and outstanding evidence are organized in one place.</p><span><FolderSearch size={16}/>{reviewStages[reviewIndex].name}: {reviewStages[reviewIndex].description}</span></div><div className="in-evidence"><span className="in-evidence-label">REVIEW CHECKPOINTS</span>{evidenceRows.map((row, index) => <button key={row.label} type="button" className={evidenceIndex === index ? "active" : ""} aria-pressed={evidenceIndex === index} onClick={() => setEvidenceIndex(index)}><small>{String(index + 1).padStart(2, "0")} / {row.label.toUpperCase()}</small><b>{row.value}</b><ArrowRight size={15}/></button>)}<p role="status"><strong>{evidenceRows[evidenceIndex].label}:</strong> {evidenceRows[evidenceIndex].detail}</p></div></div></div></section>
      <section className="in-closing ex-reveal"><div className="ex-shell in-closing-grid"><div><Eyebrow>THE NEXT STEP</Eyebrow><h2>Build a more coordinated <em>insurance workflow.</em></h2><p>Bring a claims or policy objective. We can discuss approved context, exception routing, and the human review boundaries your organization needs.</p><Action href="/book-demo">Book a demo</Action></div><div className="in-closing-map"><span className="in-closing-center"><UsersRound size={29}/><b>YOUR TEAM</b></span><span className="in-close-card cc-a"><FileText size={20}/>Share your goals</span><span className="in-close-card cc-b"><UsersRound size={20}/>Discuss use cases</span><span className="in-close-card cc-c"><ClipboardCheck size={20}/>See a tailored plan</span><span className="in-close-card cc-d"><ShieldCheck size={20}/>Review and refine</span></div></div></section>
    </main>
  </div>;
}
