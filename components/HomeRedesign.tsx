"use client";
import Image from "next/image";
import { HomeConnectedContext } from "@/components/HomeConnectedContext";
import { HomeWorkforceHero } from "@/components/HomeWorkforceHero";

import { HomeObjectiveDemo } from "@/components/HomeObjectiveDemo";
import { SpecialistWorkforce } from "@/components/SpecialistWorkforce";
import { Contact } from "@/components/landing";
import { ToolLogo } from "@/components/tool-logo";
import { registryDefinitions } from "@/lib/agent-registry";
import { autonomyLevels,faqs } from "@/lib/catalog";
import { integrationRegistry } from "@/lib/integration-registry";
import { solutions } from "@/lib/solutions";
import { ArrowRight,ArrowUpRight,BookOpen,Check,CheckCircle2,ChevronRight,ClipboardCheck,FileText,GitBranch,LockKeyhole,Pause,Play,RotateCcw,ShieldCheck,Sparkles,UsersRound, Headphones, HeartPulse, ChartNoAxesCombined, Megaphone, BriefcaseBusiness, Zap, Smile, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect,useMemo,useRef,useState } from "react";

const logoNames = ["Slack", "Microsoft Teams", "Google Drive", "Salesforce", "Notion", "Jira", "Gmail", "GitHub"];
const phases = [
  { name: "Understand", detail: "Define the objective and approved context.", icon: BookOpen },
  { name: "Plan", detail: "Break the work into owned steps.", icon: GitBranch },
  { name: "Take action", detail: "Prepare work within the sample flow.", icon: Sparkles },
  { name: "Human review", detail: "Route consequential work to a person.", icon: UsersRound },
  { name: "Complete", detail: "Present a review-ready output.", icon: CheckCircle2 },
];
const tasks = [
  { name: "Gather information", detail: "Organize approved account context", icon: BookOpen },
  { name: "Draft communications", detail: "Prepare a customer-facing draft", icon: FileText },
  { name: "Prepare system update", detail: "Shape a proposed change", icon: GitBranch },
  { name: "Route for review", detail: "Send work to the right person", icon: ShieldCheck },
];
const entryPoints = [
  { title: "Run a single team", description: "Start with one objective and a focused specialist pod.", href: "/workspace/pods/new", image: "orchestrator" },
  { title: "Modernize a function", description: "Bring a department's work into a coordinated flow.", href: "/solutions", image: "sales-sales-agent" },
  { title: "Build a system", description: "Plan connected work across teams and business functions.", href: "/product", image: "product-backend-developer" },
];
const categoryOptions = [
  { id: "", label: "All" }, { id: "sales", label: "Sales" }, { id: "marketing", label: "Marketing" },
  { id: "hr", label: "People & HR" }, { id: "finance", label: "Finance" },
  { id: "product", label: "Product" }, { id: "it", label: "IT" }, { id: "data", label: "Data" },
];
const solutionSummaries: Record<string, string> = {
  "customer-experience": "Organize requests and prepare reviewed responses.",
  "finance-operations": "Keep reporting, evidence, and exceptions visible.",
  "employee-experience": "Support people workflows with approved context.",
  "sales-marketing": "Coordinate research, campaigns, and follow-up.",
  healthcare: "Structure administrative work for staff review.",
  insurance: "Organize policy and claims work for reviewers.",
};

function HomeEmployee({id, eager = false}: {id:string; eager?:boolean}) {
  return <Image src={`/ai-workforce/avatars-hd/${id}.png`} width={480} height={400} alt="" sizes={eager ? "(max-width: 650px) 260px, 450px" : "(max-width: 650px) 200px, 320px"} loading={eager ? "eager" : "lazy"} className="hm-character"/>;
}
const solutionIcons = [UsersRound, Headphones, ChartNoAxesCombined, Megaphone, HeartPulse, ShieldCheck];
function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="hm-eyebrow"><i/>{children}</span>; }
function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="hm-button">{children}<ArrowRight size={17}/></Link>; }
function SectionHead({ eyebrow, title, copy }: { eyebrow: string; title: React.ReactNode; copy?: string }) { return <div className="hm-section-head"><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2></div>{copy && <p>{copy}</p>}</div>; }

