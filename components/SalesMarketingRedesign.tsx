"use client";
import { CampaignStudioHero } from "@/components/PageSpecificHeroes";

import { WorkerScene } from "@/components/WorkerScene";
import type { Solution } from "@/lib/solutions";
import { ArrowRight,ArrowUpRight,BriefcaseBusiness,Check,LockKeyhole,Mail,Megaphone,Pause,Play,Search,ShieldCheck,Target,UsersRound } from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";

const demo = [
  { title: "Lead captured", detail: "A fictional prospect enters the example flow.", icon: UsersRound },
  { title: "Prospect research", detail: "Public context is organized for review.", icon: Search },
  { title: "Account context", detail: "Relevant notes are gathered in one place.", icon: BriefcaseBusiness },
  { title: "Outreach plan", detail: "A draft approach is prepared.", icon: Mail },
  { title: "Campaign assets", detail: "Content tasks are grouped for the team.", icon: Megaphone },
  { title: "Human review", detail: "A person approves the next step.", icon: ShieldCheck },
];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const leads = [25, 33, 43, 52, 45, 49, 58, 67, 72, 69, 75, 81];


function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="ex-eyebrow"><i/>{children}</span>; }
function Action({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="ex-action">{children}<ArrowRight size={16}/></Link>; }
function Intro({ label, title, copy }: { label: string; title: React.ReactNode; copy: string }) { return <div className="ex-intro"><div><Eyebrow>{label}</Eyebrow><h2>{title}</h2></div><p>{copy}</p></div>; }

function ProspectDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setStep(current => { if (current >= demo.length - 1) { setPlaying(false); return current; } return current + 1; }), 1100); return () => window.clearInterval(timer); }, [playing]);
  return <section id="prospect-demo" className="sm-prospect ex-section ex-reveal"><div className="ex-shell sm-prospect-grid"><div className="sm-prospect-copy"><Eyebrow>SEE IT IN ACTION</Eyebrow><h2>From a prospect to a personalized plan. <em>Step by step.</em></h2><p>Follow a fictional prospect as the example workforce organizes research, account context, outreach, campaign work, and a human review.</p><div className="sm-demo-actions"><button type="button" onClick={() => { setStep(0); setPlaying(true); }}><Play size={15} fill="currentColor"/>{playing ? "Playing local demo" : step === demo.length - 1 ? "Replay interactive demo" : "Play interactive demo"}</button>{playing && <button type="button" onClick={() => setPlaying(false)}><Pause size={15}/> Pause</button>}</div><div className="sm-demo-status" role="status"><span>ILLUSTRATIVE PREVIEW · {String(step + 1).padStart(2, "0")}/{String(demo.length).padStart(2, "0")}</span><strong>{demo[step].title}</strong><p>{demo[step].detail}</p></div></div><div className="sm-prospect-map" aria-label="Illustrative sales workflow">{demo.map((item, index) => { const Icon = item.icon; return <button key={item.title} type="button" aria-pressed={step === index} className={`sm-map-card sm-map-${index} ${step === index ? "active" : ""}`} onClick={() => { setStep(index); setPlaying(false); }}><Icon size={21}/><span><b>{item.title}</b><small>{item.detail}</small></span></button>; })}<span className="sm-map-core"><WorkerScene role="sales" characterId="sales-sales-agent"/></span><span className="sm-map-ring"/></div></div></section>;
}

