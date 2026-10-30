"use client";

// Shared investor-page number animation and founder profiles.

import { useEffect, useRef, useState } from "react";

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

// ---- the solution: objective → workforce → outcome -------------------------


// ---- the gap ---------------------------------------------------------------

// ---- our insight: the business context layer ------------------------------


// ---- why now ---------------------------------------------------------------

// ---- who it is for ---------------------------------------------------------

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
