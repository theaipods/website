"use client";
import { FinanceLedgerHero } from "@/components/PageSpecificHeroes";

import { WorkerScene,type WorkerRole } from "@/components/WorkerScene";
import type { Solution } from "@/lib/solutions";
import { ArrowRight,ArrowUpRight,BadgeCheck,BarChart3,Check,ChevronRight,CircleAlert,FileCheck2,FileText,Link2,RotateCcw,UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";

const operatorRoles: { name: string; summary: string; role: WorkerRole; workflow: number; icon: typeof BarChart3 }[] = [
  { name: "Finance Agent", summary: "Prepare finance requests and reports.", role: "finance", workflow: 1, icon: BarChart3 },
  { name: "Audit Agent", summary: "Organize evidence against source records.", role: "research", workflow: 3, icon: FileCheck2 },
  { name: "Approval Router", summary: "Route requests to authorized reviewers.", role: "operations", workflow: 4, icon: UserRoundCheck },
];
const processDescriptions = [
  "A document enters the illustrative finance workflow. Nothing is posted to an accounting system.",
  "Relevant fields are extracted into a reviewable draft.",
  "Source records are compared and differences remain visible.",
  "An exception is organized for the appropriate owner.",
  "An authorized person reviews the proposed action before it moves forward.",
  "A report is prepared as an output for review; no live ledger is updated.",
];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const sampleSpend = [210, 260, 290, 350, 430, 410, 460, 510, 540, 500, 560, 590];
const reviewSteps = [
  { title: "Flag exception", copy: "A mismatch or missing item is recorded as a sample exception.", icon: CircleAlert },
  { title: "Notify reviewer", copy: "The proposed next step is routed to the named human owner.", icon: UserRoundCheck },
  { title: "Human review", copy: "A person approves, requests changes, or rejects the proposed action.", icon: FileCheck2 },
  { title: "Resolved", copy: "The reviewed decision is recorded before any configured downstream action.", icon: BadgeCheck },
];



function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="fo-eyebrow"><i/>{children}</span>; }
function Action({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="fo-action">{children}<ArrowRight size={16}/></Link>; }
function Intro({ label, title, copy }: { label: string; title: React.ReactNode; copy?: string }) { return <div className="fo-intro"><div><Eyebrow>{label}</Eyebrow><h2>{title}</h2></div>{copy && <p>{copy}</p>}</div>; }

function InvoiceJourney({ item }: { item: Solution }) {
  const [active, setActive] = useState(0);
  const icons = [FileText, BarChart3, Link2, CircleAlert, UserRoundCheck, FileCheck2];
  return <section id="invoice-workflow" className="fo-section fo-journey"><div className="fo-shell"><Intro label="HOW IT WORKS" title={<>An invoice becomes<br/><em>a visible workflow.</em></>} copy="Select a stage to inspect an illustrative invoice process. People retain review of exceptions and consequential decisions."/><div className="fo-journey-map" role="tablist" aria-label="Invoice workflow stages">{item.stages.map((stage, index) => { const Icon = icons[index]; return <button key={stage} type="button" role="tab" id={`fo-stage-tab-${index}`} aria-controls="fo-stage-panel" aria-selected={active === index} tabIndex={active === index ? 0 : -1} className={active === index ? "active" : index < active ? "passed" : ""} onClick={() => setActive(index)} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const next = (active + (event.key === "ArrowRight" ? 1 : -1) + item.stages.length) % item.stages.length; setActive(next); document.getElementById(`fo-stage-tab-${next}`)?.focus(); } }}><span className="fo-stage-icon">{index === 1 || index === 2 || index === 5 ? <WorkerScene role={index === 5 ? "finance" : index === 2 ? "research" : "data"}/> : <Icon size={30}/>}</span><b>{stage}</b><small>0{index + 1} / 0{item.stages.length}</small></button>; })}</div><div className="fo-stage-detail" role="tabpanel" id="fo-stage-panel" aria-labelledby={`fo-stage-tab-${active}`} key={active}><span>ILLUSTRATIVE STAGE 0{active + 1}</span><strong>{item.stages[active]}</strong><p>{processDescriptions[active]}</p><button type="button" onClick={() => setActive(0)}><RotateCcw size={14}/> Restart preview</button></div></div></section>;
}

