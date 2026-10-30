"use client";
import { ProductWorkbenchHero } from "@/components/PageSpecificHeroes";
import { ToolLogo } from "@/components/tool-logo";
import Image from "next/image";
import { capabilityGroups, deliverableExamples, integrationExamples, knowledgeSources, lifecycle, productFaq, productScenes } from "@/lib/product-demo";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Pause, Play, X, Sparkles, Network, FileText, Database, ShieldCheck, Users, Workflow, Search, ChartNoAxesCombined, Layers, ClipboardCheck, Plus, CircleCheck, FileSpreadsheet, Presentation, BookOpen } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function Window({stage=0,compact=false}:{stage?:number;compact?:boolean}){const scene=productScenes[stage];return <div className={`pd-window${compact?" compact":""}`}><div className="pd-window-top"><span className="pd-window-dots"><i/><i/><i/></span><b>AI POD / WORKSPACE</b><small>DEMO PREVIEW</small></div><div className="pd-window-body"><aside><span>COMMAND CENTER</span>{["Overview","Workforce","Tasks","Approvals","Deliverables"].map((item,i)=><div className={i===Math.min(stage,4)?"active":""} key={item}><i>0{i+1}</i>{item}</div>)}</aside><div className="pd-window-main"><div className="pd-window-heading"><small>{scene.eyebrow}</small><h3>{scene.title}</h3><p>Prepare a due-diligence report for a fictional retail company.</p></div><div className="pd-window-list">{scene.stages.map((item,i)=><div key={item} style={{"--item-delay":`${i*90}ms`} as React.CSSProperties}><span>{i<2?<Check size={13}/>:String(i+1).padStart(2,"0")}</span><b>{item}</b><small>{i<2?"PREPARED":i===2?"IN REVIEW":"NEXT"}</small></div>)}</div><div className="pd-window-foot"><span><i/> Sample workflow / no live execution</span><b>VIEW ACTIVITY <ArrowUpRight size={13}/></b></div></div></div></div>}

function PreviewModal({close}:{close:()=>void}){const [scene,setScene]=useState(0),[playing,setPlaying]=useState(true),[progress,setProgress]=useState(0),closeRef=useRef<HTMLButtonElement>(null),contentRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{const previous=document.activeElement as HTMLElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)setPlaying(false);closeRef.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==="Escape")close();if(e.key==="ArrowRight")setScene(s=>(s+1)%4);if(e.key==="ArrowLeft")setScene(s=>(s+3)%4);if(e.key===" "&&e.target===document.body){e.preventDefault();setPlaying(p=>!p)}if(e.key==="Tab"){const nodes=[...(contentRef.current?.querySelectorAll<HTMLElement>("button,a[href]")||[])].filter(el=>!el.hasAttribute("disabled"));if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};document.addEventListener("keydown",key);document.body.style.overflow="hidden";return()=>{document.removeEventListener("keydown",key);document.body.style.overflow="";previous?.focus()}},[close]);
 useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setProgress(value=>{if(value>=100){setScene(s=>(s+1)%4);return 0}return value+2}),120);return()=>clearInterval(timer)},[playing]);
 const change=(next:number)=>{setScene((next+4)%4);setProgress(0)};
 return <div className="pd-modal" role="dialog" aria-modal="true" aria-label="Interactive AI Pod product preview" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div ref={contentRef} className="pd-modal-content"><button ref={closeRef} className="pd-modal-close" onClick={close} aria-label="Close preview"><X/></button><div className="pd-modal-heading"><span className="pd-kicker">INTERACTIVE PRODUCT PREVIEW / SAMPLE WORKFLOW</span><h2>{productScenes[scene].title}</h2><p>{productScenes[scene].description}</p></div><Window stage={scene} compact/><div className="pd-modal-progress" aria-label={`Preview progress ${progress}%`}><span style={{width:`${progress}%`}}/></div><div className="pd-modal-controls"><button onClick={()=>setPlaying(p=>!p)} aria-label={playing?"Pause preview":"Play preview"}>{playing?<Pause size={18}/>:<Play size={18}/>}</button><button onClick={()=>change(scene-1)} aria-label="Previous scene"><ChevronLeft size={20}/></button><span>{String(scene+1).padStart(2,"0")} / 04</span><button onClick={()=>change(scene+1)} aria-label="Next scene"><ChevronRight size={20}/></button><div>{productScenes.map((item,i)=><button key={item.title} className={scene===i?"active":""} onClick={()=>change(i)} aria-label={`Show ${item.title}`} aria-current={scene===i?"step":undefined}/>)}</div></div></div></div>
}