function WorkflowDemo({motion}: {motion:boolean}) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  useEffect(() => { if (!motion) setPlaying(false); }, [motion]);
  useEffect(() => {
    if (!playing || !motion) return;
    const timer = window.setInterval(() => {
      if (document.hidden || !document.getElementById("how-it-works")?.classList.contains("hm-in-view")) return;
      setStep(current => Math.min(current + 1, phases.length - 1));
    }, 1500);
    return () => window.clearInterval(timer);
  }, [playing, motion]);
  useEffect(() => { if (step === phases.length - 1) setPlaying(false); }, [step]);
  return <section className="hm-section hm-demo" id="how-it-works"><div className="hm-shell"><SectionHead eyebrow="SEE IT IN ACTION" title={<>Watch the pod move <em>work forward.</em></>} copy="Give a sample workforce an objective and see the work move from context to a review-ready result."/><div className="hm-demo-board"><div className="hm-demo-objective"><div className="hm-demo-card"><small>EXAMPLE OBJECTIVE</small><h3>Customer onboarding</h3><p>Prepare the next customer handoff with a clear plan, relevant context, and a person at the review point.</p><div className="hm-demo-logos">{["Slack","Jira","Google Drive"].map(name=><ToolLogo key={name} name={name} size={27}/>)}</div></div><button type="button" className="hm-demo-play" onClick={() => { if(playing) setPlaying(false); else if(!motion) setStep(current=>(current+1)%phases.length); else {setStep(0);setPlaying(true);} }}>{playing ? <Pause size={16}/> : step === phases.length - 1 ? <RotateCcw size={16}/> : <Play size={16} fill="currentColor"/>}{playing ? "Pause sample" : !motion ? "Next sample step" : step === phases.length - 1 ? "Replay sample" : "Watch sample"}</button><span className="hm-demo-caption">Illustrative simulation · no external action</span></div><div className={`hm-demo-core hm-step-${step}`}><span className="hm-demo-ring"/><span className="hm-demo-center"><HomeEmployee id="orchestrator"/></span>{logoNames.slice(0,6).map((name,index)=><span className={`hm-demo-tool tool-${index}`} key={name}><ToolLogo name={name} size={22}/></span>)}<span className="hm-demo-signal"/></div><div className="hm-demo-tasks">{tasks.map((task,index) => { const Icon = task.icon; const state = step >= 4 ? "Prepared" : step > index ? "Prepared" : step === index ? "In view" : "Next"; return <div key={task.name} className={step >= index + 1 ? "ready" : step === index ? "current" : ""}><span><Icon size={19}/></span><span><b>{task.name}</b><small>{task.detail}</small></span><em>{state}</em></div>; })}</div><div className="hm-demo-timeline" role="group" aria-label="Illustrative workflow stages">{phases.map((phase,index) => { return <button type="button" key={phase.name} className={step === index ? "active" : step > index ? "done" : ""} aria-pressed={step === index} onClick={() => { setPlaying(false); setStep(index); }}><span className="hm-phase-number">{step>index?<Check size={19}/>:index+1}</span><span><b>{phase.name}</b><small>{["Gather information","Break down work","Prepare scoped actions","Human decision","Deliver the draft"][index]}</small></span></button>; })}</div></div><p className="hm-demo-status" role="status"><strong>{phases[step].name}:</strong> {phases[step].detail}</p><details className="hm-deep-demo" onToggle={event => setShowOriginal(event.currentTarget.open)}><summary>Explore the sample workflow in detail <ChevronRight size={16}/></summary>{showOriginal && <HomeObjectiveDemo/>}</details></div></section>;
}

