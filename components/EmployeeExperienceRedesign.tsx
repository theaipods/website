"use client";
import { EmployeeJourneyHero } from "@/components/PageSpecificHeroes";



import { WorkerScene,type WorkerRole } from "@/components/WorkerScene";

import type { Solution } from "@/lib/solutions";

import { MessageCircle,ArrowRight,BriefcaseBusiness,ChevronRight,ClipboardList,FileText,GraduationCap,Headphones,HeartHandshake,LifeBuoy,LockKeyhole,Search,ShieldCheck,UserRoundCheck,UsersRound } from "lucide-react";

import Link from "next/link";

import { useState } from "react";



const stages = [

  { name: "Attract", characterId: "marketing-marketing-agent", detail: "Find great talent", icon: BriefcaseBusiness, role: "people" },

  { name: "Hire", characterId: "hr-hr-agent", detail: "Bring them on board", icon: UsersRound, role: "operations" },

  { name: "Onboard", characterId: "ops-project-manager", detail: "Welcome & train", icon: ClipboardList, role: "people" },

  { name: "Support", characterId: "hr-employee-assistant", detail: "Solve & assist", icon: Headphones, role: "support" },

  { name: "Develop", characterId: "data-research-agent", detail: "Build skills", icon: GraduationCap, role: "data" },

  { name: "Retain", characterId: "data-data-analyst", detail: "Keep them engaged", icon: HeartHandshake, role: "people" },

  { name: "Offboard", characterId: "it-security-engineer", detail: "Capture knowledge", icon: ShieldCheck, role: "operations" },

] as const;

const employees: { name: string; detail: string; role: WorkerRole; characterId: string; capabilities: string[]; href: string }[] = [

  { name: "Employee Assistant", detail: "Help employees find relevant company information.", role: "people", characterId: "hr-employee-assistant", capabilities: ["Prepare answers from approved company knowledge", "Help organize policy and benefits questions", "Draft a response for review", "Route requests that need a person"], href: "/agents" },

  { name: "HR Agent", detail: "Coordinate day-to-day people operations requests.", role: "people", characterId: "hr-hr-agent", capabilities: ["Organize employee request context", "Prepare onboarding and handover tasks", "Track outstanding work and owners", "Keep sensitive decisions with authorized people"], href: "/agents" },

];

const sources = [

  { name: "HR policies", description: "Policy documents added and permitted by your company.", topics: ["Leave policy", "Remote work", "Code of conduct"] },

  { name: "Employee handbook", description: "Approved guidance for everyday employee questions.", topics: ["New starter guide", "Workplace guidance", "Who to contact"] },

  { name: "Benefits and perks", description: "Benefits information, if your company has supplied it.", topics: ["Benefits eligibility", "Enrollment", "Support contact"] },

  { name: "Learning and development", description: "Training plans and development material provided by your team.", topics: ["Training plan", "Learning resources", "Manager review"] },

  { name: "IT and workplace support", description: "Approved help articles and routing guidance.", topics: ["Access request", "Device support", "Help desk"] },

  { name: "Internal FAQs", description: "Frequently asked questions from company-approved sources.", topics: ["Common questions", "Policy owner", "Escalation"] },

];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const sampleVolume = [28, 36, 44, 53, 49, 46, 52, 59, 64, 70, 75, 82];





function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="ex-eyebrow"><i/>{children}</span>; }


function Intro({ label, title, copy }: { label: string; title: React.ReactNode; copy: string }) { return <div className="ex-intro"><div><Eyebrow>{label}</Eyebrow><h2>{title}</h2></div><p>{copy}</p></div>; }



