"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, FileText, GitBranch, MessageSquare, Pause, Play, ShieldCheck, Target } from "lucide-react";

const stages = [
  { title: "Start with your challenge", description: "A bottleneck, a repetitive task, or an idea worth exploring.", icon: MessageSquare, label: "THE CONVERSATION", heading: "What would better look like?", note: "We start with the work you want to improve, not a list of features.", rows: ["The outcome you want", "Where work slows down", "What a useful first step looks like"] },
  { title: "Map the moving parts", description: "Connect the people, information, and tools behind the work.", icon: GitBranch, label: "THE WORKFLOW", heading: "Make the path visible.", note: "Together, we trace the handoffs and identify where coordination could help.", rows: ["Inputs and approved sources", "Tools and team handoffs", "A clear sequence of steps"] },
  { title: "See the checkpoints", description: "Understand where people review, decide, and stay in control.", icon: ShieldCheck, label: "THE WALKTHROUGH", heading: "Keep judgment with people.", note: "Explore a relevant example and discuss the permissions and reviews it needs.", rows: ["Access and permission boundaries", "Human review before key actions", "Outputs your team can inspect"] },
  { title: "Leave with a direction", description: "Discuss a focused use case and a practical path to evaluate it.", icon: Target, label: "THE NEXT STEP", heading: "A useful place to begin.", note: "Discuss what is available today, what needs configuration, and what comes next.", rows: ["One priority use case", "Requirements to validate", "A next step agreed together"] },
] as const;

export function DemoPossibilities() {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [playing, setPlaying] = useState(true);
  const running = visible && !reduced && playing;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const sync = () => { setVisible(inView && !document.hidden); setReduced(media.matches); };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      sync();
    }, { threshold: 0.2 });
    observer.observe(section);
    sync();
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setStep(current => (current + 1) % stages.length), step === 3 ? 5000 : 3200);
    return () => window.clearTimeout(timer);
  }, [running, step]);

  const current = stages[step];
  const CurrentIcon = current.icon;
  return <section className="dp-section" ref={sectionRef} aria-labelledby="demo-expect-title" data-running={running} data-step={step}>
    <div className="dm-shell">
      <header className="dp-heading">
        <div><p className="dp-eyebrow"><span/> WHAT TO EXPECT</p><h2 id="demo-expect-title">From conversation<br/>to <em>real possibilities.</em></h2></div>
        <p>Bring one challenge. We’ll explore how the work could flow - and what it would take to make it useful for your team.</p>
      </header>
      <div className="dp-layout">
        <div className="dp-agenda">
          <p className="dp-caption">A CONVERSATION WITH A DIRECTION</p>
          <ol>{stages.map((item, index) => <li key={item.title}>
            <button type="button" aria-pressed={step === index} aria-controls="demo-possibility-preview" onClick={() => { setStep(index); setPlaying(false); }}>
              <span className="dp-step-number">0{index + 1}</span><span><strong>{item.title}</strong><small>{item.description}</small></span><ArrowRight size={18} aria-hidden="true"/>
            </button>
          </li>)}</ol>
          <a className="dp-book-link" href="#book">Bring your use case <ArrowRight size={17}/></a>
        </div>
        <div className="dp-board" id="demo-possibility-preview" role="region" aria-label="Conversation to plan preview">
          <div className="dp-board-top"><span><i/> YOUR WORK, MAPPED OUT</span><button type="button" onClick={() => { if (reduced) { setStep((step + 1) % stages.length); } else { setPlaying(!playing); } }} aria-label={reduced ? "Next preview stage" : playing ? "Pause preview" : "Play preview"}>{reduced ? <ArrowRight size={15}/> : playing ? <Pause size={15}/> : <Play size={15}/>}</button></div>
          <div className="dp-request"><span className="dp-request-icon"><MessageSquare size={20}/></span><div><span>YOUR STARTING POINT</span><p>“We want less chasing.<br/>And a clearer path from request to result.”</p></div></div>
          <div className="dp-connection" aria-hidden="true"><span/><i/><span/></div>
          <div className="dp-document" key={step}>
            <div className="dp-document-meta"><span><CurrentIcon size={17}/> {current.label}</span><span>0{step + 1} / 04</span></div>
            <h3>{current.heading}</h3><p>{current.note}</p>
            <ul>{current.rows.map((row, index) => <li key={row} style={{ "--row": index } as React.CSSProperties}><span><Check size={13}/></span>{row}</li>)}</ul>
            <div className="dp-document-foot"><FileText size={15}/><span>A clearer brief. A shared direction.</span></div>
          </div>
          <div className="dp-board-bottom"><span>ILLUSTRATIVE SESSION PREVIEW</span><div aria-hidden="true">{stages.map((_, index) => <i key={index} className={index === step ? "is-current" : ""}/>)}</div></div>
        </div>
      </div>
    </div>
  </section>;
}
