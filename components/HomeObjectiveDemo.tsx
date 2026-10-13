"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronRight, FileCheck2, LockKeyhole, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

type Phase = "ready" | "planning" | "working" | "review" | "approved";
type Example = {
  label: string;
  short: string;
  objective: string;
  image: string;
  team: [string, string, string, string];
  assignments: [string, string, string, string];
  output: string;
  evidence: string;
  approval: string;
  preview: [string, string, string];
};

const examples: Example[] = [
  {
    label: "Marketing", short: "Launch a campaign", image: "campaign",
    objective: "Launch the next product campaign",
    team: ["Audience Research", "Campaign Strategy", "Creative Studio", "Brand QA"],
    assignments: ["Find audience signals", "Set channel plan", "Prepare launch assets", "Validate claims"],
    output: "Campaign launch kit", evidence: "Audience notes · approved brand guide · channel plan", approval: "Brand and claims approval",
    preview: ["Audience and channel brief", "Creative concepts and copy", "Launch checklist with sources"],
  },
  {
    label: "Product", short: "Ship a feature", image: "feature",
    objective: "Prepare a feature for release",
    team: ["Discovery", "Product Lead", "Engineering", "Quality Review"],
    assignments: ["Synthesize feedback", "Define release scope", "Check dependencies", "Review acceptance"],
    output: "Release-ready brief", evidence: "Customer feedback · product spec · QA notes", approval: "Product owner sign-off",
    preview: ["Problem and scope summary", "Dependencies and test plan", "Release decision checklist"],
  },
  {
    label: "Support", short: "Resolve an issue", image: "support",
    objective: "Resolve a customer support issue",
    team: ["Triage", "Knowledge", "Response", "Quality Review"],
    assignments: ["Classify the issue", "Find approved guidance", "Draft a response", "Check policy and tone"],
    output: "Reviewed customer response", evidence: "Support history · knowledge article · policy", approval: "Human send approval",
    preview: ["Issue and context summary", "Suggested resolution", "Response ready for review"],
  },
];

const phases = ["Objective", "Plan", "Work", "Review", "Result"] as const;
const phaseIndex: Record<Phase, number> = { ready: 0, planning: 1, working: 2, review: 3, approved: 4 };

