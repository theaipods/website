import test from "node:test";
import assert from "node:assert/strict";
import { registryDefinitions } from "../lib/agent-registry";
import { workerRoleForEmployee } from "../lib/employee-presentation";

test("every registry employee resolves to a supported visual role", () => {
  const supported = new Set(["research", "finance", "sales", "engineering", "operations", "security", "marketing", "data", "legal", "support", "people", "product", "quality", "orchestrator"]);
  assert.ok(registryDefinitions.length >= 20);
  for (const employee of registryDefinitions) assert.ok(supported.has(workerRoleForEmployee(employee)), employee.name);
});

test("high-signal specialist roles receive distinct presentation variants", () => {
  const find = (name: string) => registryDefinitions.find(employee => employee.name === name)!;
  assert.equal(workerRoleForEmployee(find("Finance Agent")), "finance");
  assert.equal(workerRoleForEmployee(find("Marketing Agent")), "marketing");
  assert.equal(workerRoleForEmployee(find("Compliance Analyst")), "legal");
  assert.equal(workerRoleForEmployee(find("QA Engineer")), "quality");
  assert.equal(workerRoleForEmployee(find("Workforce Orchestrator")), "orchestrator");
});
