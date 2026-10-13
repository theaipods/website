"use client";

// A 25-second motion piece. One clock (t, in seconds) drives every element on a 1600×900 stage.

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { LogoMark, Robot } from "@/components/ui";

const DUR = 25;
const W = 1600;
const H = 900;
const CX = 800;
const CY = 450;

// ---- timing helpers -------------------------------------------------------
const cl = (x: number) => Math.max(0, Math.min(1, x));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const io = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = (x: number) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 11.7) * 43758.5453;
  return x - Math.floor(x);
};
// fade in over [a,b], hold, fade out over [c,d]
const win = (t: number, a: number, b: number, c: number, d: number) => Math.min(seg(t, a, b), 1 - seg(t, c, d));
const at = (x: number, y: number, extra = ""): CSSProperties => ({
  position: "absolute",
  left: x,
  top: y,
  transform: `translate(-50%,-50%) ${extra}`,
});

// ---- cast -----------------------------------------------------------------
const OBJECTIVE = "Grow Diwali sale GMV 25% year on year — hold ad spend flat, keep returns under 8%, launch in 6 languages to 4.2M shoppers.";
const team = [
  { name: "Research Agent", color: "#ffb020", hue: 40, out: "Market brief", chips: ["5 competitors", "12 categories"] },
  { name: "Data Analyst", color: "#22c55e", hue: 140, out: "Demand forecast", chips: ["4.2M shoppers", "city tiers"] },
  { name: "Marketing Agent", color: "#06b6d4", hue: 188, out: "Campaign plan", chips: ["6 languages", "bank offers"] },
  { name: "Social Media Manager", color: "#ec4899", hue: 328, out: "40 posters", chips: ["posters", "3 channels"] },
  { name: "Frontend Developer", color: "#6366f1", hue: 238, out: "Sale page", chips: ["landing page", "A/B hero"] },
  { name: "Marketing Agent", color: "#ff5c39", hue: 14, out: "Launch plan", chips: ["launch emails", "loyalty early access"] },
].map((m, i) => {
  const a = ((-60 + i * 60) * Math.PI) / 180;
  const x = CX + Math.cos(a) * 540;
  const y = CY + Math.sin(a) * 280;
  return { ...m, i, x, y, side: x >= CX ? 1 : -1, start: 12.2 + i * 0.55 };
});
const WORK = 3.2;
const chips = team.flatMap((m) =>
  m.chips.map((label, k) => {
    const n = m.i * 2 + k;
    const a = ((n * 30 + rnd(n) * 22) * Math.PI) / 180;
    return {
      label,
      m,
      n,
      // start scattered around the objective, end stacked beside the employee
      x0: CX + Math.cos(a) * (520 + rnd(n + 40) * 90),
      y0: CY + Math.sin(a) * (300 + rnd(n + 80) * 50),
      x1: m.x - m.side * 158,
      y1: m.y + (m.y > CY ? 6 : -16) + k * 34,
    };
  }),
);
const stats = [
  [40, "posters"],
  [6, "languages"],
  [5, "emails"],
  [1, "sale page"],
  [47, "tasks done"],
  [1, "approval"],
] as const;
const captions: [number, number, string][] = [
  [3.3, 5.9, "It starts with one messy, complex objective."],
  [5.9, 7.9, "The Pod Manager reads all of it."],
  [7.9, 12, "Then breaks it down and staffs the right AI employees."],
  [12, 16.9, "Everyone works at once, handing off as they go."],
  [16.9, 19, "Anything customer-facing waits for your approval."],
  [19, 23, "Finished work. In your brand. Ready to ship."],
];