export function HomeObjectiveDemo() {
  const [selected, setSelected] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [revision, setRevision] = useState(false);
  const example = examples[selected];

  useEffect(() => {
    if (phase !== "planning" && phase !== "working") return;
    const timer = window.setTimeout(() => setPhase(phase === "planning" ? "working" : "review"), phase === "planning" ? 1350 : 2450);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const choose = (index: number) => {
    setSelected(index);
    setPhase("ready");
    setRevision(false);
  };
  const run = () => {
    setRevision(false);
    setPhase("planning");
  };

  return <section className="hd-hero" id="objective-simulator" aria-label="Explore an AI Pod demo">
    <div className="hd-hero-wash" aria-hidden="true" />
    <div className="fh-container hd-hero-layout">
      <div className="hd-hero-copy">
        <p className="hd-eyebrow"><span className="hd-eyebrow-led" /> YOUR AI WORKFORCE, IN ACTION</p>
        <h1>One objective.<br/><em>A whole team <br/>in motion.</em></h1>
        <p className="hd-hero-lede">Give AI Pod a goal. Watch specialist employees plan the work, collaborate, validate it, and bring the result back for your decision.</p>
        <div className="hd-example-label">CHOOSE AN OBJECTIVE TO EXPLORE</div>
        <div className="hd-examples" role="group" aria-label="Sample objectives">
          {examples.map((item, index) => <button type="button" key={item.label} className={`hd-example${selected === index ? " is-selected" : ""}`} aria-pressed={selected === index} onClick={() => choose(index)}>
            <img src={`/brand/homepage-3d/${item.image}.png`} alt=""/><span><strong>{item.label}</strong><small>{item.short}</small></span><ChevronRight size={17}/>
          </button>)}
        </div>
        <div className="hd-hero-actions">
          <button type="button" className="hd-run-button" onClick={run}>{phase === "ready" ? "Run this demo" : "Replay demo"}<ArrowRight size={18}/></button>
          <Link href="/login" className="hd-real-link">Build a real pod <ArrowUpRight size={17}/></Link>
        </div>
        <p className="hd-hero-note"><ShieldCheck size={16}/> Interactive illustration. No external action is performed.</p>
      </div>

      <div className="hd-command" aria-label={`Illustrative AI Pod workflow for ${example.objective}`}>
        <div className="hd-command-header"><span className="hd-command-brand"><span className="hd-command-logo">✦</span> AI POD <b>/ WORKFORCE COMMAND</b></span><span className="hd-demo-badge">INTERACTIVE DEMO</span></div>
        <div className="hd-command-body">
          <div className="hd-command-objective"><span>YOUR OBJECTIVE <span className="hd-objective-number">0{selected + 1}</span></span><strong>{example.objective}</strong><small>{phase === "ready" ? "Ready for the orchestrator" : phase === "approved" ? "Completed in this illustration" : "Orchestrator coordinating the work"}</small></div>
          <div className="hd-progress" aria-label="Workflow progress">{phases.map((label, index) => <div key={label} className={`hd-progress-step${phaseIndex[phase] >= index ? " is-current" : ""}${phaseIndex[phase] > index ? " is-done" : ""}`}><span>{phaseIndex[phase] > index ? <Check size={12}/> : index + 1}</span><small>{label}</small></div>)}</div>

          <div className={`hd-workforce-map hd-phase-${phase}`}>
            <svg className="hd-connections" viewBox="0 0 640 252" preserveAspectRatio="none" aria-hidden="true"><path d="M320 126 L110 55 M320 126 L530 55 M320 126 L110 198 M320 126 L530 198"/></svg>
            <div className="hd-core"><img src="/brand/orchestrator-core-cinematic.png" alt=""/><span>ORCHESTRATOR</span></div>
            {example.team.map((role, index) => <div key={role} className={`hd-worker hd-worker-${index + 1}${phaseIndex[phase] > 0 ? " is-active" : ""}`}>
              <span className="hd-worker-mark">{String(index + 1).padStart(2, "0")}</span><span><strong>{role}</strong><small>{phase === "ready" ? "Ready to assign" : phase === "planning" ? "Task assigned" : phase === "approved" ? "Complete" : example.assignments[index]}</small></span><span className="hd-worker-state"/>
            </div>)}
          </div>

          <div className="hd-command-lower" aria-live="polite">
            <div className="hd-activity"><span className="hd-panel-kicker">{phase === "ready" ? "01 / READY TO BEGIN" : phase === "planning" ? "02 / PLAN CREATED" : phase === "working" ? "03 / WORK IN MOTION" : phase === "review" ? "04 / HUMAN CHECKPOINT" : "05 / DELIVERABLE READY"}</span>
              <strong>{phase === "ready" ? "A specialist team is ready." : phase === "planning" ? "The work has an owner and a path." : phase === "working" ? revision ? "Feedback is moving through the pod." : "Specialists are sharing evidence." : phase === "review" ? example.approval : example.output}</strong>
              <p>{phase === "ready" ? "Run the sample to see the work move from objective to approval." : phase === "planning" ? `${example.team.length} specialists assigned across a coordinated workflow.` : phase === "working" ? `Using ${example.evidence.toLowerCase()}.` : phase === "review" ? "The workflow pauses here until a person makes the decision." : "Your review is recorded. This sample is ready to inspect."}</p>
              {phase === "review" && <div className="hd-approval-actions"><button type="button" onClick={() => setPhase("approved")}><CheckCircle2 size={15}/> Approve sample</button><button type="button" onClick={() => { setRevision(true); setPhase("working"); }}><RotateCcw size={14}/> Request changes</button></div>}
            </div>
            <div className="hd-deliverable"><span className="hd-panel-kicker"><FileCheck2 size={13}/> {phase === "approved" ? "SAMPLE DELIVERABLE" : "OUTPUT IN VIEW"}</span><strong>{example.output}</strong><ul>{example.preview.map((line, index) => <li key={line}><span className={phase === "approved" || phase === "review" || (phase === "working" && index === 0) ? "is-filled" : ""}>{phase === "approved" || phase === "review" || (phase === "working" && index === 0) ? <Check size={10}/> : null}</span>{line}</li>)}</ul></div>
          </div>
        </div>
        <div className="hd-command-footer"><span><span className="hd-live-dot"/> {phase === "ready" ? "POD READY" : phase === "review" ? "WAITING FOR YOU" : phase === "approved" ? "DEMO COMPLETE" : "WORKFORCE ACTIVE"}</span><span><LockKeyhole size={13}/> HUMAN APPROVAL BUILT IN</span></div>
      </div>
    </div>
    <div className="fh-container hd-hero-bottom"><span><Sparkles size={15}/> SEE THE WORK, NOT JUST THE PROMISE</span><Link href="#experience">Explore the workflow <ArrowRight size={15}/></Link></div>
  </section>;
}
