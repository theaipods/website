import { randomUUID } from "node:crypto";
import { agents, domains, podQuestions, missingQuestions, type Business, type PodInput, type Run, type WorkforceEvent } from "../workforce";
import { db } from "./db";
import { ApiError } from "./auth";
import { audit, companyFor, podFor, savePod } from "./repository";
import { generate, providerStatus } from "./providers";
import { retrieveKnowledge } from './knowledge-retrieval';
import { eligibleAgents, registryAgent } from "../agent-registry";

export const event = (pod: Run, who: string, text: string, type: WorkforceEvent["type"] = "POD_EVENT", taskId?: string, agentId?: string) => { pod.events.unshift({ at: new Date().toISOString(), who, text, type, taskId, agentId }); pod.events = pod.events.slice(0, 300); };
function handoffs(pod: Run, sourceTaskId: string) {
  const source = pod.tasks.find(task => task.id === sourceTaskId); if (!source || source.status !== "Completed") return;
  for (const target of pod.tasks.filter(task => task.dependencies.includes(source.id) && task.agentId !== source.agentId)) {
    pod.events.unshift({ at: new Date().toISOString(), who: agents.find(a => a.id === source.agentId)?.name || "Human owner", text: `Output from ${source.title} is available to ${agents.find(a => a.id === target.agentId)?.name || "Human owner"} for ${target.title}.`, type: "AGENT_MESSAGE", taskId: target.id, agentId: target.agentId, fromAgentId: source.agentId, toAgentId: target.agentId, sourceTaskId: source.id });
  }
  pod.events = pod.events.slice(0, 300);
}
export function buildRun(company: Business, input: PodInput, autonomyLimits: Record<string, number> = {}): Run {
  const d = domains.find(x => x.id === input.domain);
  if (!d || !company.domains.includes(input.domain)) throw new ApiError(400, "Complete this department's company onboarding before creating its pod.");
  const missing = missingQuestions([...podQuestions, ...d.questions], input.answers);
  if (missing.length) throw new ApiError(400, `Complete the brief: ${missing.join("; ")}`);
  if (input.roleIds.some(id => !registryAgent(id))) throw new ApiError(400, "Unknown employee role.");
  if (!eligibleAgents(input.roleIds, input.objective, company.permissions).length) throw new ApiError(400, "No selected specialist is eligible under this company's permissions.");
  const p: Run = { ...input, id: randomUUID(), companyId: company.id, version: 1, created: new Date().toISOString(), paused: false, status: "Ready", tasks: [], events: [], result: "", resultStatus: "none", contextVersion: company.version };
  const process = company.processes[input.domain] || [];
  let previous = randomUUID();
  p.tasks.push({ id: previous, title: "Plan delivery, verify inputs and assign specialist handoffs", agentId: "pod-manager", dependencies: [], control: input.autonomy === 1 ? "Human approves" : "AI recommends", status: "Planned", output: "", feedback: "", revision: 1, createdAt: p.created, priority: "Normal", progress: 0 });
  for (const [i, step] of process.entries()) {
    const id = randomUUID();
    const eligible = eligibleAgents(input.roleIds, step.name, company.permissions);
    const agentId = step.control === "Human only" || !step.accepted || !eligible.length ? "human" : step.agentId && eligible.some(agent => agent.id === step.agentId) ? step.agentId : eligible[i % eligible.length].id;
    p.tasks.push({ id, title: step.name, description: step.output || undefined, agentId, dependencies: previous ? [previous] : [], control: agentId === "human" ? "Human only" : input.autonomy === 1 || input.autonomy > (autonomyLimits[agentId] || 4) || registryAgent(agentId)?.requiresApproval ? "Human approves" : step.control, status: "Planned", output: "", feedback: "", revision: 1, createdAt: p.created, priority: "Normal", progress: 0 });
    previous = id;
  }
  const review = randomUUID();
  p.tasks.push({ id: review, title: "Verify acceptance criteria, evidence and business rules", agentId: "orchestrator", dependencies: previous ? [previous] : [], control: "AI recommends", status: "Planned", output: "", feedback: "", revision: 1, createdAt: p.created, priority: "Normal", progress: 0 });
  p.tasks.push({ id: randomUUID(), title: "Deliver the consolidated result for owner approval", agentId: "orchestrator", dependencies: [review], control: "Human approves", status: "Planned", output: "", feedback: "", revision: 1, createdAt: p.created, priority: "Normal", progress: 0 });
  for (const task of p.tasks) event(p, "Workforce Orchestrator", `Created ${task.title} and assigned ${agents.find(a => a.id === task.agentId)?.name || "Human owner"}.`, "TASK_CREATED", task.id, task.agentId);
  event(p, "Workforce Orchestrator", `Prepared ${p.tasks.length} dependent steps using company blueprint version ${company.version}. ${input.mode === "simulation" ? "Simulation only; no models or external actions." : "Live drafting requires configured providers; external actions remain manual."}`);
  return p;
}
export async function sourceContext(pod: Run) {
  return retrieveKnowledge(pod.companyId,`${pod.objective} ${pod.answers.scope}`,pod.knowledgeIds,pod.mode!=='simulation');
}
export function simulationArtifact(p: Run, c: Business, taskTitle: string, sources: Awaited<ReturnType<typeof sourceContext>>) {
  return ["# Simulation - configuration rehearsal", "This is an execution brief assembled from your saved answers. It is not model-generated work, a published campaign, or measured business impact.", `## ${taskTitle}`, `Company: ${c.name}\nDepartment: ${domains.find(d => d.id === p.domain)?.name}\nObjective: ${p.objective}`, "## Required result", p.answers.deliverables, "## Acceptance criteria", p.answers.acceptance, "## Measurement", `Baseline (user-provided): ${p.answers.baseline}\nTarget (user-provided): ${p.answers.target}\nDeadline: ${p.answers.deadline}\nBudget: ${p.answers.budget}`, "## Scope and constraints", p.answers.scope, p.answers.constraints, "## Business context", c.about, `Products: ${c.products}\nMarket: ${c.geography}\nBrand voice: ${c.brand.tone || "Not specified"}\nAlways: ${c.brand.always || "Not specified"}\nNever: ${c.brand.never || "Not specified"}`, "## Business rules", ...c.rules.map(r => `- ${r.instruction} (applies: ${r.applies || "company"}; exception: ${r.exception || "none"})`), "## Source excerpts (lexical retrieval)", ...(sources.length ? sources.map(s => `[${s.id}] ${s.name}\n${s.text.slice(0, 700)}`) : ["No readable source selected. Add evidence before relying on a live result."]), "## Review before execution", `Owner / approver: ${p.answers.approver}\nVerify every acceptance criterion. No target has been measured or achieved by this rehearsal.`, "## Next actions", "Configure the required model gateways. Confirm source quality and permissions. Create a live pod after reviewing this simulation. External publishing, payments and deployments require a separately implemented tool adapter and human handoff."].join("\n\n");
}
export async function advancePod(id: string, owner: string) {
  const p = await podFor(id, owner);
  if (p.templateId) { const { advanceDemo } = await import("./demo-worker"); return advanceDemo(id, owner); }
  if (p.status === "Running" && Date.now() - Date.parse(p.events.find(e => e.who === "Worker lease")?.at || p.created) > 120000) {
    const unfinished = p.tasks.find(t => t.status === "Running"); if (unfinished) { unfinished.status = "Blocked"; unfinished.progress = 0; }
    p.status = "Blocked"; event(p, "Workforce Observer", "Worker lease expired after interruption. Retry to resume the unfinished draft; completed steps are preserved.", "OBSERVER_ALERT", unfinished?.id, unfinished?.agentId); await savePod(p); return;
  }
  if (p.paused || p.status !== "Queued") return;
  const control = await db().one("SELECT killed FROM controls WHERE user_id=?", [owner]);
  if (control?.killed) return;
  const c = await companyFor(p.companyId, owner);
  if (c.version !== p.contextVersion) {
    p.status = "Blocked"; event(p, "Workforce Observer", "Company context changed. Review the updated blueprint and create a new pod so completed work is not mixed with new rules.", "OBSERVER_ALERT"); await savePod(p); return;
  }
  const task = p.tasks.find(t => t.status === "Planned" && t.dependencies.every(id => p.tasks.find(x => x.id === id)?.status === "Completed"));
  if (!task) return;
  if (task.control === "Human only") {
    task.status = "Needs approval"; task.output = `Human-owned step: ${task.title}. Record the decision or completed work before the pod continues.`; p.status = "Needs approval"; event(p, "Workforce Orchestrator", `Waiting for a human at ${task.title}.`, "APPROVAL_REQUESTED", task.id, task.agentId); await savePod(p); return;
  }
  // Optimistic claim: only one worker can win this version before model calls begin.
  p.status = "Running";
  task.status = "Running"; task.startedAt = new Date().toISOString(); task.progress = 5;
  if (p.mode === "live") p.modelCalls = (p.modelCalls || 0) + 1;
  event(p, "Worker lease", `Starting ${task.title}.`, "TASK_STARTED", task.id, task.agentId);
  const claimed = await savePod(p);
  const before = claimed.version;
  try {
    if (!c.permissions.readKnowledge || !c.permissions.draft) throw new ApiError(403, "Company permissions must allow reading context and drafting results.");
    const sources = await sourceContext(p);
    if (p.mode === "live") {
      const attempts = p.modelCalls || 0;
      if (attempts > Number(process.env.MAX_MODEL_CALLS_PER_POD || 100)) throw new ApiError(429, "Pod model-call limit reached. Review the budget before creating another pod.");
      const selectedFiles = await db().all("SELECT id,status FROM knowledge WHERE company_id=?", [p.companyId]);
      const readable = await db().all("SELECT DISTINCT knowledge_id FROM chunks WHERE company_id=?", [p.companyId]);
      if (p.knowledgeIds.some(id => !selectedFiles.some(f => f.id === id) || !readable.some(f => f.knowledge_id === id))) throw new ApiError(400, "A selected evidence file has no readable indexed text.");
      const missing = providerStatus().filter(x => (x.capability === "chat" || p.requested.includes(x.capability)) && !x.configured);
      if (missing.length) throw new ApiError(503, `Configure ${missing.map(x => x.capability).join(", ")} provider(s) before live execution.`);
      // This release executes text/code drafting only. Media capabilities have explicit adapter slots.
      if (p.requested.some(x => !["chat", "code", "embedding"].includes(x))) throw new ApiError(503, "Media execution adapters are placeholders. Text/code Pods can use embeddings for saved knowledge retrieval.");
      const agent = agents.find(a => a.id === task.agentId)!;
      const capability = p.requested.includes("code") && agent.capabilities.includes("code") ? "code" : "chat";
      task.output = await generate({ capability, instructions: agent.instructions, context: { company: c, brief: p.answers, evidence: sources, upstream: p.tasks.filter(t => t.status === "Completed").map(t => ({ title: t.title, output: t.output })), feedback: task.feedback }, task: `${task.title}\nObjective: ${p.objective}`, acceptance: p.answers.acceptance, maxOutputTokens: 6000 });
    } else task.output = simulationArtifact(p, c, task.title, sources);
    const latest = await podFor(id, owner);
    const stopped = await db().one("SELECT killed FROM controls WHERE user_id=?", [owner]);
    if (latest.version !== before || latest.paused || stopped?.killed) {
      if (latest.version === before) { latest.status = "Ready"; const unfinished = latest.tasks.find(t => t.id === task.id); if (unfinished) { unfinished.status = "Planned"; unfinished.progress = 0; } event(latest, "Workforce Observer", "Execution stopped before saving output.", "OBSERVER_ALERT", task.id, task.agentId); await savePod(latest); }
      return;
    }
    if ((await companyFor(p.companyId, owner)).version !== p.contextVersion) throw new ApiError(409, "Company context changed during generation. Output discarded. Create a pod from the updated blueprint.");
    p.version = before;
    const final = task.id === p.tasks[p.tasks.length - 1].id;
    task.status = task.control === "Human approves" ? "Needs approval" : "Completed";
    task.progress = task.status === "Completed" ? 100 : 95;
    if (task.status === "Completed") task.completedAt = new Date().toISOString();
    p.status = task.status === "Needs approval" ? "Needs approval" : "Queued";
    if (final) { p.result = task.output; p.resultStatus = p.mode === "simulation" ? "simulation" : "draft"; }
    event(p, agents.find(a => a.id === task.agentId)?.name || "Employee", `${p.mode === "simulation" ? "Rehearsed" : "Drafted"} ${task.title}; ${task.status.toLowerCase()}.`, task.status === "Completed" ? "TASK_COMPLETED" : "APPROVAL_REQUESTED", task.id, task.agentId);
    if (task.status === "Completed") handoffs(p, task.id);
    if (final) event(p, "Workforce Orchestrator", `Created the consolidated deliverable for ${p.name}.`, "DELIVERABLE_CREATED", task.id, task.agentId);
    await savePod(p);
  } catch (error) {
    const latest = await podFor(id, owner);
    if (latest.version !== before) return;
    latest.status = "Blocked"; const failed = latest.tasks.find(t => t.id === task.id); if (failed) failed.status = "Blocked";
    event(latest, "Workforce Observer", error instanceof ApiError ? error.message : "Execution failed. Check server logs and retry.", "OBSERVER_ALERT", task.id, task.agentId);
    if (!(error instanceof ApiError)) console.error("Worker error", error);
    await savePod(latest);
  }
}
export async function decideTask(p: Run, taskId: string, decision: "approve" | "changes" | "reject", feedback: string, owner: string) {
  const task = p.tasks.find(t => t.id === taskId);
  if (!task || task.status !== "Needs approval") throw new ApiError(409, "This task is not awaiting approval.");
  if ((decision === "changes" || task.control === "Human only") && !feedback.trim()) throw new ApiError(400, "Provide revision instructions or the human decision / output.");
  task.feedback = feedback;
  if (decision === "approve") {
    task.status = "Completed"; task.progress = 100; task.completedAt = new Date().toISOString();
    if (task.control === "Human only") task.output = feedback;
    if (task.id === p.tasks[p.tasks.length - 1].id) { p.status = "Completed"; p.resultStatus = p.mode === "simulation" ? "simulation" : "approved"; }
    else p.status = "Queued";
  } else if (decision === "changes") { task.status = "Planned"; task.progress = 0; task.startedAt = undefined; task.completedAt = undefined; task.revision++; p.status = "Queued"; p.result = ""; p.resultStatus = "none"; }
  else { task.status = "Rejected"; p.status = "Rejected"; p.resultStatus = "none"; p.result = ""; }
  event(p, "Owner", `${decision}: ${task.title}${feedback ? ` - ${feedback}` : ""}`, decision === "approve" ? "APPROVAL_GRANTED" : decision === "reject" ? "APPROVAL_REJECTED" : "APPROVAL_REQUESTED", task.id, task.agentId);
  if (decision === "approve") handoffs(p, task.id);
  if (p.templateId && decision !== "reject") { const { demoStatus } = await import("./demo-worker"); demoStatus(p); }
  const saved = await savePod(p); await audit(owner, p.companyId, `Pod ${p.name}: ${decision} task ${task.id}`); return saved;
}
export async function workerTick() {
  const rows = await db().all("SELECT p.id,c.owner_id FROM pods p JOIN companies c ON c.id=p.company_id");
  for (const row of rows) {
    try { await advancePod(String(row.id), String(row.owner_id)); } catch (e) { if (!(e instanceof ApiError && e.status === 409)) console.error("Pod worker", e); }
  }
}
