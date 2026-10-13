import type { WorkerRole } from "@/components/WorkerScene";

type PresentableEmployee = { id: string; name: string; role: string; category: string };
export type CharacterAsset = { id: string; species: string; feature: string; modelPath: string; thumbnailPath: string };
type CharacterSpec = { species: string; feature: string; family: WorkerRole };

/** The 28 Blender sculptures are keyed by the canonical registry ID. */
export const employeeCharacterSpecs: Record<string, CharacterSpec> = {
  "pod-manager": { species: "Phoenix", feature: "planning board", family: "orchestrator" },
  orchestrator: { species: "Blue whale", feature: "work orbits", family: "orchestrator" },
  observer: { species: "Observant owl", feature: "dashboard", family: "data" },
  "sales-sales-agent": { species: "Orange fox", feature: "presentation case", family: "sales" },
  "marketing-marketing-agent": { species: "Pink bird", feature: "megaphone", family: "marketing" },
  "marketing-social-media-manager": { species: "Mint rabbit", feature: "social dashboard", family: "marketing" },
  "hr-hr-agent": { species: "Pink deer", feature: "heart", family: "people" },
  "hr-employee-assistant": { species: "Purple otter", feature: "tablet", family: "people" },
  "it-systems-administrator": { species: "Blue bear", feature: "gear", family: "engineering" },
  "it-security-engineer": { species: "Mint fox", feature: "shield", family: "security" },
  "it-network-engineer": { species: "Blue rabbit", feature: "network nodes", family: "engineering" },
  "finance-finance-agent": { species: "Gold squirrel", feature: "coin", family: "finance" },
  "finance-audit-agent": { species: "Lavender owl", feature: "magnifier", family: "finance" },
  "finance-approval-router": { species: "Green turtle", feature: "checklist", family: "operations" },
  "ops-project-manager": { species: "Lilac unicorn", feature: "calendar", family: "operations" },
  "ops-business-analyst": { species: "Blue narwhal", feature: "data chart", family: "operations" },
  "product-product-manager": { species: "Coral fox", feature: "idea bulb", family: "product" },
  "product-ui-ux-designer": { species: "Butterfly", feature: "paint palette", family: "product" },
  "product-frontend-developer": { species: "Blue cat", feature: "laptop", family: "engineering" },
  "product-backend-developer": { species: "Green dragon", feature: "laptop", family: "engineering" },
  "product-qa-engineer": { species: "Pink sheep", feature: "test checklist", family: "quality" },
  "product-cloud-engineer": { species: "Blue cloud creature", feature: "cloud glyph", family: "engineering" },
  "product-devops-agent": { species: "Purple octopus", feature: "gear", family: "engineering" },
  "data-data-analyst": { species: "Green sprout", feature: "data chart", family: "data" },
  "data-research-agent": { species: "Blue fox", feature: "magnifier", family: "research" },
  "data-market-researcher": { species: "Pink flamingo", feature: "market chart", family: "research" },
  "legal-compliance-analyst": { species: "White deer", feature: "shield", family: "legal" },
  "legal-redaction-guard": { species: "Midnight cat", feature: "locked document", family: "legal" },
};

export const defaultEmployeeForRole: Record<WorkerRole, string> = {
  research: "data-research-agent", finance: "finance-finance-agent", sales: "sales-sales-agent",
  engineering: "product-frontend-developer", operations: "ops-project-manager",
  security: "it-security-engineer", marketing: "marketing-marketing-agent",
  data: "data-data-analyst", legal: "legal-compliance-analyst",
  support: "hr-employee-assistant", people: "hr-hr-agent",
  product: "product-product-manager", quality: "product-qa-engineer",
  orchestrator: "orchestrator",
};

export function workerRoleForEmployee(employee: PresentableEmployee): WorkerRole {
  const exact = employeeCharacterSpecs[employee.id];
  if (exact) return exact.family;
  const value = (employee.id + " " + employee.name + " " + employee.role + " " + employee.category).toLowerCase();
  if (/orchestrator|pod manager|platform/.test(value)) return "orchestrator";
  if (/quality|qa|validat|verif|audit/.test(value)) return "quality";
  if (/legal|contract|compliance|redaction/.test(value)) return "legal";
  if (/security|risk|phishing|access/.test(value)) return "security";
  if (/finance|financial|tax|valuation|account/.test(value)) return "finance";
  if (/market|content|seo|social|campaign|brand/.test(value)) return "marketing";
  if (/sales|lead|deal|prospect/.test(value)) return "sales";
  if (/support|success|customer|helpdesk/.test(value)) return "support";
  if (/research/.test(value)) return "research";
  if (/data|insight|report|trend|analytics/.test(value)) return "data";
  if (/product|roadmap|user experience|ux|ui|design/.test(value)) return "product";
  if (/frontend|backend|developer|cloud|devops|technical|engineering/.test(value)) return "engineering";
  if (/hr|people|employee|talent|onboarding/.test(value)) return "people";
  if (/project|operation|process|business analyst/.test(value)) return "operations";
  return "product";
}

export function characterAssetForEmployee(employee: PresentableEmployee): CharacterAsset {
  const spec = employeeCharacterSpecs[employee.id];
  const slug = spec ? employee.id : defaultEmployeeForRole[workerRoleForEmployee(employee)];
  const selected = spec || employeeCharacterSpecs[slug];
  return {
    id: slug, species: selected.species, feature: selected.feature,
    modelPath: "/ai-workforce/employees/models/" + slug + ".glb?v=20261012c",
    thumbnailPath: "/ai-workforce/employees/previews/" + slug + ".webp?v=20261012c",
  };
}

export function characterAssetForRole(role: WorkerRole): CharacterAsset {
  const slug = defaultEmployeeForRole[role];
  return characterAssetForEmployee({ id: slug, name: slug, role, category: role });
}