function EmployeePreview() {
  const [category, setCategory] = useState("");
  const [showRegistry, setShowRegistry] = useState(false);
  const visible = useMemo(() => registryDefinitions.filter(agent => !category || agent.category === category).slice(0,4), [category]);
  return <section className="hm-section hm-employees" id="workforce"><div className="hm-shell"><div className="hm-employees-top"><SectionHead eyebrow="MEET YOUR AI WORKFORCE" title={<>Specialized AI employees.{" "}<br/><em>Real work, visible progress.</em></>} copy="Explore real roles in the current registry. Each specialist has a defined responsibility and works within the permissions of its pod."/><div className="hm-facts"><span><strong>{registryDefinitions.length}</strong><small>registry roles</small></span><span><strong>{integrationRegistry.length}</strong><small>catalog examples</small></span><span><strong>{solutions.length}</strong><small>solution areas</small></span></div></div><div className="hm-filter" role="group" aria-label="Filter AI employees">{categoryOptions.map(option => <button type="button" key={option.label} className={category === option.id ? "active" : ""} aria-pressed={category === option.id} onClick={() => setCategory(option.id)}>{option.label}</button>)}</div><div className="hm-employee-grid">{visible.length ? visible.map(agent => <Link key={agent.id} href={`/agents?category=${encodeURIComponent(agent.category)}`} className="hm-employee-card"><span className="hm-employee-art"><HomeEmployee id={agent.id}/></span><strong>{agent.name}</strong><p>{agent.description}</p><ArrowUpRight size={17}/></Link>) : <div className="hm-empty">No employees in this category. Choose another team.</div>}</div><div className="hm-centered"><Link href="/agents" className="hm-dark-button">Explore the full registry <ArrowRight size={16}/></Link></div><details className="hm-registry-detail" onToggle={event => setShowRegistry(event.currentTarget.open)}><summary>Open the full registry explorer <ChevronRight size={16}/></summary>{showRegistry && <SpecialistWorkforce/>}</details></div></section>;
}

function GovernanceSection() {
  const [autonomy, setAutonomy] = useState(0);
  return <section className="hm-section hm-governance"><div className="hm-shell hm-governance-grid"><div><Eyebrow>BUILT FOR YOUR BUSINESS</Eyebrow><h2>Autonomy with a <em>clear line of sight.</em></h2><p>AI employees work within pod permissions. People can inspect progress, review consequential steps, and decide when the workforce may continue.</p><div className="hm-autonomy-track" role="group" aria-label="Illustrative autonomy levels">{autonomyLevels.map((level,index)=><button type="button" key={level} className={autonomy===index?"active":""} aria-pressed={autonomy===index} onClick={()=>setAutonomy(index)}>L{index+1}</button>)}</div><p className="hm-autonomy-state"><strong>{autonomyLevels[autonomy]}</strong><span>{autonomy === 0 ? "AI assists while a person executes." : autonomy === 1 ? "The employee prepares work and waits for approval." : autonomy === 2 ? "The employee acts within defined boundaries." : "The pod follows its approved workflow, with human checkpoints where required."}</span></p><ul><li><CheckCircle2 size={18}/>Scope tool access to the work</li><li><CheckCircle2 size={18}/>Place people at review checkpoints</li><li><CheckCircle2 size={18}/>Track work and outcomes</li></ul><Link href="/docs" className="hm-text-link">Explore governance in the docs <ArrowRight size={16}/></Link></div><div className="hm-governance-panel"><strong><ShieldCheck size={20}/> Governance and oversight</strong>{[["Role-based permissions","Configurable"],["Human review checkpoints","Configurable"],["Action and audit records","Workspace"],["Tool access boundaries","Configurable"]].map(([name,state])=><div key={name}><span><LockKeyhole size={17}/>{name}</span><em>{state}</em></div>)}<small>Controls shown are platform concepts; exact settings depend on workspace configuration.</small></div></div></section>;
}

