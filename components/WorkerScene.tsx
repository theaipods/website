"use client";
import type { CSSProperties } from "react";
import { StaticEmployee } from "@/components/StaticEmployee";
import { characterAssetForEmployee, characterAssetForRole } from "@/lib/employee-presentation";
export type WorkerRole =
  | "research" | "finance" | "sales" | "engineering" | "operations" | "security"
  | "marketing" | "data" | "legal" | "support" | "people" | "product"
  | "quality" | "orchestrator";

function asset(role: WorkerRole, characterId?: string) {return characterId ? characterAssetForEmployee({id:characterId,name:characterId,role,category:role}) : characterAssetForRole(role);}
export function WorkerScene({
  role = "operations", ensemble = false, ensembleRoles, className = "", characterId,
}: {
  role?: WorkerRole;
  ensemble?: boolean;
  ensembleRoles?: WorkerRole[];
  className?: string;
  characterId?: string;
}) {
  const roles: WorkerRole[] = ensemble ? (ensembleRoles?.length ? ensembleRoles : ["research", "finance", "operations", "engineering", "sales"]) : [role];
  return <div className={"worker-scene worker-scene-art " + (ensemble ? "worker-ensemble " : "") + className} role="img"
    aria-label={ensemble ? "AI Pod creature workforce" : asset(role, characterId).species + " character"}>
    {roles.map((item, index) => {
      const selected = asset(item, !ensemble ? characterId : undefined);
      const spread = roles.length > 1 ? index / (roles.length - 1) : .5;
      return <StaticEmployee id={selected.id} key={item + index}
        className={ensemble ? "worker-ensemble-image" : "worker-character-image"}
        style={ensemble ? {
          left: ((index + .5) / roles.length * 100) + "%",
          width: (94 / roles.length) + "%",
          height: "68%",
          bottom: (index % 2 ? 22 : 10) + "%",
          "--employee-delay": (-index * 1.17) + "s",
          "--employee-duration": (4.8 + index * .43) + "s",
          zIndex: Math.round(10 - Math.abs(spread - .5) * 10),
          transform: "translateX(-50%)",
        } as CSSProperties : undefined}
        />;
    })}
  </div>;
}