const specialists = [
  { id: "ops-project-manager", name: "Project Manager", category: "Operations", copy: "Keep owners, tasks and handoffs in sync." },
  { id: "data-research-agent", name: "Research Agent", category: "Research", copy: "Turn approved sources into clear findings." },
  { id: "sales-sales-agent", name: "Sales Agent", category: "Sales", copy: "Prepare thoughtful outreach and follow-up." },
  { id: "legal-compliance-analyst", name: "Compliance Analyst", category: "Governance", copy: "Organize evidence for human review." },
  { id: "data-data-analyst", name: "Data Analyst", category: "Research", copy: "Bring structure and meaning to your data." },
  { id: "hr-employee-assistant", name: "Employee Assistant", category: "People", copy: "Make everyday employee questions easier." },
  { id: "finance-finance-agent", name: "Finance Agent", category: "Finance", copy: "Prepare financial analysis and summaries." },
  { id: "finance-audit-agent", name: "Audit Agent", category: "Finance", copy: "Trace findings back to their evidence." },
  { id: "product-frontend-developer", name: "Frontend Developer", category: "Engineering", copy: "Translate scoped interface work into code." },
  { id: "it-security-engineer", name: "Security Engineer", category: "Governance", copy: "Surface access requirements and risks." },
  { id: "hr-hr-agent", name: "HR Agent", category: "People", copy: "Support policy-aware people operations." },
  { id: "product-backend-developer", name: "Backend Developer", category: "Engineering", copy: "Prepare service changes for technical review." },
];
const categories = ["All", "Operations", "Research", "Sales", "Finance", "People", "Engineering", "Governance"];
const lifecycleNames = ["Plan & design", "Assign & configure", "Execute & collaborate", "Validate & review", "Deliver & improve"];
const capabilityIcons = [Network, ClipboardCheck, Database, ShieldCheck];
const requestSteps = [
  { icon: Search, title: "Understand the request", copy: "Capture the objective, scope and expected result." },
  { icon: Network, title: "Plan the workflow", copy: "Map the work, dependencies and specialist roles." },
  { icon: Database, title: "Gather information", copy: "Retrieve relevant context from permitted sources." },
  { icon: Users, title: "Execute with AI employees", copy: "Coordinate specialist tasks and quality checks." },
  { icon: CircleCheck, title: "Prepare results for review", copy: "Bring findings and sources together for a person." },
];
const objectives = ["Prepare a research brief", "Review a financial report", "Plan employee onboarding"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const activity = [8, 14, 22, 18, 29, 36];
function EmployeeArtwork({id}: {id:string}) {
  return <Image src={`/ai-workforce/avatars-hd/${id}.png`} alt="" width={480} height={400} sizes="(max-width: 600px) 180px, (max-width: 850px) 220px, 200px" loading="lazy"/>;
}
function Eyebrow({ children }: { children: ReactNode }) { return <span className="p2-eyebrow">{children}</span>; }
function Heading({ label, children, copy }: { label: string; children: ReactNode; copy?: string }) {
  return <div className="p2-heading"><div><Eyebrow>{label}</Eyebrow><h2>{children}</h2></div>{copy && <p>{copy}</p>}</div>;
}
function Action({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link className={`p2-button ${secondary ? "p2-secondary" : ""}`} href={href}>{children}<ArrowRight size={17} /></Link>;
}
function FlowPaths() {
  return <svg className="p2-network-paths" viewBox="0 0 600 360" fill="none" aria-hidden="true">
    <path d="M300 180H170Q140 180 140 150V70H90M300 180H400Q440 180 440 140V65H510M300 180H60M300 180H540M300 180H190Q150 180 150 240V290H90M300 180H400Q450 180 450 240V290H510" />
    <path className="p2-energy" d="M90 70H140V150Q140 180 170 180H300H400Q440 180 440 140V65H510M60 180H540M90 290H150V240Q150 180 190 180H400Q450 180 450 240V290H510" />
  </svg>;
}
export function ProductExperience() {
  const root = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState(false), [motion, setMotion] = useState(true);
  const [step, setStep] = useState(0), [cap, setCap] = useState(0), [integration, setIntegration] = useState(0);
  const [category, setCategory] = useState("All"), [expanded, setExpanded] = useState(false), [month, setMonth] = useState(5);
  const [flow, setFlow] = useState(0), [flowPlaying, setFlowPlaying] = useState(false), [objective, setObjective] = useState(objectives[0]);
  const [knowledge, setKnowledge] = useState(0), [search, setSearch] = useState(0), [deliverable, setDeliverable] = useState(0), [faq, setFaq] = useState<number | null>(null);
  const [allFaq, setAllFaq] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setMotion(!media.matches); if(media.matches) setFlowPlaying(false); };
    update(); media.addEventListener("change", update);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle("p2-in-view", entry.isIntersecting);
      if(entry.isIntersecting) entry.target.classList.add("p2-shown");
    }), { threshold: .08 });
    root.current?.querySelectorAll("section").forEach(section => observer.observe(section));
    return () => { observer.disconnect(); media.removeEventListener("change", update); };
  }, []);
  useEffect(() => {
    if (!flowPlaying || !motion) return;
    const timer = setInterval(() => {
      if (document.hidden || !document.getElementById("request-resolution")?.classList.contains("p2-in-view")) return;
      setFlow(value => Math.min(value + 1, requestSteps.length - 1));
    }, 1600);
    return () => clearInterval(timer);
  }, [flowPlaying, motion]);
  useEffect(() => { if(flow === requestSteps.length - 1) setFlowPlaying(false); }, [flow]);
  const selectedIntegration = integrationExamples[integration], selectedSource = knowledgeSources[knowledge], selectedDeliverable = deliverableExamples[deliverable];
  const employees = category === "All" ? specialists : specialists.filter(item => item.category === category);
  const runExample = () => { setFlow(0); setFlowPlaying(motion); };
  return <div ref={root} className="product-showcase" data-motion={motion ? "playing" : "paused"}>
    <main>
      <ProductWorkbenchHero motion={motion} onToggleMotion={()=>{setMotion(!motion);setFlowPlaying(false);}}/>
      <section className="p2-lifecycle" id="lifecycle"><div className="p2-shell p2-reveal">
        <Heading label="01 / Complete lifecycle" copy="From the first objective to a review-ready result, manage every stage of your AI employees in one place.">Manage the full <em>AI{" "}<br/>workforce lifecycle.</em></Heading>
        <button className="p2-preview-link" onClick={()=>setPreview(true)}><Play size={14} fill="currentColor"/>Explore the interactive product preview<ArrowUpRight size={14}/></button>
        <div className="p2-lifecycle-grid"><div className="p2-lifecycle-tabs" role="group" aria-label="Lifecycle stage">{lifecycle.map((item,i)=><button key={item.key} aria-pressed={step===i} onClick={()=>setStep(i)} className={step===i?"active":""}><span className={`p2-icon tone-${i%4}`}>{i===0?<Sparkles size={19}/>:i===1?<Users size={19}/>:i===2?<Workflow size={19}/>:i===3?<ShieldCheck size={19}/>:<FileText size={19}/>}</span>{lifecycleNames[i]}<ChevronRight size={15}/></button>)}</div>
          <div className="p2-lifecycle-panel p2-swap" key={step}><div className="p2-panel-title"><span className="p2-icon tone-0"><Workflow size={27}/></span><div><h3>{lifecycle[step].title}.</h3><p>{lifecycle[step].detail}</p></div></div><div className="p2-plan-tiles">{lifecycle[step].focus.map((item,i)=><div key={item}><span className="p2-icon tone-0">{i===0?<ClipboardCheck size={22}/>:i===1?<Users size={22}/>:i===2?<Network size={22}/>:<CircleCheck size={22}/>}</span><div><b>{item}</b><small>{["Set the context and scope","Give work clear ownership","Keep the team connected","Prepare the next handoff"][i]}</small></div></div>)}</div><small className="p2-sample">Illustrative lifecycle · Select a stage to explore</small></div>
        </div>
      </div></section>
      <section className="p2-capabilities p2-waves" id="capabilities"><div className="p2-shell p2-reveal">
        <Heading label="02 / One platform" copy="Bring people, data, tools and AI employees together around the work that matters.">One platform. Every part{" "}<br/><em>of the work.</em></Heading>
        <div className="p2-cap-grid"><div className="p2-network"><FlowPaths/><div className="p2-network-core"><Sparkles/><b>AI Workforce</b><small>One coordinated Pod</small></div>{[FileText,Database,Workflow,Users,ShieldCheck,ChartNoAxesCombined].map((Icon,i)=><span key={i} className={`p2-network-node p2-node-${i} tone-${i%4}`}><Icon size={27}/></span>)}<span className="p2-network-caption">{capabilityGroups[cap].example}</span></div>
          <div className="p2-cap-list">{capabilityGroups.map((group,i)=>{const Icon=capabilityIcons[i];return <article key={group.title} className={cap===i?"active":""}><button onClick={()=>setCap(i)} aria-expanded={cap===i}><span className={`p2-icon tone-${i%4}`}><Icon size={23}/></span><span><b>{group.title}</b><small>{group.summary}</small></span><ChevronRight size={17}/></button>{cap===i&&<div className="p2-cap-details p2-swap"><p>{group.items.join(" · ")}</p><Link href={group.href}>Explore this area<ArrowUpRight size={14}/></Link></div>}</article>;})}</div>
        </div>
      </div></section>
      <section className="p2-integrations" id="integrations"><div className="p2-shell p2-reveal">
        <div className="p2-integration-copy"><Eyebrow>03 / Integrations & MCP</Eyebrow><h2>Your AI workforce.{" "}<br/>Connected to your{" "}<br/><em>business stack.</em></h2><p>Bring approved tools and company context into the workflow. Connect through integrations and a permissioned MCP layer.</p><Action href="/integrations">Explore integrations</Action><small className="p2-sample">Connection examples · Setup and permissions required</small></div>
        <div className="p2-orbit-area"><div className="p2-orbit"><div className="p2-orbit-ring ring-one"/><div className="p2-orbit-ring ring-two"/><div className="p2-orbit-ring ring-three"/><div className="p2-orbit-core"><Sparkles size={28}/><b>TheAIPods</b><small>Integrations & MCP</small></div>{integrationExamples.map((item,i)=>{const angle=i/integrationExamples.length*Math.PI*2-Math.PI/2;return <button key={item.name} aria-label={`Explore ${item.name} connection`} aria-pressed={integration===i} className={`p2-tool ${integration===i?"active":""}`} style={{left:`${50+Math.cos(angle)*43}%`,top:`${47+Math.sin(angle)*38}%`,"--delay":`${-i*.4}s`} as CSSProperties} onClick={()=>setIntegration(i)}>{item.name === "PostgreSQL" ? <Database size={27} color="#3574a2"/> : item.name === "Custom MCP" ? <Network size={27} color="#7653c7"/> : <ToolLogo name={item.name} size={30}/>}<span>{item.name}</span></button>;})}</div><div className="p2-tool-detail p2-swap" key={integration} aria-live="polite"><span className="p2-status-dot">{selectedIntegration.name}</span><b>{selectedIntegration.type}</b><small>{selectedIntegration.agent} · Illustrative connection</small></div></div>
      </div></section>
      <section className="p2-employees p2-waves" id="roles"><div className="p2-shell p2-reveal">
        <Heading label="04 / Specialized employees" copy="Different responsibilities. Shared context. Explore a team of specialists designed to work together.">Specialized employees{" "}<br/>for <em>complex business work.</em></Heading>
        <div className="p2-pills" role="group" aria-label="Employee categories">{categories.map(item=><button key={item} className={category===item?"active":""} aria-pressed={category===item} onClick={()=>{setCategory(item);setExpanded(false);}}>{item}</button>)}</div>
        <div className="p2-employee-grid">{employees.slice(0,expanded?undefined:6).map((item,i)=><Link href="/agents" className="p2-employee p2-swap" key={item.id} style={{"--stagger":`${i*50}ms`} as CSSProperties}><div className="p2-employee-art"><EmployeeArtwork id={item.id}/></div><h3>{item.name}</h3><p>{item.copy}</p><span className="p2-employee-arrow"><ArrowRight size={15}/></span></Link>)}</div><div className="p2-employee-foot"><span>Example responsibilities · Explore availability in the agent registry</span>{employees.length>6&&<button onClick={()=>setExpanded(!expanded)}>{expanded?"Show fewer employees":"Meet more employees"}<ChevronDown size={15}/></button>}</div>
      </div></section>
      <section className="p2-progress" id="progress"><div className="p2-shell p2-reveal p2-progress-grid">
        <div><Eyebrow>05 / Understand the work</Eyebrow><h2>Understand the work.{" "}<br/><em>See the progress.</em></h2><p>Keep tasks, handoffs and review points visible as your workforce moves forward.</p><div className="p2-metric-cards">{[[Workflow,"04","Active specialists"],[CircleCheck,"05","Prepared tasks"],[ClipboardCheck,"01","Awaiting review"],[Layers,"03","Workstreams"]].map(([Icon,value,label],i)=>{const MetricIcon=Icon as typeof Workflow;return <div key={String(label)}><span className={`p2-icon tone-${i%4}`}><MetricIcon size={17}/></span><b>{String(value)}</b><small>{String(label)}</small></div>;})}</div><small className="p2-sample">Fictional sample data · Not performance claims</small></div>
        <div className="p2-chart"><div className="p2-chart-heading"><b>AI workforce activity</b><span><i/>{activity[month]} tasks prepared<small>{months[month]} · Sample month</small></span></div><div className="p2-chart-plot"><div className="p2-chart-guides"><span>40</span><span>20</span><span>0</span></div><div className="p2-bars">{activity.map((value,i)=><button key={months[i]} aria-label={`${months[i]}: ${value} sample tasks`} aria-pressed={month===i} className={month===i?"active":""} onClick={()=>setMonth(i)}><span style={{height:`${value/40*100}%`}}><i>{value}</i></span><small>{months[i]}</small></button>)}</div></div><p>Select a month to inspect the example.</p></div>
      </div></section>
      <section className="p2-request p2-waves" id="request-resolution"><div className="p2-shell p2-reveal p2-split">
        <div><Eyebrow>06 / From request to execution</Eyebrow><h2>From one business request{" "}<br/>to <em>coordinated execution.</em></h2><p>Start with an objective. See how a Pod can organize the right specialists, context, and review points.</p><form className="p2-objective" onSubmit={e=>{e.preventDefault();runExample();}}><Sparkles size={23}/><label className="sr-only" htmlFor="p2-objective-input">Sample objective</label><input id="p2-objective-input" value={objective} maxLength={180} onChange={e=>setObjective(e.target.value)} placeholder="Describe your objective…" required/><button aria-label="Preview the sample workflow" type="submit"><ArrowRight size={19}/></button></form><div className="p2-objective-options">{objectives.map((item,i)=><button key={item} onClick={()=>{setObjective(item);setFlow(0);setFlowPlaying(false);}}><i/>{["Research brief","Financial review","Onboarding"][i]}</button>)}</div><small className="p2-sample">Local illustration · No AI request or external action</small></div>
        <div className="p2-execution"><div className="p2-execution-top"><span><i/>{flowPlaying?"Walking through the example":"Your objective, one coordinated plan"}</span><button aria-label={flowPlaying?"Pause sample workflow":"Replay sample workflow"} onClick={()=>flowPlaying?setFlowPlaying(false):runExample()}>{flowPlaying?<Pause size={15}/>:<Play size={15}/>}</button></div>{requestSteps.map(({icon:Icon,title,copy},i)=><button key={title} onClick={()=>{setFlow(i);setFlowPlaying(false);}} className={flow===i?"active":flow>i?"done":""} aria-pressed={flow===i}><span className={`p2-icon tone-${i===4?2:0}`}>{flow>i?<Check size={22}/>:<Icon size={22}/>}</span><span><b>{title}</b><small>{copy}</small></span><span className="p2-step-number">0{i+1}</span></button>)}<div className="p2-execution-note" aria-live="polite">{flow===4?"Draft prepared. A person reviews the result.":requestSteps[flow].copy}</div></div>
      </div></section>
      <section className="p2-context" id="knowledge"><div className="p2-shell p2-reveal p2-context-grid"><div><Eyebrow>07 / Give the right context</Eyebrow><h2>Give AI employees{" "}<br/>the <em>right context.</em></h2><p>Connect approved knowledge, policies and background information for more useful work.</p></div><div className="p2-context-map"><svg viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true"><path d="M110 48C250 48 180 130 300 130M110 130H500M110 212C250 212 180 130 300 130M300 130C420 130 360 48 500 48M300 130C420 130 360 212 500 212"/></svg><div className="p2-context-sources">{knowledgeSources.slice(0,3).map((item,i)=><button key={item.name} className={knowledge===i?"active":""} onClick={()=>setKnowledge(i)} aria-pressed={knowledge===i}>{item.name}<span className="p2-icon tone-0">{i===0?<FileText size={18}/>:i===1?<ShieldCheck size={18}/>:<BookOpen size={18}/>}</span></button>)}</div><div className="p2-context-core"><Sparkles size={26}/><b>Context</b><small>Approved access</small></div><div className="p2-context-outcomes">{["Relevant evidence","Informed drafts","Consistent context"].map((item,i)=><span key={item}><span className={`p2-icon tone-${i+1}`}><Check size={17}/></span>{item}</span>)}</div><p className="p2-context-note" aria-live="polite">{selectedSource.example} · {selectedSource.permissions}</p></div></div></section>
      <section className="p2-knowledge p2-waves"><div className="p2-shell p2-reveal p2-split"><div><Eyebrow>08 / Go beyond information</Eyebrow><h2>Go beyond finding{" "}<br/>information. <em>Make it{" "}<br/>useful for work.</em></h2><p>Turn permitted context into insights, recommendations, and drafts that move work forward.</p><div className="p2-pills" role="group" aria-label="Knowledge demonstration">{["Find","Retrieve","Apply"].map((item,i)=><button key={item} className={search===i?"active":""} onClick={()=>setSearch(i)} aria-pressed={search===i}>{item}<ArrowRight size={13}/></button>)}</div></div><div className="p2-knowledge-scene"><div className="p2-floating-doc doc-one"><FileText/></div><div className="p2-floating-doc doc-two"><ClipboardCheck/></div><div className="p2-floating-doc doc-three"><FileSpreadsheet/></div><div className="p2-policy p2-swap" key={search}><div className="p2-policy-head"><span className="p2-icon tone-0"><Search size={23}/></span><div><h3>{["Find the right policy","Retrieve permitted context","HR policy summary"][search]}</h3><small>Fictional company · Sample document</small></div></div><div className="p2-policy-lines">{["Approval requirements","Roles and responsibilities","Escalation and review"].map(item=><div key={item}><CircleCheck size={13}/><span>{item}<i/></span></div>)}</div><p><Sparkles size={17}/>{["Search the sources your Pod is allowed to use.","Bring the relevant passages into a specialist task.","Prepare a policy-aware recommendation for your team to review."][search]}</p><span className="p2-policy-source"><ShieldCheck size={13}/>Source attached · Human review retained</span></div></div></div></section>
      <section className="p2-deliverables" id="deliverables"><div className="p2-shell p2-reveal p2-delivery-grid"><div><Eyebrow>09 / Turn work into deliverables</Eyebrow><h2>Turn coordinated work{" "}<br/>into <em>review-ready deliverables.</em></h2><p>Generate clear, structured drafts for people to review, approve, and share.</p></div><div className="p2-delivery-preview"><div className="p2-output-card p2-swap" key={deliverable}><span className="p2-icon tone-0"><FileText size={25}/></span><div><h3>{selectedDeliverable.title}</h3><p>{selectedDeliverable.sections.slice(0,2).join(" · ")}</p><small><Check size={12}/>Sample draft · Prepared for human review</small></div></div><div className="p2-file-types" role="group" aria-label="Deliverable preview">{deliverableExamples.map((item,i)=><button key={item.name} aria-pressed={deliverable===i} onClick={()=>setDeliverable(i)} className={`tone-${i%4} ${deliverable===i?"active":""}`}>{i===1?<FileSpreadsheet size={22}/>:i===2?<Presentation size={22}/>:i===3?<ChartNoAxesCombined size={22}/>:i===4?<ClipboardCheck size={22}/>:<FileText size={22}/>}<span>{item.name}</span></button>)}</div></div></div></section>
      <section className="p2-faq"><div className="p2-shell p2-reveal p2-faq-grid"><div><Eyebrow>10 / Questions</Eyebrow><h2>Questions before{" "}<br/><em>you build?</em></h2><p>Get to know your next workforce.{" "}<br/>We’re here to help you get started.</p><Action href="/book-demo" secondary>Talk to our team</Action></div><div>{productFaq.slice(0, allFaq ? undefined : 6).map(([q,a],i)=><details key={q} open={faq===i}><summary onClick={e=>{e.preventDefault();setFaq(faq===i?null:i);}}><span><span className="p2-faq-dot"><Plus size={12}/></span>{q}</span><Plus size={17}/></summary><p>{a}</p></details>)}<button className="p2-more-questions" aria-expanded={allFaq} onClick={()=>{setAllFaq(!allFaq);setFaq(null);}}>{allFaq ? "Show fewer questions" : "Explore all product questions"}<ChevronDown size={15}/></button></div></div></section>
    </main>{preview&&<PreviewModal close={()=>setPreview(false)}/>}
  </div>;
}
