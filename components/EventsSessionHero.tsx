"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronRight, FileText, Lightbulb, MessageCircle, Pause, Play, RotateCcw, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import "@/app/events-session-hero.css";

const questions = [
  { short: "Show me what AI can do", format: "Product demonstration", question: "Could a support request become a useful first draft?", title: "From a question to a prepared reply.", input: "Customer asks: “Where is my order?”", steps: ["Read the request", "Use approved context", "Prepare a reply"], output: "Reply drafted. Ready for a person to review.", audience: "Does it send the reply on its own?", answer: "In this example, no. The draft stops at a human review checkpoint.", takeaway: "Start with one useful task.", notes: ["Define the request", "Choose the approved context", "Make the review step explicit"], icon: Play },
  { short: "Let me see how to build it", format: "Hands-on workshop", question: "How do I turn a messy handoff into a repeatable workflow?", title: "Build the handoff, one block at a time.", input: "Your challenge: new-hire access requests", steps: ["Capture the request", "Route to an owner", "Review access"], output: "A workflow outline with an owner at each handoff.", audience: "Do I need to connect every tool first?", answer: "Start with the workflow and its boundaries. Then identify the connections it needs.", takeaway: "Map the work before the tools.", notes: ["Choose one starting point", "Name the next owner", "Identify the access boundary"], icon: SlidersHorizontal },
  { short: "Where do people step in?", format: "Expert conversation", question: "Where should human judgment stay in an AI workflow?", title: "Make the decision boundary visible.", input: "Proposed action: issue a customer refund", steps: ["Gather the details", "Flag the decision", "Request approval"], output: "Action held. An authorized person decides.", audience: "What if the information is incomplete?", answer: "Surface what is missing and route it for review. A clear exception is better than a hidden guess.", takeaway: "Design the pause, not just the action.", notes: ["Define consequential actions", "Show missing information", "Keep approval with people"], icon: ShieldCheck },
] as const;
const frames = ["The question", "On the stage", "In conversation", "Your takeaway"];
const durations = [1800, 3600, 3200];

