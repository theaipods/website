import { z } from "zod";

const item = z.object({ title: z.string().max(160), description: z.string().max(700), published: z.boolean().default(true) });
export const aboutSchema = z.object({
  mission: z.string().min(10).max(300),
  missionSupporting: z.string().max(1000),
  story: z.string().min(10).max(500),
  storySupporting: z.string().max(1000),
  milestones: z.array(item.extend({ label: z.string().max(60) })).max(12),
  leadership: z.array(item.extend({ name: z.string().max(120), role: z.string().max(160), image: z.string().max(500).default(""), profileUrl: z.string().max(500).default("") })).max(20),
  ecosystem: z.array(item.extend({ logo: z.string().max(500), url: z.string().max(500) })).max(30),
  advisors: z.array(item.extend({ name: z.string().max(120), role: z.string().max(160), image: z.string().max(500), profileUrl: z.string().max(500) })).max(30),
  values: z.array(item.extend({ icon: z.enum(["target", "shapes", "network", "control", "shield", "chart"]) })).max(12),
  recognition: z.array(item.extend({ year: z.string().max(20), issuer: z.string().max(160), url: z.string().max(500) })).max(30),
  culture: z.array(item.extend({ visual: z.enum(["systems", "work", "control"]) })).max(8),
  vision: z.string().max(1000),
});
export type AboutContent = z.infer<typeof aboutSchema>;

// Editorial draft copy and product architecture. No company-history dates or third-party claims.
export const defaultAboutContent: AboutContent = {
  mission: "Build a world where every business can have its own AI workforce.",
  missionSupporting: "AI Pod brings specialized AI employees, intelligent coordination, connected tools and human oversight together so businesses can put AI to work on meaningful objectives.",
  story: "We believe AI should do more than answer questions. It should help businesses get work done.",
  storySupporting: "A useful workforce needs defined roles, business context and the ability to collaborate. AI Pod is being built to connect those pieces while keeping decisions and high-impact actions visible to people.",
  milestones: [
    { label: "FOUNDATION", title: "Start with the objective", description: "A business goal gives every specialist a shared direction.", published: true },
    { label: "WORKFORCE", title: "Assemble specialists", description: "Purpose-built AI employees take responsibility for distinct kinds of work.", published: true },
    { label: "COORDINATION", title: "Connect the work", description: "The Orchestrator brings dependencies, tools and handoffs together.", published: true },
    { label: "CONTROL", title: "Keep people involved", description: "Permissions, review points and observable outputs shape execution.", published: true },
  ],
  leadership: [], ecosystem: [], advisors: [], recognition: [],
  values: [
    { icon: "target", title: "Outcome first", description: "We focus on useful work and meaningful business results, not activity for its own sake.", published: true },
    { icon: "shapes", title: "Specialization matters", description: "Different kinds of work deserve different capabilities, tools and responsibilities.", published: true },
    { icon: "network", title: "Built to collaborate", description: "Complex objectives benefit from coordinated specialists instead of disconnected assistants.", published: true },
    { icon: "control", title: "Human accountability", description: "Autonomy operates within explicit permissions, with people involved where necessary.", published: true },
    { icon: "shield", title: "Trust by design", description: "Access, permissions, evaluation and auditability are fundamental to enterprise AI.", published: true },
    { icon: "chart", title: "Measure what matters", description: "Task quality, useful deliverables and operational reliability guide the work.", published: true },
  ],
  culture: [
    { visual: "systems", title: "Think in systems", description: "Design the whole flow, from the objective to the people and tools that move it forward.", published: true },
    { visual: "work", title: "Make work visible", description: "Keep assignments, handoffs, sources and deliverables in view.", published: true },
    { visual: "control", title: "Keep humans in control", description: "Build approval into the workflow where judgment matters.", published: true },
  ],
  vision: "We envision businesses assembling specialized AI employees around real objectives, giving them the right context and tools, and coordinating their work through systems designed for accountability and control.",
};
