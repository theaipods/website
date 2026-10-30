"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Check, CheckCheck, ChevronRight, FileText, GitBranch, Pause, Play, Plug, RotateCcw, Send, ShieldCheck, Sparkles, Users, UserRound } from "lucide-react";
import { StaticEmployee } from "@/components/StaticEmployee";
import { ToolLogo } from "@/components/tool-logo";

const employees = [
  { id: "data-research-agent", name: "Research Agent", task: "Find the audience", output: "Audience summary" },
  { id: "marketing-marketing-agent", name: "Marketing Agent", task: "Shape the message", output: "Campaign copy" },
  { id: "product-ui-ux-designer", name: "UI/UX Designer", task: "Outline the creative", output: "Creative direction" },
  { id: "ops-project-manager", name: "Project Manager", task: "Coordinate the launch", output: "Launch checklist" },
  { id: "data-data-analyst", name: "Data Analyst" },
  { id: "sales-sales-agent", name: "Sales Agent" },
  { id: "finance-finance-agent", name: "Finance Agent" },
  { id: "hr-hr-agent", name: "HR Agent" },
  { id: "it-security-engineer", name: "Security Engineer" },
  { id: "product-qa-engineer", name: "QA Engineer" },
];
const chapters = [
  { label: "AI workforce", detail: "Meet the team", start: 0, icon: Users },
  { label: "Orchestration", detail: "Turn intent into a plan", start: 1, icon: GitBranch },
  { label: "Tool Connect", detail: "Bring in the context", start: 4, icon: Plug },
  { label: "Workflow in action", detail: "Draft, review, deliver", start: 7, icon: CheckCheck },
];
const beats = [
  { chapter: 0, title: "Different skills. One workforce.", copy: "Meet ten example specialists. You don’t need every role for every job - the objective determines who joins the work.", event: "10 specialists available", next: "You give the team one clear objective.", duration: 1900 },
  { chapter: 1, title: "Every story starts with your goal.", copy: "You ask for a launch brief for Northstar, a fictional workflow product. The orchestrator captures the outcome, audience, and review boundary.", event: "Objective captured", next: "The orchestrator breaks the goal into work.", duration: 2100 },
  { chapter: 1, title: "The objective becomes a plan.", copy: "Research the audience, shape the campaign, and prepare a launch checklist. Each task has an output and a clear owner.", event: "4 tasks planned", next: "The right specialists receive their tasks.", duration: 2200 },
  { chapter: 1, title: "The right people for each piece.", copy: "Four specialists are assigned from the workforce. They share the same objective while preparing different parts of the brief.", event: "4 of 10 specialists assigned", next: "They need approved information to work from.", duration: 1900 },
  { chapter: 2, title: "First, understand the product.", copy: "Tool Connect brings the example product brief into the workflow. The research task now has a source for what Northstar does.", event: "Product context received", next: "Brand guidance gives the draft its boundaries.", duration: 1400 },
  { chapter: 2, title: "Then, bring the brand guidance.", copy: "The brand guide adds a clear voice and a useful constraint: keep claims grounded. Marketing and design work from the same guidance.", event: "Brand guidance received", next: "Launch notes add the audience and channels.", duration: 1400 },
  { chapter: 2, title: "Connect the missing details.", copy: "The example team notes supply the audience and campaign channels. Three sources now support one shared context.", event: "3 sources organized", next: "The specialists assemble a draft from this context.", duration: 1400 },
  { chapter: 3, title: "Separate tasks. One connected draft.", copy: "The specialists combine audience research, campaign copy, creative direction, and a checklist into the Northstar launch brief.", event: "Draft ready for review", next: "A person checks the claims before anything moves on.", duration: 2200 },
  { chapter: 3, title: "Human judgment stays in the loop.", copy: "In this example, the reviewer catches an unsupported promise. The wording is corrected before the brief is marked reviewed.", event: "Example reviewer checks the draft", next: "A reviewed brief, with its sources and next steps.", duration: 2900 },
  { chapter: 3, title: "A reviewed outcome. A clear next step.", copy: "One request became a source-backed launch brief. Your team can inspect the work and decide what happens next. Nothing is published automatically.", event: "Example brief reviewed", next: "Bring a real objective to your demo.", duration: 0 },
];
const sources = [
  { tool: "Notion", file: "Northstar · product brief", content: "A shared workspace for requests, handoffs, and review.", usedBy: "Research Agent" },
  { tool: "Google Drive", file: "Brand voice · guidelines", content: "Clear, practical language. No unsupported promises.", usedBy: "Marketing + Design" },
  { tool: "Slack", file: "Launch planning · team notes", content: "Operations leaders. LinkedIn and email. Next quarter.", usedBy: "Project Manager" },
];