// ---- small pieces ---------------------------------------------------------
function MiniDeliverable({ i, color }: { i: number; color: string }) {
  const bar = (w: string, o = 0.25) => <i style={{ display: "block", height: 5, width: w, borderRadius: 3, background: `rgba(255,255,255,${o})`, marginTop: 5 }} />;
  const base: CSSProperties = { width: 110, height: 76, borderRadius: 10, overflow: "hidden", boxShadow: `0 10px 30px -8px ${color}`, border: "1px solid rgba(255,255,255,.18)" };
  if (i === 3)
    return (
      <div style={{ ...base, background: `linear-gradient(135deg, ${color}, #ffb020)`, padding: 9 }}>
        <div style={{ fontSize: 7, letterSpacing: 2, opacity: 0.85 }}>FLIPKART</div>
        <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1, marginTop: 6 }}>DIWALI<br />SALE</div>
        <span style={{ display: "inline-block", marginTop: 6, fontSize: 6, fontWeight: 700, background: "#fff", color: "#111", borderRadius: 9, padding: "2px 6px" }}>LIVE NOW</span>
      </div>
    );
  if (i === 4)
    return (
      <div style={{ ...base, background: "#fff" }}>
        <div style={{ height: 11, background: "#e9e9ef", display: "flex", gap: 3, alignItems: "center", paddingLeft: 5 }}>
          {[0, 1, 2].map((d) => <i key={d} style={{ width: 4, height: 4, borderRadius: 4, background: "#bbb" }} />)}
        </div>
        <div style={{ height: 36, background: `linear-gradient(120deg, ${color}, #06b6d4)` }} />
        <div style={{ display: "flex", gap: 4, padding: 5 }}>
          {[0, 1, 2, 3].map((d) => <i key={d} style={{ flex: 1, height: 18, borderRadius: 3, background: "#ececf2" }} />)}
        </div>
      </div>
    );
  if (i === 1)
    return (
      <div style={{ ...base, background: "#12131c", padding: 9, display: "flex", alignItems: "flex-end", gap: 5 }}>
        {[30, 48, 38, 60, 44, 70].map((h, d) => <i key={d} style={{ flex: 1, height: `${h}%`, borderRadius: 3, background: d % 2 ? color : "#06b6d4" }} />)}
      </div>
    );
  if (i === 5)
    return (
      <div style={{ ...base, background: "#fff", color: "#111" }}>
        <div style={{ background: color, color: "#fff", fontSize: 7, fontWeight: 700, letterSpacing: 2, textAlign: "center", padding: "6px 0" }}>EARLY ACCESS</div>
        <div style={{ padding: 8 }}>
          {[80, 100, 60].map((w, d) => <i key={d} style={{ display: "block", height: 5, width: `${w}%`, borderRadius: 3, background: "#e4e4ec", marginTop: d ? 5 : 0 }} />)}
          <i style={{ display: "block", height: 9, width: 38, borderRadius: 9, background: color, marginTop: 7 }} />
        </div>
      </div>
    );
  return (
    <div style={{ ...base, background: `linear-gradient(160deg, #1b1c29, #12131c)`, padding: 10 }}>
      <i style={{ display: "block", height: 7, width: "55%", borderRadius: 3, background: color }} />
      {bar("100%")}
      {bar("85%")}
      {bar("92%")}
      {bar("60%")}
    </div>
  );
}