function WorkflowExplorer({ item }: { item: Solution }) {
  const [active, setActive] = useState(0);
  const workflow = item.workflows[active];
  return <section id="sales-workflows" className="sm-workflows ex-section ex-reveal"><div className="ex-shell"><Intro label="EXPLORE THE WORKFLOWS" title={<>Select a workflow. See the work <em>take shape.</em></>} copy="Choose one of the six existing workflow examples. The preview changes locally and keeps review with authorized people."/><div className="sm-workflow-tabs" role="tablist" aria-label="Sales and marketing workflows">{item.workflows.map((flow, index) => <button key={flow.name} type="button" role="tab" id={`sm-tab-${index}`} aria-controls="sm-panel" aria-selected={active === index} tabIndex={active === index ? 0 : -1} className={active === index ? "active" : ""} onClick={() => setActive(index)} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const next = (active + (event.key === "ArrowRight" ? 1 : -1) + item.workflows.length) % item.workflows.length; setActive(next); document.getElementById(`sm-tab-${next}`)?.focus(); } }}>{String(index + 1).padStart(2, "0")} <span>{flow.name}</span></button>)}</div><div className="sm-workflow-panel" id="sm-panel" role="tabpanel" aria-labelledby={`sm-tab-${active}`} key={active}><div className="sm-workflow-copy"><Eyebrow>WORKFLOW {String(active + 1).padStart(2, "0")}</Eyebrow><h3>{workflow.name}</h3><p>{workflow.description}</p><ol>{workflow.steps.map((task, index) => <li key={task}><span>{String(index + 1).padStart(2, "0")}</span>{task}</li>)}</ol><small>Illustrative local workflow · a person reviews consequential actions.</small></div><div className="sm-ui"><div className="sm-ui-header"><span><i/><i/><i/></span><b>THEAIPODS / SALES & MARKETING</b><small>ILLUSTRATIVE PREVIEW</small></div><div className="sm-ui-body"><aside><small>WORKSPACE</small><span>Overview</span><b>Workflows</b><span>Prospects</span><span>Accounts</span><span>Campaigns</span><span>Analytics</span></aside><div className="sm-ui-main"><small>DEPARTMENT / {workflow.name.toUpperCase()}</small><h4>{workflow.name}</h4><p>{workflow.description}</p>{workflow.steps.map((task, index) => <div className="sm-ui-row" key={task}><span>{index === 0 ? <Check size={12}/> : String(index + 1).padStart(2, "0")}</span><b>{task}</b><small>{index === 0 ? "PREPARED" : index === workflow.steps.length - 1 ? "REVIEW" : "PENDING"}</small></div>)}</div></div></div></div></div></section>;
}

function Insights() {
  const [month, setMonth] = useState(11);
  return <section id="sales-insights" className="sm-insights ex-section ex-reveal"><div className="ex-shell"><Intro label="IMPACT AND INSIGHTS" title={<>More visibility into pipeline. <em>Clearer next steps.</em></>} copy="This fictional dashboard shows the kinds of signals a sales team could review. It is not connected to a CRM or customer campaign."/><div className="sm-insights-grid"><div className="ex-chart"><div className="ex-chart-head"><div><small>FICTIONAL SAMPLE DATA</small><h3>Prospects researched</h3></div><b>{leads[month]} <small>sample / {months[month]}</small></b></div><div className="ex-chart-area"><div className="ex-chart-axis"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div><div className="ex-chart-bars">{leads.map((value, index) => <button key={months[index]} type="button" aria-label={`${months[index]} fictional prospects researched: ${value}`} aria-pressed={month === index} onClick={() => setMonth(index)}><i style={{ height: `${value / 90 * 100}%` }}/><span>{months[index]}</span></button>)}</div></div><p>Select a month to inspect its fictional sample value.</p></div><div className="sm-metric-cards"><article><Target size={23}/><span>Selected period</span><strong>{months[month]}</strong><small>Fictional sample</small></article><article><Search size={23}/><span>Prospects researched</span><strong>{leads[month]}</strong><small>Illustrative count</small></article><article><LockKeyhole size={23}/><span>Human review</span><strong>Required</strong><small>Before consequential actions</small></article></div></div></div></section>;
}

export function SalesMarketingRedesign({ item }: { item: Solution }) {
  
  useEffect(() => { if (!("IntersectionObserver" in window)) return; const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .08 }); document.querySelectorAll(".sm-page .ex-reveal").forEach(node => observer.observe(node)); document.querySelector(".sm-page")?.classList.add("ex-motion-ready"); return () => observer.disconnect(); }, []);
  return <div className="ex-page sm-page"><main><CampaignStudioHero/><ProspectDemo/><section className="ex-closing sm-closing ex-reveal"><div className="ex-shell ex-closing-grid"><div><Eyebrow>THE NEXT STEP</Eyebrow><h2>Build a more coordinated <em>sales & marketing workflow.</em></h2><p>Bring your objective, approved customer context, and team together to explore how AI employees could help prepare work for review.</p><div className="ex-hero-actions"><Action href="#sales-workflows">Explore sales & marketing</Action><Link href="/book-demo">Book a demo <ArrowUpRight size={16}/></Link></div></div><div className="ex-closing-art"><span/><WorkerScene ensemble ensembleRoles={["sales", "marketing", "research", "data"]}/></div></div></section><WorkflowExplorer item={item}/><Insights/></main></div>;
}
