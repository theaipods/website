"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, FileSearch, FileText, Fingerprint, KeyRound, LockKeyhole, Pause, Play, RotateCcw, ShieldCheck, Unplug } from "lucide-react";
import "@/app/integration-gateway.css";

const chapters = ["Request", "Identity", "Discovery", "Permission", "Outcome"];
const durations = [1300, 1800, 2100, 2600];
const gates = [
  { name: "Identity", detail: "Who is asking?", icon: Fingerprint },
  { name: "Tool schema", detail: "What can this tool do?", icon: FileSearch },
  { name: "Permission", detail: "Is this action allowed?", icon: KeyRound },
];
const readStory = [
  ["An objective is not a permission.", "The research specialist asks for one approved launch brief. The request carries an identity, a tool name, and a specific resource."],
  ["First, establish who is asking.", "The sample connection identifies the research specialist and its company. Identity is checked before the request moves farther."],
  ["Discover the tool. Don’t run it yet.", "A tool schema describes the available action and its inputs. Discovering read_document does not grant permission to use it."],
  ["A narrow scope opens the passage.", "In this configured example, the scope permits reading this one brief. Editing, publishing, and unrelated documents remain outside the boundary."],
  ["Useful context returns with its source.", "The simulation returns a small evidence card for the specialist to use in a draft. A person still reviews the resulting work."],
];
const writeStory = [
  ["Now ask for something outside the scope.", "The same specialist asks to publish an update. Changing the objective does not change the connection’s read-only permission."],
  ["A known identity isn’t a blank cheque.", "The specialist is recognized. That establishes who made the request, not permission for every action it might ask to take."],
  ["An available action is not an allowed action.", "The example server describes publish_update. A discovered tool can still be restricted by the connection’s configured scope."],
  ["The gate stays closed.", "Publishing is a write action. This example connection allows reads only, so the request stops before it reaches a business system."],
  ["Nothing published. The reason is visible.", "The specialist receives a clear boundary: write access is not granted. A person can review the request; the animation does not grant new access."],
];

