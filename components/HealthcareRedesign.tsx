"use client";
import { HealthcareCoordinationHero } from "@/components/SolutionHeroScenes";

import type { Solution } from "@/lib/solutions";
import { ArrowRight,BookOpen,ClipboardCheck,FileText,HeartPulse,MessageSquare,ShieldCheck,UsersRound } from "lucide-react";
import Link from "next/link";
import { useEffect,useState,useRef } from "react";

const adminStages = [
  { name: "Questionnaires", description: "Administrative forms are received for review.", icon: ClipboardCheck },
  { name: "Information organized", description: "Permitted details are structured in one place.", icon: FileText },
  { name: "Missing details", description: "Gaps are flagged for staff to resolve.", icon: BookOpen },
  { name: "Staff notified", description: "The appropriate person receives a follow-up.", icon: UsersRound },
  { name: "Review status", description: "Progress stays visible until staff close the task.", icon: ShieldCheck },
];
const operations = [
  { name: "Intake", description: "Capture and structure administrative requests." },
  { name: "Organize", description: "Prepare permitted context and records." },
  { name: "Route", description: "Send the right task to the right team." },
  { name: "Review", description: "Staff check and decide on the work." },
  { name: "Outcome", description: "Track the administrative result." },
];
const roleDetails = [
  "Organizes incoming administrative information for the team.",
  "Prepares permitted documents for staff review.",
  "Helps draft administrative messages for approval.",
  "Routes tasks to the appropriate staff team.",
  "Summarizes permitted details for staff review.",
];


const roleNames = ["Intake Coordinator", "Documentation Assistant", "Communication Support", "Staff Notifier", "Data Reviewer"];

