"use client";
import { IntegrationGateway } from "@/components/IntegrationGateway";
import { IntegrationBridgeHero } from "@/components/PageSpecificHeroes";
import { StaticEmployee } from "@/components/StaticEmployee";

import { ToolLogo } from "@/components/tool-logo";
import { integrationCategories,integrationRegistry,type IntegrationEntry } from "@/lib/integration-registry";
import { ArrowDown,ArrowUpRight,Check,Target,Network,Database,Files,ChartNoAxesCombined,GitPullRequest,UserRoundCheck,Search,X } from "lucide-react";
import Link from "next/link";
import { useEffect,useMemo,useRef,useState } from "react";

const workflowScenarios = [
  { name: "Research brief", specialist: "Research Agent", portrait: "research", tool: "Google Drive", output: "Evidence pack", OutputIcon: Files },
  { name: "Financial review", specialist: "Finance Agent", portrait: "finance", tool: "PostgreSQL", output: "Analysis", OutputIcon: ChartNoAxesCombined },
  { name: "Engineering release", specialist: "Frontend Developer", portrait: "engineering", tool: "GitHub", output: "Change proposal", OutputIcon: GitPullRequest },
] as const;
function WorkflowIcon({scenario, step}: {scenario:number; step:number}) {
  const item = workflowScenarios[scenario];
  if (step === 1) return <div className="ix-step-visual"><StaticEmployee id={scenario === 0 ? "data-research-agent" : scenario === 1 ? "finance-finance-agent" : "product-frontend-developer"}/></div>;
  const Icon = step === 0 ? Target : step === 2 ? Network : step === 4 ? item.OutputIcon : step === 5 ? UserRoundCheck : Database;
  return <div className="ix-step-visual" aria-hidden="true">{step === 3 && item.tool !== "PostgreSQL" ? <ToolLogo name={item.tool} size={34}/> : <Icon size={34} strokeWidth={1.7}/>}</div>;
}

function Reveal({ children, className="" }: { children: React.ReactNode; className?: string }) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(!ref.current)return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("in-view");observer.unobserve(entry.target);}}),{threshold:.12});observer.observe(ref.current);return()=>observer.disconnect();},[]);
  return <div ref={ref} className={`ix-reveal ${className}`}>{children}</div>;
}
function BrandLogo({ name, size=34 }: { name:string; size?:number }) { return <span className="ix-brand-logo"><ToolLogo name={name} size={size}/><span className="ix-logo-fallback">{name.slice(0,1)}</span></span>; }
function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="ix-eyebrow"><i/> {children}</span>; }
function SectionHead({ label,title,copy }: { label:string;title:React.ReactNode;copy:string }) { return <Reveal className="ix-section-head"><Eyebrow>{label}</Eyebrow><h2>{title}</h2><p>{copy}</p></Reveal>; }

