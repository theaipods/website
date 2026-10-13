import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { registryDefinitions } from "../../../../lib/agent-registry";
import { characterAssetForEmployee, employeeCharacterSpecs, workerRoleForEmployee } from "../../../../lib/employee-presentation";

const output = path.resolve(process.cwd(), "assets/ai-workforce/manifest.json");
const agents = registryDefinitions.map((agent) => {
  const family = workerRoleForEmployee(agent);
  const asset = characterAssetForEmployee(agent);

  return {
    employeeId: agent.id,
    displayName: agent.name,
    department: agent.category,
    jobTitle: agent.role,
    characterInstanceId: agent.id,
    characterFamily: family,
    characterAssetId: agent.id,
    species: asset.species,
    signatureFeature: asset.feature,
    modelSourcePath: `assets/ai-workforce/employees/models/${agent.id}.glb`,
    modelPublicPath: `/ai-workforce/employees/models/${agent.id}.glb`,
    previewSourcePath: `assets/ai-workforce/employees/previews/${agent.id}.webp`,
    previewPublicPath: `/ai-workforce/employees/previews/${agent.id}.webp`,
    masterSourcePath: `assets/ai-workforce/employees/previews/${agent.id}.png`,
    implementation: {
      directory: "transparent render of the employee's own Blender sculpture",
      interactive: "individual GLB profile viewer",
      status: "integrated",
    },
  };
});

const duplicateIds = agents.filter((agent, index) => agents.findIndex((candidate) => candidate.employeeId === agent.employeeId) !== index);
const missingAssets = agents.filter((agent) => !employeeCharacterSpecs[agent.employeeId]);
if (duplicateIds.length || missingAssets.length) {
  throw new Error(`Cannot generate character manifest: ${duplicateIds.length} duplicate IDs; ${missingAssets.length} missing assets.`);
}

const byDepartment = Object.fromEntries(
  [...new Set(agents.map((agent) => agent.department))]
    .sort()
    .map((department) => [department, agents.filter((agent) => agent.department === department).length]),
);

const models = [...new Map(agents.map((agent) => [agent.characterAssetId, {
  id: agent.characterAssetId,
  species: agent.species,
  feature: agent.signatureFeature,
  modelSourcePath: agent.modelSourcePath,
  modelPublicPath: agent.modelPublicPath,
  previewSourcePath: agent.previewSourcePath,
  previewPublicPath: agent.previewPublicPath,
}])).values()];

const manifest = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  source: {
    registry: "lib/workforce.ts → lib/agent-registry.ts",
    roleAssignment: "lib/employee-presentation.ts",
    assetGenerator: "assets/ai-workforce/source/blender/generate_employee_collection.py",
  },
  totals: { employees: agents.length, individualModels: models.length, byDepartment },
  models,
  employees: agents,
};

async function main() {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${agents.length} employee mappings across ${models.length} individual models to ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
