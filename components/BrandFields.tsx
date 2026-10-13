"use client";

import { useState } from "react";
import type { Brand, Palette } from "@/lib/store";
import { btnSm, input, label } from "./ui";

const swatches: (keyof Omit<Palette, "name">)[] = ["primary", "secondary", "accent"];
const tones = ["Warm and festive", "Bold and energetic", "Premium and refined", "Friendly and simple", "Professional and direct"];

// Brand guidelines form, shared by onboarding and the company profile.
// A company can keep several colour combinations; the first one is the default employees use.
export function BrandFields({ value, onChange }: { value: Brand; onChange: (b: Brand) => void }) {
  const [logoError, setLogoError] = useState("");
  const set = <K extends keyof Brand>(k: K, v: Brand[K]) => onChange({ ...value, [k]: v });
  const setPalette = (i: number, patch: Partial<Palette>) =>
    set("palettes", value.palettes.map((p, n) => (n === i ? { ...p, ...patch } : p)));

  const pickLogo = (file?: File) => {
    if (!file) return;
    if (file.size > 400 * 1024) return setLogoError("Please use a logo under 400 KB.");
    setLogoError("");
    const r = new FileReader();
    r.onload = () => set("logo", String(r.result));
    r.readAsDataURL(file);
  };

  return (
    <div className="grid gap-5">
      <div>
        <label className={label}>Tagline</label>
        <input className={input} value={value.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="e.g. Light up every corner." />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className={`${label} !mb-0`}>Colour combinations</span>
          <button
            type="button"
            className={btnSm}
            onClick={() => set("palettes", [...value.palettes, { name: `Combination ${value.palettes.length + 1}`, primary: "#1F3A93", secondary: "#F5A623", accent: "#2BB673" }])}
          >
            + Add combination
          </button>
        </div>
        <ul className="space-y-3">
          {value.palettes.map((p, i) => (
            <li key={i} className="rounded-xl border border-line bg-white p-4">
              <div className="flex items-center gap-3">
                <input
                  className="h-9 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-sm font-medium outline-none hover:border-line focus:border-ink"
                  value={p.name}
                  onChange={(e) => setPalette(i, { name: e.target.value })}
                  aria-label="Combination name"
                />
                {i === 0 ? (
                  <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] text-paper">Default</span>
                ) : (
                  <>
                    <button
                      type="button"
                      className="cursor-pointer text-xs text-muted hover:text-ink"
                      onClick={() => set("palettes", [p, ...value.palettes.filter((_, n) => n !== i)])}
                    >
                      Make default
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer text-xs text-muted hover:text-accent"
                      onClick={() => set("palettes", value.palettes.filter((_, n) => n !== i))}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {swatches.map((k) => (
                  <label key={k} className="block">
                    <span className="mb-1 block text-xs capitalize text-muted">{k}</span>
                    <span className="flex items-center gap-2">
                      <input type="color" value={p[k]} onChange={(e) => setPalette(i, { [k]: e.target.value })} className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-line bg-white p-0.5" />
                      <input className={`${input} !h-9 font-mono text-xs uppercase`} value={p[k]} onChange={(e) => setPalette(i, { [k]: e.target.value })} />
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex h-8 overflow-hidden rounded-md">
                <i className="flex-[3]" style={{ background: p.primary }} />
                <i className="flex-[2]" style={{ background: p.secondary }} />
                <i className="flex-1" style={{ background: p.accent }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className={label}>Typography (font names or style)</label>
        <input className={input} value={value.typography} onChange={(e) => set("typography", e.target.value)} placeholder="e.g. Playfair Display for headlines, Inter for body" />
      </div>

      <div>
        <label className={label}>Tone of voice</label>
        <input className={input} value={value.tone} onChange={(e) => set("tone", e.target.value)} placeholder="e.g. Warm, premium, a little playful. Never pushy." />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tones.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("tone", t)}
              className={`h-7 cursor-pointer rounded-full px-3 text-xs ${value.tone === t ? "bg-ink text-paper" : "border border-line hover:border-ink"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Always do</label>
          <textarea className={`${input} h-24 py-3`} value={value.always} onChange={(e) => set("always", e.target.value)} placeholder="e.g. Lead with craftsmanship. Use 'you'. Mention free gift-wrapping." />
        </div>
        <div>
          <label className={label}>Never do</label>
          <textarea className={`${input} h-24 py-3`} value={value.never} onChange={(e) => set("never", e.target.value)} placeholder="e.g. No discount-shouting. No emojis in headlines. Don't call products 'cheap'." />
        </div>
      </div>

      <div>
        <label className={label}>Logo (PNG, SVG or JPG — used in websites and creatives)</label>
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-white text-xs text-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {value.logo ? <img src={value.logo} alt="Logo" className="max-h-full max-w-full object-contain p-1.5" /> : "No logo"}
          </span>
          <label className={`${btnSm} !h-9`}>
            Choose file
            <input type="file" hidden accept=".png,.svg,.jpg,.jpeg,image/*" onChange={(e) => pickLogo(e.target.files?.[0])} />
          </label>
          {value.logo && (
            <button type="button" className="cursor-pointer text-xs text-muted hover:text-accent" onClick={() => set("logo", "")}>
              Remove
            </button>
          )}
        </div>
        {logoError && <p className="mt-2 text-xs text-accent">{logoError}</p>}
      </div>
    </div>
  );
}
