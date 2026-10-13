"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, ShieldCheck, Users } from "lucide-react";
import { WorkerScene, type WorkerRole } from "@/components/WorkerScene";
import { ToolLogo } from "@/components/tool-logo";
import { CalendlyBooking } from "@/components/CalendlyBooking";

const heroRoles: WorkerRole[] = ["research", "finance", "orchestrator", "engineering", "sales"];
const focusAreas: { name: string; role: WorkerRole; description: string }[] = [
  { name: "Customer Experience", role: "support", description: "Support requests and customer journeys" },
  { name: "Finance Operations", role: "finance", description: "Reporting and financial workflows" },
  { name: "Employee Experience", role: "operations", description: "Internal support and team processes" },
  { name: "Sales & Marketing", role: "marketing", description: "Research, outreach and campaigns" },
  { name: "Healthcare", role: "people", description: "Administrative healthcare work" },
  { name: "Insurance", role: "security", description: "Claims and policy workflows" },
];

export function BookDemoExperience() {
  const [focus, setFocus] = useState("");
  const chooseFocus = (name: string) => {
    setFocus(name);
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return <div className="dm-page">
    <main>
      <section className="dm-hero"><div className="dm-shell dm-hero-grid"><div className="dm-hero-copy"><p className="dm-eyebrow">BOOK A DEMO <i/></p><h1>Let’s build your <em>AI workforce.</em></h1><p>See how TheAI Pods helps teams turn complex work into coordinated action—with specialized AI employees, your tools, and human review.</p><div className="dm-hero-points"><span><CalendarDays/>Personalized walkthrough</span><span><Users/>Built around your team</span><span><ShieldCheck/>Clear product boundaries</span></div><a href="#book" className="dm-primary">Schedule your demo <ArrowRight/></a></div><div className="dm-hero-art"><div className="dm-orbit dm-orbit-one"/><div className="dm-orbit dm-orbit-two"/><WorkerScene role="orchestrator"/><div className="dm-app dm-app-one"><ToolLogo name="Slack" size={30}/></div><div className="dm-app dm-app-two"><ToolLogo name="Notion" size={30}/></div><div className="dm-app dm-app-three"><ToolLogo name="Salesforce" size={30}/></div><div className="dm-app dm-app-four"><ToolLogo name="Gmail" size={30}/></div><div className="dm-hero-board"><small>YOUR WALKTHROUGH</small>{["Understand your goals","Explore your use case","See the workflow","Discuss next steps"].map((item,index)=><span key={item}><i className={index<3?"done":""}>{index<3?<Check/>:index+1}</i>{item}</span>)}</div></div></div></section>
      <section className="dm-booking-section" id="book"><div className="dm-shell"><div className="dm-section-intro"><p className="dm-eyebrow blue">SCHEDULE YOUR DEMO</p><h2>Book a personalized demo.</h2><p>Choose a time that works for you. Calendly will show live availability and collect the details needed to prepare your walkthrough.</p></div><CalendlyBooking focus={focus}/></div></section>
      <section className="dm-steps"><div className="dm-shell dm-steps-grid"><div><p className="dm-eyebrow blue">WHAT TO EXPECT</p><h2>From conversation<br/>to <em>real possibilities.</em></h2><p>In a focused demo, we’ll show how AI employees can help your team coordinate work, connect tools, and keep people in control.</p></div><div className="dm-step-list">{[["01","Understand your goals","We learn about your team, priorities, and use case."],["02","Explore live use cases","See how specialists work with data and tools."],["03","Get a tailored demo","A walkthrough built around your workflow."],["04","Discuss next steps","Agree on a practical path forward."]].map(([number,title,description])=><article key={number}><span>{number}</span><div><b>{title}</b><p>{description}</p></div></article>)}</div></div></section>
      <section className="dm-tools"><div className="dm-shell"><div className="dm-tools-head"><div><p className="dm-eyebrow blue">WORK WITH YOUR STACK</p><h2>Works with the tools<br/>your team already uses.</h2></div><p>We’ll discuss the tools your team relies on and distinguish live integrations from configurable or planned connections.</p></div><div className="dm-tool-row">{["Slack","Microsoft Teams","Google Drive","Salesforce","Notion","Jira","Gmail","GitHub"].map(name=><span key={name}><ToolLogo name={name} size={25}/>{name}</span>)}</div></div></section>
      <section className="dm-focus"><div className="dm-shell"><p className="dm-eyebrow blue">DEMO FOCUS AREAS</p><h2>Tailor the demo<br/>to your team’s needs.</h2><p className="dm-focus-lead">Choose a topic to carry into the Calendly booking context. You can add more detail in Calendly.</p><div className="dm-focus-grid">{focusAreas.map(item=><button type="button" key={item.name} className={focus===item.name?"selected":""} onClick={()=>chooseFocus(item.name)} aria-pressed={focus===item.name}><div><WorkerScene role={item.role}/></div><b>{item.name}</b><span>{item.description}</span><ArrowUpRight/></button>)}</div></div></section>
      <section className="dm-final"><div className="dm-shell dm-final-grid"><div><p className="dm-eyebrow">READY TO SEE IT IN ACTION?</p><h2>Make work feel<br/><em>possible again.</em></h2><p>Book a personalized demo and see how a coordinated AI workforce could help your team.</p><a className="dm-primary" href="#book">Book a demo <ArrowRight/></a></div><div className="dm-final-art"><div className="dm-orbit dm-orbit-one"/><WorkerScene ensemble ensembleRoles={heroRoles}/></div></div></section>
    </main>
  </div>;
}
