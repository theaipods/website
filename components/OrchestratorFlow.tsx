"use client";

import { useEffect, useState } from "react";
import { Check, CirclePause, FileCheck2, Sparkles } from "lucide-react";
import { WorkerScene } from "@/components/WorkerScene";

const phases = [
  { title: "Objective received", detail: "Grow Diwali sale GMV 25% with ad spend flat", role: "You", status: "BRIEF" },
  { title: "Orchestrator plans", detail: "Breaks the objective into steps, sources and owners", role: "Orchestrator", status: "PLANNING" },
  { title: "Specialists work in sync", detail: "Research, data, creative and launch tasks run together", role: "AI employees", status: "WORKING" },
  { title: "Quality validates", detail: "Evidence, claims and deliverables are checked", role: "Quality agent", status: "CHECKING" },
  { title: "Human approval", detail: "The pod stops here. You review before anything ships.", role: "You", status: "WAITING" },
];

export function OrchestratorFlow() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % phases.length), 2600);
    return () => window.clearInterval(timer);
  }, []);
  return <div className="of-stage" aria-label="Animated example of a task moving through an AI pod">
    <div className="of-brief"><span>YOUR OBJECTIVE</span><strong>Grow Diwali sale GMV 25%</strong><small>Keep ad spend flat · 9 workstreams</small></div>
    <div className="of-robot-wrap"><div className="of-robot-halo"/><WorkerScene role="orchestrator" className="of-creature"/><div className="of-robot-caption"><Sparkles size={16}/> POD ORCHESTRATOR <span className={active === 4 ? "waiting" : ""}>{active === 4 ? "AWAITING YOU" : "COORDINATING"}</span></div></div>
    <div className="of-workflow" role="list">{phases.map((phase, index) => <div key={phase.title} role="listitem" className={`of-step ${index === active ? "active" : ""} ${index < active ? "complete" : ""}`}><span className="of-step-index">{index < active ? <Check size={16}/> : index === 4 ? <CirclePause size={17}/> : String(index + 1).padStart(2,"0")}</span><div><span className="of-step-role">{phase.role}</span><strong>{phase.title}</strong><small>{phase.detail}</small></div><em>{index === active ? phase.status : index < active ? "DONE" : "QUEUED"}</em></div>)}</div>
    <div className={`of-approval ${active === 4 ? "lit" : ""}`}><FileCheck2 size={21}/><div><strong>Approval checkpoint</strong><span>Execution pauses for your decision</span></div><b>{active === 4 ? "ACTION NEEDED" : "UP NEXT"}</b></div>
  </div>;
}
