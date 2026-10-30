"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, ChartNoAxesCombined, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CirclePlay, Crown, FileText, GitBranch, ImageIcon, Megaphone, Pause, Play, RotateCcw, Search, Send, ShieldCheck, Sparkles, UserRound, UsersRound } from "lucide-react";
import { workforceHeroStories } from "@/lib/workforce-hero-stories";
import { registryDefinitions } from "@/lib/agent-registry";
import "@/app/home-workforce-hero.css";
import { CampaignPackage, CampaignWork, campaignTasks } from "./HomeCampaignOutputs";

const specialistIcons = { search: Search, strategy: Megaphone, design: ImageIcon, document: FileText, chart: ChartNoAxesCombined, people: UsersRound, shield: ShieldCheck, tools: GitBranch, check: CheckCircle2 };
const specialistColors = ["#8ec7ef", "#b8adf1", "#e7adc8", "#e5bc92", "#9fd7c4"];
const benefitIcons = [Sparkles, GitBranch, ShieldCheck, ChartNoAxesCombined];
const stages = [
  { name: "A place to begin", copy: "Every team starts with someone who has an idea." },
  { name: "It starts with you", copy: "One person. One objective. No team to assemble first." },
  { name: "Say what you need", copy: "“Create a marketing campaign for our new product.”" },
  { name: "Your objective finds a coordinator", copy: "The Orchestrator turns the request into a brief the team can work from." },
  { name: "The work becomes a plan", copy: "Research the audience, prepare the campaign, and define how to measure it." },
  { name: "The right specialists arrive", copy: "Watch the brief become research, copy, creative, a calendar, and a measurement plan." },
  { name: "Separate contributions. One package.", copy: "The Orchestrator collects the work and brings the pieces together." },
  { name: "Back to you, ready for review", copy: "Open the original sample campaign. Inspect the work, save the ad, or download the full PDF." },
];
const durations = [300, 850, 1600, 1500, 1600, 6500, 1400];
const config = workforceHeroStories.home;
const team = config.team.map((member, index) => ({ ...member, name: registryDefinitions.find(agent => agent.id === member.id)!.name, color: specialistColors[index], icon: specialistIcons[member.icon] }));

function Character({ id, className = "", eager = false }: { id: string; className?: string; eager?: boolean }) {
  return <Image className={className} src={`/ai-workforce/avatars-hd/${id}.png`} alt="" width={480} height={480} sizes="(max-width: 700px) 160px, 280px" loading={eager ? "eager" : "lazy"}/>;
}

