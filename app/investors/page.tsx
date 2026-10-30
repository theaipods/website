import { Code2, Megaphone, Server, UsersRound, ShieldCheck } from "lucide-react";
import { Count, Team } from "@/components/pitch";
import { Reveal } from "@/components/sections";
import { eyebrow, palette } from "@/components/ui";

// Investor-facing material from the pitch deck: market, competition, team and the ask.
// Kept off the main navigation; linked from the footer only.

const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const h2 = "mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl";

const landscape = [
  ["Glean", "Enterprise context + agents", "Knowledge layer"],
  ["Ema", "AI employees + workflows", "Workforce layer"],
  ["CrewAI / Relevance AI", "Agent build + orchestration", "Agent layer"],
  ["Vertical AI", "Function-specific automation", "Application layer"],
];
const funds = [
  ["Product & AI Engineering", 40, "Core platform + AI execution"],
  ["Customer Acquisition", 25, "GTM + customer expansion"],
  ["AI Infrastructure", 15, "Models + compute + integrations"],
  ["People & Operations", 10, "Key hires + operating costs"],
  ["Security & Reliability", 10, "Enterprise readiness"],
] as const;
const fundIcons = [Code2, Megaphone, Server, UsersRound, ShieldCheck];
const path = ["B2B SaaS", "AI-native teams", "Business processes", "Cross-functional AI workforce"];

export default function Investors() {
  return (
    <>
      

      <main>
        <section className={`${wrap} py-16 sm:py-24`}>
          <p className={eyebrow}>For investors</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.03] tracking-tight sm:text-6xl">
            AI teams that run your business. <span className="grad-text">On your command.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Everyone is building AI agents. We are building the business around them: the layer that turns
            business intent into coordinated execution across the company.
          </p>
        </section>

        {/* market */}
        <section className="border-y border-line bg-white">
          <div className={`${wrap} py-20`}>
            <p className={eyebrow}>Market opportunity</p>
            <h2 className={h2}>A $1T+ shift in how software gets executed.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <Reveal className="rounded-2xl border border-line bg-paper p-6">
                <span className="font-mono text-[11px] text-muted">TAM</span>
                <div className="mt-2 text-6xl font-semibold tracking-tight" style={{ color: palette[4] }}>
                  ~<Count to={985} prefix="$" suffix="B" />
                </div>
                <p className="mt-3 text-sm text-muted">Agentic AI software opportunity by 2030. Gartner.</p>
              </Reveal>
              <Reveal delay={120} className="rounded-2xl border border-line bg-paper p-6">
                <span className="font-mono text-[11px] text-muted">SAM</span>
                <div className="mt-2 text-6xl font-semibold tracking-tight" style={{ color: palette[5] }}>
                  ~<Count to={234} prefix="$" suffix="B" />
                </div>
                <p className="mt-3 text-sm text-muted">Enterprise application spend exposed to agentic AI by 2030. Gartner.</p>
              </Reveal>
              <Reveal delay={240} className="grad-bg rounded-2xl p-6 text-white">
                <span className="font-mono text-[11px] text-white/70">INITIAL WEDGE</span>
                <div className="mt-2 text-5xl font-semibold tracking-tight">B2B SaaS</div>
                <p className="mt-3 text-sm text-white/85">20–100 employee companies. AI-ready, founder-led.</p>
              </Reveal>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-2 font-mono text-[11px] uppercase tracking-widest text-muted">Expansion path</span>
              {path.map((p, i) => (
                <span key={p} className="flex items-center gap-2">
                  {i > 0 && <span className="text-accent">→</span>}
                  <span className="rounded-full border border-line px-3.5 py-1.5">{p}</span>
                </span>
              ))}
              <span className="ml-auto rounded-full bg-ink px-4 py-1.5 text-paper">Initial company target: $30–50M ARR</span>
            </div>
          </div>
        </section>

        {/* competition */}
        <section className={`${wrap} py-20`}>
          <p className={eyebrow}>Competition</p>
          <h2 className={h2}>Not another agent builder, assistant or workflow tool.</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <ul className="border-t border-line">
              {landscape.map(([n, what, layer], i) => (
                <li key={n} className="grid grid-cols-[1fr_auto] items-center gap-x-4 border-b border-line py-4 sm:grid-cols-[180px_1fr_auto]">
                  <span className="font-medium">{n}</span>
                  <span className="hidden text-sm text-muted sm:block">{what}</span>
                  <span className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ background: palette[i + 1] }}>
                    {layer}
                  </span>
                </li>
              ))}
            </ul>
            <div className="grad-bg rounded-2xl p-[2px]">
              <div className="flex h-full flex-col justify-center rounded-[14px] bg-[#0b0b12] p-7 text-white">
                <span className="font-mono text-[11px] tracking-widest text-white/60">THEAIPODS</span>
                <div className="mt-2 text-3xl font-semibold tracking-tight">Business execution layer</div>
                <p className="mt-3 text-sm text-white/75">Intent → Process → AI workforce → Outcome</p>
                <p className="mt-1 text-sm text-white/75">Standard process plus company-specific context. Coordinates work across functions, systems and humans.</p>
              </div>
            </div>
          </div>
        </section>

        {/* team */}
        <section className="border-y border-line bg-white">
          <div className={`${wrap} py-20`}>
            <p className={eyebrow}>Team</p>
            <h2 className={h2}>Two builders. One mission.</h2>
            <div className="mt-10">
              <Team />
            </div>
          </div>
        </section>

        {/* the ask */}
        <section className={`${wrap} py-20`}>
          <p className={eyebrow}>The ask · pre-seed</p>
          <h2 className={h2}>
            <span className="grad-text">₹5 Cr</span> to build and scale TheAIPods.
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            18–24 months of runway to build the platform, onboard early customers and prove repeatable value.
          </p>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h3 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted">Use of funds</h3>
              <ul className="space-y-4">
                {funds.map(([n, pct, note], i) => { const Icon = fundIcons[i]; return (
                  <li key={n}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 font-medium"><Icon size={19} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden="true"/>{n}</span>
                      <span className="text-sm text-muted">{note}</span>
                      <span className="w-12 text-right text-lg font-semibold tabular-nums">{pct}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line">
                      <i className="block h-full rounded-full" style={{ width: `${pct * 2.5}%`, maxWidth: `${pct * 2.5}%`, background: palette[i], animation: "grow 1.2s ease-out both" }} />
                    </div>
                  </li>
                ); })}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-white p-6">
                <span className="font-mono text-[11px] tracking-widest text-muted">BEFORE THIS ROUND</span>
                <p className="mt-2 text-xl font-semibold">10 early customers targeted</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-6">
                <span className="font-mono text-[11px] tracking-widest text-muted">ROUND OUTCOME</span>
                <p className="mt-2 text-xl font-semibold">10 → 20–30 paying customers</p>
                <p className="mt-1 text-sm text-muted">A repeatable go-to-market engine, then expansion across business processes.</p>
              </div>
              <p className="text-sm text-muted">Milestone-led: build, onboard, demonstrate value, then scale.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#07070d] text-paper">
          <div className={`${wrap} flex flex-col gap-6 py-16 sm:flex-row sm:items-center sm:justify-between`}>
            <h2 className="text-3xl font-semibold tracking-tight">Talk to the founders.</h2>
            <div className="text-sm text-paper/80">
              <a className="block hover:text-accent" href="mailto:contact@theaipods.com">contact@theaipods.com</a>
              <a className="block hover:text-accent" href="tel:+918587032648">+91 85870 32648</a>
              <a className="block hover:text-accent" href="https://theaipods.com/">theaipods.com</a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
