import { randomUUID } from "node:crypto";
import { demoTemplates, reasoningFor, type DemoStep } from "../demo-templates";
import { agents, type ApprovalMode, type Business, type Run, type WorkTask } from "../workforce";
import { ApiError } from "./auth";

export function buildDemoProject(company: Business, templateId: string, prompt: string, mode: "simulation" | "live", approvalMode: ApprovalMode, knowledgeIds: string[]): Run {
  const template = demoTemplates.find(t => t.id === templateId);
  if (!template) throw new ApiError(404, "Demo template not found.");
  if (company.status !== "active") throw new ApiError(400, "Finish and activate company onboarding before sending a demo brief.");
  const created = new Date().toISOString();
  const steps: DemoStep[] = [
    { key: "plan", title: "Interpret the objective, evidence and company rules; prepare delivery strategy", role: "Pod Manager", depends: [], complexity: "complex", minutes: 2 },
    ...template.steps,
    { key: "validate", title: "Validate every deliverable against the request, brand rules and evidence; list defects and unresolved assumptions", role: "Workforce Orchestrator", depends: template.steps.map(s => s.key), complexity: "complex", minutes: 2 },
    { key: "deliver", title: "Consolidate the complete project with deliverables, validation findings, risks and handoff instructions", role: "Workforce Orchestrator", depends: ["validate"], complexity: "complex", approval: true, minutes: 2 },
  ];
  const ids = Object.fromEntries(steps.map(s => [s.key, randomUUID()]));
  const tasks: WorkTask[] = steps.map(s => {
    const agent = agents.find(a => a.name === s.role);
    if (!agent) throw new ApiError(500, `Demo role is missing from registry: ${s.role}`);
    return { id: ids[s.key], title: s.title, agentId: agent.id, dependencies: s.depends.map(d => ids[d]), control: approvalMode === "manual" || approvalMode === "smart" && s.approval ? "Human approves" : "AI handles", status: "Planned", output: "", feedback: "", revision: 1, progress: 0, createdAt: created, reasoningEffort: reasoningFor(s.complexity), estimatedMinutes: s.minutes };
  });
  const duration = new Map<string, number>();
  for (const s of steps) duration.set(s.key, s.minutes + Math.max(0, ...s.depends.map(d => duration.get(d) || 0)));
  return { id: randomUUID(), name: `${template.name} · ${company.name}`, objective: prompt, domain: template.domain, roleIds: [...new Set(tasks.map(t => t.agentId))].filter(id => !["pod-manager", "orchestrator", "observer"].includes(id)), knowledgeIds, autonomy: approvalMode === "manual" ? 1 : approvalMode === "smart" ? 2 : 4, mode, requested: template.domain === "engineering" ? ["chat", "code"] : ["chat"], companyId: company.id, version: 1, created, paused: false, status: "Queued", tasks, events: [{ at: created, who: "Pod Manager", text: `Created project and assigned ${tasks.length} tasks from your submitted brief. Approval policy: ${approvalMode}. Estimates exclude human review time.`, type: "TASK_CREATED" }], result: "", resultStatus: "none", contextVersion: company.version, templateId, approvalMode, estimatedMinutes: duration.get("deliver"), answers: { audience: "Company founder and department owners", scope: prompt, deliverables: template.deliverables, acceptance: "Deliver every requested artifact; follow saved company brand and business rules; cite evidence; label assumptions; report missing inputs and unexecuted actions honestly.", baseline: company.baseline || "Not supplied; do not fabricate", target: company.target || "Reviewable demo deliverables", deadline: "This demo session; estimate excludes approval waiting time", budget: "No spending or publication authorized by this template", constraints: "Use approved company evidence. Do not invent business facts or claim unexecuted actions. External tools require explicit grants.", approver: "Company owner", detail0: company.answers[template.domain]?.detail0 || "Use saved company context and identify missing domain-specific information.", detail1: company.answers[template.domain]?.detail1 || "Prepare a reviewable draft; disclose missing information." } };
}
