"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Search, X } from "lucide-react";
import type { RegistryAgent } from "@/lib/agent-registry";

type Category = { id: string; name: string; count: number };
type PodOption = { id: string; name: string; companyId: string; roleIds: string[]; status: string; tasks: { status: string }[] };
const statusLabel = (s: string) => s.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
export function SpecialistWorkforce({ fullPage = false }: { fullPage?: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [agents, setAgents] = useState<RegistryAgent[]>([]);
  const [systems, setSystems] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [autonomy, setAutonomy] = useState("");
  const [risk, setRisk] = useState("");
  const [tool, setTool] = useState("");
  const [approval, setApproval] = useState("");
  const [deployment, setDeployment] = useState("");
  const [selected, setSelected] = useState<RegistryAgent | null>(null);
  const [pods, setPods] = useState<PodOption[]>([]);
  const [podId, setPodId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [activity, setActivity] = useState<{ at: string; text: string; podName: string }[]>([]);
  const [configAutonomy, setConfigAutonomy] = useState(2);
  const [configManager, setConfigManager] = useState("Pod Manager");
  const requestSequence = useRef(0);
  useEffect(() => { const params = new URLSearchParams(window.location.search); setCategory(params.get("category") || ""); if (fullPage) fetch("/api/auth/session").then(r => r.json()).then(session => session.user ? fetch("/api/state").then(r => r.json()) : null).then(data => { if (data?.companies?.length) setCompanyId(data.companies.find((c: {status:string}) => c.status === "active")?.id || data.companies[0].id); setPods(data?.pods || []); }).catch(() => {}); }, [fullPage]);
  const load = useCallback(async () => {
    const sequence = ++requestSequence.current;
    const params = new URLSearchParams();
    for (const [key,value] of Object.entries({ category, q, status, autonomy, risk, tool, approval, deployment })) if (value) params.set(key,value);
    if (companyId) params.set("companyId",companyId);
    const response = await fetch(`/api/agents?${params}`);
    if (!response.ok) return;
    const data = await response.json() as { agents: RegistryAgent[]; categories: Category[]; compatibleSystems: string[] };
    if (sequence !== requestSequence.current) return;
    setAgents(data.agents); setCategories(data.categories); setSystems(data.compatibleSystems);
    setSelected(current => current ? data.agents.find(a => a.id === current.id) || current : null);
  }, [category, q, status, autonomy, risk, tool, approval, deployment, companyId]);
  useEffect(() => { void load(); const timer = companyId ? window.setInterval(() => void load(), 15000) : undefined; return () => { if (timer) window.clearInterval(timer); }; }, [load,companyId]);
  useEffect(() => { if (!selected || !companyId) { setActivity([]); return; } fetch(`/api/agents/${selected.id}/activity?companyId=${encodeURIComponent(companyId)}`).then(r => r.ok ? r.json() : []).then(setActivity).catch(() => setActivity([])); }, [selected?.id,companyId]);
  function chooseCategory(id: string) { setCategory(id); const params = new URLSearchParams(window.location.search); if (id) params.set("category",id); else params.delete("category"); window.history.replaceState({},"",`${window.location.pathname}${params.size ? `?${params}` : ""}${window.location.hash}`); }
  const availablePods = useMemo(() => pods.filter(p => p.companyId === companyId && ["Ready","Blocked"].includes(p.status) && p.tasks.every(t => t.status === "Planned")), [pods,companyId]);
  async function addToPod() {
    if (!selected || !podId) return;
    setBusy(true); setMessage("");
    try { const response = await fetch(`/api/pods/${podId}/agents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId: selected.id }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not add this specialist."); setPods(current => current.map(p => p.id === podId ? { ...p, roleIds: data.roleIds } : p)); setMessage(`${selected.name} was added to ${data.name}.`); window.dispatchEvent(new Event("workforce:changed")); await load(); }
    catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  async function saveConfig() {
    if (!selected || !companyId) return;
    setBusy(true); setMessage("");
    try { const response = await fetch(`/api/agents/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId, autonomyLevel: configAutonomy, manager: configManager }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not save configuration."); setSelected(data); setMessage("Agent configuration saved for this company."); window.dispatchEvent(new Event("workforce:changed")); await load(); }
    catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  return <div className={`sw-catalog${fullPage ? " sw-full" : ""}`}>
    <div className="sw-intro"><div><p className="sw-overline">THE AGENT REGISTRY / DEPLOYABLE ROLES</p><h2>Specialist AI workforce.</h2><p>Deploy specialized AI employees for research, finance, engineering, sales, operations, marketing, customer success and more.</p></div><div className="sw-count"><strong>{agents.length}</strong><span>specialists match</span></div></div>
    <div className="sw-categories" role="tablist" aria-label="Agent categories"><button role="tab" aria-selected={!category} className={!category ? "active" : ""} onClick={() => chooseCategory("")}>All teams</button>{categories.map(c => <button role="tab" aria-selected={category === c.id} className={category === c.id ? "active" : ""} onClick={() => chooseCategory(c.id)} key={c.id}>{c.name}<small>{c.count}</small></button>)}</div>
    <div className="sw-toolbar"><label className="sw-search"><Search size={17}/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search role, skill, tool or capability" aria-label="Search specialists" /></label><select aria-label="Status" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{["IDLE","PLANNING","WORKING","WAITING","BLOCKED","NEEDS_APPROVAL","COMPLETED","ERROR"].map(s => <option key={s}>{s}</option>)}</select><select aria-label="Autonomy" value={autonomy} onChange={e => setAutonomy(e.target.value)}><option value="">Any autonomy</option>{[1,2,3,4].map(n => <option value={n} key={n}>Level {n}</option>)}</select><select aria-label="Risk level" value={risk} onChange={e => setRisk(e.target.value)}><option value="">Any risk</option>{["Low","Medium","High"].map(x => <option key={x}>{x}</option>)}</select><select aria-label="Tool access" value={tool} onChange={e => setTool(e.target.value)}><option value="">Any tool</option>{systems.map(x => <option key={x}>{x}</option>)}</select><select aria-label="Approval requirement" value={approval} onChange={e => setApproval(e.target.value)}><option value="">Any approval</option><option value="true">Approval required</option><option value="false">No role-level approval</option></select>{fullPage && <select aria-label="Deployment" value={deployment} onChange={e => setDeployment(e.target.value)}><option value="">Any deployment</option><option value="deployed">In a pod</option><option value="available">Available</option></select>}</div>
    {agents.length ? <><div className="sw-grid" key={category}>{(fullPage ? agents : agents.slice(0,8)).map((agent,i) => <button className="sw-tile" key={agent.id} onClick={() => { setSelected(agent); setConfigAutonomy(agent.autonomyLevel); setConfigManager(agent.manager === "Human owner" || agent.manager === "Workforce Orchestrator" ? agent.manager : "Pod Manager"); setMessage(""); }} style={{ animationDelay: `${Math.min(i,12)*32}ms` }}><div className="sw-tile-head"><span className={`sw-core sw-core-${agent.category}`} aria-hidden="true"><span/></span><span className={`sw-status sw-status-${agent.status.toLowerCase()}`}><i/>{statusLabel(agent.status)}</span></div><div className="sw-tile-body"><small>{agent.role.toUpperCase()}</small><h3>{agent.name}</h3><p>{agent.description}</p></div><div className="sw-tile-bottom"><span>{agent.capabilities.slice(0,2).join(" + ")} · L{agent.autonomyLevel}</span><span>Inspect <ArrowRight size={15}/></span></div></button>)}</div>{!fullPage && agents.length > 8 && <Link className="sw-view-all" href={`/agents${category ? `?category=${category}` : ""}`}>Explore all {agents.length} matching specialists <ArrowRight size={16}/></Link>}</> : <div className="sw-empty">No specialists match these filters. Try another category or search.</div>}
    {selected && <div className="sw-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><aside className="sw-inspector" role="dialog" aria-modal="true" aria-label={`${selected.name} details`}><div className="sw-inspector-top"><span>AGENT REGISTRY / {selected.id}</span><button onClick={() => setSelected(null)} aria-label="Close agent details"><X size={20}/></button></div><div className="sw-inspector-hero"><span className={`sw-core sw-core-${selected.category}`}><span/></span><p>{selected.role}</p><h2>{selected.name}</h2><div className={`sw-status sw-status-${selected.status.toLowerCase()}`}><i/>{statusLabel(selected.status)}</div><p>{selected.description}</p></div><div className="sw-inspector-scroll"><div className="sw-inspector-stats"><span><b>{selected.metrics.assigned}</b>assigned steps</span><span><b>{selected.metrics.completed}</b>completed</span><span><b>{selected.metrics.awaitingApproval}</b>review gates</span></div><dl className="sw-definition"><dt>Capabilities & skills</dt><dd>{[...selected.capabilities,...selected.skills].join(" · ")}</dd><dt>Tools & access</dt><dd>{selected.tools.join(" · ")}</dd><dt>Compatible systems</dt><dd>{selected.compatibleSystems.join(" · ")} (connection required)</dd><dt>Knowledge</dt><dd>{selected.knowledgeScopes.join(" · ")}</dd><dt>Manager</dt><dd>{selected.manager}</dd><dt>Autonomy & risk</dt><dd>Level {selected.autonomyLevel} · {selected.riskLevel} risk · {selected.requiresApproval ? "Role-level approval required" : "Pod approval rules apply"}</dd><dt>Current task</dt><dd>{selected.currentTask || "No active assignment"}</dd><dt>Inputs → outputs</dt><dd>{selected.inputTypes.join(" · ")} → {selected.outputTypes.join(" · ")}</dd><dt>Pod memberships</dt><dd>{selected.deployedPodIds.length || "Not deployed"}</dd><dt>Recent activity</dt><dd>{activity.length ? activity.slice(0,5).map((event,i) => <span className="sw-activity" key={i}>{event.podName}: {event.text}</span>) : "No agent activity recorded for this company."}</dd></dl><p className="sw-safety">Activity shows actions and results only. Private model reasoning is never displayed.</p></div><div className="sw-inspector-actions">{companyId && <div className="sw-config"><strong>Company configuration</strong><div><label>Autonomy<select value={configAutonomy} onChange={e => setConfigAutonomy(Number(e.target.value))}>{[1,2,3,4].map(n => <option key={n} value={n}>Level {n}</option>)}</select></label><label>Manager<select value={configManager} onChange={e => setConfigManager(e.target.value)}>{["Pod Manager","Workforce Orchestrator","Human owner"].map(x => <option key={x}>{x}</option>)}</select></label></div><button onClick={saveConfig} disabled={busy}>Save configuration</button></div>}{availablePods.length ? <><label htmlFor="sw-pod">Add to a pod</label><select id="sw-pod" value={podId} onChange={e => setPodId(e.target.value)}><option value="">Choose a pod</option>{availablePods.map(p => <option key={p.id} value={p.id}>{p.name}{p.roleIds.includes(selected.id) ? " · already assigned" : ""}</option>)}</select><button disabled={!podId || busy || !!availablePods.find(p => p.id === podId)?.roleIds.includes(selected.id)} onClick={addToPod}>{busy ? "Adding…" : availablePods.find(p => p.id === podId)?.roleIds.includes(selected.id) ? "Already in this pod" : "Add specialist to pod"} <ArrowRight size={16}/></button></> : <Link href={`/workspace/pods/new?agent=${encodeURIComponent(selected.id)}`}>Create a pod with this specialist <ArrowRight size={16}/></Link>}{message && <p role="status">{message.startsWith(selected.name) && <Check size={15}/>} {message}</p>}</div></aside></div>}
  </div>;
}