export function IntegrationGateway() {
  const stageRef = useRef<HTMLDivElement>(null);
  const clock = useRef(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const [restricted, setRestricted] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const running = playing && visible && !reduced && step < 4;
  const story = restricted ? writeStory : readStory;
  const reset = (mode: boolean) => {
    clock.current = 0;
    progressRef.current?.style.setProperty("--gate-progress", "0%");
    setRestricted(mode); setStep(0); setPlaying(true);
  };
  const selectStep = (value: number) => {
    clock.current = 0;
    progressRef.current?.style.setProperty("--gate-progress", "0%");
    setStep(value); setPlaying(false);
  };

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const sync = () => { setVisible(inView && !document.hidden); setReduced(media.matches); };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= .3;
      sync();
    }, { threshold: .3 });
    observer.observe(node); sync();
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); media.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, []);

  useEffect(() => {
    if (!running) return;
    let id = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      if (previous !== null) clock.current += now - previous;
      previous = now;
      progressRef.current?.style.setProperty("--gate-progress", `${Math.min(100, clock.current / durations[step] * 100)}%`);
      if (clock.current >= durations[step]) { clock.current = 0; setStep(value => value + 1); return; }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [running, step, restricted]);

  const packetPosition = [4, 20, 49, restricted ? 67 : 79, restricted ? 67 : 96][step];
  return <section className="ig-section" id="mcp" aria-labelledby="gateway-title" data-step={step} data-restricted={restricted} data-running={running} data-visible={visible}>
    <div className="ig-shell">
      <header className="ig-heading">
        <div><span className="ig-eyebrow"><i/> THE MCP GATEWAY</span><h2 id="gateway-title">One governed passage<br/><em>between intent and action.</em></h2></div>
        <p>A request doesn’t get a free pass.<br/>Watch the checks open the way - or stop it.</p>
      </header>
      <div className="ig-lab" ref={stageRef}>
        <div className="ig-toolbar">
          <div className="ig-modes" role="group" aria-label="Gateway example">
            <button type="button" aria-pressed={!restricted} onClick={() => reset(false)}><FileText size={16}/> Read an approved brief</button>
            <button type="button" aria-pressed={restricted} onClick={() => reset(true)}><LockKeyhole size={16}/> Try a restricted action</button>
          </div>
          <span className="ig-simulation"><i/> INTERACTIVE EXAMPLE</span>
        </div>

        <div className="ig-stage">
          <article className="ig-request">
            <span className="ig-card-label">01 / THE INTENT</span>
            <div className="ig-request-icon"><FileText size={26}/><span>R</span></div>
            <span className="ig-agent">RESEARCH SPECIALIST</span>
            <h3>{restricted ? "Publish the launch update." : "Find the approved launch brief."}</h3>
            <div className="ig-request-code"><span>requested tool</span><code>{restricted ? "publish_update" : "read_document"}</code></div>
            <span className="ig-request-scope"><ShieldCheck size={13}/> Connection scope: read only</span>
          </article>

          <div className="ig-passage">
            <div className="ig-passage-top"><span>02 / THE CHECKS</span><span>MCP CONNECTION</span></div>
            <div className="ig-machine" style={{ "--packet-x": `${packetPosition}%` } as CSSProperties}>
              <div className="ig-floor" aria-hidden="true"/>
              <div className="ig-track" aria-hidden="true"><i/><i/><i/></div>
              <div className="ig-gates">{gates.map((gate, index) => {
                const blocked = restricted && index === 2 && step >= 3;
                const open = step > index && !blocked;
                const active = step === index + 1;
                return <div className="ig-gate" key={gate.name} data-open={open} data-blocked={blocked} data-active={active}>
                  <span className="ig-gate-number">0{index + 1}</span>
                  <div className="ig-gate-frame" aria-hidden="true"><div className="ig-door ig-door-left"/><div className="ig-door ig-door-right"/><span className="ig-gate-emblem"><gate.icon size={25}/></span><i className="ig-gate-scan"/></div>
                  <strong>{gate.name}</strong><span className="ig-gate-detail">{gate.detail}</span>
                  <span className="ig-gate-status">{blocked ? <><LockKeyhole size={11}/> Held</> : open ? <><Check size={11}/> {index === 2 ? "Read allowed" : "Checked"}</> : "Waiting"}</span>
                </div>;
              })}</div>
              <span className="ig-traveler" aria-hidden="true"><FileText size={18}/></span>
            </div>
            <div className="ig-scope-strip"><KeyRound size={13}/><span>One resource</span><i/><span>Read only</span><i/><span>No publishing</span></div>
          </div>

          <article className="ig-result" data-ready={step === 4}>
            <span className="ig-card-label">03 / THE OUTCOME</span>
            {step < 4 ? <div className="ig-result-waiting"><div className="ig-receive-rings"><i/><i/><ShieldCheck size={27}/></div><h3>Waiting for the checks.</h3><p>No result is returned before the boundary is resolved.</p></div> : restricted ? <div className="ig-result-content ig-result-held" key="held"><span className="ig-result-symbol"><LockKeyhole size={24}/></span><h3>Stopped before action.</h3><p>Write access is not granted.</p><div className="ig-held-stamp"><Unplug size={16}/> Nothing published</div><button type="button" onClick={() => reset(false)}>Compare a permitted read <ArrowRight size={14}/></button></div> : <div className="ig-result-content" key="read"><span className="ig-result-symbol"><Check size={24}/></span><h3>Context, with evidence.</h3><div className="ig-evidence"><span><FileText size={14}/> Launch brief · sample</span><p>Launch: 12 November<br/>Owner: Product team</p><small>Source attached · read only</small></div><button type="button" onClick={() => reset(true)}>What if it tried to publish? <ArrowRight size={14}/></button></div>}
          </article>
        </div>

        <div className="ig-narrative" key={`${restricted}-${step}`}><span className="ig-beat">0{step + 1}<small>/ 05</small></span><div><h3>{story[step][0]}</h3><p>{story[step][1]}</p></div><span className={`ig-outcome-tag${restricted && step >= 3 ? " is-held" : ""}`}>{step === 4 ? restricted ? "BOUNDARY HELD" : "READY FOR REVIEW" : "FOLLOW THE REQUEST"}</span></div>
        <div className="ig-controls" ref={progressRef}>
          <div className="ig-chapters" aria-label="Gateway demonstration chapters">{chapters.map((chapter, index) => <button type="button" key={chapter} aria-current={step === index ? "step" : undefined} onClick={() => selectStep(index)}><span>{index < step ? <Check size={12}/> : `0${index + 1}`}</span>{chapter}<i/></button>)}</div>
          <button className="ig-play" type="button" aria-label={step === 4 ? "Replay gateway example" : reduced ? "Next gateway step" : playing ? "Pause gateway example" : "Play gateway example"} onClick={() => { if (step === 4) reset(restricted); else if (reduced) selectStep(step + 1); else setPlaying(!playing); }}>{step === 4 ? <RotateCcw size={16}/> : reduced ? <ChevronRight size={18}/> : playing ? <Pause size={16}/> : <Play size={16}/>}<span>{step === 4 ? "Replay" : reduced ? "Next" : playing ? "Pause" : "Play"}</span></button>
        </div>
      </div>
      <div className="ig-footnote"><p><ShieldCheck size={16}/><span>This is a local simulation. Discovery does not grant execution. Real access needs explicit permissions and a configured executor.</span></p><Link href="/docs/integrations">Understand the connection boundary <ArrowRight size={15}/></Link></div>
    </div>
  </section>;
}