export function EventsSessionHero() {
  const visualRef = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const [topic, setTopic] = useState(0);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const running = playing && visible && !reduced && frame < 3;
  const selected = questions[topic];
  const resetProgress = () => { elapsed.current = 0; progressRef.current?.style.setProperty("--session-progress", "0%"); };
  const select = (index: number) => { resetProgress(); setTopic(index); setFrame(0); setPlaying(true); };
  const jump = (index: number) => { resetProgress(); setFrame(index); setPlaying(false); };

  useEffect(() => {
    const el = visualRef.current;
    if (!el) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const sync = () => { setVisible(inView && !document.hidden); setReduced(media.matches); };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting && entry.intersectionRatio >= .2; sync(); }, { threshold: .2 });
    observer.observe(el);
    sync();
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); media.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, []);

  useEffect(() => {
    if (!running) return;
    let id = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      if (previous !== null) elapsed.current += now - previous;
      previous = now;
      progressRef.current?.style.setProperty("--session-progress", `${Math.min(100, elapsed.current / durations[frame] * 100)}%`);
      if (elapsed.current >= durations[frame]) { elapsed.current = 0; setFrame(value => value + 1); return; }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [running, frame, topic]);

  return <section className="esh" aria-labelledby="events-hero-title" data-frame={frame} data-topic={topic} data-running={running} data-visible={visible}>
    <div className="esh-shell">
      <div className="esh-copy">
        <p className="esh-eyebrow"><span/> THEAIPODS / EVENTS</p>
        <h1 id="events-hero-title">Come curious.<br/>Leave with<br/><em>something useful.</em></h1>
        <p className="esh-lead">See the work, ask the questions, try the ideas. Join demonstrations, workshops, and conversations that bring AI into focus.</p>
        <div className="esh-actions"><Link href="#featured" className="esh-primary">Find a session <ArrowRight size={18}/></Link><Link href="#archive" className="esh-secondary">Explore past events <ArrowUpRight size={16}/></Link></div>
        <div className="esh-question-picker"><span><MessageCircle size={15}/> What would you ask?</span><div>{questions.map((question,index)=><button type="button" key={question.short} aria-pressed={topic===index} aria-controls="event-preview-screen" onClick={()=>select(index)}><question.icon size={16}/><span>{question.short}</span><ArrowRight size={15}/></button>)}</div></div>
      </div>

      <div className="esh-theater" ref={visualRef}>
        <div className="esh-preview-heading"><span><Sparkles size={13}/> YOUR FRONT-ROW PREVIEW</span><span>~9 seconds · sound off</span></div>
        <div className="esh-stage-arch" aria-hidden="true"><i/><i/><i/></div>
        <div className="esh-spotlight esh-spotlight-left" aria-hidden="true"/><div className="esh-spotlight esh-spotlight-right" aria-hidden="true"/>
        <div className="esh-screen" id="event-preview-screen" role="region" aria-label="Illustrative event session preview">
          <header className="esh-screen-top"><span><i/> {selected.format}</span><span>SESSION PREVIEW</span></header>
          <div className="esh-screen-content" key={`${topic}-${frame}`}>
            {frame===0 && <div className="esh-opening"><span className="esh-frame-kicker">IT STARTS WITH A GOOD QUESTION</span><span className="esh-quote-mark" aria-hidden="true">“</span><h2>{selected.question}</h2><div className="esh-opening-bottom"><span className="esh-soundbars" aria-hidden="true">{Array.from({length:9},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}/>)}</span><span>Let’s put it on the stage.</span><ArrowRight size={18}/></div></div>}
            {frame===1 && <div className="esh-demo"><span className="esh-frame-kicker">SEE AN EXAMPLE, NOT JUST A SLIDE</span><h2>{selected.title}</h2><div className="esh-example-input"><MessageCircle size={17}/>{selected.input}</div><div className="esh-demo-flow">{selected.steps.map((step,index)=><div key={step} style={{"--i":index} as CSSProperties}><span className="esh-flow-number">0{index+1}</span><strong>{step}</strong><Check size={15}/>{index<2 && <ChevronRight className="esh-flow-arrow" size={17}/>}</div>)}</div><div className="esh-example-output"><ShieldCheck size={17}/><span>{selected.output}</span></div></div>}
            {frame===2 && <div className="esh-conversation"><span className="esh-frame-kicker">THE QUESTION BEHIND THE QUESTION</span><div className="esh-audience-question"><span>FROM THE AUDIENCE · EXAMPLE</span><h2>{selected.audience}</h2><MessageCircle size={23}/></div><div className="esh-host-answer"><span className="esh-answer-symbol"><Lightbulb size={21}/></span><div><span>LET’S UNPACK THAT</span><p>{selected.answer}</p></div></div><div className="esh-conversation-caption"><i/> This is where the useful conversation begins.</div></div>}
            {frame===3 && <div className="esh-takeaway"><span className="esh-frame-kicker">TAKE THE IDEA BACK TO YOUR TEAM</span><div className="esh-note-paper"><span className="esh-paper-heading"><FileText size={15}/> YOUR TAKEAWAY <span>01</span></span><h2>{selected.takeaway}</h2><ul>{selected.notes.map((note,index)=><li key={note} style={{"--i":index} as CSSProperties}><Check size={14}/>{note}</li>)}</ul><span className="esh-paper-foot">One idea you can start a conversation with.</span></div></div>}
          </div>
          <div className="esh-screen-controls" ref={progressRef}><div className="esh-frame-buttons" aria-label="Preview chapters">{frames.map((label,index)=><button key={label} type="button" aria-label={label} aria-current={frame===index ? "step" : undefined} onClick={()=>jump(index)}><span>{String(index+1).padStart(2,"0")}</span><i/></button>)}</div><button type="button" className="esh-play" aria-label={frame===3 ? "Replay session preview" : reduced ? "Next preview chapter" : playing ? "Pause session preview" : "Play session preview"} onClick={()=>{ if(frame===3)select(topic); else if(reduced)jump(frame+1); else setPlaying(!playing); }}>{frame===3 ? <RotateCcw size={16}/> : reduced ? <ArrowRight size={16}/> : playing ? <Pause size={16}/> : <Play size={16}/>}</button></div>
        </div>
        <div className="esh-stage-base" aria-hidden="true"><i/><i/></div>
        <div className="esh-below-screen"><span><i/> {frames[frame]}</span>{frame===3 ? <a href="#featured">Find your next session <ArrowRight size={14}/></a> : <span>A glimpse of the experience. Not a live broadcast.</span>}</div>
      </div>
      <div className="esh-footer"><span><Play size={16}/><strong>See it work.</strong> Follow a demonstration.</span><span><SlidersHorizontal size={16}/><strong>Try the thinking.</strong> Explore a workshop.</span><span><MessageCircle size={16}/><strong>Bring a question.</strong> Join the conversation.</span><a href="#featured" aria-label="Explore events below"><ArrowDown size={18}/></a></div>
    </div>
  </section>;
}