function Lifecycle() {

  const [selected, setSelected] = useState(2);

  return <section id="lifecycle" className="ex-lifecycle ex-section ex-reveal"><div className="ex-shell"><Intro label="THE EMPLOYEE LIFECYCLE" title={<>From hire to retire.<br/>Every stage, <em>one coordinated workforce.</em></>} copy="Follow an inclusive employee journey. Coordinate teams and systems across every stage, with people in control of sensitive decisions."/><div className="ex-life-track" role="group" aria-label="Employee lifecycle stages">{stages.map((stage, index) => { const Icon = stage.icon; return <button key={stage.name} type="button" aria-pressed={selected === index} className={selected === index ? "active" : ""} onClick={() => setSelected(index)}><span className="ex-life-art"><WorkerScene role={stage.role} characterId={stage.characterId}/></span><span className="ex-life-number">0{index + 1}</span><b>{stage.name}</b><small>{stage.detail}</small><Icon size={15}/></button>; })}</div><div className="ex-life-detail" role="status"><strong>{stages[selected].name}</strong><span>{stages[selected].detail}. This is a sample coordination stage; no employee record is accessed.</span></div></div></section>;

}


function Workforce({ item }: { item: Solution }) {

  const [selected, setSelected] = useState(0);

  const [workflow, setWorkflow] = useState(0);

  const [message, setMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const employee = employees[selected];

  const example = item.workflows[workflow];

  const labels = ["Recruitment", "Onboarding", "Employee Support", "Compliance", "Offboarding"];

  return <section id="hr-workforce" className="ex-workforce ex-section"><div className="ex-shell ex-assistant-layout">

    <div className="ex-assistant-copy"><Eyebrow>MEET YOUR AI ASSISTANT</Eyebrow><h2>Specialized AI employees<br/>for <em>people operations.</em></h2><p>AI employees help organize everyday work, so your HR team can focus on what matters most - people.</p>

      <div className="ex-workflow-tabs" role="group" aria-label="Workflow previews">{labels.map((label,index)=><button key={label} aria-pressed={workflow===index} className={workflow===index?"active":""} onClick={()=>{setWorkflow(index);setSubmitted(false);}}>{label}</button>)}</div>

    </div>

    <div className="ex-assistant-visual"><div className="ex-chat"><header><span className="ex-chat-avatar"><UsersRound size={22}/></span><div><select aria-label="Registered HR employee" value={selected} onChange={e=>setSelected(Number(e.target.value))}>{employees.map((person,index)=><option value={index} key={person.name}>{person.name}</option>)}</select><small><i/> Interactive preview</small></div></header><p className="ex-chat-greeting">Hi! I’m your HR assistant. How can I help you today?</p><div className="ex-chat-suggestions">{(selected===1?employee.capabilities:workflow===0?["Answer HR policy questions", "Help with leave and attendance", "Share onboarding checklist", "Route employee issues"]:workflow===3?["Find approved HR policies", "Prepare policy questions", "Route sensitive decisions", "Request human review"]:example.steps.slice(0,4)).map((text)=><button key={text} onClick={()=>{setMessage(text);setSubmitted(false);}}><FileText size={15}/>{text}</button>)}</div><form onSubmit={e=>{e.preventDefault();if(message.trim())setSubmitted(true);}}><input aria-label="Sample assistant request" placeholder="Ask me anything…" value={message} onChange={e=>{setMessage(e.target.value);setSubmitted(false);}}/><button aria-label="Preview request"><ArrowRight size={16}/></button></form>{submitted&&<p role="status" className="ex-chat-notice">This is a preview. <Link href="/login">Log in</Link> to work with your company’s permitted sources.</p>}<span className="ex-chat-caption">{employee.name} · {labels[workflow]} example</span></div><div className="ex-assistant-mascot"><WorkerScene role="people" characterId="hr-employee-assistant"/><span className="ex-mini-icon mini-a"><MessageCircle/></span><span className="ex-mini-icon mini-b"><FileText/></span><span className="ex-mini-icon mini-c"><ClipboardList/></span></div></div>

  </div></section>;

}



function Knowledge() {

  const [selected, setSelected] = useState(0);

  const [query, setQuery] = useState("");

  const [asked, setAsked] = useState(false);

  const source = sources[selected];

  return <section id="knowledge" className="ex-knowledge ex-section ex-reveal"><div className="ex-shell"><Intro label="THE RIGHT ANSWER, EVERY TIME" title={<>The right answer starts with<br/><em>the right source.</em></>} copy="Company-approved information, in one place. Preview sources below; private documents require workspace access."/><div className="ex-knowledge-grid"><div className="ex-source-list" role="group" aria-label="Knowledge source categories">{sources.map((entry, index) => <button key={entry.name} type="button" aria-pressed={selected === index} className={selected === index ? "active" : ""} onClick={() => { setSelected(index); setAsked(false); setQuery(""); }}><FileText size={18}/>{entry.name}<ChevronRight size={16}/></button>)}</div><div className="ex-knowledge-panel"><div className="ex-document" aria-hidden="true"><FileText size={34}/></div><Eyebrow>{source.name.toUpperCase()}</Eyebrow><h3>Find what you need</h3><p>{source.description}</p><form onSubmit={event => { event.preventDefault(); if (query.trim()) setAsked(true); }}><label className="ex-search"><Search size={19}/><input value={query} onChange={event => { setQuery(event.target.value); setAsked(false); }} placeholder={`Ask a question about ${source.name.toLowerCase()}…`} aria-label={`Sample question about ${source.name}`}/></label><button type="submit" aria-label="Preview knowledge question"><ArrowRight size={18}/></button></form><span className="ex-topic-label">Popular topics</span><div className="ex-topics">{source.topics.map(topic => <button key={topic} type="button" onClick={() => { setQuery(`What is our ${topic.toLowerCase()}?`); setAsked(false); }}>{topic}</button>)}</div>{asked && <div className="ex-search-result" role="status"><LockKeyhole size={18}/><span><b>Company answer requires sign-in.</b> This public preview cannot access private HR documents or give a policy answer. Open your workspace to use permitted sources.</span><Link href="/login">Log in <ArrowRight size={14}/></Link></div>}</div></div></div></section>;

}



function Insights() {

  const [month, setMonth] = useState(11);

  return <section id="insights" className="ex-insights ex-section ex-reveal"><div className="ex-shell"><Intro label="IMPACT AND INSIGHTS" title={<>A clearer view of<br/>employee <em>support work.</em></>} copy="Track progress and spot trends. Explore the illustrative chart; these figures are sample data, not live employee analytics."/><a className="ex-action ex-analytics-action" href="#support-chart">View analytics <ArrowRight size={16}/></a><div className="ex-insights-grid" id="support-chart"><div className="ex-chart"><div className="ex-chart-head"><div><small>ILLUSTRATIVE DATA</small><h3>Employee support requests</h3></div><b>{sampleVolume[month]} <small>sample / {months[month]}</small></b></div><div className="ex-chart-area"><div className="ex-chart-axis"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div><div className="ex-chart-bars">{sampleVolume.map((value, index) => <button key={months[index]} type="button" aria-label={`${months[index]} fictional support requests: ${value}`} aria-pressed={month === index} onClick={() => setMonth(index)}><i style={{ height: `${value / 90 * 100}%` }}/><span>{months[index]}</span></button>)}</div></div><p>Choose a month to inspect its fictional sample volume.</p></div><div className="ex-insight-cards"><article><LifeBuoy size={23}/><span>Support requests</span><strong>{sampleVolume[month]}</strong><small>Illustrative · {months[month]}</small></article><article><ClipboardList size={23}/><span>Avg. resolution time</span><strong>4.2 hrs</strong><small>Illustrative example</small></article><article><UserRoundCheck size={23}/><span>Human review</span><strong>Required</strong><small>For sensitive decisions</small></article></div></div></div></section>;

}



export function EmployeeExperienceRedesign({ item }: { item: Solution }) {

  


  return <div className="ex-page"><main><EmployeeJourneyHero/><Lifecycle/><Workforce item={item}/><Knowledge/><Insights/></main></div>;
}
