"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { solutions, solutionHref } from "@/lib/solutions";

export function SolutionsMenu({ current=false }: { current?:boolean }) {
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{const onOtherMenuOpen=(event:Event)=>{if((event as CustomEvent<string>).detail!=="solutions")setOpen(false)};document.addEventListener("ai-pod-menu-open",onOtherMenuOpen);return()=>{document.removeEventListener("ai-pod-menu-open",onOtherMenuOpen);if(timer.current)clearTimeout(timer.current)}},[]);
  const openMenu=()=>{if(timer.current)clearTimeout(timer.current);document.dispatchEvent(new CustomEvent("ai-pod-menu-open",{detail:"solutions"}));setOpen(true)};
  useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)};const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);trigger.current?.focus()}};document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape)}},[open]);
  return <div ref={root} className={`sol-menu${open?" is-open":""}`} onMouseEnter={()=>{if(matchMedia("(hover:hover)").matches)openMenu()}} onMouseLeave={()=>{if(matchMedia("(hover:hover)").matches)timer.current=setTimeout(()=>setOpen(false),200)}}>
    <button ref={trigger} type="button" className="sol-menu-trigger" aria-expanded={open} aria-haspopup="true" aria-current={current?"page":undefined} onClick={()=>{if(matchMedia("(hover:hover)").matches)openMenu();else if(open)setOpen(false);else openMenu()}}>Solutions <ChevronDown size={13}/></button>
    {open&&<div className="sol-mega" role="group" aria-label="Solutions navigation"><div className="sol-mega-feature"><small>EXPLORE BY THE WORK</small><strong>One workforce.<br/>Many ways to<br/><em>move forward.</em></strong><p>Find a coordinated AI workforce for a business function or industry.</p><Link href="/solutions" onClick={()=>setOpen(false)}>All solutions <ArrowUpRight size={16}/></Link></div>{(["Department","Industry"] as const).map(group=><div className="sol-mega-group" key={group}><small>{group.toUpperCase()}</small>{solutions.filter(item=>item.category===group).map(item=><Link href={solutionHref(item.slug)} key={item.slug} onClick={()=>setOpen(false)}><i style={{background:item.accent}}/><span>{item.title}<small>{item.objective}</small></span><ArrowUpRight size={14}/></Link>)}</div>)}</div>}
  </div>;
}
