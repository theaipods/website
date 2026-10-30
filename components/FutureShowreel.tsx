"use client";
import { StaticEmployee } from "@/components/StaticEmployee";

import { useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import { EnterpriseShowreel } from "@/remotion/EnterpriseShowreel";

export function FutureShowreel() {
  const root = useRef<HTMLDivElement>(null);
  const [nearView, setNearView] = useState(false);
  useEffect(() => {
    if (!root.current) return;
    if (typeof IntersectionObserver === "undefined") { setNearView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearView(true); observer.disconnect(); }
    }, { rootMargin: "400px" });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return <div className="future-reel-player" ref={root}>{nearView ? <Player component={EnterpriseShowreel} compositionWidth={3840} compositionHeight={2160} durationInFrames={1950} fps={30} initialFrame={0} controls initiallyShowControls={false} style={{width:"100%",aspectRatio:"16 / 9"}} /> : <div className="future-reel-poster" aria-label="Cinematic AI Pod workforce film loading"><StaticEmployee id="orchestrator"/><span>AI POD / WORKFORCE FILM</span></div>}</div>;
}
