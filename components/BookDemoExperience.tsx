"use client";
import { DemoPossibilities } from "@/components/DemoPossibilities";
import { DemoSessionHero } from "@/components/PageSpecificHeroes";
import { StaticEmployee } from "@/components/StaticEmployee";
import { PublicFeatureIcon } from "@/components/PublicFeatureIcon";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { WorkerScene, type WorkerRole } from "@/components/WorkerScene";
import { ToolLogo } from "@/components/tool-logo";
import { CalendlyBooking } from "@/components/CalendlyBooking";
import { plans } from "@/lib/plans";

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
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const chooseFocus = (name: string) => {
    setFocus(name);
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return <div className="dm-page">
    <main>
      <DemoSessionHero/>
      <section className="dm-booking-section" id="book"><div className="dm-shell"><div className="dm-section-intro"><p className="dm-eyebrow blue">SCHEDULE YOUR DEMO</p><h2>Book a personalized demo.</h2><p>Choose a time that works for you. Calendly will show live availability and collect the details needed to prepare your walkthrough.</p></div><CalendlyBooking focus={focus}/></div></section>
      <DemoPossibilities/>
      <section className="dm-tools"><div className="dm-shell"><div className="dm-tools-head"><div><p className="dm-eyebrow blue">WORK WITH YOUR STACK</p><h2>Works with the tools<br/>your team already uses.</h2></div><p>We’ll discuss the tools your team relies on and distinguish live integrations from configurable or planned connections.</p></div><div className="dm-tool-row">{["Slack","Microsoft Teams","Google Drive","Salesforce","Notion","Jira","Gmail","GitHub"].map(name=><span key={name}><ToolLogo name={name} size={25}/>{name}</span>)}</div></div></section>
      <section className="dm-focus"><div className="dm-shell"><p className="dm-eyebrow blue">DEMO FOCUS AREAS</p><h2>Tailor the demo<br/>to your team’s needs.</h2><p className="dm-focus-lead">Choose a topic to carry into the Calendly booking context. You can add more detail in Calendly.</p><div className="dm-focus-grid">{focusAreas.map(item=><button type="button" key={item.name} className={focus===item.name?"selected":""} onClick={()=>chooseFocus(item.name)} aria-pressed={focus===item.name}><div><WorkerScene role={item.role}/></div><b>{item.name}</b><span>{item.description}</span><ArrowUpRight/></button>)}</div></div></section>
      <section className="dm-final"><div className="dm-shell dm-final-grid"><div><p className="dm-eyebrow">READY TO SEE IT IN ACTION?</p><h2>Make work feel<br/><em>possible again.</em></h2><p>Book a personalized demo and see how a coordinated AI workforce could help your team.</p><a className="dm-primary" href="#book">Book a demo <ArrowRight/></a></div><div className="dm-final-art" aria-hidden="true"/></div></section>
      <section className="dm-plans" aria-labelledby="plans-title"><div className="dm-shell"><p className="dm-eyebrow blue">PLANS FOR YOUR TEAM</p><h2 id="plans-title">Start small. Grow your workforce.</h2><div className="dm-plan-grid">{Object.entries(plans).map(([id, plan]) => <article className={`dm-plan-card dm-plan-${id}`} key={id}>{id === "founders" && <span className="dm-plan-badge">RECOMMENDED</span>}<PublicFeatureIcon name={id === "starter" ? "starter" : id === "founders" ? "founders" : "enterprise"}/><h3>{plan.name}</h3><p className="dm-plan-price">{id === "founders" ? <><strong>$499</strong><span>/month + GST</span></> : id === "starter" ? <strong>$0</strong> : "Custom"}</p><p className="dm-plan-allowance">{plan.pods === null ? "Custom Pod and project allowances." : `${plan.pods} ${plan.pods === 1 ? "Pod" : "Pods"} · ${plan.projects} ${plan.projects === 1 ? "project" : "projects"}`}</p><p className="dm-plan-description">{plan.description}</p><a className="dm-plan-action" href={id === "starter" ? "/login" : "#book"}>{id === "starter" ? "Start free" : "Discuss your plan"}<ArrowRight size={16}/></a><div className="dm-plan-character"><StaticEmployee id={id === "starter" ? "product-frontend-developer" : id === "founders" ? "finance-finance-agent" : "ops-project-manager"}/></div></article>)}</div><p className="dm-plan-note">Every new account starts on Starter. Company email required. Founders is billed monthly at $499 plus GST. Upgrades are arranged with our team; online checkout is not enabled.</p></div></section>
    </main>
  </div>;
}
