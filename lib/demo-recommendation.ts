import { registryDefinitions } from "./agent-registry";
import { integrationRegistry } from "./integration-registry";

export type DemoRecommendationInput = { industry: string; companySize: string; primaryGoal: string; currentTools: string[]; areasOfInterest: string[] };
export type DemoRecommendation = { recommendedPod: string; recommendedAgents: { id: string; name: string; role: string; category: string }[]; recommendedIntegrations: string[]; suggestedWorkflow: string[]; basis: "deterministic-rules-v1" };

const rules = [
  { match: /finance|bank|insurance|account|audit|investment/i, pod: "Finance Intelligence Pod", names: ["Finance Agent","Audit Agent","Research Agent","Compliance Analyst","Data Analyst","Approval Router"], flow: ["Collect approved records","Analyze financial position","Validate evidence","Assess risk","Request approval","Prepare report"] },
  { match: /commerce|retail|store|consumer|marketplace/i, pod: "Commerce Growth Pod", names: ["Research Agent","Marketing Agent","Sales Agent","Data Analyst","Social Media Manager"], flow: ["Read demand signals","Research audience","Plan campaign","Prepare content","Review performance","Report outcomes"] },
  { match: /software|saas|technology|developer|product/i, pod: "Product Delivery Pod", names: ["Product Manager","Research Agent","Frontend Developer","Backend Developer","QA Engineer","DevOps Agent","Data Analyst"], flow: ["Clarify objective","Research users","Plan delivery","Build proposal","Validate quality","Prepare release"] },
  { match: /consult|professional|agency|legal|service/i, pod: "Client Delivery Pod", names: ["Research Agent","Business Analyst","Finance Agent","Compliance Analyst","Project Manager","Redaction Guard"], flow: ["Receive client brief","Collect evidence","Analyze requirements","Review risk","Validate work","Deliver report"] },
];

export function recommendDemoWorkforce(input: DemoRecommendationInput): DemoRecommendation {
  const signal=`${input.industry} ${input.primaryGoal} ${input.areasOfInterest.join(" ")}`;
  const rule=rules.find(item=>item.match.test(signal)) || { pod:"Business Operations Pod", names:["Workforce Orchestrator","Research Agent","Business Analyst","Project Manager","Redaction Guard"], flow:["Understand objective","Collect context","Plan tasks","Assign specialists","Validate outputs","Deliver result"] };
  const agents=rule.names.map(name=>registryDefinitions.find(agent=>agent.name===name)).filter((agent):agent is NonNullable<typeof agent>=>!!agent).map(agent=>({id:agent.id,name:agent.name,role:agent.role,category:agent.category}));
  const catalogNames=new Set(integrationRegistry.map(item=>item.name));
  const requested=input.currentTools.filter(name=>catalogNames.has(name));
  const defaults=/finance|bank|account/i.test(signal)?["Google Drive","PostgreSQL","QuickBooks"]:/software|saas|technology/i.test(signal)?["GitHub","Jira","Slack"]:["Google Drive","Slack","Notion"];
  return { recommendedPod:rule.pod,recommendedAgents:agents,recommendedIntegrations:[...new Set([...requested,...defaults])].slice(0,6),suggestedWorkflow:rule.flow,basis:"deterministic-rules-v1" };
}
