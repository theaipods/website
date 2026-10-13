import { solutionBySlug } from "./solutions";

export const finderObjectives = [
  "Reduce manual coordination",
  "Organize information",
  "Prepare business documents",
  "Improve service handling",
  "Support financial operations",
  "Coordinate claims",
  "Streamline internal processes",
] as const;

const objectiveRoutes: Record<string, string> = {
  "Reduce manual coordination": "employee-experience",
  "Organize information": "sales-marketing",
  "Prepare business documents": "sales-marketing",
  "Improve service handling": "customer-experience",
  "Support financial operations": "finance-operations",
  "Coordinate claims": "insurance",
  "Streamline internal processes": "employee-experience",
};

/** A local, deterministic discovery example. Team size scopes a conversation; it is not a ranking signal. */
export function discoverSolution(group: string, objective: string) {
  if (group && group !== "Any area" && solutionBySlug[group]) return solutionBySlug[group];
  return solutionBySlug[objectiveRoutes[objective] || "employee-experience"];
}