function WorkforceScene() {
  return <div className="aps-workforce"><div className="aps-scene-heading"><span className="aps-mini">YOUR EXAMPLE WORKFORCE</span><span className="aps-count">10 <small>specialists</small></span></div><div className="aps-roster">{employees.map((employee, i) => <div className="aps-employee" key={employee.id} style={{ "--i": i } as CSSProperties}><StaticEmployee id={employee.id}/><strong>{employee.name}</strong><span className="aps-role-signal"><i/> {i < 4 ? "Matching this objective" : "Available"}</span></div>)}</div><div className="aps-scene-note"><Sparkles size={16}/><span>Different expertise. Coordinated around your objective.</span></div></div>;
}

function ObjectiveScene() {
  return <div className="aps-objective-scene"><div className="aps-request"><span className="aps-person"><UserRound size={20}/></span><div><span className="aps-mini">YOU · THE REQUEST</span><p>“Prepare a launch brief for Northstar.<br/>Reach operations leaders. Keep it ready for my review.”</p></div><Send size={21}/></div><div className="aps-downlink" aria-hidden="true"><i/><ArrowDown size={20}/></div><div className="aps-objective-card"><span className="aps-card-icon"><GitBranch size={24}/></span><div><span className="aps-mini">ORCHESTRATOR · OBJECTIVE RECEIVED</span><h4>Northstar launch brief</h4></div><dl><div><dt>Outcome</dt><dd>A coordinated campaign brief</dd></div><div><dt>Audience</dt><dd>Operations leaders</dd></div><div><dt>Boundary</dt><dd>Human review before publishing</dd></div></dl></div></div>;
}

function PlanScene({ assigned }: { assigned: boolean }) {
  return <div className="aps-plan-scene"><div className="aps-plan-origin"><span className="aps-card-icon"><GitBranch size={23}/></span><div><span className="aps-mini">ONE OBJECTIVE → FOUR TASKS</span><h4>Prepare the Northstar launch brief</h4></div><span className="aps-pill">{assigned ? "Assigned" : "Planned"}</span></div><div className="aps-assignment-grid">{employees.slice(0,4).map((employee,i) => <div className={`aps-task ${assigned ? "is-assigned" : ""}`} key={employee.id} style={{"--i":i} as CSSProperties}><span className="aps-task-number">0{i+1}</span><i className="aps-task-beam" aria-hidden="true"/>{assigned ? <StaticEmployee id={employee.id}/> : <span className="aps-task-symbol"><FileText size={28}/></span>}<h4>{employee.task}</h4><p>{assigned ? employee.name : "Output: " + employee.output}</p><span className="aps-task-status">{assigned ? <Check size={13}/> : <ArrowRight size={13}/>} {assigned ? employee.output : "Awaiting assignment"}</span></div>)}</div><div className="aps-scene-note"><Users size={16}/>{assigned ? "Four roles selected. The other six stay available for other work." : "Tasks share one brief, so handoffs stay connected."}</div></div>;
}

