"use client";

import { useEffect, useRef, useState } from "react";
import { Robot, palette } from "./ui";

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

// Fades and lifts its children in the first time they scroll into view.
export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.12);
  return (
    <div ref={ref} className={`reveal ${seen ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const prompts = ["Launch our Diwali sale in 6 languages", "Find why customers are cancelling", "Prepare the weekly business report"];

function Typer() {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    const full = prompts[i].length;
    const t = setTimeout(
      () => {
        if (n < full + 28) setN(n + 1);
        else {
          setN(0);
          setI((i + 1) % prompts.length);
        }
      },
      n < full ? 45 : 60,
    );
    return () => clearTimeout(t);
  }, [n, i]);
  const done = n >= prompts[i].length;
  return (
    <div>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm">
        <span className="text-accent">✦</span>
        <span className="truncate">{prompts[i].slice(0, n)}</span>
        {!done && <i className="pulse-dot h-4 w-[2px] bg-accent" />}
      </div>
      <div className="mt-3 flex h-7 gap-2">
        {done &&
          ["Plan", "6 employees", "9 tasks", "1 approval"].map((c, k) => (
            <span key={c} className="rise rounded-full px-3 py-1 text-xs font-medium text-white" style={{ background: palette[k + 2], animationDelay: `${k * 120}ms` }}>
              {c}
            </span>
          ))}
      </div>
    </div>
  );
}

const tile = "relative overflow-hidden rounded-2xl border border-line bg-paper p-5 flex flex-col justify-between min-h-[200px] transition-transform duration-300 hover:-translate-y-1";

function Head({ t, s }: { t: string; s: string }) {
  return (
    <div>
      <h3 className="font-medium">{t}</h3>
      <p className="text-sm text-muted">{s}</p>
    </div>
  );
}

export function Bento({ more }: { more: string[] }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={`${tile} sm:col-span-2`}>
          <Typer />
          <Head t="Command Center" s="Say the goal. Get the plan." />
        </div>

        <div className={tile}>
          <div className="relative flex h-14 items-center justify-between px-2">
            <i className="absolute inset-x-6 top-1/2 h-[2px] bg-line" />
            <i className="absolute top-1/2 -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-[#ec4899] shadow-[0_0_12px_#ec4899]" style={{ animation: "travel 2.4s ease-in-out infinite" }} />
            {["Research Agent", "Marketing Agent", "Frontend Developer"].map((n) => (
              <span key={n} className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-white">
                <Robot name={n} className="h-8 w-8" />
              </span>
            ))}
          </div>
          <Head t="Collaboration" s="Employees hand off work." />
        </div>

        <div className={tile}>
          <div className="px-1 pt-3">
            <div className="relative h-2 rounded-full bg-line">
              <span className="absolute -top-2 h-6 w-6" style={{ animation: "knob 8s ease-in-out infinite", marginLeft: -12 }}>
                <i className="block h-6 w-6 rounded-full border-4 border-white bg-accent shadow-md" />
              </span>
            </div>
            <div className="mt-3 flex justify-between font-mono text-[10px] text-muted">
              {["L1", "L2", "L3", "L4"].map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>
          <Head t="Autonomy & approvals" s="You set how far they go." />
        </div>

        <div className={tile}>
          <div className="relative mx-auto h-20 w-full">
            {[["PDF", -70, -26], ["DOCX", 64, -30], ["XLSX", -58, 26], ["URL", 70, 22]].map(([l, x, y], i) => (
              <span
                key={l as string}
                className="absolute left-1/2 top-1/2 -ml-5 -mt-2.5 rounded bg-white px-1.5 py-0.5 font-mono text-[9px] shadow"
                style={{ ["--x" as string]: `${x}px`, ["--y" as string]: `${y}px`, animation: `suck 3s ${i * 0.6}s ease-in infinite`, color: palette[i + 1] }}
              >
                {l}
              </span>
            ))}
            <i className="grad-bg absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_24px_rgba(236,72,153,.6)]" />
          </div>
          <Head t="Company Brain" s="Learns your brand once." />
        </div>

        <div className={tile}>
          <div className="relative flex h-20 items-center justify-between px-3">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 80" preserveAspectRatio="none">
              {[14, 40, 66].map((y) => (
                <path key={y} d={`M24 40 C 90 40, 110 ${y}, 172 ${y}`} fill="none" stroke="rgba(21,22,26,.15)" strokeWidth="1.5" strokeDasharray="4 4" style={{ animation: "dashmove 1s linear infinite" }} />
              ))}
            </svg>
            <i className="relative h-5 w-5 rounded-md bg-ink" />
            <span className="relative flex h-full flex-col justify-between py-1">
              {["#22c55e", "#6366f1", "#ffb020"].map((c, i) => (
                <i key={c} className="block h-4 w-4 rounded-full" style={{ background: c, animation: `seq 3s ${i}s infinite both` }} />
              ))}
            </span>
          </div>
          <Head t="Model Router" s="Best model per task." />
        </div>

        <div className={tile}>
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 animate-[spin_12s_linear_infinite]">
              {palette.slice(0, 6).map((c, i) => {
                const a = (i / 6) * Math.PI * 2;
                return <i key={c} className="absolute -ml-2 -mt-2 h-4 w-4 rounded-[5px]" style={{ background: c, left: `${50 + Math.cos(a) * 46}%`, top: `${50 + Math.sin(a) * 46}%` }} />;
              })}
            </div>
            <i className="absolute inset-[30%] rounded-full bg-ink" />
          </div>
          <Head t="Integrations" s="Plugs into your tools." />
        </div>

        <div className={tile}>
          <div>
            <svg viewBox="0 0 200 40" className="h-10 w-full">
              <path d="M0 22 H40 L50 8 L62 34 L72 22 H110 L120 10 L132 32 L142 22 H200" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="130 130" style={{ animation: "beat 2.2s linear infinite" }} />
            </svg>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted">Kill switch</span>
              <span className="relative block h-6 w-12 rounded-full bg-line">
                <i className="absolute top-[3px] h-[18px] w-[22px] rounded-full bg-accent" style={{ animation: "flip 5s ease-in-out infinite" }} />
              </span>
            </div>
          </div>
          <Head t="Observer & control" s="Health, budgets, one off switch." />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="mr-1 text-muted">Also inside:</span>
        {more.map((m, i) => (
          <span key={m} className="flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5">
            <i className="h-2 w-2 rounded-full" style={{ background: palette[i % palette.length] }} />
            {m}
          </span>
        ))}
      </div>
    </>
  );
}