export function IntegrationExperience() {
  const [query,setQuery]=useState("");const [category,setCategory]=useState("All");const [detail,setDetail]=useState<IntegrationEntry|null>(null);
  const [scenario,setScenario]=useState(0);const [limit,setLimit]=useState(20);const [activeStep,setActiveStep]=useState(0);const [workflowVisible,setWorkflowVisible]=useState(false);
  const workflowRef=useRef<HTMLElement>(null);
  useEffect(()=>{if(!detail)return;const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setDetail(null);};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[detail]);
  const catalog=useMemo(()=>integrationRegistry.filter(item=>(category==="All"||item.category===category)&&`${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase())),[category,query]);
  useEffect(()=>setLimit(20),[query,category]);
  useEffect(()=>{const element=workflowRef.current;if(!element)return;const observer=new IntersectionObserver(entries=>{if(entries[0]?.isIntersecting){setWorkflowVisible(true);observer.disconnect();}},{threshold:.2});observer.observe(element);return()=>observer.disconnect();},[]);
  useEffect(()=>{if(!workflowVisible)return;setActiveStep(0);if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setActiveStep(5);return;}let step=0;const timer=window.setInterval(()=>{step+=1;setActiveStep(step);if(step===5)window.clearInterval(timer);},530);return()=>window.clearInterval(timer);},[scenario,workflowVisible]);
  return <div className="ix-page">
    
    <main>
      <IntegrationBridgeHero/>
      <section className="ix-systems-strip"><div className="ix-shell"><span>YOUR BUSINESS ALREADY RUNS HERE</span><div>{["Slack","Gmail","Google Drive","Salesforce","GitHub","Notion","HubSpot","QuickBooks"].map(name=><span key={name}><BrandLogo name={name} size={24}/><b>{name}</b></span>)}</div></div></section>
      <IntegrationGateway/>
      <section className="ix-section ix-catalog" id="catalog"><div className="ix-shell"><SectionHead label="THE DIRECTORY / 04" title={<>Find the systems<br/><span>behind your work.</span></>} copy="Browse a structured catalog of candidate connections. Connector availability is shown honestly in each detail."/><div className="ix-catalog-tools"><label className="ix-search"><Search size={19}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search tools, categories or workflows" aria-label="Search integrations"/></label><span>{catalog.length} catalog entries</span></div><div className="ix-categories" role="group" aria-label="Integration category">{integrationCategories.map(item=><button key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div><div className="ix-catalog-grid">{catalog.slice(0,limit).map(item=><button className="ix-catalog-card" onClick={()=>setDetail(item)} key={item.id}><BrandLogo name={item.name} size={28}/><span><b>{item.name}</b><small>{item.category}</small></span><ArrowUpRight size={17}/></button>)}</div>{catalog.length>limit&&<button className="ix-load" onClick={()=>setLimit(value=>value+18)}>Show more integrations <ArrowDown size={16}/></button>}{catalog.length===0&&<p className="ix-empty">No matching systems. Try another category or search term.</p>}</div></section>
      <section className="ix-section ix-workflow" ref={workflowRef}><div className="ix-shell"><SectionHead label="A WORKFLOW IN MOTION / 06" title={<>Not another app list.<br/><span>A path from data to decision.</span></>} copy="Choose a scenario to see how a task could move through a governed connection layer. This is an explanatory animation, not a live tool call."/><div className="ix-scenario-switch">{workflowScenarios.map(({name:item},i)=><button key={item} aria-pressed={scenario===i} onClick={()=>setScenario(i)}>{item}</button>)}</div><Reveal className="ix-workflow-lane">{["Objective",workflowScenarios[scenario].specialist,"MCP gateway",workflowScenarios[scenario].tool,workflowScenarios[scenario].output,"Human review"].map((name,i)=><div className={`ix-workflow-node${i===activeStep?" is-active":""}${i<activeStep?" is-complete":""}`} key={`${scenario}-${i}`}><WorkflowIcon scenario={scenario} step={i}/><span>{String(i+1).padStart(2,"0")}</span><b>{name}</b>{i<5&&<i className="ix-flow-line"><em/></i>}</div>)}</Reveal><p className="ix-workflow-caption">Task → authorized tool → returned context → specialist output → human checkpoint</p></div></section>

    </main>
    {detail&&<div className="ix-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setDetail(null);}}><aside className="ix-detail" role="dialog" aria-modal="true" aria-label={`${detail.name} integration details`}><button className="ix-detail-close" onClick={()=>setDetail(null)} aria-label="Close integration details"><X size={20}/></button><div className="ix-detail-hero"><BrandLogo name={detail.name} size={43}/><span>{detail.category} / CONNECTOR CATALOG</span><h2>{detail.name}</h2><p>{detail.description}</p></div><div className="ix-detail-body"><div className="ix-detail-status"><span>Current availability</span><b>{detail.mode==="custom_mcp"?"Discovery available":"Adapter not connected"}</b></div><h3>Potential specialist fit</h3><p>{detail.agents.join(" · ")}</p><h3>Illustrative capabilities</h3><ul>{detail.capabilities.map(capability=><li key={capability}><Check size={15}/>{capability}</li>)}</ul><h3>Connection path</h3><p>{detail.mode==="custom_mcp"?"Register a public HTTPS MCP endpoint in your workspace, then discover its tool schemas. Execution stays disabled.":detail.mode==="model_gateway"?"Configure the supported model capability on the server. This catalog card does not show account connection state.":"A provider-specific adapter and authorization flow must be implemented before live data or actions are available."}</p></div><Link href="/workspace/settings#mcp" className="ix-button ix-button-dark">Open connection settings <ArrowUpRight size={16}/></Link></aside></div>}
  </div>;
}