function CampaignScene({ stage, workIndex, onSelectWorker, requesterReady, onRequesterReady }: { stage: number; workIndex: number; onSelectWorker: (index: number) => void; requesterReady: boolean; onRequesterReady: () => void }) {
  return <>
    {stage >= 1 && stage <= 3 && <div className="hwh-person" data-handoff={stage === 3} data-loaded={requesterReady}>
      <Image src="/brand/home-requester-woman.png" alt="A woman with her laptop" width={1254} height={1254} sizes="(max-width: 700px) 300px, 420px" loading="eager" onLoad={onRequesterReady}/>
      <span className="hwh-person-label"><UserRound size={15}/> You</span>
    </div>}
    {stage >= 2 && stage <= 3 && <div className="hwh-message" data-sent={stage === 3}>
      <span>YOUR OBJECTIVE / MORROW FOCUS NOTEBOOK</span><p>{config.request}</p><div><small>{stage === 2 ? "Sending the brief" : "Brief received"}</small>{stage === 2 ? <Send size={17}/> : <Check size={17}/>}</div>
    </div>}
    {stage === 3 && <div className="hwh-handoff" aria-hidden="true"><i/><ArrowRight size={23}/></div>}
    {(stage === 3 || stage === 4) && <div className="hwh-director" data-planning={stage === 4}>
      <span className="hwh-director-label"><Crown size={17}/> Workforce Orchestrator</span>
      <Character id="orchestrator" eager/><span className="hwh-director-floor"/>
      <p>{stage === 3 ? "Let’s turn that into a clear plan." : "One objective. Defined responsibilities."}</p>
    </div>}
    {stage === 4 && <div className="hwh-plan">
      <span className="hwh-scene-kicker">THE CAMPAIGN PLAN</span><h2>Make the brief<br/>actionable.</h2>
      {[['01', 'Understand the audience', 'Extract product facts and flag assumptions.'], ['02', 'Shape the campaign', 'Align strategy, creative, and content.'], ['03', 'Define the measures', 'Prepare a plan for evaluating results.']].map(([number, title, detail], index) => <div key={number} style={{ "--arrival": `${index * .18}s` } as CSSProperties}><span>{number}</span><section><b>{title}</b><p>{detail}</p></section></div>)}
    </div>}
    {stage === 6 && <div className="hwh-workbench" data-collecting={stage === 6}>
      <header><span className="hwh-scene-kicker">BRINGING THE WORK TOGETHER</span><h2>Five contributions. One campaign.</h2></header>
      {stage === 6 && <div className="hwh-collection" aria-hidden="true"><FileText size={20}/><span>Assembling your campaign package</span><i/><i/><i/></div>}
      <div className="hwh-cast">{team.map(({ id, name, task, artifact, color, icon: Icon }, index) => <article key={id} className="hwh-worker" style={{ "--worker-color": color, "--arrival": `${index * .2}s` } as CSSProperties}>
        <div className="hwh-worker-art"><Character id={id} eager/><i/></div>
        <span className="hwh-worker-number">0{index + 1} / {stage === 6 ? "PREPARED" : "ASSIGNED"}</span><h3>{name}</h3><p>{stage === 6 ? artifact : task}</p>
        <span className="hwh-worker-progress">{stage === 6 ? <><Check size={12}/> Contribution ready</> : <><Icon size={12}/> Working on the brief<i/></>}</span>
      </article>)}</div>
    </div>}
    {stage === 5 && <div className="mc-workbench">
      <div className="mc-specialists" role="group" aria-label="Inspect specialist contributions">{team.map(({ id, name }, index) => <button type="button" key={id} aria-label={`Inspect ${campaignTasks[index].label} contribution`} aria-pressed={index === workIndex} onClick={() => onSelectWorker(index)} style={{ "--arrival": `${index * .16}s` } as CSSProperties}><Character id={id} eager/><b>{campaignTasks[index].label}</b><small>{index < workIndex ? "Prepared" : index === workIndex ? "In focus" : "Assigned"}</small><span className="sr-only">{name}</span></button>)}</div>
      <CampaignWork index={workIndex}/><p className="mc-inspect-hint">Select a specialist to pause and inspect their work.</p>
    </div>}
    {stage === 7 && <CampaignPackage/>}
  </>;
}