function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="ex-eyebrow"><i/>{children}</span>; }
function Action({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="ex-action">{children}<ArrowRight size={16}/></Link>; }
function Intro({ label, title, copy }: { label: string; title: React.ReactNode; copy: string }) { return <div className="ex-intro"><div><Eyebrow>{label}</Eyebrow><h2>{title}</h2></div><p>{copy}</p></div>; }

export function HealthcareRedesign({ item }: { item: Solution }) {
  
  const [workflowIndex, setWorkflowIndex] = useState(0);
  const [adminIndex, setAdminIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [operationIndex, setOperationIndex] = useState(0);
  const [paused,setPaused] = useState(false);
  const [reduced,setReduced] = useState(false);
  const [previewStep,setPreviewStep] = useState(2);
  const [previewRunning,setPreviewRunning] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{const media=window.matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReduced(media.matches);update();media.addEventListener("change",update);return()=>media.removeEventListener("change",update);},[]);
  useEffect(()=>{if(paused||reduced)return;const timer=setInterval(()=>{if(document.hidden)return;const shown=(selector:string)=>{const el=pageRef.current?.querySelector(selector);if(!el)return false;const box=el.getBoundingClientRect();return box.top<innerHeight&&box.bottom>0;};if(shown('.hc-role-map'))setRoleIndex(v=>(v+1)%5);if(shown('.hc-operations'))setOperationIndex(v=>(v+1)%5);},2600);return()=>clearInterval(timer);},[paused,reduced]);
  useEffect(()=>{if(!previewRunning)return;const timer=setInterval(()=>setPreviewStep(v=>{if(v>=item.workflows[workflowIndex].steps.length-1){setPreviewRunning(false);return v;}return v+1;}),1500);return()=>clearInterval(timer);},[previewRunning,workflowIndex,item.workflows]);
  const flow = item.workflows[workflowIndex];
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .06 });
    document.querySelectorAll(".hc-page .ex-reveal").forEach(node => observer.observe(node));
    document.querySelector(".hc-page")?.classList.add("ex-motion-ready");
    return () => observer.disconnect();
  }, []);
  return <div ref={pageRef} className={`ex-page hc-page ${paused||reduced?"hc-motion-paused":""}`}>
    
    <main>
      <HealthcareCoordinationHero motion={!paused && !reduced} onToggleMotion={() => setPaused(value => !value)}/>
      <div className="hc-boundary"><div className="ex-shell"><ShieldCheck size={24}/><div><strong>HUMAN DECISION BOUNDARY</strong><p>This administrative workflow does not diagnose, treat, or prescribe. Staff make clinical decisions.</p></div></div></div>
      <section className="hc-workflows ex-section ex-reveal" id="healthcare-workflows"><div className="ex-shell"><Intro label="02 / EXPLORE THE WORK" title={<>Administrative work, <em>organized for staff review.</em></>} copy="Select a workflow to see a local, illustrative preview. No patient records or external systems are connected."/><div className="sm-workflow-tabs" role="tablist" aria-label="Healthcare workflow examples">{item.workflows.map((entry, index) => <button key={entry.name} type="button" role="tab" id={`hc-tab-${index}`} aria-controls="hc-panel" aria-selected={workflowIndex === index} tabIndex={workflowIndex === index ? 0 : -1} className={workflowIndex === index ? "active" : ""} onClick={() => {setWorkflowIndex(index);setPreviewStep(2);setPreviewRunning(false);}} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const next = (workflowIndex + (event.key === "ArrowRight" ? 1 : -1) + item.workflows.length) % item.workflows.length; setWorkflowIndex(next); document.getElementById(`hc-tab-${next}`)?.focus(); } }}>{String(index + 1).padStart(2, "0")} <span>{entry.name}</span></button>)}</div><div className="sm-workflow-panel" id="hc-panel" role="tabpanel" aria-labelledby={`hc-tab-${workflowIndex}`} key={workflowIndex}><div className="sm-workflow-copy"><Eyebrow>WORKFLOW {String(workflowIndex + 1).padStart(2, "0")}</Eyebrow><h3>{flow.name}</h3><p>{flow.description}</p><ol>{flow.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol><button className="ex-action hc-try" onClick={()=>{setPreviewStep(0);setPreviewRunning(true);}}>Try this workflow <ArrowRight size={16}/></button><small>Local demonstration · staff review remains required.</small></div><div className="sm-ui"><div className="sm-ui-header"><span><i/><i/><i/></span><b>THEAIPODS / HEALTHCARE</b><small>ILLUSTRATIVE PREVIEW</small></div><div className="sm-ui-body"><aside><small>WORKSPACE</small><span>Overview</span><b>Workflows</b><span>Records</span><span>Documents</span><span>Review</span></aside><div className="sm-ui-main"><small>ADMINISTRATIVE / {flow.name.toUpperCase()}</small><h4>{flow.name}</h4><p>{flow.description}</p>{flow.steps.map((step, index) => <div className={`sm-ui-row ${index<previewStep?"complete":index===previewStep?"current":""}`} key={step}><span><FileText size={16}/></span><b>{step}</b><small>{index < previewStep ? "Completed" : index === previewStep ? index === flow.steps.length-1 ? "Awaiting staff" : "In progress" : "Pending"}</small></div>)}</div></div></div></div></div></section>
      <section className="hc-admin ex-section ex-reveal"><div className="ex-shell"><Intro label="ADMINISTRATIVE EXAMPLES" title={<>Documentation, routing and <em>staff follow-up.</em></>} copy="A sample sequence for organizing administrative requests. Select each stage to inspect its role."/><div className="hc-admin-track">{adminStages.map((stage, index) => { const Icon = stage.icon; return <button type="button" key={stage.name} className={adminIndex === index ? "active" : ""} aria-pressed={adminIndex === index} onClick={() => setAdminIndex(index)}><span className="hc-stage-icon"><Icon size={23}/></span><span className="hc-stage-body"><small>{String(index + 1).padStart(2, "0")}</small><b>{stage.name}</b><span>{stage.description}</span></span><ArrowRight size={15}/></button>; })}</div><p className="hc-stage-detail" role="status"><strong>{adminStages[adminIndex].name}</strong>  - {adminStages[adminIndex].description} This example does not access patient data.</p></div></section>
      <section className="hc-workforce ex-section ex-reveal"><div className="ex-shell hc-workforce-grid"><div><Eyebrow>THE ADMINISTRATIVE WORKFORCE</Eyebrow><h2>Coordinated roles for <em>healthcare operations.</em></h2><p>These are illustrative responsibilities in the solution scenario. They are not additional registered AI employees or clinical staff.</p><Action href="/book-demo">Discuss your workflow</Action></div><div className="hc-role-map"><span className="hc-role-core"><HeartPulse size={33}/><b>HEALTHCARE<br/>WORKFLOW</b></span>{roleNames.map((role, index) => <button key={role} type="button" className={`hc-role hc-role-${index} ${roleIndex === index ? "active" : ""}`} aria-pressed={roleIndex === index} onClick={() => {setRoleIndex(index);setPaused(true);}}><span>{index === 3 ? <UsersRound size={21}/> : index === 2 ? <MessageSquare size={21}/> : <FileText size={21}/>}</span><b>{role}</b><small>{roleDetails[index]}</small></button>)}<p className="hc-role-status" role="status"><b>{roleNames[roleIndex]}</b> · {roleDetails[roleIndex]}</p></div></div></section>
      <section className="hc-operations ex-section ex-reveal"><div className="ex-shell"><Intro label="HEALTHCARE WORKFLOW" title={<>Healthcare workflows should <em>move with clarity.</em></>} copy="From intake to outcome, each administrative step stays visible and ready for the appropriate human review."/><div className="hc-operation-track">{operations.map((stage, index) => <button key={stage.name} type="button" className={operationIndex === index ? "active" : ""} aria-pressed={operationIndex === index} onClick={() => {setOperationIndex(index);setPaused(true);}}><span>{String(index + 1).padStart(2, "0")}</span><b>{stage.name}</b><small>{stage.description}</small>{index < operations.length - 1 && <ArrowRight size={17}/>}</button>)}</div><p className="hc-operation-status" role="status">{operations[operationIndex].name}: {operations[operationIndex].description}</p></div></section>
      <section className="hc-closing ex-reveal"><div className="ex-shell hc-closing-grid"><div><Eyebrow>THE NEXT STEP</Eyebrow><h2>Build a more coordinated <em>healthcare workflow.</em></h2><p>Bring an administrative objective. We can discuss the approved context, staff review, and boundaries your organization needs.</p><Action href="/book-demo">Book a demo</Action></div><div className="hc-closing-map"><span className="hc-closing-center"><UsersRound size={29}/><b>YOUR TEAM</b></span><span className="hc-close-card cc-a"><FileText size={20}/>Discuss scope</span><span className="hc-close-card cc-b"><UsersRound size={20}/>Tailor workflow</span><span className="hc-close-card cc-c"><ClipboardCheck size={20}/>Set up intake</span><span className="hc-close-card cc-d"><ShieldCheck size={20}/>Review and refine</span></div></div></section>
    </main>
  </div>;
}