function Pod({ t, scale = 1 }: { t: number; scale?: number }) {
  // The pod "looks" left and right while scanning (6–7.6s), then idles.
  const look = t > 5.9 && t < 7.7 ? Math.sin((t - 5.9) * 4.2) * 15 : Math.sin(t * 1.3) * 4;
  const blink = Math.sin(t * 2.1) > 0.96 ? 0.15 : 1;
  return (
    <div style={{ width: 170, height: 170, transform: `scale(${scale})`, position: "relative" }}>
      <div style={{ position: "absolute", inset: -26, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,92,57,.45), transparent 65%)", filter: "blur(8px)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(#ff5c39,#ffb020,#22c55e,#06b6d4,#6366f1,#ec4899,#ff5c39)", transform: `rotate(${t * 70}deg)` }} />
      <div style={{ position: "absolute", inset: 9, borderRadius: "50%", background: "radial-gradient(circle at 32% 26%, #4a4d63, #14151f 62%, #07070c)" }} />
      <div style={{ position: "absolute", left: 26, top: 22, width: 60, height: 24, borderRadius: "50%", background: "rgba(255,255,255,.22)", transform: "rotate(-24deg)", filter: "blur(2px)" }} />
      <div style={{ position: "absolute", left: 36, right: 36, top: 62, height: 46, borderRadius: 23, background: "#05050a", boxShadow: "inset 0 2px 8px #000" }}>
        {[0, 1].map((e) => (
          <i
            key={e}
            style={{
              position: "absolute",
              top: 13,
              left: 20 + e * 40 + look,
              width: 18,
              height: 20,
              borderRadius: 9,
              background: "#7df9ff",
              boxShadow: "0 0 16px #7df9ff",
              transform: `scaleY(${blink})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---- sound: synthesised music + spoken narration (no audio files) -------------
const NARRATION: [number, string][] = [
  [0.4, "Meet TheAI Pods."],
  [3.4, "It starts with one complex objective."],
  [6.0, "The Pod Manager reads all of it,"],
  [8.3, "breaks it down, and staffs the right AI employees."],
  [12.3, "Everyone works at once, handing off as they go."],
  [16.9, "Anything customer facing waits for your approval."],
  [20.1, "Objective complete. Finished work, in your brand."],
  [23.3, "TheAI Pods. Build your AI workforce."],
];
const BAR = 2.4;
const CHORDS = [
  [53, 57, 60, 64],
  [55, 59, 62, 67],
  [57, 60, 64, 67],
  [52, 55, 60, 64],
];
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// Schedules the whole 25s score from `offset` on the audio clock. Returns a stop function.
function scheduleMusic(ctx: AudioContext, offset: number) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  const when = (x: number) => ctx.currentTime + 0.06 + Math.max(0, x - offset);
  master.gain.setValueAtTime(0.9, when(24));
  master.gain.linearRampToValueAtTime(0, when(25));
  const pad = ctx.createBiquadFilter();
  pad.type = "lowpass";
  pad.frequency.value = 1200;
  pad.connect(master);
  const sources: AudioScheduledSourceNode[] = [];

  const tone = (type: OscillatorType, f: number, t0: number, dur: number, vol: number, att: number, dest: AudioNode, detune = 0) => {
    if (t0 + dur <= offset + 0.05) return;
    const a = when(t0);
    const e = when(t0 + dur);
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, a);
    g.gain.linearRampToValueAtTime(vol, Math.min(a + att, e));
    g.gain.linearRampToValueAtTime(0, e);
    o.connect(g).connect(dest);
    o.start(a);
    o.stop(e + 0.05);
    sources.push(o);
  };
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = (t0: number, dur: number, vol: number, type: BiquadFilterType, f0: number, f1: number) => {
    if (t0 < offset) return;
    const a = when(t0);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(f0, a);
    f.frequency.exponentialRampToValueAtTime(f1, a + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, a);
    g.gain.exponentialRampToValueAtTime(0.0001, a + dur);
    src.connect(f).connect(g).connect(master);
    src.start(a);
    src.stop(a + dur + 0.05);
    sources.push(src);
  };

  for (let bar = 0; bar * BAR < 23.4; bar++) {
    const t0 = bar * BAR;
    const dur = Math.min(BAR, 23.4 - t0);
    const ch = CHORDS[bar % 4];
    ch.forEach((m) => {
      tone("sawtooth", hz(m), t0, dur + 0.25, 0.03, 0.5, pad, -7);
      tone("sawtooth", hz(m), t0, dur + 0.25, 0.03, 0.5, pad, 7);
    });
    if (t0 >= 2.4) tone("sine", hz(ch[0] - 12), t0, dur, 0.16, 0.05, master);
    for (let k = 0; k < 8; k++) {
      const at = t0 + k * 0.3;
      if (at >= 3.3 && at < 23.2) tone("triangle", hz(ch[[0, 2, 1, 3, 2, 3, 1, 2][k]] + 12), at, 0.26, 0.055, 0.01, master);
    }
  }
  // closing chord
  [48, 55, 60, 64, 67, 72].forEach((m) => tone("sawtooth", hz(m), 23.4, 1.6, 0.035, 0.3, pad));
  tone("sine", hz(36), 23.4, 1.6, 0.18, 0.05, master);
  // drums join when the team assembles
  for (let b = 8.4; b < 23.3; b += 0.6) {
    if (b >= offset) {
      const a = when(b);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(150, a);
      o.frequency.exponentialRampToValueAtTime(42, a + 0.16);
      g.gain.setValueAtTime(0.3, a);
      g.gain.exponentialRampToValueAtTime(0.0001, a + 0.26);
      o.connect(g).connect(master);
      o.start(a);
      o.stop(a + 0.3);
      sources.push(o);
    }
    if (b >= 12) noise(b + 0.3, 0.06, 0.05, "highpass", 7000, 9000);
  }
  noise(7.75, 0.8, 0.1, "bandpass", 300, 5000); // riser into the breakdown
  noise(8.55, 1.3, 0.22, "lowpass", 5000, 180); // impact
  noise(19.4, 0.75, 0.1, "bandpass", 300, 6000);
  noise(20.15, 1.5, 0.24, "lowpass", 7000, 200);

  return () => {
    sources.forEach((n) => {
      try {
        n.stop();
      } catch {}
    });
    master.disconnect();
  };
}

function femaleVoice() {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  const pick = (re: RegExp) => voices.find((v) => re.test(v.name));
  return (
    pick(/aria|jenny|sonia|libby|natasha|neerja|michelle|emma|ava/i) ||
    pick(/female|zira|samantha|hazel|susan|heera|karen|moira|tessa/i) ||
    pick(/google (uk|us) english/i) ||
    voices[0]
  );
}

// ---- the reel -------------------------------------------------------------
export function Showreel({ embedded = false }: { embedded?: boolean }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(!embedded);
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [sound, setSound] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const clock = useRef({ t: 0, last: 0 });
  const audio = useRef<{ ctx: AudioContext | null; stop: (() => void) | null; spoken: Set<number>; live: boolean }>({
    ctx: null,
    stop: null,
    spoken: new Set(),
    live: false,
  });
  const auto = useRef({ started: false, pausedByScroll: false });

  useEffect(() => setMounted(true), []);

  // Fit the 1600×900 stage to whatever box we are in.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / W, el.clientHeight / H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted]);

  // Embedded: start when scrolled into view, pause when scrolled away.
  useEffect(() => {
    const el = root.current;
    if (!embedded || !el) return;
    const io2 = new IntersectionObserver(
      ([e]) => {
        const a = auto.current;
        if (e.intersectionRatio >= 0.6) {
          if (!a.started || a.pausedByScroll) {
            a.started = true;
            a.pausedByScroll = false;
            if (clock.current.t < DUR) setPlaying(true);
          }
        } else if (e.intersectionRatio < 0.25) {
          setPlaying((p) => {
            if (p) a.pausedByScroll = true;
            return false;
          });
        }
      },
      { threshold: [0, 0.25, 0.6, 1] },
    );
    io2.observe(el);
    return () => io2.disconnect();
  }, [embedded, mounted]);

  // Browsers only allow sound after the visitor has interacted with the page.
  useEffect(() => {
    const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
    if (nav.userActivation?.hasBeenActive) setUnlocked(true);
    const unlock = () => setUnlocked(true);
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Start, stop or re-sync music and narration whenever play state changes or we seek.
  useEffect(() => {
    const a = audio.current;
    a.stop?.();
    a.stop = null;
    window.speechSynthesis?.cancel();
    a.live = playing && sound && unlocked;
    if (!a.live) {
      a.ctx?.suspend();
      return;
    }
    const now = clock.current.t;
    a.spoken = new Set(NARRATION.map((_, i) => i).filter((i) => NARRATION[i][0] < now - 0.4));
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      a.ctx = a.ctx ?? new Ctx();
      a.ctx.resume();
      a.stop = scheduleMusic(a.ctx, now);
    } catch {}
  }, [playing, sound, unlocked, epoch]);

  useEffect(
    () => () => {
      audio.current.stop?.();
      audio.current.ctx?.close();
      window.speechSynthesis?.cancel();
    },
    [],
  );

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    clock.current.last = performance.now();
    const loop = (now: number) => {
      const c = clock.current;
      c.t = Math.min(DUR, c.t + (now - c.last) / 1000);
      c.last = now;
      const a = audio.current;
      if (a.live && window.speechSynthesis) {
        NARRATION.forEach(([start, line], i) => {
          if (a.spoken.has(i) || c.t < start || c.t > start + 1) return;
          a.spoken.add(i);
          const u = new SpeechSynthesisUtterance(line);
          const v = femaleVoice();
          if (v) u.voice = v;
          u.rate = 1.04;
          u.pitch = 1.08;
          window.speechSynthesis.speak(u);
        });
      }
      setT(c.t);
      if (c.t >= DUR) setPlaying(false);
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const seek = (v: number) => {
    clock.current.t = v;
    setT(v);
    setEpoch((e) => e + 1);
  };
  const toggle = () => {
    if (t >= DUR) seek(0);
    setPlaying((p) => (t >= DUR ? true : !p));
  };

  useEffect(() => {
    if (embedded) return;
    const key = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const frame = embedded
    ? "relative aspect-video w-full overflow-hidden rounded-3xl bg-[#07070d] text-white select-none"
    : "fixed inset-0 overflow-hidden bg-[#07070d] text-white select-none";

  // ---- pod path: drops in, sits on the objective, moves to centre, then rises
  const drop = back(seg(t, 5.1, 6));
  const toCentre = io(seg(t, 7.8, 8.7));
  const rise = io(seg(t, 19, 20));
  const podY = lerp(lerp(lerp(-140, 262, drop), CY, toCentre), 78, rise);
  const podScale = lerp(lerp(1, 1.12, toCentre), 0.42, rise) * (1 + 0.03 * Math.sin(t * 6));
  const podOp = seg(t, 5.05, 5.3) * (1 - seg(t, 22.8, 23.3));

  const typed = OBJECTIVE.slice(0, Math.floor(OBJECTIVE.length * seg(t, 3.5, 5.7)));
  const collapse = io(seg(t, 7.6, 8.35));
  const scanX = lerp(370, 1230, io(seg(t, 6, 7.5)));
  const done = Math.floor(47 * out3(seg(t, 12.2, 18.6)));
  const approveClick = t > 18.05;
  const cur = io(seg(t, 17.3, 18));
  const s5 = seg(t, 19, 20.4);
  const outro = seg(t, 23.1, 23.9);

  // Positions are computed floats; render on the client only so server and client markup cannot differ.
  if (!mounted) return <div ref={root} className={frame} />;

  return (
    <div ref={root} className={frame}>
      {/* colour wash */}
      {[
        ["#ff5c39", 18, 22, 1],
        ["#6366f1", 78, 30, 2],
        ["#ec4899", 62, 82, 3],
        ["#06b6d4", 22, 78, 4],
        ["#ffb020", 50, 50, 5],
      ].map(([c, x, y, k]) => (
        <div
          key={k as number}
          className="absolute rounded-full"
          style={{
            width: "52%",
            aspectRatio: "1",
            left: `${(x as number) + Math.sin(t * 0.35 + (k as number) * 1.7) * 9}%`,
            top: `${(y as number) + Math.cos(t * 0.28 + (k as number) * 2.3) * 9}%`,
            transform: `translate(-50%,-50%) scale(${0.8 + 0.25 * Math.sin(t * 0.5 + (k as number))})`,
            background: c as string,
            opacity: 0.2 + 0.12 * seg(t, 19.6, 20.6) * (1 - seg(t, 22.6, 23.4)),
            filter: "blur(110px)",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          width: W,
          height: H,
          left: "50%",
          top: "50%",
          transform: `translate(-50%,-50%) scale(${scale})`,
        }}
      >
        {/* drifting dust */}
        {Array.from({ length: 54 }, (_, i) => (
          <i
            key={i}
            style={{
              position: "absolute",
              left: (rnd(i) * W + t * (8 + rnd(i + 9) * 22)) % W,
              top: (rnd(i + 3) * H + Math.sin(t * 0.6 + i) * 14 + H) % H,
              width: 2 + rnd(i + 5) * 3,
              height: 2 + rnd(i + 5) * 3,
              borderRadius: 9,
              background: team[i % 6].color,
              opacity: cl(0.25 + 0.3 * Math.sin(t * 1.5 + i)),
            }}
          />
        ))}

        {/* ── 0–3.3s  title ─────────────────────────────────────────────── */}
        {t < 3.5 && (
          <div style={{ ...at(CX, CY, `scale(${1 + io(seg(t, 2.7, 3.4)) * 0.6})`), opacity: 1 - seg(t, 2.8, 3.3), textAlign: "center", whiteSpace: "nowrap" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 34 }}>
              {[0, 1, 2, 3].map((k) => {
                const p = back(seg(t, 0.1 + k * 0.09, 0.75 + k * 0.09));
                const dir = [[-1, -1], [1, -1], [-1, 1], [1, 1]][k];
                return (
                  <i
                    key={k}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: team[(k * 2 + 5) % 6].color,
                      transform: `translate(${dir[0] * (1 - p) * 500}px, ${dir[1] * (1 - p) * 320}px) rotate(${(1 - p) * 220}deg)`,
                      opacity: cl(p * 2),
                      boxShadow: `0 0 40px ${team[(k * 2 + 5) % 6].color}`,
                    }}
                  />
                );
              })}
            </div>
            <div style={{ fontSize: 158, fontWeight: 800, letterSpacing: -6, lineHeight: 1 }}>
              {"THE AI PODS".split("").map((ch, k) => {
                const p = back(seg(t, 0.45 + k * 0.09, 1.15 + k * 0.09));
                return (
                  <span
                    key={k}
                    style={{
                      display: "inline-block",
                      minWidth: ch === " " ? 44 : undefined,
                      transform: `translateY(${(1 - p) * 180}px) rotate(${(1 - p) * (k % 2 ? 14 : -14)}deg)`,
                      opacity: cl(p * 1.5),
                      background: `linear-gradient(180deg, #fff 30%, ${team[k % 6].color})`,
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
            <div style={{ marginTop: 26, fontSize: 34, letterSpacing: 1, opacity: seg(t, 1.5, 2.1), transform: `translateY(${(1 - out3(seg(t, 1.5, 2.2))) * 24}px)` }}>
              One objective. <b style={{ color: "#ffb020" }}>A whole workforce.</b>
            </div>
          </div>
        )}

        {/* ── 3.3–8.4s  the objective ───────────────────────────────────── */}
        {t > 3.2 && t < 8.5 && (
          <div
            style={{
              ...at(CX, lerp(CY, 262, collapse), `scale(${out3(seg(t, 3.25, 3.8)) * (1 - collapse)}) rotate(${collapse * -8}deg)`),
              width: 880,
              padding: "34px 40px",
              borderRadius: 26,
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.18)",
              backdropFilter: "blur(14px)",
              opacity: 1 - seg(t, 8, 8.35),
              overflow: "hidden",
            }}
          >
            <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 15, letterSpacing: 4, color: "#ffb020" }}>THE OBJECTIVE</div>
            <div style={{ marginTop: 14, fontSize: 38, fontWeight: 600, lineHeight: 1.22, minHeight: 186 }}>
              {typed}
              {t < 5.9 && <span style={{ opacity: Math.sin(t * 14) > 0 ? 1 : 0, color: "#ff5c39" }}>▍</span>}
            </div>
            {t > 6 && t < 7.55 && (
              <i
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: scanX - 360,
                  width: 90,
                  background: "linear-gradient(90deg, transparent, rgba(125,249,255,.55), transparent)",
                  boxShadow: "0 0 50px rgba(125,249,255,.6)",
                }}
              />
            )}
          </div>
        )}

        {/* connections from the pod to each employee */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, 19, 19.6) }}>
          {team.map((m) => {
            const len = Math.hypot(m.x - CX, m.y - CY);
            const p = out3(seg(t, 8.7 + m.i * 0.22, 9.4 + m.i * 0.22));
            return (
              <line
                key={m.i}
                x1={CX}
                y1={CY}
                x2={m.x}
                y2={m.y}
                stroke={m.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={`${len}`}
                strokeDashoffset={len * (1 - p)}
                opacity={0.55}
              />
            );
          })}
          {/* shockwave when the pod lands in the centre */}
          {[0, 0.25].map((d) => {
            const p = seg(t, 8.55 + d, 9.9 + d);
            return p > 0 && p < 1 ? <circle key={d} cx={CX} cy={CY} r={80 + out3(p) * 720} fill="none" stroke="#fff" strokeWidth={3} opacity={(1 - p) * 0.5} /> : null;
          })}
          {/* work going out, results coming back */}
          {team.map((m) =>
            [0, 1, 2, 3].map((k) => {
              const outP = seg(t, m.start - 0.7 + k * 0.12, m.start + k * 0.12);
              const backP = seg(t, m.start + WORK + k * 0.12, m.start + WORK + 0.7 + k * 0.12);
              const p = outP > 0 && outP < 1 ? io(outP) : backP > 0 && backP < 1 ? 1 - io(backP) : -1;
              return p < 0 ? null : <circle key={`${m.i}${k}`} cx={lerp(CX, m.x, p)} cy={lerp(CY, m.y, p)} r={7 - k} fill={m.color} opacity={1 - k * 0.2} />;
            }),
          )}
        </svg>

        {/* fragments of the objective → task chips */}
        {t > 3.5 && t < 19.8 &&
          chips.map((c) => {
            const show = back(seg(t, 3.7 + c.n * 0.15, 4.2 + c.n * 0.15));
            const fly = io(seg(t, 8.9 + c.m.i * 0.22 + (c.n % 2) * 0.12, 10.1 + c.m.i * 0.22 + (c.n % 2) * 0.12));
            const wob = 1 - fly;
            const x = lerp(c.x0, c.x1, fly) + Math.sin(t * 2.3 + c.n * 1.9) * 16 * wob;
            const y = lerp(c.y0, c.y1, fly) + Math.cos(t * 1.9 + c.n * 2.7) * 14 * wob - Math.sin(fly * Math.PI) * 90;
            const finished = t > c.m.start + WORK;
            return (
              <span
                key={c.n}
                style={{
                  ...at(x, y, `scale(${show}) rotate(${wob * (rnd(c.n) * 30 - 15)}deg)`),
                  whiteSpace: "nowrap",
                  fontSize: 19,
                  fontWeight: 600,
                  padding: "6px 15px",
                  borderRadius: 30,
                  background: finished ? c.m.color : "#14151f",
                  color: finished ? "#0b0b12" : "#fff",
                  border: `2px solid ${fly > 0.05 ? c.m.color : "rgba(255,255,255,.35)"}`,
                  opacity: 1 - seg(t, 19, 19.6),
                  boxShadow: fly > 0.05 ? `0 0 22px -4px ${c.m.color}` : "none",
                }}
              >
                {finished ? "✓ " : ""}
                {c.label}
              </span>
            );
          })}

        {/* the AI employees */}
        {t > 8.8 && t < 20 &&
          team.map((m) => {
            const pop = back(seg(t, 9 + m.i * 0.22, 9.6 + m.i * 0.22));
            const prog = seg(t, m.start, m.start + WORK);
            const working = prog > 0 && prog < 1;
            const r = 62;
            const circ = 2 * Math.PI * r;
            return (
              <div key={m.i} style={{ ...at(m.x, m.y, `scale(${pop * (1 - seg(t, 19.2, 19.9))})`), width: 0, height: 0 }}>
                <div style={{ ...at(0, 0), width: 150, height: 150, borderRadius: "50%", background: `radial-gradient(circle, ${m.color}55, transparent 68%)`, opacity: working ? 0.7 + 0.3 * Math.sin(t * 9) : 0.5 }} />
                <div style={{ ...at(0, working ? Math.sin(t * 11 + m.i) * 3 : 0), width: 108, height: 108, borderRadius: "50%", background: "#11121b", border: "1px solid rgba(255,255,255,.14)", display: "grid", placeItems: "center" }}>
                  <Robot name={m.name} hue={m.hue} className="h-[84px] w-[84px]" />
                </div>
                <svg width={150} height={150} style={{ ...at(0, 0, "rotate(-90deg)") }}>
                  <circle cx={75} cy={75} r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={6} />
                  <circle cx={75} cy={75} r={r} fill="none" stroke={m.color} strokeWidth={6} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)} />
                </svg>
                <div style={{ ...at(0, 92), whiteSpace: "nowrap", fontSize: 21, fontWeight: 700 }}>{m.name}</div>
                <div style={{ ...at(0, 119), whiteSpace: "nowrap", fontFamily: "var(--font-geist-mono)", fontSize: 14, color: prog >= 1 ? m.color : "rgba(255,255,255,.6)" }}>
                  {prog >= 1 ? "✓ DELIVERED" : working ? `WORKING ${Math.round(prog * 100)}%` : "ASSIGNED"}
                </div>
              </div>
            );
          })}

        {/* deliverables: pop beside each employee, then assemble into a wall */}
        {t > 15 && t < 23.4 &&
          team.map((m) => {
            const pop = back(seg(t, m.start + WORK, m.start + WORK + 0.5));
            const fly = io(seg(t, 19.1 + m.i * 0.13, 20.3 + m.i * 0.13));
            const gx = CX + ((m.i % 3) - 1) * 300;
            const gy = 356 + Math.floor(m.i / 3) * 238;
            const x = lerp(m.x + m.side * 148, gx, fly);
            const y = lerp(m.y - 6, gy, fly) - Math.sin(fly * Math.PI) * 70;
            return (
              <div key={m.i} style={{ ...at(x, y, `scale(${pop * lerp(1, 2.35, fly)}) rotate(${(1 - fly) * m.side * 5}deg)`), opacity: 1 - seg(t, 22.8, 23.3) }}>
                <MiniDeliverable i={m.i} color={m.color} />
                <div style={{ marginTop: 5, fontSize: 8, fontWeight: 600, textAlign: "center", opacity: fly, whiteSpace: "nowrap" }}>
                  {m.out} <span style={{ opacity: 0.55 }}>· {m.name}</span>
                </div>
              </div>
            );
          })}

        {/* counter */}
        {t > 11.8 && t < 19.6 && (
          <div style={{ ...at(CX, 62), opacity: win(t, 11.9, 12.4, 19, 19.5), textAlign: "center", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 15, letterSpacing: 4, color: "rgba(255,255,255,.6)" }}>TASKS COMPLETED</span>
            <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {done}
              <span style={{ fontSize: 26, opacity: 0.45 }}> / 47</span>
            </div>
          </div>
        )}

        {/* approval moment */}
        {t > 16.8 && t < 19.4 && (
          <div
            style={{
              ...at(CX, 604, `scale(${back(seg(t, 16.9, 17.4)) * (1 - seg(t, 18.9, 19.3))})`),
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "14px 16px 14px 24px",
              borderRadius: 60,
              background: "#fff",
              color: "#111",
              whiteSpace: "nowrap",
              zIndex: 7,
              boxShadow: "0 24px 70px -18px #ec4899",
            }}
          >
            <span style={{ fontSize: 20 }}>
              <b>Approval needed</b> · publish 40 posters
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                padding: "9px 22px",
                borderRadius: 40,
                color: "#fff",
                background: approveClick ? "#22c55e" : "#111",
                transform: `scale(${approveClick && t < 18.25 ? 0.9 : 1})`,
              }}
            >
              {approveClick ? "✓ Approved" : "Approve"}
            </span>
            <svg width="30" height="30" viewBox="0 0 24 24" style={{ position: "absolute", left: lerp(520, 372, cur), top: lerp(150, 34, cur), opacity: 1 - seg(t, 18.5, 18.8) }}>
              <path d="M4 2l15 9-6.5 1.5L9 19z" fill="#111" stroke="#fff" strokeWidth="1.5" />
            </svg>
          </div>
        )}

        {/* ── 19–23s  objective complete ────────────────────────────────── */}
        {t > 19.6 && t < 23.4 && (
          <>
            <div style={{ ...at(CX, 178, `scale(${back(seg(t, 19.9, 20.6))})`), opacity: 1 - seg(t, 22.8, 23.3), whiteSpace: "nowrap", fontSize: 84, fontWeight: 800, letterSpacing: -3 }}>
              <span style={{ background: "linear-gradient(90deg,#ffb020,#ff5c39,#ec4899,#6366f1,#06b6d4,#22c55e)", WebkitBackgroundClip: "text", color: "transparent" }}>Objective complete.</span>
            </div>
            <div style={{ ...at(CX, 782), display: "flex", gap: 54, opacity: 1 - seg(t, 22.8, 23.3), whiteSpace: "nowrap" }}>
              {stats.map(([n, l], k) => {
                const p = out3(seg(t, 20.5 + k * 0.12, 21.5 + k * 0.12));
                return (
                  <div key={l} style={{ textAlign: "center", opacity: cl(p * 2), transform: `translateY(${(1 - p) * 30}px)` }}>
                    <div style={{ fontSize: 50, fontWeight: 800, color: team[k].color, fontVariantNumeric: "tabular-nums" }}>{Math.round(n * p)}</div>
                    <div style={{ fontSize: 17, opacity: 0.7 }}>{l}</div>
                  </div>
                );
              })}
            </div>
            {Array.from({ length: 90 }, (_, k) => {
              const tau = t - 20.15;
              if (tau < 0 || tau > 2.6) return null;
              const a = rnd(k) * Math.PI * 2;
              const v = 380 + rnd(k + 20) * 760;
              return (
                <i
                  key={k}
                  style={{
                    position: "absolute",
                    left: CX + Math.cos(a) * v * tau * (1 - tau * 0.16),
                    top: 300 + Math.sin(a) * v * tau * 0.8 + 520 * tau * tau,
                    width: 10 + rnd(k + 7) * 10,
                    height: 7 + rnd(k + 8) * 6,
                    borderRadius: k % 3 ? 2 : 9,
                    background: team[k % 6].color,
                    transform: `rotate(${tau * (300 + rnd(k) * 600)}deg)`,
                    opacity: 1 - seg(tau, 1.7, 2.6),
                  }}
                />
              );
            })}
          </>
        )}

        {/* the pod itself */}
        {podOp > 0 && (
          <div style={{ ...at(CX, podY), opacity: podOp, zIndex: 5 }}>
            <Pod t={t} scale={podScale} />
          </div>
        )}
        {t > 8.6 && t < 19.2 && (
          <div style={{ ...at(CX, CY + 122), opacity: win(t, 8.8, 9.3, 16.6, 16.9), fontSize: 20, fontWeight: 700, whiteSpace: "nowrap" }}>Pod Manager</div>
        )}

        {/* captions */}
        {captions.map(([a, b, text]) => {
          const o = win(t, a, a + 0.45, b - 0.35, b);
          return o <= 0 ? null : (
            <div key={a} style={{ ...at(CX, 858, `translateY(${(1 - out3(seg(t, a, a + 0.5))) * 18}px)`), opacity: o, fontSize: 27, whiteSpace: "nowrap", color: "rgba(255,255,255,.85)" }}>
              {text}
            </div>
          );
        })}

        {/* ── 23–25s  outro ─────────────────────────────────────────────── */}
        {outro > 0 && (
          <div style={{ ...at(CX, CY, `scale(${lerp(0.9, 1, out3(outro))})`), opacity: outro, textAlign: "center", whiteSpace: "nowrap", zIndex: 6 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 18, fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>
              <LogoMark className="h-[84px] w-[96px]" />
              <span>
                The<span style={{ background: "linear-gradient(90deg,#6d5cf6,#a78bfa)", WebkitBackgroundClip: "text", color: "transparent" }}>AI</span>Pods
              </span>
            </div>
            <div style={{ marginTop: 30, fontSize: 104, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
              Build your{" "}
              <span style={{ background: "linear-gradient(90deg,#ffb020,#ff5c39,#ec4899,#6366f1)", WebkitBackgroundClip: "text", color: "transparent" }}>AI workforce.</span>
            </div>
            <div style={{ marginTop: 22, fontSize: 28, opacity: 0.75 }}>TheAI Pods — teams of AI employees that plan, collaborate and deliver.</div>
            <div style={{ marginTop: 40, display: "flex", gap: 16, justifyContent: "center", opacity: seg(t, 24, 24.6), pointerEvents: t > 24 ? "auto" : "none" }}>
              <Link href="/login" style={{ fontSize: 22, fontWeight: 700, padding: "16px 36px", borderRadius: 60, background: "#ff5c39", color: "#fff" }}>
                Build your pod
              </Link>
              <button onClick={() => { seek(0); setPlaying(true); }} style={{ cursor: "pointer", fontSize: 22, fontWeight: 600, padding: "16px 36px", borderRadius: 60, border: "2px solid rgba(255,255,255,.4)" }}>
                ↻ Replay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* chrome */}
      <div className="absolute left-5 top-4 z-10 flex items-center gap-4 font-mono text-[11px] tracking-widest text-white/60">
        {embedded ? <span>THE AI PODS</span> : <Link href="/" className="hover:text-white">← THE AI PODS</Link>}
        <span>SHOWREEL</span>
      </div>
      <div className="absolute right-5 top-4 z-10 flex items-center gap-3 font-mono text-[11px] tracking-widest text-white/60">
        {sound && !unlocked && <span className="pulse-dot rounded-full bg-white/15 px-3 py-1 text-white">CLICK ANYWHERE FOR SOUND</span>}
        <button onClick={() => setSound(!sound)} className="cursor-pointer hover:text-white" aria-label="Toggle sound">
          SOUND {sound ? "ON" : "OFF"}
        </button>
        {embedded && <Link href="/showreel" className="hover:text-white">FULLSCREEN ↗</Link>}
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-4 px-5 pb-4 font-mono text-[11px] text-white/60">
        <button onClick={toggle} className="w-14 cursor-pointer text-left hover:text-white" aria-label={playing ? "Pause" : "Play"}>
          {t >= DUR ? "REPLAY" : playing ? "PAUSE" : "PLAY"}
        </button>
        <input
          type="range"
          min={0}
          max={DUR}
          step={0.01}
          value={t}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer accent-[#ff5c39]"
          aria-label="Timeline"
        />
        <span className="w-20 text-right tabular-nums">
          {t.toFixed(1)}s / {DUR}s
        </span>
      </div>
    </div>
  );
}
