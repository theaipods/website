import { agents, toolGroups, type AgentDefinition, type Run } from "./workforce";
import { departments } from "./catalog";

export const agentStatuses = ["IDLE", "PLANNING", "WORKING", "WAITING", "BLOCKED", "NEEDS_APPROVAL", "COMPLETED", "ERROR"] as const;
export type AgentStatus = typeof agentStatuses[number];
export type RegistryAgent = AgentDefinition & {
  category: string; icon: string; description: string; skills: string[]; knowledgeScopes: string[]; compatibleSystems: string[];
  autonomyLevel: number; permissions: string[]; manager: string; status: AgentStatus;
  currentTask: string | null; supportedTaskTypes: string[]; inputTypes: string[];
  outputTypes: string[]; riskLevel: "Low" | "Medium" | "High";
  requiresApproval: boolean; metrics: { assigned: number; completed: number; awaitingApproval: number };
  createdAt: string | null; updatedAt: string | null; deployedPodIds: string[];
};
export type AgentSettings = { autonomyLevel: number; manager: string; updatedAt: string };

const systemIds = new Set(["pod-manager", "orchestrator", "observer"]);
const categoryId = (a: AgentDefinition) => departments.find(d => d.name === a.role)?.id || "platform";
const systemGroups: Record<string, string[]> = { sales:["Sales","Communication"],marketing:["Marketing","Communication"],support:["Support","Knowledge"],success:["Support","Sales"],hr:["People","Communication"],it:["Engineering","Communication"],finance:["Finance","Analytics"],ops:["Product","Knowledge"],product:["Product","Engineering"],data:["Analytics","Knowledge"],legal:["Knowledge","Communication"],platform:["Knowledge"] };
const riskFor = (a: AgentDefinition): RegistryAgent["riskLevel"] => /legal|compliance|finance|payment|security|access|tax|contract/i.test(`${a.role} ${a.name}`) ? "High" : /sales|support|outreach|publish|marketing|customer/i.test(`${a.role} ${a.name}`) ? "Medium" : "Low";
export const registryDefinitions: RegistryAgent[] = agents.map(a => ({
  ...a, category: categoryId(a), icon: `core-${categoryId(a)}`, description: a.mission,
  skills: a.capabilities.map(c => c === "chat" ? "Reasoning and drafting" : c === "code" ? "Code generation and review" : `${c[0].toUpperCase()}${c.slice(1)} work`),
  compatibleSystems: [...new Set((systemGroups[categoryId(a)] || []).flatMap(group => toolGroups[group] || []))],
  knowledgeScopes: ["Selected company blueprint", "Evidence granted to the pod"],
  autonomyLevel: 2, permissions: a.tools, manager: systemIds.has(a.id) ? "Workforce Orchestrator" : "Pod Manager",
  status: "IDLE", currentTask: null, supportedTaskTypes: [a.mission], inputTypes: a.inputs,
  outputTypes: a.outputs, riskLevel: riskFor(a), requiresApproval: riskFor(a) === "High",
  metrics: { assigned: 0, completed: 0, awaitingApproval: 0 }, createdAt: null, updatedAt: null, deployedPodIds: [],
}));
export const registryCategories = departments.map(d => ({ id: d.id, name: d.name, count: registryDefinitions.filter(a => a.category === d.id).length }));
export function registryAgent(id: string) { return registryDefinitions.find(a => a.id === id); }
export function eligibleAgents(roleIds: string[], taskTitle: string, companyPermissions?: { financial: boolean; production: boolean; sensitive: boolean }) {
  const terms = taskTitle.toLowerCase().split(/\W+/).filter(t => t.length > 3);
  return roleIds.map(registryAgent).filter((a): a is RegistryAgent => !!a).filter(a =>
    !(a.category === "finance" && companyPermissions && !companyPermissions.financial) &&
    !(a.category === "legal" && companyPermissions && !companyPermissions.sensitive) &&
    !(a.category === "product" && /deploy|production/i.test(taskTitle) && companyPermissions && !companyPermissions.production)
  ).sort((a, b) => terms.filter(t => `${b.name} ${b.mission}`.toLowerCase().includes(t)).length - terms.filter(t => `${a.name} ${a.mission}`.toLowerCase().includes(t)).length);
}
export function agentWithOperations(agent: RegistryAgent, pods: Run[], settings?: AgentSettings): RegistryAgent {
  const memberships = pods.filter(p => p.roleIds.includes(agent.id));
  const tasks = memberships.flatMap(p => p.tasks.filter(t => t.agentId === agent.id).map(t => ({ ...t, pod: p })));
  const active = tasks.find(t => t.status === "Needs approval") || tasks.find(t => t.status === "Blocked") || tasks.find(t => t.status === "Running") || tasks.find(t => t.status === "Planned" && ["Queued", "Running"].includes(t.pod.status));
  const status: AgentStatus = memberships.some(p => p.status === "Error") ? "ERROR" : active?.status === "Needs approval" ? "NEEDS_APPROVAL" : active?.status === "Blocked" ? "BLOCKED" : memberships.some(p => p.paused) ? "WAITING" : active ? active.pod.status === "Queued" ? "PLANNING" : "WORKING" : tasks.some(t => t.status === "Completed") ? "COMPLETED" : "IDLE";
  return { ...agent, status, currentTask: active?.title || null, autonomyLevel: settings?.autonomyLevel ?? memberships[0]?.autonomy ?? agent.autonomyLevel, manager: settings?.manager || agent.manager, updatedAt: settings?.updatedAt || agent.updatedAt,
    deployedPodIds: memberships.map(p => p.id), metrics: { assigned: tasks.length, completed: tasks.filter(t => t.status === "Completed").length, awaitingApproval: tasks.filter(t => t.status === "Needs approval").length } };
}
