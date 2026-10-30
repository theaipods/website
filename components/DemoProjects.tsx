"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, usePlatform } from "./platform-context";
import { Button, Field, Heading, Notice, Section } from "./platform-ui";
import { demoTemplates } from "@/lib/demo-templates";
import { plans, type PlanId } from "@/lib/plans";
import { agents, type ApprovalMode, type Knowledge, type Run } from "@/lib/workforce";

type Allowance = { id: PlanId; usedPods: number; usedProjects: number };
export function DemoProjects() {
  const s = usePlatform(); const router = useRouter();
  const submission = useRef<string | undefined>(undefined);
  const [selected, select] = useState(demoTemplates[0]); const [prompt, setPrompt] = useState(selected.prompt);
  const [mode, setMode] = useState("live"); const [approval, setApproval] = useState<ApprovalMode>("smart");
  const [plan, setPlan] = useState<Allowance>(); const [files, setFiles] = useState<Knowledge[]>([]); const [evidence, setEvidence] = useState<string[]>([]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { void api<{plan: Allowance}>("demo-projects").then(r => setPlan(r.plan)).catch(e => setError(e.message)); }, [s.pods.length]);
  useEffect(() => { setEvidence([]); setFiles([]); if (s.activeId) void api<Knowledge[]>(`companies/${s.activeId}/knowledge`).then(setFiles).catch(e => setError(e.message)); }, [s.activeId]);
  const allowance = plan && plans[plan.id]; const full = !!(allowance && plan && ((allowance.pods !== null && plan.usedPods >= allowance.pods) || (allowance.projects !== null && plan.usedProjects >= allowance.projects)));
  const missing = s.providers.filter(p => (p.capability === "chat" || selected.domain === "engineering" && p.capability === "code") && !p.configured);
  return <><Heading eyebrow="Founder demonstrations" title="Give your workforce its next objective.">Five editable briefs. Nothing runs until you send. Your saved company profile, rules and selected evidence guide the work.</Heading>
    {error && <Notice error>{error}</Notice>}
    <Section title={`${allowance?.name || "Loading"} plan`}><p>{plan ? `${plan.usedProjects}/${allowance?.projects ?? "unlimited"} projects · ${plan.usedPods}/${allowance?.pods ?? "unlimited"} Pods used across your account.` : "Loading allowance…"}</p><p className="text-sm text-muted mt-2">Every account starts on Starter. All templates are available; Starter permits one project and one Pod. Upgrades require an administrator.</p></Section>
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mb-8">{demoTemplates.map(t => <button key={t.id} aria-pressed={selected.id === t.id} className={`wf-chip text-left p-5 ${selected.id === t.id ? "selected" : ""}`} onClick={() => { select(t); setPrompt(t.prompt); }}><b className="block">{t.name}</b><span className="block mt-2 text-sm">{t.summary}</span></button>)}</div>
    <Section title={selected.name}><Field label="Your brief" area value={prompt} onChange={setPrompt}/><div className="wf-grid mt-5"><Field label="Execution" value={mode} options={["live", "simulation"]} onChange={setMode}/><label className="text-sm">Approval policy<select className="wf-select w-full mt-2" value={approval} onChange={e => setApproval(e.target.value as ApprovalMode)}><option value="manual">Manually approve every draft</option><option value="smart">Decide for me - review key commitments</option><option value="auto">Auto-approve all drafts</option></select></label></div>
    <p className="text-sm text-muted my-4">Decide for me uses explicit template checkpoints for commercial terms, commitments and sign-off. Auto-approve applies to drafts; it does not grant access to external services. Estimates exclude review time.</p>
    <details className="my-5"><summary>Assigned work and connection checklist</summary><ol className="list-decimal pl-5 mt-3">{selected.steps.map(step => <li key={step.key} className="py-2">{step.title}  - {step.role}</li>)}</ol><p className="mt-3">{selected.tools.join(" · ")}</p><Link className="underline" href="/workspace/settings">Configure connections</Link></details>
    <fieldset className="my-5"><legend className="font-medium">Approved evidence</legend>{files.map(f => <label key={f.id} className="wf-check"><input type="checkbox" checked={evidence.includes(f.id)} onChange={e => setEvidence(e.target.checked ? [...evidence, f.id] : evidence.filter(id => id !== f.id))}/>{f.name} · {f.status}</label>)}{!files.length && <p className="text-sm text-muted">No uploaded evidence. The workforce will disclose missing data instead of inventing facts.</p>}</fieldset>
    {mode === "live" && missing.length > 0 && <Notice>Configure {missing.map(p => p.capability).join(" and ")} model providers in the server environment and restart the web app and worker.</Notice>}
    {full && <Notice>Your plan allowance is used. Open your existing Pod or ask an administrator for an upgrade.</Notice>}
    <Button disabled={busy || !plan || full || s.company?.status !== "active" || prompt.trim().length < 20 || mode === "live" && missing.length > 0} onClick={async () => { setBusy(true); setError(""); submission.current ??= crypto.randomUUID(); try { const p = await api<Run>("demo-projects", "POST", { requestKey: submission.current, companyId: s.activeId, templateId: selected.id, prompt, mode, approvalMode: approval, knowledgeIds: evidence }); await s.refresh(); router.push(`/workspace/pods/${p.id}`); } catch(e) { setError((e as Error).message); } finally { setBusy(false); } }}>{busy ? "Creating your project…" : "Send brief & create Pod →"}</Button></Section>
    <Link href="/docs/local-demo" className="underline">Local demo setup guide</Link>
  </>;
}
export function DemoRunBoard({pod}: {pod: Run}) {
  const completed = pod.tasks.filter(t => t.status === "Completed").length;
  const remaining = new Map<string, number>();
  for (const t of pod.tasks) remaining.set(t.id, (t.status === "Completed" || t.status === "Needs approval" ? 0 : t.estimatedMinutes || 2) + Math.max(0, ...t.dependencies.map(id => remaining.get(id) || 0)));
  return <Section title="Your workforce in motion"><div className="flex flex-wrap justify-between gap-4 mb-4"><b>{completed} / {pod.tasks.length} completed</b><span>About {Math.max(0, ...remaining.values())} min of work remaining · estimate excludes reviews</span><span>Approval policy: {pod.approvalMode}</span></div><progress className="w-full mb-6 accent-blue-700" value={completed} max={pod.tasks.length} aria-label="Completed tasks"/><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{pod.tasks.map(t => <article key={t.id} className="rounded-xl border border-line bg-white p-4"><p className="text-xs text-muted">{agents.find(a => a.id === t.agentId)?.name} · {t.reasoningEffort}</p><h3 className="font-semibold my-3">{t.title}</h3><span className="wf-badge">{t.status === "Running" ? "● Working" : t.status}</span>{t.status === "Planned" && <p className="text-xs text-muted mt-3">{t.dependencies.filter(id => pod.tasks.find(d => d.id === id)?.status !== "Completed").length} dependencies remaining</p>}{t.output && <details className="mt-4 text-sm"><summary>Inspect output</summary><pre className="wf-artifact mt-3">{t.output}</pre></details>}</article>)}</div></Section>;
}