export function HomeWorkforceHero({ motion }: { motion: boolean }) {
  const [stage, setStage] = useState(0);
  const [workIndex, setWorkIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [requesterReady, setRequesterReady] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const visual = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const running = motion && visible && playing && stage < 7 && (stage !== 1 || requesterReady);
  const jump = (next: number) => { elapsed.current = 0; setStage(next); setWorkIndex(0); setPlaying(false); };
  const replay = () => { elapsed.current = 0; setStage(0); setWorkIndex(0); setPlaying(true); };

  useEffect(() => {
    const element = visual.current;
    if (!element) return;
    let inView = false;
    const sync = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting && entry.intersectionRatio >= .3; sync(); }, { threshold: .3 });
    observer.observe(element); document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      if (previous !== null) elapsed.current += now - previous;
      previous = now;
      if (stage === 5) setWorkIndex(Math.min(4, Math.floor(elapsed.current / 1300)));
      if (elapsed.current >= durations[stage]) { elapsed.current = 0; setStage(value => value + 1); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, stage]);

  return <section className="hwh" aria-labelledby="home-hero-title" data-story="home" data-stage={stage} data-running={running} data-visible={visible}>
    <Image src={config.background} className="hwh-background" alt="" fill sizes="100vw" preload/>
    <div className="hwh-shade"/>
    <div className="hwh-layout">
      <div className="hwh-copy">
        <span className="hwh-eyebrow"><i/> {config.eyebrow}</span>
        <h1 id="home-hero-title">{config.title.map((line, index) => index === config.title.length - 1 ? <em key={line}>{line}</em> : <span key={line}>{line}<br/></span>)}</h1>
        <p>{config.description}</p>
        <div className="hwh-actions"><Link href={config.primary.href} className="hwh-primary">{config.primary.label} <ArrowRight size={20}/></Link><Link href={config.secondary.href} className="hwh-secondary">{config.secondary.label} <CirclePlay size={20}/></Link></div>
        <div className="hwh-benefits">{config.benefits.map(([title, detail], index) => { const Icon = benefitIcons[index]; return <div key={title}><Icon size={21}/><span><b>{title}</b><small>{detail}</small></span></div>; })}</div>
      </div>
      <div className="hwh-experience">
        <div className="hwh-story-top"><span><i/> ONE REQUEST, FROM START TO FINISH</span><small>A brief → a real review pack</small></div>
        <div ref={visual} className="hwh-story-stage" role="region" aria-label="An illustrative marketing campaign, revealed one scene at a time"><CampaignScene stage={stage} workIndex={workIndex} onSelectWorker={index => { elapsed.current = index * 1300; setWorkIndex(index); setPlaying(false); }} requesterReady={requesterReady} onRequesterReady={() => setRequesterReady(true)}/></div>
        <div className="hwh-narration"><span>{String(stage + 1).padStart(2, "0")}<small> / 08</small></span><div><strong>{stages[stage].name}</strong><p>{stages[stage].copy}</p></div></div>
        <div className="hwh-story-controls">
          <div className="hwh-stage-picker" role="group" aria-label="Campaign story chapters">{stages.map((item, index) => <button type="button" key={item.name} aria-label={`Show ${item.name.toLowerCase()}`} aria-pressed={stage === index} onClick={() => jump(index)}><span/></button>)}</div>
          <div className="hwh-playback"><button type="button" aria-label="Previous story scene" disabled={stage === 0} onClick={() => jump(stage - 1)}><ChevronLeft size={17}/></button><button type="button" className="hwh-pause" onClick={() => { if(stage === 7) replay(); else if(!motion) jump(stage + 1); else setPlaying(!playing); }}>{stage === 7 ? <RotateCcw size={14}/> : !motion ? <ChevronRight size={15}/> : playing ? <Pause size={14}/> : <Play size={14}/>} {stage === 7 ? "Replay story" : !motion ? "Next scene" : playing ? "Pause story" : "Play story"}</button><button type="button" aria-label="Next story scene" disabled={stage === 7} onClick={() => jump(stage + 1)}><ChevronRight size={17}/></button></div>
        </div>
        <div className="hwh-scene-footer"><small>{config.note}</small><button type="button" aria-expanded={rosterOpen} aria-controls="hero-workforce-roster" onClick={() => setRosterOpen(!rosterOpen)}><UsersRound size={16}/> Meet all {registryDefinitions.length} AI employees <ChevronDown size={15}/></button></div>
      </div>
    </div>
    <div id="hero-workforce-roster" className="hwh-roster" hidden={!rosterOpen}>{rosterOpen && <><div className="hwh-roster-heading"><div><span className="hwh-eyebrow">ONE WORKFORCE. MANY SPECIALTIES.</span><h2>The right people for every pod.</h2></div><p>Five specialists illustrate the workflow above. Explore every registered role and build a team around your own objective.</p></div><div className="hwh-roster-grid">{registryDefinitions.map(agent => <Link href={`/agents?category=${encodeURIComponent(agent.category)}`} key={agent.id}><Character id={agent.id}/><b>{agent.name}</b><p>{agent.description}</p><span>Explore role <ArrowUpRight size={14}/></span></Link>)}</div></>}</div>
  </section>;
}
