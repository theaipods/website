"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore, type Deliverable, type Pod, type Task } from "@/lib/store";
import { DeliverablePreview } from "./DeliverablePreview";
import { Monogram, StatusPill, btnSm, eyebrow, time } from "./ui";

export function PageHead({
  kicker,
  title,
  sub,
  children,
}: {
  kicker: string;
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className={eyebrow}>{kicker}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 max-w-xl text-muted">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function Empty({ title, sub, children }: { title: string; sub: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink/20 px-6 py-14 text-center">
      <div className="font-medium">{title}</div>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{sub}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export const progress = (p: Pod) =>
  Math.round((p.tasks.filter((t) => t.status === "Completed").length / p.tasks.length) * 100);

export function PodRow({ pod }: { pod: Pod }) {
  const pct = progress(pod);
  const running = pod.tasks.find((t) => t.status === "Running");
  return (
    <Link href={`/workspace/pods/${pod.id}`} className="group grid items-center gap-x-6 gap-y-2 border-b border-line py-4 sm:grid-cols-[1.3fr_1fr_120px]">
      <div className="min-w-0">
        <div className="font-medium group-hover:text-accent">{pod.name}</div>
        <div className="truncate text-sm text-muted">{pod.objective}</div>
      </div>
      <div className="truncate text-sm text-muted">
        {pod.paused ? "Paused" : pct === 100 ? "Objective complete" : running ? `${running.agent} is working` : "Waiting on you"}
      </div>
      <div className="flex items-center gap-2">
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-line">
          <i className="block h-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} />
        </span>
        <span className="w-9 text-right font-mono text-[11px] text-muted">{pct}%</span>
      </div>
    </Link>
  );
}

export function ApprovalRow({ pod, task }: { pod: Pod; task: Task }) {
  const { decide } = useStore();
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line py-4">
      <Monogram name={task.agent} active />
      <div className="min-w-0 flex-1 basis-56">
        <div className="text-sm font-medium">{task.title}</div>
        <div className="text-xs text-muted">
          {task.agent} · {pod.name} · customer-facing output
        </div>
      </div>
      <div className="flex gap-2">
        <button className={btnSm} onClick={() => decide(pod.id, task.id, "reject")}>Reject</button>
        <button className={btnSm} onClick={() => decide(pod.id, task.id, "changes")}>Request changes</button>
        <button className={`${btnSm} !border-ink !bg-ink !text-paper hover:!border-accent hover:!bg-accent`} onClick={() => decide(pod.id, task.id, "approve")}>
          Approve
        </button>
      </div>
    </li>
  );
}

export function TaskRow({ task }: { task: Task }) {
  return (
    <li className="flex items-center gap-3 border-b border-line py-3.5">
      <Monogram name={task.agent} active={task.status === "Running"} />
      <div className="min-w-0 flex-1">
        <div className="text-sm">{task.title}</div>
        <div className="text-xs text-muted">{task.agent}</div>
      </div>
      <StatusPill status={task.status} />
    </li>
  );
}

export function ActivityFeed({ pods, limit = 12 }: { pods: Pod[]; limit?: number }) {
  const items = pods
    .flatMap((p) => p.activity.map((a) => ({ ...a, pod: p.name })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
  if (!items.length) return <p className="text-sm text-muted">Nothing yet. Activity appears when a pod starts working.</p>;
  return (
    <ul>
      {items.map((a) => (
        <li key={a.id} className="rise flex gap-3 border-b border-line py-3 text-sm">
          <span className="w-12 shrink-0 font-mono text-[11px] leading-5 text-muted">{time(a.at)}</span>
          <span className="min-w-0">
            <b className="font-medium">{a.who}</b> <span className="text-muted">{a.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DeliverableGrid({ items }: { items: { d: Deliverable; pod: Pod }[] }) {
  const { company } = useStore();
  const [open, setOpen] = useState<{ d: Deliverable; pod: Pod } | null>(null);
  if (!company) return null;
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((x) => (
          <button key={x.d.id} onClick={() => setOpen(x)} className="rise group cursor-pointer text-left">
            <DeliverablePreview d={x.d} pod={x.pod} company={company} />
            <div className="mt-2.5 text-sm font-medium group-hover:text-accent">{x.d.title}</div>
            <div className="text-xs text-muted">
              {x.d.agent} · {time(x.d.at)}
            </div>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={() => setOpen(null)}>
          <div className="rise max-h-[92vh] w-full max-w-3xl overflow-auto rounded-2xl bg-paper p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{open.d.title}</div>
                <div className="text-xs text-muted">
                  By {open.d.agent} · {open.pod.name} · sample preview in your brand colours
                </div>
              </div>
              <button className={btnSm} onClick={() => setOpen(null)}>Close</button>
            </div>
            <DeliverablePreview d={open.d} pod={open.pod} company={company} large />
          </div>
        </div>
      )}
    </>
  );
}
