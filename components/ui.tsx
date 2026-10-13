import Link from "next/link";
import Image from "next/image";
import type { TaskStatus } from "@/lib/store";
import { characterAssetForEmployee, characterAssetForRole, employeeCharacterSpecs, workerRoleForEmployee } from "@/lib/employee-presentation";
import { siteBrand } from "@/lib/site-brand";

export const btn =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer";
export const btnPrimary = `${btn} bg-ink text-paper hover:bg-accent`;
export const btnAccent = `${btn} bg-accent text-paper hover:bg-ink`;
export const btnGhost = `${btn} border border-line hover:border-ink`;
export const btnSm =
  "inline-flex h-8 items-center justify-center rounded-full border border-line px-3 text-xs font-medium hover:border-ink transition-colors cursor-pointer disabled:opacity-40";
export const input =
  "w-full rounded-lg border border-line bg-white px-3.5 h-11 text-sm outline-none focus:border-ink placeholder:text-muted/70";
export const label = "mb-1.5 block text-xs font-medium text-muted";
export const eyebrow = "font-mono text-[11px] uppercase tracking-[0.14em] text-muted";

export function LogoMark({ className = "h-7 w-8" }: { className?: string }) {
  return <Image src={siteBrand.logo} alt="" aria-hidden width={347} height={58} className={className} style={{ objectFit: "contain" }} />;
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center" aria-label={siteBrand.name}>
      <Image src={siteBrand.logo} width={347} height={58} alt={siteBrand.name} className="h-9 w-auto object-contain" />
    </Link>
  );
}

export const palette = ["#ff5c39", "#ffb020", "#22c55e", "#06b6d4", "#6366f1", "#ec4899", "#a855f7", "#14b8a6"];

// Compact views use the same original creature source as employee profiles.
export function Robot({ name, className = "h-8 w-8" }: { name: string; hue?: number; className?: string }) {
  const normalized = (name || "employee").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const exactId = Object.keys(employeeCharacterSpecs).find(id => id === normalized || id.endsWith("-" + normalized));
  const role = workerRoleForEmployee({ id: exactId || normalized, name, role: name, category: "" });
  const character = exactId
    ? characterAssetForEmployee({ id: exactId, name, role: name, category: "" })
    : characterAssetForRole(role);
  return <Image unoptimized src={character.thumbnailPath} alt="" aria-hidden width={128} height={128}
    className={className + " object-contain drop-shadow-[0_3px_9px_rgba(41,58,92,.18)]"} />;
}

export function Monogram({ name, active }: { name: string; active?: boolean }) {
  return (
    <span
      title={name}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border bg-white ${
        active ? "border-accent ring-2 ring-accent/25" : "border-line"
      }`}
    >
      <Robot name={name} />
    </span>
  );
}


export function StatusPill({ status }: { status: TaskStatus | string }) {
  const style =
    status === "Running"
      ? "bg-accent text-paper"
      : status === "Needs approval"
        ? "border border-accent text-accent"
        : status === "Completed"
          ? "bg-ink text-paper"
          : status === "Rejected"
            ? "border border-line text-muted line-through"
            : "border border-line text-muted";
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[11px] font-medium ${style}`}
    >
      {status === "Running" && <i className="pulse-dot h-1.5 w-1.5 rounded-full bg-paper" />}
      {status}
    </span>
  );
}

export const time = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
