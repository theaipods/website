"use client";

import { SolutionsAtlasHero } from "@/components/SolutionHeroScenes";

import { ToolLogo } from "@/components/tool-logo";
import { WorkerScene,type WorkerRole } from "@/components/WorkerScene";
import { integrationRegistry } from "@/lib/integration-registry";
import { discoverSolution,finderObjectives } from "@/lib/solution-discovery";
import { solutionHref,solutions } from "@/lib/solutions";
import { ArrowRight,ArrowUpRight,Check,ChevronDown,Link2,Network,RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect,useRef,useState } from "react";

const industryArt: Record<string, WorkerRole> = { healthcare: "support", insurance: "security" };
const workflow = [
  { title: "Receive the request", copy: "A business objective enters a local example workflow with its desired outcome and context." },
  { title: "Plan the work", copy: "The orchestrator breaks the objective into visible steps and identifies the specialists involved." },
  { title: "Use the right tools", copy: "Approved sources and tools can supply context when they are configured for the company." },
  { title: "Execute tasks", copy: "Specialists prepare their outputs and pass evidence to the next step." },
  { title: "Review and complete", copy: "A person reviews the result where the workflow requires a decision or approval." },
];
const featuredTools = ["Slack", "Google Drive", "Gmail", "Microsoft Teams", "Notion", "HubSpot", "Salesforce", "GitHub", "Jira", "Linear", "Figma", "Google Calendar"];

function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="sr-eyebrow"><i/>{children}</span>; }


function Action({ href, children, pale = false }: { href: string; children: React.ReactNode; pale?: boolean }) { return <Link href={href} className={`sr-action${pale ? " sr-action-pale" : ""}`}>{children}<ArrowUpRight size={16}/></Link>; }
function SectionIntro({ label, title, copy }: { label: string; title: React.ReactNode; copy?: string }) { return <div className="sr-section-intro"><div><Eyebrow>{label}</Eyebrow><h2>{title}</h2></div>{copy && <p>{copy}</p>}</div>; }

