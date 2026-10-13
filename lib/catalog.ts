// The full catalogue for TheAI Pods. All marketing and workspace screens render from this file.

export type Role = { id: string; name: string; does: string; dept: string };
export type Department = {
  id: string;
  name: string;
  pod: string;
  outcome: string;
  roles: Role[];
};

const d = (
  id: string,
  name: string,
  pod: string,
  outcome: string,
  roles: [string, string][],
): Department => ({
  id,
  name,
  pod,
  outcome,
  roles: roles.map(([n, does]) => ({
    id: `${id}-${n.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: n,
    does,
    dept: name,
  })),
});

export const POD_MANAGER: Role = {
  id: "pod-manager",
  name: "Pod Manager",
  does: "Break the objective into tasks, assign employees, manage handoffs and report outcomes",
  dept: "Every pod",
};

export const departments: Department[] = [
  d("sales", "Sales", "Sales Pod", "More selling time, cleaner pipeline", [
    ["Sales Agent", "Own outreach and follow-up from first touch to booked meeting"],
  ]),
  d("marketing", "Marketing", "Growth Pod", "Campaigns planned, produced and shipped", [
    ["Marketing Agent", "Plan the campaign strategy, channels and calendar"],
    ["Social Media Manager", "Create posters and posts, schedule and report on social"],
  ]),
  d("support", "Customer Support", "Support Pod", "Faster answers, fewer tickets", [
  ]),
  d("success", "Customer Success", "Success Pod", "Onboarded, adopted, renewed", [
  ]),
  d("hr", "HR & People", "People Pod", "Hire, onboard and support employees", [
    ["HR Agent", "Run day-to-day people operations requests"],
    ["Employee Assistant", "Answer policy and benefits questions instantly"],
  ]),
  d("it", "IT & Service Desk", "IT Pod", "Requests resolved without a queue", [
    ["Systems Administrator", "Maintain approved systems and service operations"],
    ["Security Engineer", "Review security controls and configuration changes"],
    ["Network Engineer", "Plan network changes and connectivity work"],
  ]),
  d("finance", "Finance", "Finance Pod", "Close faster with controls intact", [
    ["Finance Agent", "Handle recurring finance requests and reporting"],
    ["Audit Agent", "Collect and reconcile financial audit evidence against the source ledger"],
    ["Approval Router", "Send each request to the right approver by policy"],
  ]),
  d("ops", "Operations", "Operations Pod", "Processes that run themselves", [
    ["Project Manager", "Keep projects on plan and chase every owner"],
    ["Business Analyst", "Turn requirements into clear specifications"],
  ]),
  d("product", "Product & Engineering", "Engineering Pod", "From idea to shipped page", [
    ["Product Manager", "Write requirements and prioritise the backlog"],
    ["UI/UX Designer", "Design the page layout and visual direction"],
    ["Frontend Developer", "Build the landing page and interface"],
    ["Backend Developer", "Build services, APIs and data models"],
    ["QA Engineer", "Test for defects, accessibility and brand compliance"],
    ["Cloud Engineer", "Provision and scale infrastructure"],
    ["DevOps Agent", "Automate builds, releases and monitoring"],
  ]),
  d("data", "Data & Research", "Insights Pod", "Sourced answers, not guesses", [
    ["Data Analyst", "Segment customers and analyse past performance"],
    ["Research Agent", "Research the market, audience and competitors"],
    ["Market Researcher", "Turn live sources into sourced market briefs"],
  ]),
  d("legal", "Legal & Compliance", "Compliance Pod", "Reviewed, redacted, on policy", [
    ["Compliance Analyst", "Find gaps against regulations and policy"],
    ["Redaction Guard", "Redact sensitive data while keeping structure"],
  ]),
];

export const allRoles: Role[] = departments.flatMap((x) => x.roles);
export const roleById = (id: string) =>
  id === POD_MANAGER.id ? POD_MANAGER : allRoles.find((r) => r.id === id);

const pick = (names: string[]) =>
  names.map((n) => allRoles.find((r) => r.name === n)!).filter(Boolean);

export type PodTemplate = { id: string; name: string; hint: string; roles: Role[] };

export const podTemplates: PodTemplate[] = [
  {
    id: "campaign",
    name: "Festive Sale Campaign Pod",
    hint: "Posters, sale landing page, ads and emails for a big sale",
    roles: pick([
      "Research Agent",
      "Data Analyst",
      "Marketing Agent",
      "Social Media Manager",
      "UI/UX Designer",
      "Frontend Developer",
      "QA Engineer",
    ]),
  },
  ...departments.map((x) => ({
    id: x.id,
    name: x.pod,
    hint: x.outcome,
    roles: x.roles.slice(0, 6),
  })),
];

export const platform = [
  ["Pods & Pod Manager", "Goal-oriented teams. Every pod has a manager that plans, assigns and reports."],
  ["Command Center", "State an objective in plain language. Review the plan, then let it run."],
  ["AI Employee Roster", "A curated workforce across eleven departments. Hire in a click."],
  ["Agent Studio", "Describe a new role, compose it on a canvas, or build through API and MCP."],
  ["Collaboration Room", "Watch employees hand work to each other in real time."],
  ["Deliverables Studio", "Posters, pages, emails, documents and reports you can open and use."],
  ["Company Brain", "Your brand, documents and decisions, shared by every employee."],
  ["Integrations & Triggers", "Connect your tools. Start work on a schedule, an event or a webhook."],
  ["Model Router", "Each task goes to the best model for accuracy and cost, with failover."],
  ["Quality & Evals", "Set the bar once. Versions that miss it never ship."],
  ["Approvals & Autonomy", "Four autonomy levels and a risk-scored approval queue."],
  ["Observer & Cost", "Health, blocked work, budgets that pause, and one kill switch."],
  ["Voice & Channels", "Employees that work by phone, chat, email, Slack and Teams."],
  ["Trust & Security", "Roles and permissions, audit trail, redaction, your data stays yours."],
];

export const faqs = [
  [
    "What is an AI Pod?",
    "A pod is a team of specialised AI employees built around one goal, led by a Pod Manager that plans the work, coordinates handoffs and reports the outcome.",
  ],
  [
    "How is this different from a chatbot?",
    "You do not prompt all day. You set an objective, the pod produces a plan, employees execute and collaborate, and you approve the steps that matter.",
  ],
  [
    "How does it learn my business?",
    "During onboarding you upload brand guidelines and company documents. TheAI Pods reads them into a Company Brain that every employee uses.",
  ],
  [
    "Can I run more than one company?",
    "Yes. Each company gets its own brain, pods and employees. Switch between them from the workspace.",
  ],
  [
    "Do employees act without asking?",
    "Only as far as you allow. Each employee has an autonomy level, and anything customer-facing waits in your approval queue by default.",
  ],
  [
    "What does it cost?",
    "Pricing is being finalised. Contact us and we will set up a plan that fits your team.",
  ],
];

export const autonomyLevels = [
  "L1 · Assist",
  "L2 · Execute with approval",
  "L3 · Execute independently",
  "L4 · Autonomous",
];