function ToolsScene({ received }: { received: number }) {
  return <div className="aps-tools-scene"><div className="aps-scene-heading"><span className="aps-mini">TOOL CONNECT / MCP · EXAMPLE DATA FLOW</span><span className="aps-pill">Read context</span></div><div className="aps-context-flow"><div className="aps-sources">{sources.map((source,i) => <div className={`aps-source ${i <= received ? "is-received" : ""} ${i===received ? "is-fetching" : ""}`} key={source.tool}><ToolLogo name={source.tool} size={26}/><div><strong>{source.file}</strong><small>{i<=received ? "Context received" : "Waiting for context"}</small></div>{i<=received ? <Check size={17}/> : <span className="aps-source-wait"/>}</div>)}</div><div className="aps-transfer" aria-hidden="true"><span/><ChevronRight size={22}/><i/></div><div className="aps-context-card"><span className="aps-card-icon"><FileText size={22}/></span><h4>Shared task context</h4><p>Information the specialists can work from.</p><ul>{sources.map((source,i) => <li key={source.tool} className={i<=received ? "is-ready" : ""}>{i<=received ? <><strong>{source.content}</strong><small>{source.tool} → {source.usedBy}</small></> : <span className="aps-context-placeholder">Waiting for {source.tool}…</span>}</li>)}</ul></div></div><div className="aps-scene-note"><ShieldCheck size={16}/>Illustrative reads from approved sources. No accounts are connected.</div></div>;
}

function BriefScene({ step }: { step: number }) {
  const review = step === 8;
  const complete = step === 9;
  return <div className="aps-brief-scene"><div className="aps-delivery-tasks">{employees.slice(0,4).map((employee,i)=><div key={employee.id} style={{"--i":i} as CSSProperties}><StaticEmployee id={employee.id}/><span><strong>{employee.output}</strong><small>{employee.name}</small></span><Check size={16}/></div>)}</div><div className={`aps-brief ${complete ? "is-reviewed" : ""}`}><div className="aps-brief-top"><span><FileText size={17}/> NORTHSTAR</span><span className="aps-pill">{complete ? "Reviewed · example" : review ? "Human review" : "Draft v1"}</span></div><h4>Product launch brief</h4><p className="aps-brief-subtitle">One shared direction for your launch.</p>{review ? <div className="aps-review-note"><span className="aps-review-person"><UserRound size={18}/> EXAMPLE REVIEWER</span><strong>Let’s keep this claim grounded.</strong><del>Guaranteed savings for every team.</del><span className="aps-corrected"><Check size={15}/> Less manual coordination for your team.</span><small>Proposed wording checked against the brand guide.</small></div> : <dl className="aps-brief-fields"><div><dt>Audience</dt><dd>Operations leaders</dd></div><div><dt>Message</dt><dd>{complete ? "Less manual coordination for your team." : "Guaranteed savings for every team."}</dd></div><div><dt>Channels</dt><dd>LinkedIn + email</dd></div><div><dt>Next step</dt><dd>{complete ? "Team decides when to launch" : "Review wording and supporting sources"}</dd></div></dl>}<div className="aps-brief-sources"><span>Sources attached</span>{sources.map(source=><ToolLogo key={source.tool} name={source.tool} size={19}/>)}</div><div className={`aps-review-status ${complete ? "is-complete" : ""}`}><ShieldCheck size={17}/>{complete ? "Reviewed brief ready. Publishing stays with your team." : review ? "Review checkpoint: a person makes the decision." : "Prepared by specialists. Waiting for human review."}</div></div></div>;
}

