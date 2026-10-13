"use client";

import { useEffect, useState } from "react";
import { departments } from "@/lib/catalog";
import { Monogram, StatusPill, btnPrimary, input, palette } from "./ui";

const demo = [
  ["Pod Manager", "Break the ₹120 Cr GMV target into a 6-week plan across 9 workstreams"],
  ["Research Agent", "Benchmark festive pricing and offers across 5 competitors and 12 categories"],
  ["Data Analyst", "Segment 4.2M past shoppers to forecast demand by city tier"],
  ["Social Media Manager", "Produce 40 on-brand poster variants in 6 languages"],
  ["Frontend Developer", "Build a personalised sale page with live countdown and bank offers"],
  ["Marketing Agent", "Draft a 5-touch launch sequence tailored to each segment"],
];
const ROW = 64;
const LAST = demo.length; // index of the "you" row

// A miniature of a pod at work. Fixed size: nothing reflows as the steps advance.
// The active specialist and its work illuminate in turn without a travelling dot.
export function HeroPod() {
  const [step, setStep] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s >= LAST + 1 ? 0 : s + 1)), 2000);
    return () => clearInterval(t);
  }, []);
  const node = Math.min(step, LAST);
  const approved = step > LAST;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_30px_80px_-40px_rgba(21,22,26,0.35)]">
      <div className="flex h-14 items-start justify-between gap-4 border-b border-line">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted">Objective</div>
          <div className="mt-1 truncate text-sm font-medium">Grow Diwali sale GMV 25% with ad spend flat</div>
        </div>
        <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
          Diwali Sale Pod
        </span>
      </div>

      <div className="relative mt-2" style={{ height: ROW * (LAST + 1) }}>
        {/* The spine remains as context while each handoff is highlighted in its row. */}
        <i className="absolute left-[17px] w-[2px] bg-line" style={{ top: ROW / 2, height: ROW * LAST }} />
        <i
          className="absolute left-[17px] w-[2px] transition-[height] duration-700 ease-out"
          style={{ top: ROW / 2, height: ROW * node, background: "linear-gradient(#ffb020,#ff5c39,#ec4899,#6366f1)" }}
        />

        {demo.map(([who, what], i) => {
          const status = i < step ? "Completed" : i === step ? "Running" : "Planned";
          return (
            <div
              key={who}
              className={`absolute inset-x-0 flex items-center gap-3 rounded-xl pr-2 transition-colors duration-500 ${i === step ? "bg-accent-soft" : ""}`}
              style={{ top: i * ROW, height: ROW }}
            >
              <span className="relative z-10">
                <Monogram name={who} active={i === step} />
              </span>
              <div className="min-w-0 flex-1">
                <div className={`line-clamp-2 text-[13px] leading-snug transition-colors ${i > step ? "text-muted" : ""}`}>{what}</div>
                <div className="text-[11px] text-muted">{who}</div>
              </div>
              <div className="flex w-[92px] shrink-0 justify-end">
                <StatusPill status={status} />
              </div>
              {i === step && (
                <i key={step} className="absolute bottom-0 left-12 h-[2px] rounded bg-accent" style={{ animation: "grow 2s linear both", maxWidth: "calc(100% - 56px)" }} />
              )}
            </div>
          );
        })}

        {/* the owner is the last node on the same spine */}
        <div
          className={`absolute inset-x-0 flex items-center gap-3 rounded-xl pr-2 transition-colors duration-500 ${step === LAST ? "bg-accent-soft" : ""}`}
          style={{ top: LAST * ROW, height: ROW }}
        >
          <span className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[10px] font-semibold transition-colors ${step >= LAST ? "bg-ink text-paper" : "border border-line bg-white text-muted"}`}>
            YOU
          </span>
          <div className="min-w-0 flex-1">
            <div className={`text-[13px] font-medium leading-snug ${step < LAST ? "text-muted" : ""}`}>
              {approved ? "Published to 3 channels" : "Your approval"}
            </div>
            <div className="truncate text-[11px] text-muted">Publish 40 posters to 4.2M shoppers</div>
          </div>
          <div className="flex w-[92px] shrink-0 justify-end">
            <span
              className={`inline-flex h-7 items-center rounded-full px-3 text-[11px] font-medium transition-colors ${
                approved ? "bg-[#22c55e] text-white" : step === LAST ? "bg-ink text-paper" : "border border-line text-muted"
              }`}
              style={step === LAST ? { animation: "ping-soft 1s ease-out infinite" } : undefined}
            >
              {approved ? "✓ Approved" : step === LAST ? "Approve" : "Waiting"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Roster() {
  const [id, setId] = useState(departments[1].id);
  const dept = departments.find((x) => x.id === id)!;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {departments.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setId(x.id)}
            style={x.id === id ? { background: palette[i % palette.length], borderColor: "transparent" } : undefined}
            className={`flex h-9 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition-colors ${
              x.id === id ? "font-medium text-white" : "border-line hover:border-ink"
            }`}
          >
            {x.id !== id && <i className="h-2 w-2 rounded-full" style={{ background: palette[i % palette.length] }} />}
            {x.name}
            <span className="ml-0.5 font-mono text-[10px] opacity-60">{x.roles.length}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex items-baseline justify-between border-b border-line pb-3">
        <h3 className="text-lg font-medium">{dept.pod}</h3>
        <span className="text-sm text-muted">{dept.outcome}</span>
      </div>
      <ul key={id} className="grid sm:grid-cols-2">
        {dept.roles.map((r, i) => (
          <li key={r.id} className="rise flex items-start gap-3 border-b border-line py-4 sm:odd:pr-8 sm:even:pl-8" style={{ animationDelay: `${i * 35}ms` }}>
            <Monogram name={r.name} />
            <div>
              <div className="text-sm font-medium">{r.name}</div>
              <div className="text-sm text-muted">{r.does}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <p className="rise rounded-lg border border-paper/20 px-4 py-3 text-sm">
        Thanks. This demo does not send anything yet — the form will be connected later.
      </p>
    );
  return (
    <div><p className="mb-4 text-sm">Email us at <a className="font-semibold text-violet-700 underline" href="mailto:contact@theaipods.com">contact@theaipods.com</a></p><form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <input required type="email" placeholder="Work email" className={`${input} text-ink sm:max-w-xs`} />
      <button className={`${btnPrimary} !bg-accent hover:!bg-paper hover:!text-ink`}>Contact us</button>
    </form></div>
  );
}

const objectives = [
  "Increase trial-to-paid conversion from 8% to 12%",
  "Launch our Diwali sale across 6 languages",
  "Find the top reasons customers are cancelling",
  "Prepare the weekly business report",
  "Cut support response time below 2 minutes",
  "Create a product launch plan for next quarter",
  "Review our GitHub backlog and propose a sprint",
  "Prepare a competitor analysis with sources",
  "Draft a win-back email campaign",
  "Analyse last month's sales by city",
  "Create a hiring plan for 12 roles",
];

export function ObjectiveMarquee() {
  const row = [...objectives, ...objectives];
  return (
    <div className="overflow-hidden py-2">
      <div className="marquee flex w-max gap-3">
        {row.map((o, i) => (
          <span key={i} className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-white px-5 py-2.5 text-sm">
            <i className="h-2 w-2 rounded-full" style={{ background: palette[i % palette.length] }} />
            {o}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- deliverables gallery ---------------------------------------------------
// Sample output drawn in CSS to show the kinds of things a pod produces. Not real customer work.

function Tile({ title, who, children, className = "", bg }: { title: string; who: string; children: React.ReactNode; className?: string; bg: string }) {
  return (
    <figure className={`group ${className}`}>
      <div
        className="relative h-full overflow-hidden rounded-2xl text-white transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_60px_-30px_rgba(21,22,26,.5)]"
        style={{ background: bg }}
      >
        {children}
        <figcaption className="absolute inset-x-3 bottom-3 flex items-center gap-2.5 rounded-xl bg-white/95 p-2 text-ink backdrop-blur">
          <Monogram name={who} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{title}</span>
            <span className="block truncate text-xs text-muted">by {who}</span>
          </span>
          <span className="ml-auto mr-1 hidden rounded-full bg-ink px-2 py-0.5 text-[10px] text-paper xl:block">Approved</span>
        </figcaption>
      </div>
    </figure>
  );
}

export function Gallery() {
  const [sec, setSec] = useState(8076);
  useEffect(() => {
    const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 8076)), 1000);
    return () => clearInterval(t);
  }, []);
  const clock = [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map((n) => String(n).padStart(2, "0"));

  return (
    <div className="grid auto-rows-[17rem] gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* poster */}
      <Tile title="Sale poster · 40 variants" who="Social Media Manager" bg="linear-gradient(140deg,#ec4899,#ff5c39 55%,#ffb020)" className="lg:row-span-2">
        <i className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15" />
        <i className="absolute -left-8 top-40 h-28 w-28 rounded-full bg-white/10" />
        {[[78, 30], [70, 12], [84, 52], [62, 62], [12, 70]].map(([x, y], i) => (
          <i key={i} className="absolute text-lg not-italic" style={{ left: `${x}%`, top: `${y}%`, animation: `bob ${3 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * -0.7}s` }}>
            ✦
          </i>
        ))}
        <div className="relative p-6">
          <div className="text-[10px] font-semibold tracking-[0.3em] opacity-90">YOUR BRAND PRESENTS</div>
          <div className="mt-6 text-5xl font-black leading-[0.95] tracking-tight">
            THE BIG
            <br />
            FESTIVE
            <br />
            SALE
          </div>
          <div className="mt-5 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-bold text-[#e11d48]">UP TO 60% OFF</div>
          <div className="mt-4 hidden text-sm font-medium opacity-90 lg:block">12 – 18 October · Free delivery · Bank offers</div>
          <div className="mt-6 hidden flex-wrap gap-1.5 text-[10px] font-semibold lg:flex">
            {["EN", "HI", "TA", "TE", "BN", "MR"].map((l) => (
              <span key={l} className="rounded-full bg-white/20 px-2 py-0.5">{l}</span>
            ))}
          </div>
        </div>
      </Tile>

      {/* landing page */}
      <Tile title="Sale landing page" who="Frontend Developer" bg="linear-gradient(140deg,#6366f1,#06b6d4)" className="sm:col-span-2">
        <div className="absolute inset-x-5 bottom-0 top-5 overflow-hidden rounded-t-xl bg-white text-ink shadow-xl">
          <div className="flex h-7 items-center gap-1.5 border-b border-line px-3">
            {[0, 1, 2].map((d) => <i key={d} className="h-2 w-2 rounded-full bg-line" />)}
            <span className="ml-2 rounded bg-soft px-2 font-mono text-[9px] text-muted">yourstore.com/big-festive-sale</span>
          </div>
          <div className="flex items-center justify-between bg-[#eef0ff] px-5 py-3">
            <div>
              <div className="text-[9px] font-semibold tracking-widest text-[#6366f1]">SALE ENDS IN</div>
              <div className="mt-1 flex gap-1.5">
                {clock.map((n, i) => (
                  <span key={i} className="rounded-md bg-ink px-2 py-1 font-mono text-base font-semibold tabular-nums text-paper">{n}</span>
                ))}
              </div>
              <div className="mt-1.5 text-base font-bold leading-tight">Lights on. Prices down.</div>
            </div>
            <span className="rounded-full bg-[#6366f1] px-4 py-2 text-xs font-semibold text-white">Shop the sale</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5 p-3">
            {[["Headphones", "₹1,499", "-55%"], ["Kurta set", "₹899", "-40%"], ["Air fryer", "₹3,299", "-48%"], ["Sneakers", "₹1,999", "-35%"]].map(([n, p, o], i) => (
              <div key={n} className="rounded-lg border border-line p-2">
                <i className="block h-7 rounded" style={{ background: palette[(i + 2) % palette.length], opacity: 0.25 }} />
                <div className="mt-1 truncate text-[10px]">{n}</div>
                <div className="flex items-center justify-between text-[10px]">
                  <b>{p}</b>
                  <span className="text-[#16a34a]">{o}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Tile>

      {/* forecast */}
      <Tile title="Demand forecast" who="Data Analyst" bg="linear-gradient(160deg,#0f172a,#14532d)">
        <div className="p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-white/60">ORDERS BY CITY TIER</span>
            <span className="rounded-full bg-[#22c55e] px-2 py-0.5 text-[10px] font-bold text-[#052e16]">▲ 25%</span>
          </div>
          <div className="mt-3 flex h-28 items-end gap-2.5">
            {[["Metro", 62, 84], ["Tier 1", 48, 70], ["Tier 2", 38, 66], ["Tier 3", 22, 45]].map(([l, a, b], i) => (
              <div key={l as string} className="flex h-full flex-1 flex-col justify-end">
                <div className="flex h-full items-end gap-1">
                  <i className="flex-1 origin-bottom rounded-t bg-white/25" style={{ height: `${a}%`, animation: `rise-bar .8s ${i * 0.1}s both` }} />
                  <i className="flex-1 origin-bottom rounded-t bg-[#22c55e]" style={{ height: `${b}%`, animation: `rise-bar .8s ${0.15 + i * 0.1}s both` }} />
                </div>
                <span className="mt-1 text-center text-[9px] not-italic text-white/60">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </Tile>

      {/* email */}
      <Tile title="Launch email · 1 of 5" who="Marketing Agent" bg="linear-gradient(160deg,#ff5c39,#ffb020)">
        <div className="absolute inset-x-5 bottom-0 top-5 overflow-hidden rounded-t-xl bg-white text-ink shadow-xl">
          <div className="border-b border-line px-4 py-2">
            <div className="text-[10px] text-muted">To: loyalty members</div>
            <div className="truncate text-xs font-semibold">Priya, your early access starts tonight</div>
          </div>
          <div className="bg-[#ff5c39] py-1.5 text-center text-[10px] font-bold tracking-[0.25em] text-white">EARLY ACCESS</div>
          <div className="space-y-1 px-4 py-2.5 text-[11px] leading-snug text-muted">
            <p>You get in 12 hours before everyone else.</p>
            <p>Your saved items are already 40% off.</p>
            <span className="inline-block rounded-full bg-[#ff5c39] px-3 py-1 text-[10px] font-semibold text-white">Open my sale</span>
          </div>
        </div>
      </Tile>

      {/* brief */}
      <Tile title="Market brief · 14 sources" who="Research Agent" bg="linear-gradient(160deg,#ffb020,#f97316)">
        <div className="absolute inset-x-5 bottom-0 top-5 rounded-t-xl bg-white p-4 text-ink shadow-xl">
          <div className="text-xs font-bold leading-snug">Festive pricing: what 5 competitors are doing</div>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-snug text-muted">
            {["Three of five lead with bank-card offers, not price cuts", "Electronics discounts peak on day one", "Free-delivery thresholds dropped across the board"].map((x, i) => (
              <li key={i} className="flex gap-2">
                <b className="text-[#f97316]">{i + 1}</b>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </Tile>

      {/* ad copy */}
      <Tile title="Campaign strategy · 6 languages" who="Marketing Agent" bg="linear-gradient(160deg,#06b6d4,#6366f1)">
        <div className="space-y-2 p-5">
          {[["EN", "Lights on. Prices down."], ["HI", "रोशनी भी, बचत भी।"], ["EN", "Your wishlist just got cheaper."]].map(([l, x], i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-ink" style={{ animation: `bob ${3.5 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * -1}s` }}>
              <span className="rounded bg-[#06b6d4] px-1.5 text-[9px] font-bold text-white">{l}</span>
              <span className="truncate text-xs font-semibold">{x}</span>
            </div>
          ))}
          <div className="text-[10px] text-white/80">+ 4 more languages · 18 variants</div>
        </div>
      </Tile>
    </div>
  );
}
