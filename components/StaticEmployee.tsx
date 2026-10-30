import type { CSSProperties } from "react";
import { employeeCharacterSpecs } from "@/lib/employee-presentation";

/** Shared high-definition transparent employee artwork, selected by stable registry ID. */
export function StaticEmployee({id,className,style}:{id:string;className?:string;style?:CSSProperties}) {
 const character = Object.hasOwn(employeeCharacterSpecs,id) ? id : "pod-manager";
 return <svg className={className} style={style} viewBox="0 0 240 200" aria-hidden="true" focusable="false">
  <image href={`/ai-workforce/avatars-hd/${character}.png`} width="240" height="200" preserveAspectRatio="xMidYMid meet"/>
 </svg>;
}
