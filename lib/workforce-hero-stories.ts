/** Homepage story and copy for independent marketing heroes. All previews are illustrative. */
type Specialist = {
  id: string;
  task: string;
  artifact: string;
  icon:
    | "search"
    | "strategy"
    | "design"
    | "document"
    | "chart"
    | "people"
    | "shield"
    | "tools"
    | "check";
};
export type WorkforceHeroStory = {
  eyebrow: string;
  title: string[];
  description: string;
  background: string;
  request: string;
  outcome: string;
  pendingOutcome: string;
  review: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  benefits: [string, string][];
  team: Specialist[];
  note: string;
};
const campaign: Specialist[] = [
  {
    id: "data-research-agent",
    task: "Market & audience insights",
    artifact: "Research brief",
    icon: "search",
  },
  {
    id: "marketing-marketing-agent",
    task: "Strategy, channels & copy",
    artifact: "Campaign strategy",
    icon: "strategy",
  },
  {
    id: "product-ui-ux-designer",
    task: "Creative & visual direction",
    artifact: "Creative direction",
    icon: "design",
  },
  {
    id: "marketing-social-media-manager",
    task: "Social content & calendar",
    artifact: "Content calendar",
    icon: "document",
  },
  {
    id: "data-data-analyst",
    task: "Audience & performance insights",
    artifact: "Measurement plan",
    icon: "chart",
  },
];
const standardBenefits: [string, string][] = [
  ["Specialized AI employees", "Experts for every role"],
  ["Works with your tools", "Connect your stack"],
  ["Governed work", "People stay in control"],
  ["Real results", "Turn ideas into action"],
];
export const workforceHeroStories = {
  home: {
    eyebrow: "AI WORKFORCE PLATFORM",
    title: ["One objective.", "A whole team", "in motion."],
    description:
      "Give AI a job to do. Our AI workforce plans, delegates and executes the work through a team of specialized AI employees - just like a real team.",
    background: "/brand/home-workforce-office.webp",
    request: "Create a marketing campaign for our new product.",
    outcome: "Campaign Completed",
    pendingOutcome: "Your campaign, together.",
    review: "Prepared for human review",
    primary: { label: "Book a demo", href: "/book-demo" },
    secondary: { label: "See how it works", href: "#how-it-works" },
    benefits: standardBenefits,
    team: campaign,
    note: "Illustrative workflow · no live tasks",
  },
  "book-demo": {
    eyebrow: "YOUR PERSONALIZED AI WORKFORCE DEMO",
    title: ["Your objective.", "Your AI team.", "See it in action."],
    description:
      "Bring a business challenge. See how the right specialists, your tools, and human review could come together in a workflow built for your team.",
    primary: { label: "Schedule your demo", href: "#book" },
    secondary: { label: "What to expect", href: "#demo-expect-title" },
    note: "Illustrative demo plan · select a real time below",
  },
  integrations: {
    eyebrow: "INTEGRATIONS & MCP",
    title: ["Your tools.", "One connected", "AI workforce."],
    description:
      "Bring approved context from your business systems into a coordinated workflow. Explore connections, scope permissions, and keep your people in control.",
    primary: { label: "Connect your stack", href: "/workspace/settings#mcp" },
    secondary: { label: "Explore MCP", href: "#mcp" },
    note: "Illustrative flow · no accounts connected or tools executed",
  },
  "employee-experience": {
    eyebrow: "EMPLOYEE EXPERIENCE",
    title: ["Better workdays.", "A coordinated", "AI workforce."],
    description:
      "Make every employee handoff feel connected. Bring people guidance, onboarding tasks, and approved knowledge together, with sensitive decisions kept with your team.",
    primary: { label: "Explore the lifecycle", href: "#lifecycle" },
    secondary: { label: "Meet your HR team", href: "#hr-workforce" },
    note: "Illustrative onboarding · no employee records accessed",
  },
  "finance-operations": {
    eyebrow: "FINANCE OPERATIONS",
    title: ["Every number.", "One coordinated", "finance team."],
    description:
      "Bring invoices, evidence, exceptions, and review into one visible workflow. AI specialists prepare the work; your finance team owns approvals and consequential decisions.",
    primary: { label: "Explore finance workflows", href: "#invoice-workflow" },
    secondary: { label: "Book a demo", href: "/book-demo" },
    note: "Illustrative finance workflow · no real records accessed",
  },
  "sales-marketing": {
    eyebrow: "SALES & MARKETING",
    title: ["From first signal", "to your next", "opportunity."],
    description:
      "Turn research, relationships, and campaigns into coordinated work. Specialists prepare the context, creative, and next steps while your team stays in control of outreach and review.",
    primary: { label: "Explore sales workflows", href: "#sales-workflows" },
    secondary: { label: "Book a demo", href: "/book-demo" },
    note: "Illustrative campaign · no messages sent or ads published",
  },
  healthcare: {
    eyebrow: "HEALTHCARE OPERATIONS",
    title: ["Less admin.", "More clarity", "for your people."],
    description:
      "Organize administrative requests, documentation, and staff follow-up with a coordinated AI workforce. Qualified staff retain every clinical decision.",
    primary: { label: "Explore healthcare", href: "#healthcare-workflows" },
    secondary: { label: "Book a demo", href: "/book-demo" },
    note: "Administrative illustration · no patient data or clinical actions",
  },
  insurance: {
    eyebrow: "INSURANCE OPERATIONS",
    title: ["From claim", "to clarity.", "Together."],
    description:
      "Bring claim intake, policy context, evidence, and exceptions into a reviewable workflow. Authorized people retain coverage, underwriting, and settlement decisions.",
    primary: { label: "Explore insurance", href: "#insurance-workflows" },
    secondary: { label: "Book a demo", href: "/book-demo" },
    note: "Illustrative claim · no coverage or settlement decision",
  },
  product: {
    eyebrow: "THE AI WORKFORCE PLATFORM",
    title: ["Build your team.", "Connect the work.", "Move forward."],
    description:
      "Plan, deploy, and manage specialized AI employees around a shared objective. Bring your context, tools, and people into one coordinated way of working.",
    primary: { label: "Explore the product", href: "#lifecycle" },
    secondary: { label: "Book a demo", href: "/book-demo" },
    note: "Illustrative product flow · no workflow deployed",
  },
} satisfies Record<
  string,
  | WorkforceHeroStory
  | Pick<
      WorkforceHeroStory,
      "eyebrow" | "title" | "description" | "primary" | "secondary" | "note"
    >
>;
