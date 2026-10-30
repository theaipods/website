import { db } from "./db";
import { companyFor } from "./repository";
import { registryAgent } from "../agent-registry";
import type { Run, WorkTask } from "../workforce";

export type OperationsTask = { id: string; podId: string; podName: string; companyId: string; title: string; description: string; agentId: string; agentName: string; collaborators: { id: string; name: string }[]; status: string; priority: string; progress: number | null; dependencies: { id: string; title: string; status: string; agentName: string }[]; control: string; createdAt: string; startedAt: string | null; completedAt: string | null; outputAvailable: boolean; outputPreview: string; mode: string };
export async function operationsPods(companyId: string, ownerId: string): Promise<Run[]> {
  await companyFor(companyId, ownerId);
  const rows = await db().all("SELECT data FROM pods WHERE company_id=? ORDER BY created DESC", [companyId]);
  return rows.map(row => JSON.parse(String(row.data)) as Run);
}
function statusFor(task: WorkTask, pod: Run) {
  if (task.status === "Planned" && pod.paused) return "WAITING";
  if (task.status === "Planned" && ["Queued", "Running", "Needs approval"].includes(pod.status) && task.dependencies.some(id => pod.tasks.find(t => t.id === id)?.status !== "Completed")) return "WAITING";
  if (task.status === "Rejected") return "CANCELLED";
  return task.status.toUpperCase().replaceAll(" ", "_");
}
function operationalTask(task: WorkTask, pod: Run): OperationsTask {
  const dependencies = task.dependencies.map(id => pod.tasks.find(t => t.id === id)).filter((item): item is WorkTask => !!item).map(item => ({ id: item.id, title: item.title, status: statusFor(item,pod), agentName: registryAgent(item.agentId)?.name || "Human owner" }));
  const collaborators = [...new Set([...(task.supportingAgentIds || []), ...task.dependencies.map(id => pod.tasks.find(t => t.id === id)?.agentId).filter((id): id is string => !!id && id !== task.agentId)])].map(id => ({ id, name: registryAgent(id)?.name || "Human owner" }));
  return { id: task.id, podId: pod.id, podName: pod.name, companyId: pod.companyId, title: task.title, description: task.description || "", agentId: task.agentId, agentName: registryAgent(task.agentId)?.name || "Human owner", collaborators, status: statusFor(task,pod), priority: task.priority || "Normal", progress: task.status === "Running" ? null : task.progress ?? (task.status === "Completed" ? 100 : 0), dependencies, control: task.control, createdAt: task.createdAt || pod.created, startedAt: task.startedAt || null, completedAt: task.completedAt || null, outputAvailable: !!task.output, outputPreview: task.output.slice(0,180), mode: pod.mode };
}
export function operationsSnapshot(pods: Run[], options: { podId?: string; status?: string; agentId?: string; q?: string; limit?: number; offset?: number } = {}) {
  const selected = options.podId ? pods.filter(p => p.id === options.podId) : pods;
  const allTasks = selected.flatMap(p => p.tasks.map(t => operationalTask(t,p)));
  const statuses = new Set(["RUNNING","WAITING","NEEDS_APPROVAL","BLOCKED","COMPLETED","PLANNED","CANCELLED"]);
  const tasks = allTasks.filter(t => (!options.status || t.status === options.status) && (!options.agentId || t.agentId === options.agentId) && (!options.q || `${t.title} ${t.agentName} ${t.podName}`.toLowerCase().includes(options.q.toLowerCase())));
  tasks.sort((a,b) => (b.startedAt || b.createdAt).localeCompare(a.startedAt || a.createdAt));
  const nowDay = new Date().toISOString().slice(0,10);
  const health = { activeAgents: new Set(allTasks.filter(t => t.status === "RUNNING").map(t => t.agentId)).size, running: allTasks.filter(t => t.status === "RUNNING").length, waiting: allTasks.filter(t => t.status === "WAITING").length, needsApproval: allTasks.filter(t => t.status === "NEEDS_APPROVAL").length, blocked: allTasks.filter(t => t.status === "BLOCKED").length, completedToday: allTasks.filter(t => t.status === "COMPLETED" && t.completedAt?.startsWith(nowDay)).length };
  const events = selected.flatMap(p => p.events.map(e => ({ ...e, podId: p.id, podName: p.name }))).sort((a,b) => b.at.localeCompare(a.at)).slice(0,60);
  const alerts = [ ...allTasks.filter(t => t.status === "NEEDS_APPROVAL" || t.status === "BLOCKED").map(t => ({ id: `${t.podId}:${t.id}`, kind: t.status, taskId: t.id, podId: t.podId, text: `${t.agentName} · ${t.title}` })), ...events.filter(e => e.who === "Workforce Observer" && e.type === "OBSERVER_ALERT").slice(0,5).map((e,i) => ({ id: `observer:${i}:${e.at}`, kind: "OBSERVER", taskId: e.taskId || null, podId: e.podId, text: e.text })) ];
  const offset = Number.isFinite(options.offset) ? Math.max(0,options.offset || 0) : 0;
  const limit = Number.isFinite(options.limit) ? Math.min(100,Math.max(1,options.limit || 50)) : 50;
  return { health, tasks: tasks.slice(offset,offset+limit), total: tasks.length, events, alerts, pods: pods.map(p => ({ id: p.id, name: p.name, status: p.paused ? "Paused" : p.status, mode: p.mode, objective: p.objective })), statuses: [...statuses], updatedAt: new Date().toISOString() };
}
export function taskDetail(pod: Run, task: WorkTask) {
  const activity = pod.events.filter(e => e.taskId === task.id || e.sourceTaskId === task.id).slice(0,60);
  const chain: WorkTask[] = []; const seen = new Set<string>();
  function visit(current: WorkTask) { for (const id of current.dependencies) { const parent = pod.tasks.find(item => item.id === id); if (parent && !seen.has(id)) { seen.add(id); visit(parent); chain.push(parent); } } }
  visit(task); chain.push(task);
  return { ...operationalTask(task,pod), output: task.output, feedback: task.feedback, revision: task.revision, dependencyChain: chain.map(item => ({ id: item.id, title: item.title, agentName: registryAgent(item.agentId)?.name || "Human owner", status: statusFor(item,pod) })), inputs: [ ...task.dependencies.map(id => ({ type: "task", id, title: pod.tasks.find(t => t.id === id)?.title || "Upstream task" })), ...pod.knowledgeIds.map(id => ({ type: "knowledge", id, title: `Selected evidence ${id.slice(0,8)}` })) ], activity, warnings: pod.events.filter(e => e.type === "OBSERVER_ALERT" && e.taskId === task.id).map(e => e.text), podStatus: pod.status, paused: pod.paused, resultStatus: pod.resultStatus };
}
export function eventRevision(pods: Run[]) { return pods.map(p => `${p.id}:${p.version}`).sort().join("|"); }
