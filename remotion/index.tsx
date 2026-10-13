import { registerRoot } from "remotion";
import React from "react";
import { Composition } from "remotion";
import { WorkforceShowreel } from "./ShowreelV1";
import { EnterpriseShowreel } from "./EnterpriseShowreel";

registerRoot(() => <>
  <Composition id="EnterpriseShowreel" component={EnterpriseShowreel} fps={30} durationInFrames={1950} width={3840} height={2160}/>
  <Composition id="PreviousShowreel" component={WorkforceShowreel} fps={30} durationInFrames={600} width={1920} height={1080}/>
</>);