function SolutionFinder() {
  const [group, setGroup] = useState("Any area");
  const [objective, setObjective] = useState<string>(finderObjectives[0]);
  const [teamSize, setTeamSize] = useState("Not specified");
  const [submitted, setSubmitted] = useState(false);
  const recommendation = discoverSolution(group, objective);
  const resultRef = useRef<HTMLElement>(null);
  const submit = (event: React.FormEvent) => { event.preventDefault(); setSubmitted(true); resultRef.current?.focus(); };
  return <section id="find-solution" className="sr-section sr-finder"><div className="sr-shell"><SectionIntro label="GET STARTED" title={<>Start with the work.<br/>Find the <em>right solution.</em></>} copy="Choose a business area and objective to explore a matching example. Team size helps frame a later conversation."/><div className="sr-finder-grid"><form onSubmit={submit} className="sr-finder-form"><label htmlFor="sr-area">Business function or industry</label><span className="sr-select"><select id="sr-area" value={group} onChange={event => { setGroup(event.target.value); setSubmitted(false); }}><option>Any area</option><optgroup label="Business function">{solutions.filter(item => item.category === "Department").map(item => <option key={item.slug} value={item.slug}>{item.title}</option>)}</optgroup><optgroup label="Industry">{solutions.filter(item => item.category === "Industry").map(item => <option key={item.slug} value={item.slug}>{item.title}</option>)}</optgroup></select><ChevronDown size={16}/></span><label htmlFor="sr-objective">Primary objective</label><span className="sr-select"><select id="sr-objective" value={objective} onChange={event => { setObjective(event.target.value); setSubmitted(false); }}>{finderObjectives.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={16}/></span><label htmlFor="sr-team">Team size <small>(conversation context)</small></label><span className="sr-select"><select id="sr-team" value={teamSize} onChange={event => { setTeamSize(event.target.value); setSubmitted(false); }}>{["Not specified", "1–10 people", "11–50 people", "51–200 people", "201+ people"].map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={16}/></span><div className="sr-finder-actions"><button type="submit" className="sr-action">Find my solution <ArrowRight size={16}/></button><Link href="/book-demo">Talk to our team <ArrowUpRight size={15}/></Link></div><p>Local matching based on area and objective. Team size does not change the match.</p></form><article ref={resultRef} tabIndex={-1} className="sr-recommendation" key={recommendation.slug}><div className="sr-recommendation-copy"><Eyebrow>{submitted ? "YOUR EXAMPLE MATCH" : "RECOMMENDED SOLUTION"}</Eyebrow><h3>{recommendation.title}</h3><p>{recommendation.description}</p><ul>{recommendation.stages.slice(0, 4).map(stage => <li key={stage}><Check size={15}/>{stage}</li>)}</ul><Link href={solutionHref(recommendation.slug)} className="sr-recommendation-link">Explore this solution <ArrowUpRight size={16}/></Link><small>Illustrative match · configuration requires review</small></div><div className="sr-recommendation-art"><WorkerScene role={recommendation.slug === "healthcare" ? "support" : recommendation.slug === "insurance" ? "security" : recommendation.slug === "finance-operations" ? "finance" : recommendation.slug === "sales-marketing" ? "sales" : recommendation.slug === "customer-experience" ? "support" : "people"}/><span className="sr-recommendation-orbit"/></div></article></div></div></section>;
}

function IndustryCards() {
  const industries = solutions.filter(item => item.category === "Industry");
  return <section className="sr-section sr-industries"><div className="sr-shell"><SectionIntro label="INDUSTRY SOLUTIONS" title="Built around your industry." copy="Explore the industry pages currently available. Each example is shaped by its workflows, context, and human decisions."/><div className="sr-industry-grid">{industries.map((item, index) => <Link href={solutionHref(item.slug)} className="sr-industry-card" key={item.slug}><div className="sr-industry-art"><span className="sr-industry-number">0{index + 1} / INDUSTRY</span><WorkerScene role={industryArt[item.slug]}/><span className="sr-industry-halo"/></div><div className="sr-industry-content"><h3>{item.title}</h3><p>{item.description}</p><strong>Explore solution <ArrowRight size={15}/></strong></div></Link>)}</div></div></section>;
}

function WorkflowDemo() {
  const [active, setActive] = useState(0);
  return <section id="workflow-demo" className="sr-section sr-workflow"><div className="sr-shell"><SectionIntro label="SEE IT IN ACTION" title={<>Watch the work move,<br/>step by step.</>} copy="Select a stage to inspect an explanatory workflow. This local example does not execute business tasks."/><div className="sr-workflow-grid"><div className="sr-workflow-steps" role="tablist" aria-label="Sample workflow stages">{workflow.map((step, index) => <button key={step.title} type="button" role="tab" id={`sr-workflow-tab-${index}`} aria-controls="sr-workflow-panel" aria-selected={index === active} tabIndex={index === active ? 0 : -1} className={index === active ? "active" : ""} onClick={() => setActive(index)} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const next = (active + (event.key === "ArrowDown" ? 1 : -1) + workflow.length) % workflow.length; setActive(next); document.getElementById(`sr-workflow-tab-${next}`)?.focus(); } }}><span>0{index + 1}</span><b>{step.title}</b><ArrowRight size={15}/></button>)}</div><div className="sr-workflow-panel" role="tabpanel" id="sr-workflow-panel" aria-labelledby={`sr-workflow-tab-${active}`}><div className="sr-workflow-panel-top"><Eyebrow>LOCAL WORKFLOW DEMO</Eyebrow><button type="button" onClick={() => setActive(0)} aria-label="Restart workflow preview"><RotateCcw size={16}/></button></div><div className="sr-flow-diagram">{workflow.map((step, index) => <button key={step.title} type="button" className={index === active ? "active" : index < active ? "passed" : ""} onClick={() => setActive(index)} aria-label={`Show ${step.title}`}><span>{index === workflow.length - 1 ? <Check size={22}/> : index === 2 ? <Link2 size={20}/> : index === 1 ? <Network size={20}/> : <span className="sr-flow-dot"/>}</span><small>{step.title}</small></button>)}</div><div className="sr-workflow-state" key={active}><span className="sr-mini-worker"><WorkerScene role={active === 2 ? "engineering" : "research"}/></span><div><small>STAGE 0{active + 1} / 0{workflow.length}</small><h3>{workflow[active].title}</h3><p>{workflow[active].copy}</p></div></div><div className="sr-workflow-progress" aria-hidden="true"><i style={{ width: `${((active + 1) / workflow.length) * 100}%` }}/></div></div></div></div></section>;
}