function Operators({ item }: { item: Solution }) {
  const [operator, setOperator] = useState(0);
  const [workflow, setWorkflow] = useState(operatorRoles[0].workflow);
  const selected = operatorRoles[operator];
  const selectedWorkflow = item.workflows[workflow];
  return <section id="finance-workforce" className="fo-section fo-operators"><div className="fo-shell"><Intro label="MEET YOUR FINANCE OPERATORS" title={<>A team of specialized<br/>AI employees <em>for finance.</em></>} copy="The current finance registry includes three roles. Select one, then explore the separate finance workflow examples."/><div className="fo-workflow-chips" role="tablist" aria-label="Finance workflow examples">{item.workflows.map((flow, index) => <button key={flow.name} type="button" role="tab" id={`fo-flow-tab-${index}`} aria-controls="fo-flow-panel" aria-selected={workflow === index} tabIndex={workflow === index ? 0 : -1} className={workflow === index ? "active" : ""} onClick={() => setWorkflow(index)} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const next = (workflow + (event.key === "ArrowRight" ? 1 : -1) + item.workflows.length) % item.workflows.length; setWorkflow(next); document.getElementById(`fo-flow-tab-${next}`)?.focus(); } }}>{flow.name}</button>)}</div><div className="fo-operator-grid"><div className="fo-operator-list" role="group" aria-label="Finance roles">{operatorRoles.map((role, index) => { const Icon = role.icon; return <button key={role.name} type="button" className={operator === index ? "active" : ""} aria-pressed={operator === index} onClick={() => { setOperator(index); setWorkflow(role.workflow); }}><span><Icon size={20}/></span><span><b>{role.name}</b><small>{role.summary}</small></span><ArrowRight size={15}/></button>; })}</div><article className="fo-operator-feature" role="tabpanel" id="fo-flow-panel" aria-labelledby={`fo-flow-tab-${workflow}`} key={`${operator}-${workflow}`}><div className="fo-operator-copy"><Eyebrow>ILLUSTRATIVE WORKFLOW / {selected.name.toUpperCase()}</Eyebrow><h3>{selectedWorkflow.name}</h3><p>{selectedWorkflow.description}</p><ul>{selectedWorkflow.steps.slice(0, 5).map(step => <li key={step}><Check size={14}/>{step}</li>)}</ul><Link href="#finance-report" className="fo-feature-link">See example reporting <ArrowUpRight size={15}/></Link></div><div className="fo-operator-art"><span/><WorkerScene role={selected.role}/></div></article></div><p className="fo-operator-disclaimer">Role cards describe the current registry. Workflow previews use fictional data and do not execute a finance transaction.</p></div></section>;
}

function Reporting() {
  const [month, setMonth] = useState(11);
  const max = Math.max(...sampleSpend);
  const points = sampleSpend.map((value, index) => `${35 + index * 46},${176 - value / max * 138}`).join(" ");
  return <section id="finance-report" className="fo-section fo-report"><div className="fo-shell"><Intro label="FINANCE INSIGHTS" title={<>From data intake to a report<br/><em>someone can review.</em></>} copy="This sample dashboard shows how financial data could be prepared for review. Figures are fictional, not customer results."/><div className="fo-report-grid"><div className="fo-chart-card"><div className="fo-chart-head"><div><span>FICTIONAL SAMPLE DATA</span><h3>Monthly spend overview</h3></div><strong>${sampleSpend[month]}k <small>sample / {months[month]}</small></strong></div><div className="fo-chart"><div className="fo-chart-scale"><span>$600k</span><span>$400k</span><span>$200k</span><span>$0</span></div><div className="fo-chart-body"><svg viewBox="0 0 590 190" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} fill="none" stroke="#16895c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg><div className="fo-bars">{sampleSpend.map((value, index) => <button key={months[index]} type="button" aria-label={`${months[index]} sample spend $${value}k`} aria-pressed={month === index} onClick={() => setMonth(index)} style={{ "--bar": `${value / max * 100}%` } as React.CSSProperties}><i/><span>{months[index]}</span></button>)}</div></div></div><p>Click a month to inspect its fictional sample value. No financial account is connected.</p></div><aside className="fo-insights"><span>EXAMPLE REVIEW PACKAGE</span><h3>Prepared for a person</h3>{[["Selected period", months[month]], ["Sample spend", `$${sampleSpend[month]}k`], ["Evidence", "Source records required"], ["Next step", "Human review"]].map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}<small>Illustrative values · no live ledger feed</small></aside></div></div></section>;
}

function Exceptions() {
  const [active, setActive] = useState(0);
  return <section className="fo-section fo-exceptions"><div className="fo-shell"><Intro label="EXCEPTIONS & APPROVALS" title={<>Exceptions and approvals<br/><em>remain visible.</em></>} copy="Routine preparation can move forward while exceptions and consequential decisions stay with authorized people."/><div className="fo-exception-grid">{reviewSteps.map((step, index) => { const Icon = step.icon; return <button type="button" key={step.title} aria-pressed={active === index} className={active === index ? "active" : ""} onClick={() => setActive(index)}><span><Icon size={22}/></span><b>{step.title}</b><small>{step.copy}</small>{index < reviewSteps.length - 1 && <ChevronRight size={18}/>}</button>; })}</div><p className="fo-exception-status" role="status">SAMPLE REVIEW PATH · <strong>{reviewSteps[active].title}:</strong> {reviewSteps[active].copy}</p></div></section>;
}

export function FinanceOperationsRedesign({ item }: { item: Solution }) {
  
  useEffect(() => { if (!("IntersectionObserver" in window)) return; const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .1 }); document.querySelectorAll(".fo-reveal").forEach(node => observer.observe(node)); document.querySelector(".fo-page")?.classList.add("fo-motion-ready"); return () => observer.disconnect(); }, []);
  return <div className="fo-page"><main><FinanceLedgerHero/><div className="fo-reveal"><InvoiceJourney item={item}/></div><div className="fo-reveal"><Operators item={item}/></div><div className="fo-reveal"><Reporting/></div><div className="fo-reveal"><Exceptions/></div><section className="fo-closing fo-reveal"><div className="fo-shell fo-closing-grid"><div><Eyebrow>GET STARTED</Eyebrow><h2>Build a more coordinated<br/><em>finance operations workflow.</em></h2><p>Bring an objective. We can discuss how specialized work, connected context, and human review could fit your finance team.</p><div className="fo-hero-actions"><Action href="#finance-workforce">Explore finance solutions</Action><Link href="/book-demo">Book a demo <ArrowUpRight size={16}/></Link></div></div><div className="fo-closing-art"><span/><WorkerScene ensemble ensembleRoles={["finance", "research", "operations", "data"]}/></div></div></section></main></div>;
}
