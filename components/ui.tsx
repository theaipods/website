import { StaticEmployee } from "@/components/StaticEmployee";
import Link from "next/link";
import Image from "next/image";
import { characterAssetForEmployee, characterAssetForRole, employeeCharacterSpecs, workerRoleForEmployee } from "@/lib/employee-presentation";
import { siteBrand } from "@/lib/site-brand";

const btn =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer";
export const btnPrimary = `${btn} bg-ink text-paper hover:bg-accent`;
export const input =
  "w-full rounded-lg border border-line bg-white px-3.5 h-11 text-sm outline-none focus:border-ink placeholder:text-muted/70";
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
  return <StaticEmployee id={character.id}
    className={className + " object-contain drop-shadow-[0_3px_9px_rgba(41,58,92,.18)]"} />;
}