function ToolStrip() {
  const [category, setCategory] = useState("All");
  const tools = featuredTools.map(name => integrationRegistry.find(item => item.name === name)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const categories = ["All", ...new Set(tools.map(item => item.category))];
  const visible = tools.filter(item => category === "All" || item.category === category);
  return <section className="sr-section sr-tools"><div className="sr-shell"><SectionIntro label="YOUR WORK ALREADY FITS" title={<>Explore the tools<br/>your team uses.</>} copy="These are catalog examples. Provider setup and permissions are required before an AI Pod can use a tool."/><div className="sr-tool-filters" aria-label="Filter example tools">{categories.map(item => <button key={item} type="button" aria-pressed={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="sr-tool-grid">{visible.map(item => <Link href="/integrations#catalog" key={item.id} title={`${item.name} · ${item.mode === "planned_adapter" ? "planned adapter" : "configuration required"}`}><ToolLogo name={item.name} size={36}/><span>{item.name}</span></Link>)}</div><Link className="sr-inline-link" href="/integrations#catalog">View the integrations catalog <ArrowUpRight size={17}/></Link></div></section>;
}

function Governance() { return <section className="sr-governance"><div className="sr-shell sr-governance-grid"><div><Eyebrow>DECISION SUPPORT</Eyebrow><h2>People stay at<br/>the decision points.</h2><p>AI employees can prepare work for review while authorized people decide what moves forward. This panel shows sample states.</p><Action href="/docs/decisions" pale>See governance guidance</Action></div><div className="sr-governance-panel"><span>ILLUSTRATIVE REVIEW PATH</span>{[["Research and analysis", "Prepared"], ["Draft response", "For review"], ["Action in tools", "Pending"], ["Notify stakeholders", "Pending"]].map(([name, status], index) => <div key={name}><span>0{index + 1}</span><b>{name}</b><small className={index === 0 ? "prepared" : index === 1 ? "review" : ""}>{status}</small></div>)}</div></div></section>; }

export function SolutionsRedesign() {
  
  useEffect(() => { if (!("IntersectionObserver" in window)) return; const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .1 }); document.querySelectorAll(".sr-reveal").forEach(node => observer.observe(node)); document.querySelector(".sr-page")?.classList.add("sr-motion-ready"); return () => observer.disconnect(); }, []);
  return <div className="sr-page"><main><SolutionsAtlasHero/><div className="sr-reveal"><SolutionFinder/></div><div className="sr-reveal"><IndustryCards/></div><div className="sr-reveal"><WorkflowDemo/></div><div className="sr-reveal"><ToolStrip/></div><div className="sr-reveal"><Governance/></div><section className="sr-section sr-more sr-reveal"><div className="sr-shell"><SectionIntro label="EXPLORE MORE SOLUTIONS" title="Explore the platform behind the work." copy="Choose a business solution or learn how the platform connects specialists, tools and review."/><div className="sr-more-grid">{solutions.filter(item => item.category === "Department").map(item => <Link key={item.slug} href={solutionHref(item.slug)}><span>{item.title}</span><small>{item.objective}</small><ArrowUpRight size={17}/></Link>)}</div></div></section></main></div>;
}
