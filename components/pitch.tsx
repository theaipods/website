"use client";

// Sections that carry the pitch-deck story onto the site: problem, solution, gap, insight, why now, audience, team.
// Figures and sources are taken from the deck as supplied.

import { useEffect, useRef, useState } from "react";
import { palette } from "./ui";
import { ToolLogo } from "./tool-logo";

export function Count({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const k = Math.min(1, (now - t0) / 1300);
          setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

// ---- the problem -----------------------------------------------------------
const problem = [
  [88, "of organizations use AI", "AI adoption is mainstream"],
  [80, "report individual productivity gains", "But value is uneven"],
  [13, "report organizational EBIT impact", "Productivity ≠ business value"],
] as const;
const scattered = [
  { label: "Copilot", brand: "GitHub Copilot" }, { label: "Agents", brand: "LangChain" },
  { label: "SaaS tools", brand: "Slack" }, { label: "Workflows", brand: "n8n" },
  { label: "Data", brand: "Google BigQuery" }, { label: "People", brand: "Microsoft Teams" },
];

export function Problem() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
      <div className="space-y-6">
        {problem.map(([v, label, note], i) => (
          <div key={label}>
            <div className="flex items-baseline gap-4">
              <span className="w-28 text-6xl font-semibold tracking-tight" style={{ color: palette[[4, 1, 0][i]] }}>
                <Count to={v} suffix="%" />
              </span>
              <span>
                <span className="block font-medium">{label}</span>
                <span className="block text-sm text-muted">{note}</span>
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
              <i className="block h-full rounded-full" style={{ width: `${v}%`, background: palette[[4, 1, 0][i]], animation: "grow 1.4s ease-out both", maxWidth: `${v}%` }} />
            </div>
          </div>
        ))}
        <p className="font-mono text-[11px] text-muted">Sources: Stanford AI Index 2026 · McKinsey State of AI 2026</p>
      </div>

      {/* today: tools everywhere, the leader in the middle joining the dots */}
      <div className="relative mx-auto aspect-square w-full max-w-sm">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {scattered.map((_, i) => {
            const a = (i / scattered.length) * Math.PI * 2 - 1;
            return (
              <line key={i} x1="50" y1="50" x2={50 + Math.cos(a) * 38} y2={50 + Math.sin(a) * 38} stroke="rgba(21,22,26,.25)" strokeWidth=".5" strokeDasharray="1.5 2.5" style={{ animation: "dashmove 1.6s linear infinite" }} />
            );
          })}
        </svg>
        {scattered.map((s, i) => {
          const a = (i / scattered.length) * Math.PI * 2 - 1;
          return (
            <span
              key={s.label}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 whitespace-nowrap rounded-full border bg-white px-3 py-1.5 text-sm"
              style={{ left: `${50 + Math.cos(a) * 38}%`, top: `${50 + Math.sin(a) * 38}%`, borderColor: palette[i], animation: `bob ${2.6 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * -0.6}s` }}
            >
              <ToolLogo name={s.brand} size={21}/>{s.label}
            </span>
          );
        })}
        <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-xs font-semibold tracking-widest text-paper">
          LEADER
        </span>
      </div>
    </div>
  );
}

// ---- the solution: objective → workforce → outcome -------------------------
const functions = ["Product", "Engineering", "Marketing", "Sales", "HR & Finance", "Customer Success"];
const verbs = ["Plans", "Coordinates", "Executes", "Learns"];

function Link3() {
  return (
    <div className="relative mx-auto h-10 w-[2px] bg-line lg:h-[2px] lg:w-full">
      <i className="absolute -left-[5px] top-0 h-3 w-3 rounded-full bg-accent shadow-[0_0_12px_#e8590c] lg:-top-[5px] lg:left-0" style={{ animation: "travel 2.2s ease-in-out infinite" }} />
    </div>
  );
}

