"use client";

import { WorkerScene } from "@/components/WorkerScene";
import type { Solution } from "@/lib/solutions";
import { ArrowRight,ArrowUpRight,BookOpen,Check,ClipboardCheck,FileText,FolderSearch,GitBranch,MessageSquare,ShieldCheck,UsersRound } from "lucide-react";
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
const operations = [
  { name: "Intake", description: "Capture a notice or policy request." },
  { name: "Organize", description: "Prepare evidence and policy context." },
  { name: "Route", description: "Assign the task and flag exceptions." },
  { name: "Review", description: "Authorized people decide on the case." },
  { name: "Outcome", description: "Record the reviewed result." },
];
const roleDetails = [
  "Structures initial claim details and routes the file.",
  "Finds relevant policy context for a reviewer.",
  "Organizes available evidence and highlights gaps.",
  "An authorized person makes coverage and settlement decisions.",
];


function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="ex-eyebrow"><i/>{children}</span>; }
function Action({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="ex-action">{children}<ArrowRight size={16}/></Link>; }
function Intro({ label, title, copy }: { label: string; title: React.ReactNode; copy: string }) { return <div className="ex-intro"><div><Eyebrow>{label}</Eyebrow><h2>{title}</h2></div><p>{copy}</p></div>; }

export function InsuranceRedesign({ item }: { item: Solution }) {
  
  const [workflowIndex, setWorkflowIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [operationIndex, setOperationIndex] = useState(0);
  const flow = item.workflows[workflowIndex];
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .06 });
    document.querySelectorAll(".in-page .ex-reveal").forEach(node => observer.observe(node));
    document.querySelector(".in-page")?.classList.add("ex-motion-ready");
    return () => observer.disconnect();
  }, []);
  return <div className="ex-page in-page">
    
    <main>
      <section className="ex-hero in-hero"><div className="ex-shell ex-hero-grid"><div className="ex-hero-copy"><Eyebrow>INSURANCE SOLUTION</Eyebrow><h1>Bring clarity to complex <em>insurance workflows.</em></h1><p>{item.description} Authorized people retain coverage and settlement decisions.</p><div className="ex-hero-actions"><Action href="#insurance-workflows">Explore insurance</Action><Link href="/book-demo">Book a demo <ArrowUpRight size={16}/></Link></div><div className="ex-benefits"><span><ClipboardCheck size={20}/><b>Reduce manual work</b><small>Visible handoffs and gaps</small></span><span><BookOpen size={20}/><b>Work with your tools</b><small>Connect approved systems</small></span><span><ShieldCheck size={20}/><b>Secure and governed</b><small>Review stays with people</small></span></div></div><div className="ex-hero-art in-hero-art"><span className="ex-hero-orbit"/><span className="ex-hero-platform"/><span className="ex-hero-character"><WorkerScene role="legal" characterId="legal-compliance-analyst" eager/></span>{[["Context", "Approved information", "tile-a", BookOpen], ["Intake", "Structure requests", "tile-b", ClipboardCheck], ["Work", "Prepare and route", "tile-c", FileText], ["Review", "Staff decision", "tile-d", UsersRound], ["Outcome", "Visible status", "tile-e", ShieldCheck]].map(([title, detail, place, Icon]) => { const TileIcon = Icon as typeof BookOpen; return <span className={`ex-hero-tile ${place}`} key={String(title)}><TileIcon size={18}/><b>{String(title)}</b><small>{String(detail)}</small></span>; })}</div></div></section>
      <div className="in-boundary"><div className="ex-shell"><ShieldCheck size={24}/><div><strong>HUMAN DECISION BOUNDARY</strong><p>Claims, underwriting, coverage, and settlement decisions remain with authorized people.</p></div></div></div>
      <section className="in-workflows ex-section ex-reveal" id="insurance-workflows"><div className="ex-shell"><Intro label="02 / EXPLORE THE WORK" title={<>One command view across <em>the insurance journey.</em></>} copy="Select a workflow to see a local, illustrative preview. No real claims or external systems are connected."/><div className="sm-workflow-tabs" role="tablist" aria-label="Insurance workflow examples">{item.workflows.map((entry, index) => <button key={entry.name} type="button" role="tab" id={`in-tab-${index}`} aria-controls="in-panel" aria-selected={workflowIndex === index} tabIndex={workflowIndex === index ? 0 : -1} className={workflowIndex === index ? "active" : ""} onClick={() => setWorkflowIndex(index)} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const next = (workflowIndex + (event.key === "ArrowRight" ? 1 : -1) + item.workflows.length) % item.workflows.length; setWorkflowIndex(next); document.getElementById(`in-tab-${next}`)?.focus(); } }}>{String(index + 1).padStart(2, "0")} <span>{entry.name}</span></button>)}</div><div className="sm-workflow-panel" id="in-panel" role="tabpanel" aria-labelledby={`in-tab-${workflowIndex}`} key={workflowIndex}><div className="sm-workflow-copy"><Eyebrow>WORKFLOW {String(workflowIndex + 1).padStart(2, "0")}</Eyebrow><h3>{flow.name}</h3><p>{flow.description}</p><ol>{flow.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol><small>Illustrative local workflow · authorized human review remains required.</small></div><div className="sm-ui"><div className="sm-ui-header"><span><i/><i/><i/></span><b>THE AI PODS / INSURANCE</b><small>ILLUSTRATIVE PREVIEW</small></div><div className="sm-ui-body"><aside><small>WORKSPACE</small><span>Overview</span><b>Workflows</b><span>Records</span><span>Documents</span><span>Review</span></aside><div className="sm-ui-main"><small>INSURANCE / {flow.name.toUpperCase()}</small><h4>{flow.name}</h4><p>{flow.description}</p>{flow.steps.map((step, index) => <div className="sm-ui-row" key={step}><span>{index === 0 ? <Check size={12}/> : String(index + 1).padStart(2, "0")}</span><b>{step}</b><small>{index === 0 ? "PREPARED" : index === flow.steps.length - 1 ? "STAFF REVIEW" : "PENDING"}</small></div>)}</div></div></div></div></div></section>
      <section className="in-admin ex-section ex-reveal"><div className="ex-shell"><Intro label="03 / HUMAN-REVIEWED DECISIONS" title={<>Evidence first. <em>Decisions with people.</em></>} copy="The sample claim file collects evidence, flags gaps, and makes the next owner clear. It does not make a coverage or settlement decision."/><div className="in-admin-track">{reviewStages.map((stage, index) => { const Icon = stage.icon; return <button type="button" key={stage.name} className={reviewIndex === index ? "active" : ""} aria-pressed={reviewIndex === index} onClick={() => setReviewIndex(index)}><span className="in-stage-icon"><Icon size={23}/></span><span className="in-stage-body"><small>{String(index + 1).padStart(2, "0")}</small><b>{stage.name}</b><span>{stage.description}</span></span><ArrowRight size={15}/></button>; })}</div><div className="in-review-package"><div className="in-review-summary"><small>CLAIM FILE / FICTIONAL EXAMPLE</small><h3>Review package</h3><p>Notice, documents, policy context, and outstanding evidence are organized in one place.</p><span><FolderSearch size={16}/>{reviewStages[reviewIndex].name}: {reviewStages[reviewIndex].description}</span></div><div className="in-evidence"><span className="in-evidence-label">REVIEW CHECKPOINTS</span>{evidenceRows.map((row, index) => <button key={row.label} type="button" className={evidenceIndex === index ? "active" : ""} aria-pressed={evidenceIndex === index} onClick={() => setEvidenceIndex(index)}><small>{String(index + 1).padStart(2, "0")} / {row.label.toUpperCase()}</small><b>{row.value}</b><ArrowRight size={15}/></button>)}<p role="status"><strong>{evidenceRows[evidenceIndex].label}:</strong> {evidenceRows[evidenceIndex].detail}</p></div></div></div></section>
      <section className="in-workforce ex-section ex-reveal"><div className="ex-shell in-workforce-grid"><div><Eyebrow>THE INSURANCE WORKFORCE</Eyebrow><h2>Coordinated roles for <em>insurance operations.</em></h2><p>See how claims intake, policy research, and evidence preparation can work together, then route the case to an authorized reviewer.</p><Action href="/book-demo">Discuss your workflow</Action></div><div className="in-role-map"><span className="in-role-core"><GitBranch size={33}/><b>COORDINATED<br/>WORK</b></span>{item.roles.map((role, index) => <button key={role} type="button" className={`in-role in-role-${index} ${roleIndex === index ? "active" : ""}`} aria-pressed={roleIndex === index} onClick={() => setRoleIndex(index)}><span>{index === 3 ? <UsersRound size={21}/> : index === 2 ? <MessageSquare size={21}/> : <FileText size={21}/>}</span><b>{role}</b><small>{roleDetails[index]}</small></button>)}<p className="in-role-status" role="status"><b>{item.roles[roleIndex]}</b> · {roleDetails[roleIndex]}</p></div></div></section>
      <section className="in-operations ex-section ex-reveal"><div className="ex-shell"><Intro label="INSURANCE WORKFLOW" title={<>Insurance workflows should <em>move with clarity.</em></>} copy="From intake to outcome, evidence, exceptions, and ownership stay visible for human review."/><div className="in-operation-track">{operations.map((stage, index) => <button key={stage.name} type="button" className={operationIndex === index ? "active" : ""} aria-pressed={operationIndex === index} onClick={() => setOperationIndex(index)}><span>{String(index + 1).padStart(2, "0")}</span><b>{stage.name}</b><small>{stage.description}</small>{index < operations.length - 1 && <ArrowRight size={17}/>}</button>)}</div><p className="in-operation-status" role="status">{operations[operationIndex].name}: {operations[operationIndex].description}</p></div></section>
      <section className="in-closing ex-reveal"><div className="ex-shell in-closing-grid"><div><Eyebrow>THE NEXT STEP</Eyebrow><h2>Build a more coordinated <em>insurance workflow.</em></h2><p>Bring a claims or policy objective. We can discuss approved context, exception routing, and the human review boundaries your organization needs.</p><Action href="/book-demo">Book a demo</Action></div><div className="in-closing-map"><span className="in-closing-center"><GitBranch size={29}/><b>WORKFLOW</b></span><span className="in-close-card cc-a"><FileText size={20}/>Policy documents</span><span className="in-close-card cc-b"><UsersRound size={20}/>Claim details</span><span className="in-close-card cc-c"><ClipboardCheck size={20}/>Task routing</span><span className="in-close-card cc-d"><ShieldCheck size={20}/>Review status</span></div></div></section>
    </main>
  </div>;
}
