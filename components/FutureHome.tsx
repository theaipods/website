"use client";

import { HomeObjectiveDemo } from "@/components/HomeObjectiveDemo";
import { OrchestratorFlow } from "@/components/OrchestratorFlow";
import { SpecialistWorkforce } from "@/components/SpecialistWorkforce";
import { Contact,Gallery,ObjectiveMarquee,Roster } from "@/components/landing";
import { Audience,Gap,Insight,Problem,SolutionFlow,Team,WhyNow } from "@/components/pitch";
import { Bento,Reveal } from "@/components/sections";
import { ToolLogo } from "@/components/tool-logo";
import { autonomyLevels,faqs } from "@/lib/catalog";
import { ArrowRight,ArrowUpRight,FileCheck2,MousePointer2,Pause,ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";

const platformMore = ["AI Employee Roster", "Agent Studio", "Deliverables Studio", "Quality & Evals", "Voice & Channels", "Trust & Security", "Triggers & Automations"];
const integrations = ["Google Drive", "Slack", "Microsoft Teams", "Gmail", "Google Calendar", "Notion", "GitHub", "Jira", "HubSpot", "Salesforce", "Google Sheets", "Shopify", "WordPress", "Zendesk", "Instagram", "WhatsApp", "QuickBooks", "Figma", "Airtable", "Dropbox", "Linear", "Asana", "Stripe", "Zoom", "Canva", "Intercom", "Microsoft Power BI", "Mailchimp", "Calendly", "Google Analytics"];
const questions = [...faqs, ["Does selecting a tool connect my account?", "No. Tool selections describe where work happens. Access requires a separately configured integration."], ["Can I pause the workforce?", "Yes. You can pause a pod or stop the workforce from your workspace."]];

function CinematicIcon({ name, className = "" }: { name: "ready-team" | "industry" | "custom-pod" | "campaign" | "feature" | "support"; className?: string }) {
  return <span className={`fh-cinematic-icon ${className}`} aria-hidden="true"><img src={`/brand/homepage-3d/${name}.png`} alt="" loading="lazy" /></span>;
}

function RestoredSection({ id, label, title, description, children, secondary = false }: { id?: string; label: string; title: string; description?: string; children: React.ReactNode; secondary?: boolean }) {
  if (secondary) return <section id={id} className="fh-explain-section"><div className="fh-container"><details><summary><span>{label}</span><strong>{title}</strong><span aria-hidden="true">+</span></summary><div className="fh-explain-content">{description && <p>{description}</p>}{children}</div></details></div></section>;
  return <section id={id} className="fh-restored-section"><div className="fh-container"><Reveal><div className="fh-section-head"><div><p className="fh-kicker">{label}</p><h2>{title}</h2>{description && <p>{description}</p>}</div></div></Reveal>{children}</div></section>;
}

export function FutureHome() {
  const [showTeam, setShowTeam] = useState(false);
  const [autonomy, setAutonomy] = useState(0);
  useEffect(() => { fetch("/api/site").then((response) => response.json()).then((data) => setShowTeam(data.showTeam === true)).catch(() => {}); }, []);
  useEffect(() => { const timer = window.setInterval(() => setAutonomy((value) => (value + 1) % 4), 2500); return () => window.clearInterval(timer); }, []);

  return <div className="future-home" id="top">
    

    <main>
      <HomeObjectiveDemo />

      <div className="fh-objective-marquee"><ObjectiveMarquee /></div>
      <RestoredSection label="START YOUR WAY" title="One platform. Three ways in." description="Choose a ready team, explore your industry, or build a pod around your own objective."><div className="fh-door-grid"><a href="#workforce"><CinematicIcon name="ready-team"/><strong>Hire a ready team</strong><span>Explore department pods and specialist roles.</span><ArrowUpRight size={18}/></a><a href="/solutions"><CinematicIcon name="industry"/><strong>Solve for my industry</strong><span>See how a connected workforce fits your business.</span><ArrowUpRight size={18}/></a><a href="/login"><CinematicIcon name="custom-pod"/><strong>Build my own</strong><span>Shape a custom pod around a measurable goal.</span><ArrowUpRight size={18}/></a></div></RestoredSection>




      <RestoredSection id="experience" label="LIVE HANDOFF" title="Watch the pod move work forward." description="A task moves from your brief to the orchestrator, specialists, quality checks and your approval."><OrchestratorFlow /></RestoredSection>
      <section className="fh-restored-section" id="workforce"><div className="fh-container"><SpecialistWorkforce /><div style={{marginTop:24}}><Link href="/agents" className="fh-link">Open full agent registry <ArrowUpRight size={16}/></Link></div></div></section>
      <RestoredSection secondary label="ROLE INDEX" title="Browse the original department roster."><Roster /></RestoredSection>
      <RestoredSection id="platform" label="INSIDE THE PLATFORM" title="Everything the pod needs to work."><Bento more={platformMore} /></RestoredSection>
      <RestoredSection label="DELIVERABLES STUDIO" title="See the work, not just the promise." description="Illustrative examples of outputs a coordinated pod can prepare."><Gallery /></RestoredSection>


      <RestoredSection label="WHO IT'S FOR" title="Built around the business you run."><Audience /></RestoredSection>

      <section className="fh-control-section" id="control"><div className="fh-container fh-control-grid"><div><p className="fh-kicker">YOUR CONTROL / 04</p><h2>Autonomy with a clear line of sight.</h2><p>Choose how far each employee can go. Every level keeps the work visible; approval gates stop it when your decision is needed.</p><div className="fh-autonomy-track" aria-label="Autonomy levels">{autonomyLevels.map((level, i) => <button key={level} className={autonomy === i ? "active" : ""} onClick={() => setAutonomy(i)} aria-pressed={autonomy === i}><b>L{i + 1}</b><span>{level.replace(/^L\d\s*·\s*/, "")}</span></button>)}</div><Link href="/login" className="fh-text-action">Explore the platform <ArrowRight size={18}/></Link></div><div className="fh-control-board"><div className="fh-control-header"><span>HUMAN CONTROL PANEL</span><span className="fh-control-live">● IN CONTROL</span></div><div className="fh-control-selected"><span>AUTONOMY LEVEL L{autonomy + 1}</span><strong>{autonomyLevels[autonomy]}</strong><small>{autonomy === 0 ? "AI assists while a person executes." : autonomy === 1 ? "The employee prepares work and waits for your approval." : autonomy === 2 ? "The employee can act within your defined boundaries." : "The pod can execute its approved workflow autonomously."}</small></div><div className="fh-control-line"><span className="fh-control-symbol"><FileCheck2 size={20}/></span><span><strong>Approval checkpoint</strong><small>{autonomy < 2 ? "Waiting for your decision before execution" : "Stops when a human decision is required"}</small></span><span className="fh-control-pill">ON</span></div><div className="fh-control-line"><span className="fh-control-symbol"><MousePointer2 size={20}/></span><span><strong>Visible activity</strong><small>See what the pod is doing and why</small></span><span className="fh-control-pill">ON</span></div><div className="fh-control-line"><span className="fh-control-symbol"><Pause size={20}/></span><span><strong>Pause when needed</strong><small>Keep the final say over the workflow</small></span><span className="fh-control-pill">ON</span></div><div className="fh-control-bottom"><ShieldCheck size={18}/> YOUR PEOPLE STAY IN CHARGE</div></div></div></section>

      <RestoredSection label="YOUR SYSTEMS" title="Start with the tools your teams use." description="Choose where your work happens; account access and live connections are configured separately."><div className="fh-integration-grid">{integrations.map((tool) => <span key={tool} className="fh-tool-chip"><ToolLogo name={tool} size={22}/>{tool}</span>)}</div><div style={{marginTop:28}}><Link href="/integrations" className="fh-link">Explore integrations & MCP <ArrowUpRight size={16}/></Link></div></RestoredSection>
      <div className="hd-detail-intro"><div className="fh-container"><p>THE THINKING BEHIND AI POD</p><h2>Understand what makes it work.</h2></div></div>
      <RestoredSection secondary label="THE PROBLEM" title="AI is everywhere. Outcomes are not."><Problem /></RestoredSection>
      <RestoredSection secondary label="THE SOLUTION" title="Business intent becomes coordinated work."><SolutionFlow /></RestoredSection>
      <RestoredSection secondary label="THE MISSING LAYER" title="Connect the tools, people and tasks."><Gap /></RestoredSection>
      <RestoredSection secondary label="THE INSIGHT" title="Your business context is the operating system."><Insight /></RestoredSection>

      <RestoredSection secondary label="WHY NOW" title="The shift is already underway."><WhyNow /></RestoredSection>

      {showTeam && <RestoredSection label="THE FULL TEAM" title="The people behind the platform."><Team /></RestoredSection>}
      <RestoredSection label="QUESTIONS" title="A few things worth knowing."><div className="fh-faq">{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></RestoredSection>
      <RestoredSection label="GET IN TOUCH" title="Talk through your first pod." description="The original contact form remains available while the full signup flow is built."><Contact /></RestoredSection>

      <section className="fh-final-section"><div className="fh-container"><div className="fh-final-orb" aria-hidden="true"><span>✦</span></div><p className="fh-kicker">THE NEXT WORKFORCE IS YOURS</p><h2>Make work feel<br/><em>possible again.</em></h2><p>Start with one objective. Build the team around it.</p><Link href="/login" className="fh-button">Build your pod <ArrowUpRight size={18}/></Link></div></section>
    </main>
    
  </div>;
}





