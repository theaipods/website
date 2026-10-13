import { integrations as existingCatalog } from "./tool-catalog";

export type IntegrationEntry = {
  id: string; name: string; category: string; description: string;
  mode: "planned_adapter" | "model_gateway" | "custom_mcp";
  auth: string; capabilities: string[]; agents: string[]; featured: boolean;
};

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const additions: Record<string, string[]> = {
  "AI & ML": ["OpenAI", "Anthropic", "Google Gemini", "Perplexity", "Replicate"],
  "Email & calendar": ["Google Docs", "Google Sheets", "Google Tasks", "Todoist"],
  "Development": ["PostgreSQL", "MySQL", "Redis", "Supabase", "Google Cloud", "Azure"],
  "Automation": ["Zapier", "Make", "n8n", "Power Automate"],
  "Custom systems": ["Custom MCP Server", "Custom REST API", "Custom GraphQL API", "Custom Webhook", "Custom Database"],
};
const featured = new Set(["Gmail", "Slack", "Google Drive", "Salesforce", "GitHub", "Notion", "QuickBooks", "Google Calendar", "HubSpot", "PostgreSQL", "Custom MCP Server", "OpenAI"]);
const categoryAgents: Record<string, string[]> = {
  Communication: ["Operations", "Customer Success"], Product: ["Product", "Engineering"], Engineering: ["Engineering", "Security"],
  Marketing: ["Marketing", "Sales"], Knowledge: ["Research", "Reporting"], Sales: ["Sales", "Customer Success"],
  Analytics: ["Data", "Finance"], People: ["People & HR"], Finance: ["Finance", "Audit"], Support: ["Customer Support"],
  Commerce: ["Sales", "Operations"], "AI & ML": ["Pod Manager"], "Email & calendar": ["Operations"], Development: ["Engineering", "Data"],
  Automation: ["Operations"], "Custom systems": ["Pod Manager"],
};
const capabilityByName: Record<string, string[]> = {
  Gmail: ["Read mail", "Draft reply", "Send with approval"], Slack: ["Find conversations", "Draft update", "Send with approval"],
  "Google Drive": ["Find files", "Read evidence", "Summarize"], Salesforce: ["Find accounts", "Read opportunities", "Propose update"],
  GitHub: ["Inspect repository", "Read issues", "Propose change"], Notion: ["Search pages", "Read context", "Draft page"],
  QuickBooks: ["Read invoices", "Review expenses", "Propose entry"], "Google Calendar": ["Read events", "Suggest times", "Create with approval"],
  HubSpot: ["Find contacts", "Read pipeline", "Propose update"], PostgreSQL: ["Read scoped records", "Inspect schema", "Run approved query"],
  "Custom MCP Server": ["Discover tools", "Inspect schemas", "Grant access"], OpenAI: ["Draft text", "Analyze content", "Generate structured output"],
};
const descriptions: Record<string, string> = {
  Gmail: "Bring customer conversations into a reviewed workflow.", Slack: "Turn team context into coordinated work and approved updates.",
  "Google Drive": "Give specialists access to selected documents and evidence.", Salesforce: "Connect account context to your sales workforce.",
  GitHub: "Let engineering specialists inspect code and issue context.", Notion: "Make company knowledge available to the right pod.",
  QuickBooks: "Put finance records in reach of approved analysis.", "Google Calendar": "Coordinate schedules with human oversight.",
  HubSpot: "Connect marketing and sales context to specialist work.", PostgreSQL: "Bring scoped records into governed analysis.",
  "Custom MCP Server": "Discover tools from your own public HTTPS MCP endpoint.", OpenAI: "Use the configured model gateway for agent drafting.",
};
const allGroups = { ...existingCatalog, ...additions };
const seen = new Set<string>();
export const integrationRegistry: IntegrationEntry[] = Object.entries(allGroups).flatMap(([category, names]) => names.flatMap(name => {
  const id = slug(name); if (seen.has(id)) return []; seen.add(id);
  return [{ id, name, category, description: descriptions[name] || `Explore how ${name} can fit a governed AI Pod workflow.`,
    mode: name === "Custom MCP Server" ? "custom_mcp" as const : ["OpenAI", "Anthropic", "Google Gemini"].includes(name) ? "model_gateway" as const : "planned_adapter" as const,
    auth: name === "Custom MCP Server" ? "Public HTTPS endpoint" : "Provider configuration required",
    capabilities: capabilityByName[name] || ["Discover capability", "Review permissions", "Configure adapter"],
    agents: categoryAgents[category] || ["Pod Manager"], featured: featured.has(name) }];
}));
export const integrationCategories = ["All", ...Object.keys(allGroups)];