export function HomeRedesign() {
  const [motion, setMotion] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setMotion(!media.matches);
    updateMotion(); media.addEventListener("change", updateMotion);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle("hm-in-view", entry.isIntersecting);
      if(entry.isIntersecting) entry.target.classList.add("hm-revealed");
    }), {threshold: .08});
    root.current?.querySelectorAll("main > section").forEach(section => observer.observe(section));
    return () => { observer.disconnect(); media.removeEventListener("change", updateMotion); };
  }, []);
  const featured = integrationRegistry.filter(entry => logoNames.includes(entry.name));
  return <div ref={root} className="future-home hm-page" id="top" data-motion={motion?"playing":"paused"}><main>
    <HomeWorkforceHero motion={motion}/>
    <section className="hm-logo-strip" aria-label="Example tools in the integration catalog"><div className="hm-shell"><span>CATALOG EXAMPLES · SETUP REQUIRED</span><div>{featured.map(entry => <span key={entry.id} title={`${entry.name}: ${entry.mode === "planned_adapter" ? "adapter configuration required" : "connection configuration required"}`}><ToolLogo name={entry.name} size={24}/><b>{entry.name}</b></span>)}</div></div></section>
    <section className="hm-section hm-entry"><div className="hm-shell"><SectionHead eyebrow="BUILT FOR REAL WORK" title={<>One platform. <em>Three ways in.</em></>} copy="Start where you are. Bring a use case, a department, or a broader transformation."/><div className="hm-entry-grid">{entryPoints.map(entry => <Link href={entry.href} key={entry.title}><span className="hm-entry-art"><HomeEmployee id={entry.image}/></span><ArrowUpRight className="hm-entry-arrow" size={18}/><h3>{entry.title}</h3><p>{entry.description}</p></Link>)}</div></div></section>
    <WorkflowDemo motion={motion}/>
    <EmployeePreview/>
    <HomeConnectedContext motion={motion}/>
    <section className="hm-section hm-solutions"><div className="hm-shell"><SectionHead eyebrow="SEE THE POSSIBILITIES" title={<>Real workflows. <em>Reviewable outcomes.</em></>} copy="Explore how each solution area could bring its work into a coordinated, human-reviewed flow."/><div className="hm-solution-grid">{solutions.map((solution,index) => {const Icon=solutionIcons[index] || BriefcaseBusiness; return <Link href={`/solutions/${solution.slug}`} key={solution.slug} className={`solution-${index}`}><span><Icon size={24}/></span><strong>{solution.title}</strong><small>{solutionSummaries[solution.slug]}</small><ArrowUpRight size={17}/></Link>;})}</div></div></section>
    <GovernanceSection/>
    <section className="hm-final"><div className="hm-shell hm-final-grid"><div><Eyebrow>GET STARTED</Eyebrow><h2>Make work feel{" "}<br/><em>possible again.</em></h2><p>Book a personalized demo and see how a coordinated AI workforce could fit your business.</p><ButtonLink href="/book-demo">Book a demo</ButtonLink></div><div className="hm-final-scene"><span className="hm-final-ring"/><span className="hm-final-platform"/><HomeEmployee id="orchestrator"/>{[["Simpler workdays",ClipboardCheck],["Happier teams",Smile],["Clearer handoffs",Zap],["Visible progress",TrendingUp]].map(([title,Icon],index)=>{const CardIcon=Icon as typeof ClipboardCheck;return <span className={`hm-final-benefit benefit-${index}`} key={String(title)}><CardIcon size={22}/><b>{String(title)}</b></span>;})}</div></div></section>
    <section className="hm-afterword"><div className="hm-shell"><SectionHead eyebrow="QUESTIONS & CONTACT" title={<>Questions? <em>Let’s talk.</em></>} copy="Find a quick answer, or tell us what your team is hoping to improve."/><div className="hm-afterword-grid"><div className="hm-faq-list" aria-label="Frequently asked questions">{faqs.map(([question,answer],index)=><details key={question} open={index===0}><summary><span>{question}</span><ChevronRight size={18}/></summary><p>{answer}</p></details>)}</div><aside className="hm-contact-card"><span className="hm-contact-icon"><Headphones size={23}/></span><Eyebrow>CONTACT OUR TEAM</Eyebrow><h3>Let’s make work move better.</h3><p>Share your work email and we’ll help you find a useful place to start.</p><Contact/></aside></div></div></section>
  </main></div>;
}