export function ProductsInActionSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef({ y: 0, step: 0 });
  const stepRef = useRef(0);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const elapsedRef = useRef(0);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [playing, setPlaying] = useState(true);
  const running = visible && !reduced && playing && step < beats.length - 1;
  const beat = beats[step];
  stepRef.current = step;
  const jump = (next: number, autoplay = false) => {
    elapsedRef.current = 0;
    progressRef.current?.style.setProperty("--beat-progress", "0%");
    scrollAnchorRef.current = { y: window.scrollY, step: next };
    setStep(next);
    setPlaying(autoplay);
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1180px) and (min-height: 850px)");
    let inView = false;
    const sync = () => { setVisible(inView && !document.hidden); setReduced(media.matches); setScrollEnabled(desktop.matches && !media.matches); };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      sync();
    }, { threshold: 0.2 });
    observer.observe(stage);
    sync();
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", sync);
    desktop.addEventListener("change", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); media.removeEventListener("change", sync); desktop.removeEventListener("change", sync); };
  }, []);

  // Native scrolling moves the story forward; it never cancels a wheel/touch event.
  useEffect(() => {
    if (!scrollEnabled || !playing) return;
    let frame = 0;
    let lastY = window.scrollY;
    const advance = () => {
      frame = 0;
      const track = trackRef.current;
      if (!track || document.hidden) return;
      const y = window.scrollY;
      const forward = y > lastY;
      lastY = y;
      const rect = track.getBoundingClientRect();
      const story = track.querySelector<HTMLElement>(".aps-story");
      if (!forward || !story || rect.top > 96 || rect.bottom < 96) return;
      const runway = track.offsetHeight - story.offsetHeight;
      if (runway <= 0) return;
      const start = Math.max(y + rect.top - 96, scrollAnchorRef.current.y);
      const target = Math.min(9, scrollAnchorRef.current.step + Math.floor(Math.max(0, y - start) / (runway / 9)));
      if (target > stepRef.current) {
        elapsedRef.current = 0;
        stepRef.current = target;
        setStep(target);
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(advance); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [scrollEnabled, playing]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      if (previous !== null) elapsedRef.current += now - previous;
      previous = now;
      progressRef.current?.style.setProperty("--beat-progress", `${Math.min(100, elapsedRef.current / beats[step].duration * 100)}%`);
      if (elapsedRef.current >= beats[step].duration) {
        elapsedRef.current = 0;
        setStep(value => value + 1);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, step]);

  return <section className="aps-section" id="building" aria-labelledby="aps-title" data-step={step} data-running={running} data-visible={visible} data-scroll-story={scrollEnabled}>
    <div className="aps-shell">
      <header className="aps-heading"><div><p className="aps-eyebrow"><span/> THE PLATFORM, IN MOTION</p><h2 id="aps-title">See what we’re building<br/><em>and how it all works together.</em></h2></div><div className="aps-invitation"><span><Play size={13}/> A WORKFLOW IN ~18 SECONDS</span><p>Watch one request turn into a reviewed brief.<br/>Stay and watch - or scroll to move it forward.</p><a href="#after-product-story">Skip the story <ArrowDown size={14}/></a></div></header>
      <div className="aps-track" ref={trackRef}><div className="aps-story">
        <div className="aps-live-ribbon"><div className="aps-mini-engine" aria-hidden="true"><Send size={16}/><span className="aps-engine-wire"><i/></span><span className="aps-engine-cube"><i/><i/><i/></span><span className="aps-engine-wire"><i/></span><FileText size={16}/></div><div className="aps-live-caption"><span>{step === 9 ? "REQUEST → REVIEWED BRIEF" : "WATCH THE HANDOFFS HAPPEN"}</span><strong key={step}>{beat.event}</strong></div><a href="#after-product-story" className="aps-skip">Skip story <ArrowDown size={13}/></a></div>
        <nav className="aps-chapters" aria-label="Workflow story chapters">{chapters.map((chapter,index)=><button key={chapter.label} type="button" onClick={()=>jump(chapter.start)} aria-current={beat.chapter===index ? "step" : undefined} className={beat.chapter>index ? "is-done" : ""}><span className="aps-chapter-icon">{beat.chapter>index ? <Check size={19}/> : <chapter.icon size={19}/>}</span><span><strong>{chapter.label}</strong><small>{chapter.detail}</small></span><span className="aps-chapter-number">0{index+1}</span></button>)}</nav>
        <div className="aps-example"><span><span className="aps-example-dot"/> FOLLOW ONE EXAMPLE</span><strong>Northstar product launch</strong><span className="aps-example-type">Illustrative workflow · no live execution</span></div>
        <div className="aps-stage">
          <aside className="aps-narrative"><span className="aps-beat-label">{String(step+1).padStart(2,"0")} / 10 · {chapters[beat.chapter].label}</span><div key={step} className="aps-narrative-copy"><h3>{beat.title}</h3><p>{beat.copy}</p><div className="aps-event"><span><Check size={13}/></span>{beat.event}</div></div><div className="aps-up-next"><span>{step===9 ? "YOUR NEXT STEP" : "UP NEXT"}</span><p>{beat.next}</p>{step===9 && <Link href="/book-demo">Book a demo <ArrowRight size={16}/></Link>}</div></aside>
          <div className="aps-visual" ref={stageRef} onPointerMove={event => {
            if (!scrollEnabled || reduced || event.pointerType !== "mouse") return;
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty("--scene-rx", `${(0.5 - (event.clientY - rect.top) / rect.height) * 3}deg`);
            event.currentTarget.style.setProperty("--scene-ry", `${((event.clientX - rect.left) / rect.width - 0.5) * 4}deg`);
          }} onPointerLeave={event => { event.currentTarget.style.setProperty("--scene-rx", "0deg"); event.currentTarget.style.setProperty("--scene-ry", "0deg"); }}><div className="aps-scene-content" key={step < 4 ? step : step < 7 ? "tools" : step}>
            {step===0 && <WorkforceScene/>}
            {step===1 && <ObjectiveScene/>}
            {(step===2 || step===3) && <PlanScene assigned={step===3}/>}
            {step>=4 && step<=6 && <ToolsScene received={step-4}/>}
            {step>=7 && <BriefScene step={step}/>}
          </div></div>
        </div>
        <div className="aps-playback" ref={progressRef}><div className="aps-progress" aria-hidden="true"><span style={{width: `${(step / 9) * 100}%`}}/><i/></div><div className="aps-playback-inner"><div className="aps-playback-buttons"><button type="button" aria-label="Previous story step" disabled={step===0} onClick={()=>jump(step-1)}><ArrowLeft size={17}/></button><button type="button" className="aps-play-toggle" aria-label={step===9 ? "Replay workflow story" : reduced ? "Next story step with reduced motion" : playing ? "Pause workflow story" : "Play workflow story"} onClick={()=>{ if(step===9) jump(0,true); else if(reduced) jump(Math.min(9,step+1)); else { scrollAnchorRef.current = { y: window.scrollY, step }; setPlaying(!playing); } }}>{step===9 ? <RotateCcw size={16}/> : playing && !reduced ? <Pause size={16}/> : <Play size={16}/>}<span>{step===9 ? "Replay story" : reduced ? "Next step" : playing ? "Pause" : "Play"}</span></button><button type="button" aria-label="Next story step" disabled={step===9} onClick={()=>jump(step+1)}><ArrowRight size={17}/></button></div><p>{step===9 ? "The story is complete. Explore it again at your own pace." : reduced ? "Motion reduced. Use the controls to explore the story." : (scrollEnabled ? "Scroll to advance, or watch it unfold. Pause to explore." : "A complete story in ~18 seconds. Pause to explore.")}</p><span className="aps-step-counter">{String(step+1).padStart(2,"0")} <span>/ 10</span></span></div></div>
      </div></div>
      <div id="after-product-story" ref={endRef} className="aps-bottom" tabIndex={-1}><span><ShieldCheck size={17}/> Example data, simulated tool reads, and an illustrative human review.</span><Link href="/product">Explore the platform <ArrowRight size={16}/></Link></div>
    </div>
  </section>;
}