export function SolutionFlow() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setV((x) => (x + 1) % verbs.length), 1100);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid items-center gap-4 lg:grid-cols-[1fr_70px_1.25fr_70px_1fr]">
      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted">Business objective</div>
        <p className="mt-3 text-2xl font-semibold leading-snug tracking-tight">
          “Increase trial-to-paid conversion from <span className="text-accent">8% to 12%</span>.”
        </p>
        <p className="mt-3 text-sm text-muted">One outcome. Not a list of tasks.</p>
      </div>
      <Link3 />
      <div className="grad-bg rounded-2xl p-[2px]">
        <div className="rounded-[14px] bg-white p-6 text-ink">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted">TheAI Pods · AI workforce</div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-lg font-semibold">
            {verbs.map((x, i) => (
              <span key={x} className="transition-all duration-300" style={{ color: i === v ? palette[i + 1] : "rgba(21,22,26,.36)", transform: i === v ? "translateY(-2px)" : "none" }}>
                {x}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {functions.map((f, i) => (
              <span key={f} className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ background: palette[i], animation: `bob ${2.8 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * -0.5}s` }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
      <Link3 />
      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted">Business outcome</div>
        <p className="mt-3 text-2xl font-semibold leading-snug tracking-tight">
          Higher conversion.
          <br />
          More customers.
          <br />
          <span className="grad-text">More revenue.</span>
        </p>
        <p className="mt-3 text-sm text-muted">Measured at the business level.</p>
      </div>
    </div>
  );
}

// ---- the gap ---------------------------------------------------------------
const gaps = [
  ["AI Copilots", "Help people complete individual tasks faster.", "The human still owns the outcome."],
  ["Agent Builders", "Let teams build agents for defined tasks.", "Someone still has to design and orchestrate the team."],
  ["Workflow / Vertical AI", "Automate a specific process or function.", "Work remains siloed across the business."],
];

export function Gap() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {gaps.map(([t, does, gap], i) => (
          <div key={t} className="rounded-2xl border border-line bg-white p-6 transition-transform duration-300 hover:-translate-y-1">
            <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
            <h3 className="mt-2 text-xl font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-muted">{does}</p>
            <div className="mt-5 rounded-xl bg-accent-soft p-4">
              <div className="font-mono text-[10px] tracking-widest text-accent">THE GAP</div>
              <p className="mt-1 text-sm font-medium">{gap}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grad-bg mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl px-6 py-5 text-center text-white">
        <span className="font-mono text-[11px] uppercase tracking-widest text-white/80">The missing layer</span>
        <span className="text-lg font-semibold">Business intent → Coordinated execution → Measurable outcome</span>
      </div>
    </>
  );
}

// ---- our insight: the business context layer ------------------------------
const context = ["Goals & Strategy", "Processes & Rules", "Company Knowledge", "Tools & Systems", "People & Roles"];
const loop = ["Plan", "Execute", "Adapt", "Deliver"];

function Chain({ items, live }: { items: string[]; live?: boolean }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {items.map((x, i) => (
        <div key={x} className="flex flex-col items-start gap-1.5">
          {i > 0 && <span className={`ml-5 ${live ? "text-accent" : "text-muted"}`}>↓</span>}
          <span
            className={`rounded-lg px-3.5 py-2 text-sm font-medium ${live ? "text-white" : "border border-line bg-white text-muted"}`}
            style={live ? { background: palette[[4, 5, 0][i]], animation: `bob ${3 + i * 0.4}s ease-in-out infinite` } : undefined}
          >
            {x}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Insight() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-line bg-white p-6">
        <h3 className="text-lg font-semibold">The unit of AI work is shifting.</h3>
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <div className="mb-3 font-mono text-[10px] tracking-widest text-muted">TODAY</div>
            <Chain items={["Agent", "Task", "Output"]} />
          </div>
          <div>
            <div className="mb-3 font-mono text-[10px] tracking-widest text-accent">WITH THE AI PODS</div>
            <Chain live items={["Business objective", "AI workforce", "Business outcome"]} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-6">
        <h3 className="text-lg font-semibold">Business context becomes the operating layer.</h3>
        <div className="mt-5 flex flex-wrap gap-2">
          {context.map((c, i) => (
            <span key={c} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: palette[i], animation: `bob ${2.8 + i * 0.35}s ease-in-out infinite`, animationDelay: `${i * -0.5}s` }}>
              {c}
            </span>
          ))}
        </div>
        <div className="my-3 text-center text-accent">↓</div>
        <div className="grad-bg rounded-xl py-3 text-center text-sm font-semibold tracking-wide text-white">BUSINESS CONTEXT LAYER</div>
        <div className="my-3 text-center text-accent">↓</div>
        <div className="grid grid-cols-4 gap-2">
          {loop.map((l, i) => (
            <span key={l} className="rounded-lg bg-soft py-2 text-center text-sm font-medium" style={{ animation: `seq 4s ${i}s infinite both` }}>
              {l}
            </span>
          ))}
        </div>
        <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
          <b className="text-2xl font-semibold text-ink">
            <Count to={86} suffix="%" />
          </b>{" "}
          of business leaders say agents cannot be reliably deployed without process context.
          <span className="mt-1 block font-mono text-[11px]">Hackett Group + ARIS, 2026</span>
        </p>
      </div>
    </div>
  );
}

// ---- why now ---------------------------------------------------------------
const now = [
  [88, "AI is already everywhere", "of surveyed organizations use AI.", "Stanford AI Index 2026"],
  [57, "Agents are moving into production", "of surveyed organizations have agents in production.", "LangChain, 2026"],
  [74, "Workflows are the next battlefield", "of leaders expect business processes to be redesigned around AI agents.", "Deloitte, 2026"],
  [15, "The orchestration gap is open", "of surveyed organizations have scaled cross-functional multi-agent adoption.", "Deloitte, 2026"],
] as const;

export function WhyNow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {now.map(([v, title, text, src], i) => (
        <div key={title} className="rounded-2xl border border-line bg-white p-6 transition-transform duration-300 hover:-translate-y-1">
          <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
          <div className="mt-2 text-6xl font-semibold tracking-tight" style={{ color: palette[[4, 2, 5, 0][i]] }}>
            <Count to={v} suffix="%" />
          </div>
          <h3 className="mt-3 font-medium">{title}</h3>
          <p className="mt-1 text-sm text-muted">{text}</p>
          <p className="mt-3 font-mono text-[11px] text-muted">{src}</p>
        </div>
      ))}
    </div>
  );
}

// ---- who it is for ---------------------------------------------------------
const persona = [
  ["What I want", "Grow the business faster."],
  ["My reality", "I already have AI tools helping my teams."],
  ["My blocker", "They work in silos. I still have to connect the dots."],
];
const audience = [
  ["B2B SaaS", "20–100 employee, founder-led companies", "Now"],
  ["D2C brands", "Campaigns, storefronts and support", "Next"],
  ["Product-based companies", "Cross-functional execution", "Next"],
];

export function Audience() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="grad-bg grid h-11 w-11 place-items-center rounded-full text-sm font-bold text-white">CEO</span>
          <div>
            <div className="font-semibold">The B2B SaaS founder</div>
            <div className="text-sm text-muted">50-person company · growth is the priority</div>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {persona.map(([k, x], i) => (
            <div key={k} className="rounded-xl p-4" style={{ background: `${palette[[2, 1, 0][i]]}1f` }}>
              <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: palette[[2, 1, 0][i]] }}>
                {k}
              </div>
              <p className="mt-2 text-sm font-medium">{x}</p>
            </div>
          ))}
        </div>
      </div>
      <ul className="space-y-3">
        {audience.map(([n, x, when], i) => (
          <li key={n} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
            <i className="h-3 w-3 shrink-0 rounded-full" style={{ background: palette[i + 3] }} />
            <div>
              <div className="font-medium">{n}</div>
              <div className="text-sm text-muted">{x}</div>
            </div>
            <span className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${when === "Now" ? "bg-ink text-paper" : "bg-soft text-muted"}`}>{when}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- team ------------------------------------------------------------------
const team = [
  {
    name: "Abhishek Tripathi",
    role: "Product & Growth",
    title: "Product, Design & Growth",
    years: "11+ years building products and companies",
    tags: ["Product", "Customer Experience", "Growth"],
    bio: "Built and ran two startups. Focused on product, design and AI initiatives.",
    photo: "/team/abhishek.png",
    color: "#22c55e",
  },
  {
    name: "R. S. Mahato",
    role: "Tech & Growth",
    title: "Full-Stack AI Engineer · Data Architecture · AI Systems",
    years: "10+ years engineering complex systems",
    tags: ["AI Engineering", "Data Architecture", "Full-Stack"],
    bio: "Deep AI and engineering expertise across full-stack systems, data and productization.",
    photo: "",
    color: "#6366f1",
  },
];

export function Team() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {team.map((m) => (
        <article key={m.name} className="flex gap-5 rounded-2xl border border-line bg-white p-6 transition-transform duration-300 hover:-translate-y-1">
          {m.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.photo} alt={m.name} className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
          ) : (
            <span className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-violet-200 bg-gradient-to-br from-slate-950 via-indigo-800 to-violet-500 text-2xl font-semibold text-white" aria-hidden="true">RS</span>
          )}
          <div>
            <h3 className="text-xl font-semibold tracking-tight">{m.name}</h3>
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: m.color }}>
              {m.role}
            </div>
            <p className="mt-2 text-sm font-medium">{m.title}</p>
            <p className="text-sm text-muted">{m.years}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.tags.map((t) => (
                <span key={t} className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: `${m.color}1f`, color: m.color }}>
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted">{m.bio}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
