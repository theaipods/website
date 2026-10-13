"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";

const groups = [
  { label: "Build", href: "/product#lifecycle", summary: "Shape a pod around the work you need done.", points: ["AI Pods", "Orchestrator", "Workflow execution"] },
  { label: "Connect", href: "/integrations", summary: "Give the workforce approved context and tools.", points: ["Integrations & MCP", "Company knowledge"] },
  { label: "Operate", href: "/product#deliverables", summary: "Follow progress and review what the team delivers.", points: ["Deliverables & outcomes", "Documentation"] },
] as const;

export function ProductMenu({ current = false }: { current?: boolean }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onOtherMenuOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== "product") setOpen(false);
    };
    document.addEventListener("ai-pod-menu-open", onOtherMenuOpen);
    return () => {
      document.removeEventListener("ai-pod-menu-open", onOtherMenuOpen);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const openMenu = () => {
    if (timer.current) clearTimeout(timer.current);
    document.dispatchEvent(new CustomEvent("ai-pod-menu-open", { detail: "product" }));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={`pd-menu${open ? " is-open" : ""}`} ref={root}
      onMouseEnter={() => { if (matchMedia("(hover: hover)").matches) openMenu(); }}
      onMouseLeave={() => { if (matchMedia("(hover: hover)").matches) timer.current = setTimeout(() => setOpen(false), 200); }}>
      <button
        ref={trigger}
        type="button"
        className="pd-menu-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-current={current ? "page" : undefined}
        onClick={() => { if (matchMedia("(hover: hover)").matches) openMenu(); else { if (open) setOpen(false); else openMenu(); } }}
      >
        Product <ChevronDown size={13} />
      </button>
      {open && (
        <div className="pd-mega" role="group" aria-label="Product navigation">
          <div className="pd-mega-intro">
            <span>THE AI POD PLATFORM</span>
            <h2>One platform.<br />A coordinated<br />workforce.</h2>
            <p>From one business objective to specialists, connected tools, visible work and reviewed deliverables.</p>
            <Link href="/product" onClick={() => setOpen(false)}>Explore AI Pod <ArrowRight size={16} /></Link>
          </div>
          {groups.map((group, index) => (
            <Link
              href={group.href}
              className={`pd-mega-card pd-mega-card-${group.label.toLowerCase()}`}
              key={group.label}
              onClick={() => setOpen(false)}
              aria-label={`${group.label}: ${group.points.join(", ")}`}
            >
              <span className="pd-mega-card-top"><span>0{index + 1} / AI POD</span><ArrowUpRight size={18} /></span>
              <strong>{group.label}</strong>
              <span className="pd-mega-card-summary">{group.summary}</span>
              <ul>{group.points.map(point => <li key={point}>{point}</li>)}</ul>
              <span className="pd-mega-card-action">Explore {group.label.toLowerCase()} <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
