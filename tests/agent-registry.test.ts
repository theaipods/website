import test from "node:test";
import assert from "node:assert/strict";
import { allRoles } from "../lib/catalog";
import { agentWithOperations, eligibleAgents, registryAgent, registryCategories, registryDefinitions } from "../lib/agent-registry";
import type { Run } from "../lib/workforce";

test("registry uses the same specialist IDs as pod planning and exposes every department", () => {
  assert.equal(registryDefinitions.length, allRoles.length + 3);
  for (const role of allRoles) assert.equal(registryAgent(role.id)?.name, role.name);
  assert.ok(registryCategories.some(c => c.id === "finance" && c.count > 0));
  assert.ok(registryDefinitions.every(a => a.id && a.description && a.inputs.length && a.tools.length));
});

test("eligible agents respect company permissions and task match", () => {
  const finance = registryAgent("finance-finance-agent")!;
  const sales = registryAgent("sales-sales-agent")!;
  assert.deepEqual(eligibleAgents([finance.id,sales.id], "Review financial forecast", { financial: false, production: false, sensitive: false }).map(a => a.id), [sales.id]);
  assert.equal(eligibleAgents([finance.id], "Review financial forecast", { financial: true, production: false, sensitive: false })[0].id, finance.id);
});

test("operational view derives status and metrics from persisted pod tasks", () => {
  const agent = registryAgent("finance-finance-agent")!;
  const pod = { id: "p1", name: "Finance Pod", roleIds: [agent.id], autonomy: 2, status: "Running", tasks: [{ id: "t1", agentId: agent.id, title: "Review forecast", status: "Needs approval" }, { id: "t2", agentId: agent.id, title: "Prepare analysis", status: "Completed" }] } as Run;
  const view = agentWithOperations(agent,[pod]);
  assert.equal(view.status,"NEEDS_APPROVAL");
  assert.equal(view.currentTask,"Review forecast");
  assert.deepEqual(view.metrics,{ assigned: 2, completed: 1, awaitingApproval: 1 });
  assert.deepEqual(view.deployedPodIds,["p1"]);
});
