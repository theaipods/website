"use client";

import { Player } from "@remotion/player";
import { WorkforceShowreel } from "@/remotion/ShowreelV1";

export function PreviousShowreel() {
  return <Player component={WorkforceShowreel} compositionWidth={1920} compositionHeight={1080} durationInFrames={600} fps={30} controls style={{width:"100%",aspectRatio:"16 / 9"}}/>;
}
