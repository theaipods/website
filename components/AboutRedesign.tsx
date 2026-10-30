"use client";

import { ToolLogo } from "@/components/tool-logo";
import { WorkerScene } from "@/components/WorkerScene";
import { AboutWorkforceScene } from "@/components/AboutWorkforceScene";
import { ProductsInActionSection } from "@/components/ProductsInActionSection";
import type { AboutContent } from "@/lib/about-content";
import {
  ArrowRight,
  Boxes,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  CirclePlay,
  Cpu,
  Database,
  FileCheck2,
  GitBranch,
  Link2,
  Network,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundCheck,
  UsersRound,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const valueIcons = {
  target: Target,
  shapes: Boxes,
  network: Network,
  control: UserRoundCheck,
  shield: ShieldCheck,
  chart: ChartNoAxesCombined,
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="au-eyebrow">
      <i />
      {children}
    </span>
  );
}

/* ============================================================================
   SYNCHRONIZED 5-STAGE WORKFLOW CONTROLLER & 3D SCENE ("OUR APPROACH")
   ============================================================================ */
type WorkflowStageIndex = 0 | 1 | 2 | 3 | 4;

interface StageDefinition {
  index: WorkflowStageIndex;
  number: string;
  shortTitle: string;
  checklistLabel: string;
  statusLabel: string;
  subtitle: string;
  duration: number;
}

const WORKFLOW_STAGES: readonly StageDefinition[] = [
  {
    index: 0,
    number: "1",
    shortTitle: "Plan",
    checklistLabel: "Define the objective",
    statusLabel: "Planning objective",
    subtitle: "Define goals and break it into tasks",
    duration: 2.0,
  },
  {
    index: 1,
    number: "2",
    shortTitle: "Assign",
    checklistLabel: "Choose the right specialists",
    statusLabel: "Assigning specialists",
    subtitle: "AI specialists join based on your needs",
    duration: 2.2,
  },
  {
    index: 2,
    number: "3",
    shortTitle: "Execute",
    checklistLabel: "Connect approved tools",
    statusLabel: "Executing tasks",
    subtitle: "Agents work together using your tools",
    duration: 2.8,
  },
  {
    index: 3,
    number: "4",
    shortTitle: "Review",
    checklistLabel: "Coordinate the work",
    statusLabel: "Coordinating & reviewing",
    subtitle: "Check results, make refinements",
    duration: 2.2,
  },
  {
    index: 4,
    number: "5",
    shortTitle: "Outcome",
    checklistLabel: "Review the outcome",
    statusLabel: "Outcome ready",
    subtitle: "Reviewed, actionable results",
    duration: 2.2,
  },
] as const;

const TOTAL_CYCLE_DURATION = WORKFLOW_STAGES.reduce((acc, s) => acc + s.duration, 0); // 11.4s

const UPPER_STATION_PODS = [
  {
    stageIndex: 0 as WorkflowStageIndex,
    name: "Plan",
    avatar: "/ai-workforce/avatars-hd/data-research-agent.png",
    pos: new THREE.Vector3(-5.95, 0.92, 0.0),
  },
  {
    stageIndex: 1 as WorkflowStageIndex,
    name: "Assign",
    avatar: "/ai-workforce/avatars-hd/finance-finance-agent.png",
    pos: new THREE.Vector3(-2.95, 1.62, 0.0),
  },
  {
    stageIndex: 2 as WorkflowStageIndex,
    name: "Execute",
    avatar: "/ai-workforce/avatars-hd/product-frontend-developer.png",
    pos: new THREE.Vector3(0.05, 1.12, 0.0),
  },
  {
    stageIndex: 3 as WorkflowStageIndex,
    name: "Review",
    avatar: "/ai-workforce/avatars-hd/ops-project-manager.png",
    pos: new THREE.Vector3(3.05, 1.02, 0.0),
  },
] as const;

const OUTCOME_PEDESTAL_POS = new THREE.Vector3(7.35, -1.35, 0.2);

// X-coordinates calibrated to align 1:1 with the 5 HTML specialist cards in .awf-network-bay
const NETWORK_SPECIALISTS = [
  { id: "research", label: "Research", avatar: "/ai-workforce/avatars-hd/hr-hr-agent.png", x: -5.22, arrivalThreshold: 0.42 },
  { id: "marketing", label: "Marketing", avatar: "/ai-workforce/avatars-hd/sales-sales-agent.png", x: -3.4, arrivalThreshold: 0.52 },
  { id: "analysis", label: "Analysis", avatar: "/ai-workforce/avatars-hd/data-research-agent.png", x: -1.58, arrivalThreshold: 0.62 },
  { id: "sales", label: "Sales", avatar: "/ai-workforce/avatars-hd/sales-sales-agent.png", x: 0.24, arrivalThreshold: 0.72 },
  { id: "operations", label: "Operations", avatar: "/ai-workforce/avatars-hd/ops-project-manager.png", x: 2.06, arrivalThreshold: 0.82 },
] as const;

function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

function remapWindow(progress: number, start: number, end: number): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

function getStageFromElapsed(cycleTime: number): {
  stage: WorkflowStageIndex;
  stageProgress: number;
  overallProgress: number;
} {
  const wrapped = ((cycleTime % TOTAL_CYCLE_DURATION) + TOTAL_CYCLE_DURATION) % TOTAL_CYCLE_DURATION;
  let accumulated = 0;
  for (let i = 0; i < WORKFLOW_STAGES.length; i++) {
    const dur = WORKFLOW_STAGES[i].duration;
    if (wrapped < accumulated + dur) {
      return {
        stage: i as WorkflowStageIndex,
        stageProgress: (wrapped - accumulated) / dur,
        overallProgress: wrapped / TOTAL_CYCLE_DURATION,
      };
    }
    accumulated += dur;
  }
  return { stage: 4, stageProgress: 1, overallProgress: 1 };
}

function ApproachWorkflowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentStage, setCurrentStage] = useState<WorkflowStageIndex>(0);
  const [arrivedSpecialists, setArrivedSpecialists] = useState<number>(0);
  const [isReplaying, setIsReplaying] = useState(false);

  const timelineControlRef = useRef({
    elapsedOffset: 0,
    manualSeekTime: null as number | null,
    currentStage: 0 as WorkflowStageIndex,
    stageProgress: 0,
    arrivedCount: 0,
  });

  const jumpToStage = useCallback((targetStage: WorkflowStageIndex, isReplayAction = false) => {
    let targetSeconds = 0;
    for (let i = 0; i < targetStage; i++) {
      targetSeconds += WORKFLOW_STAGES[i].duration;
    }
    timelineControlRef.current.manualSeekTime = targetSeconds;
    timelineControlRef.current.currentStage = targetStage;
    timelineControlRef.current.stageProgress = 0;
    const initArrived = targetStage >= 2 ? 5 : 0;
    timelineControlRef.current.arrivedCount = initArrived;
    setCurrentStage(targetStage);
    setArrivedSpecialists(initArrived);

    if (isReplayAction) {
      setIsReplaying(true);
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => setIsReplaying(false), 650);
    }
  }, []);

  useEffect(() => {
    const host = canvasHostRef.current;
    const canvas = canvasRef.current;
    const sectionEl = sectionRef.current;
    if (!host || !canvas || !sectionEl) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      host.classList.add("awf-webgl-unavailable");
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 80);
    camera.position.set(0.65, 0.65, 18.2);
    camera.lookAt(0.65, 0.1, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.25 : 1.75));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x000000, 0);

    const envGen = new THREE.PMREMGenerator(renderer);
    const envTex = envGen.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };
    const geom = <T extends THREE.BufferGeometry>(g: T) => track(g);
    const mat = (color: number, opts: THREE.MeshStandardMaterialParameters = {}) =>
      track(new THREE.MeshStandardMaterial({ color, roughness: 0.28, metalness: 0.82, ...opts }));

    scene.add(new THREE.HemisphereLight(0xd4fff2, 0x04121c, 0.9));
    const dirLight = new THREE.DirectionalLight(0xf0fffb, 1.55);
    dirLight.position.set(2, 8, 12);
    scene.add(dirLight);

    const darkMetalMat = mat(0x0e1e26, { roughness: 0.3, metalness: 0.88 });
    const brushedPodMat = mat(0x28434f, { roughness: 0.24, metalness: 0.86 });
    const chromeRimMat = mat(0x88b5be, { roughness: 0.16, metalness: 0.94 });

    const stationGroups: THREE.Group[] = [];
    const stationRimMats: THREE.MeshStandardMaterial[] = [];
    const stationTopMats: THREE.MeshStandardMaterial[] = [];
    const stationLights: THREE.PointLight[] = [];
    const stationShockwaves: THREE.Mesh[] = [];
    const texLoader = new THREE.TextureLoader();
    let disposed = false;

    UPPER_STATION_PODS.forEach((station) => {
      const group = new THREE.Group();
      group.position.copy(station.pos);
      scene.add(group);
      stationGroups.push(group);

      const lowerBase = new THREE.Mesh(geom(new THREE.CylinderGeometry(1.08, 1.18, 0.2, 56)), darkMetalMat);
      lowerBase.position.y = -0.52;
      group.add(lowerBase);

      const mainBody = new THREE.Mesh(geom(new THREE.CylinderGeometry(1.04, 1.08, 0.28, 56)), brushedPodMat);
      mainBody.position.y = -0.34;
      group.add(mainBody);

      const rimMat = mat(0x48ffc2, {
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
        roughness: 0.18,
        metalness: 0.5,
      });
      stationRimMats.push(rimMat);

      const topRim = new THREE.Mesh(geom(new THREE.TorusGeometry(1.02, 0.04, 14, 64)), rimMat);
      topRim.rotation.x = Math.PI / 2;
      topRim.position.y = -0.18;
      group.add(topRim);

      const topSurfaceMat = mat(0x133b48, {
        emissive: 0x0d9488,
        emissiveIntensity: 0.4,
        roughness: 0.22,
        metalness: 0.65,
      });
      stationTopMats.push(topSurfaceMat);

      const topDisk = new THREE.Mesh(geom(new THREE.CircleGeometry(0.98, 48)), topSurfaceMat);
      topDisk.rotation.x = -Math.PI / 2;
      topDisk.position.y = -0.175;
      group.add(topDisk);

      const shockMat = track(
        new THREE.MeshBasicMaterial({
          color: 0x64ffda,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      const shockRing = new THREE.Mesh(geom(new THREE.RingGeometry(0.62, 0.88, 48)), shockMat);
      shockRing.rotation.x = -Math.PI / 2;
      shockRing.position.y = -0.16;
      group.add(shockRing);
      stationShockwaves.push(shockRing);

      const ptLight = new THREE.PointLight(0x38ffc2, 2.5, 4.2, 2);
      ptLight.position.set(0, 0.35, 0.4);
      group.add(ptLight);
      stationLights.push(ptLight);

      texLoader.load(station.avatar, tex => {
        if (disposed) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        const h = 1.68;
        const aspect = Math.min(tex.image.width / tex.image.height, 1.2);
        const avatarMesh = new THREE.Mesh(
          geom(new THREE.PlaneGeometry(h * aspect, h)),
          track(
            new THREE.MeshBasicMaterial({
              map: tex,
              transparent: true,
              alphaTest: 0.03,
              side: THREE.DoubleSide,
              toneMapped: false,
            })
          )
        );
        avatarMesh.position.set(0, -0.17 + h / 2, 0.16);
        group.add(avatarMesh);
      });
    });

    const outcomeGroup = new THREE.Group();
    outcomeGroup.position.copy(OUTCOME_PEDESTAL_POS);
    scene.add(outcomeGroup);

    const outBaseLower = new THREE.Mesh(geom(new THREE.CylinderGeometry(1.42, 1.54, 0.24, 64)), darkMetalMat);
    outBaseLower.position.y = -0.7;
    outcomeGroup.add(outBaseLower);

    const outBaseBody = new THREE.Mesh(geom(new THREE.CylinderGeometry(1.32, 1.4, 0.34, 64)), brushedPodMat);
    outBaseBody.position.y = -0.44;
    outcomeGroup.add(outBaseBody);

    const outcomeRimMat = mat(0x54ffcb, {
      emissive: 0x10d998,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.4,
    });
    const outTopRim = new THREE.Mesh(geom(new THREE.TorusGeometry(1.28, 0.046, 16, 72)), outcomeRimMat);
    outTopRim.rotation.x = Math.PI / 2;
    outTopRim.position.y = -0.25;
    outcomeGroup.add(outTopRim);

    const outcomeCorePoolMat = mat(0x22ffc0, {
      emissive: 0x10b981,
      emissiveIntensity: 0.7,
      roughness: 0.15,
    });
    const outPool = new THREE.Mesh(geom(new THREE.CircleGeometry(1.22, 64)), outcomeCorePoolMat);
    outPool.rotation.x = -Math.PI / 2;
    outPool.position.y = -0.245;
    outcomeGroup.add(outPool);

    const outcomeLight = new THREE.PointLight(0x48ffc2, 3.5, 6, 1.8);
    outcomeLight.position.set(0, 0.75, 0.6);
    outcomeGroup.add(outcomeLight);

    interface SyncedConduit {
      id: string;
      curve: THREE.CatmullRomCurve3;
      baseMat: THREE.MeshStandardMaterial;
      leadPacket: THREE.Mesh;
      leadAura: THREE.Mesh;
      streamPackets: Array<{
        mesh: THREE.Mesh;
        offset: number;
        reverse: boolean;
      }>;
    }

    const syncedConduits: Record<string, SyncedConduit> = {};

    const buildSyncedConduit = (
      id: string,
      points: THREE.Vector3[],
      radius = 0.044,
      streamCount = 4,
      bidirectional = false
    ) => {
      const curve = new THREE.CatmullRomCurve3(points);

      const baseMat = mat(0x2ce8b0, {
        emissive: 0x0ea878,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.38,
        roughness: 0.18,
        metalness: 0.3,
      });
      const baseTube = new THREE.Mesh(geom(new THREE.TubeGeometry(curve, 64, radius, 12, false)), baseMat);
      scene.add(baseTube);

      const jacketMat = mat(0x28b8ff, {
        emissive: 0x07486e,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      });
      const jacketTube = new THREE.Mesh(geom(new THREE.TubeGeometry(curve, 64, radius * 1.8, 12, false)), jacketMat);
      scene.add(jacketTube);

      [0.01, 0.99].forEach(tPos => {
        const pt = curve.getPoint(tPos);
        const socket = new THREE.Mesh(geom(new THREE.SphereGeometry(radius * 2.3, 14, 12)), chromeRimMat);
        socket.position.copy(pt);
        scene.add(socket);
      });

      const leadMat = mat(0xffffff, {
        emissive: 0x54ffcb,
        emissiveIntensity: 4.0,
        roughness: 0.05,
      });
      const leadPacket = new THREE.Mesh(geom(new THREE.SphereGeometry(radius * 2.3, 16, 14)), leadMat);
      const leadAura = new THREE.Mesh(
        geom(new THREE.SphereGeometry(radius * 4.2, 16, 14)),
        track(
          new THREE.MeshBasicMaterial({
            color: 0x48ffc2,
            transparent: true,
            opacity: 0.48,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        )
      );
      leadPacket.add(leadAura);
      leadPacket.visible = false;
      scene.add(leadPacket);

      const streamPackets: SyncedConduit["streamPackets"] = [];
      for (let i = 0; i < streamCount; i++) {
        const reverse = bidirectional && i % 2 === 1;
        const pMat = mat(reverse ? 0x68d8ff : 0x8effd8, {
          emissive: reverse ? 0x0ea5e9 : 0x18e89e,
          emissiveIntensity: 3.0,
        });
        const pMesh = new THREE.Mesh(geom(new THREE.SphereGeometry(radius * 1.55, 12, 10)), pMat);
        pMesh.visible = false;
        scene.add(pMesh);
        streamPackets.push({
          mesh: pMesh,
          offset: i / streamCount,
          reverse,
        });
      }

      syncedConduits[id] = { id, curve, baseMat, leadPacket, leadAura, streamPackets };
    };

    buildSyncedConduit(
      "bridge-0-1",
      [
        new THREE.Vector3(-4.9, 0.62, 0.05),
        new THREE.Vector3(-4.45, 0.92, 0.1),
        new THREE.Vector3(-3.98, 1.32, 0.05),
      ],
      0.046,
      4,
      false
    );

    buildSyncedConduit(
      "bridge-1-2",
      [
        new THREE.Vector3(-1.9, 1.32, 0.05),
        new THREE.Vector3(-1.42, 1.02, 0.1),
        new THREE.Vector3(-0.98, 0.82, 0.05),
      ],
      0.046,
      5,
      true
    );

    buildSyncedConduit(
      "bridge-2-3",
      [
        new THREE.Vector3(1.1, 0.82, 0.05),
        new THREE.Vector3(1.55, 0.72, 0.1),
        new THREE.Vector3(2.02, 0.72, 0.05),
      ],
      0.046,
      5,
      true
    );

    const manifoldY = -0.48;
    [
      { id: "stem-0", x: -5.95, topY: 0.38, targetX: -5.22 },
      { id: "stem-1", x: -2.95, topY: 1.08, targetX: -2.95 },
      { id: "stem-2", x: 0.05, topY: 0.58, targetX: 0.05 },
      { id: "stem-3", x: 3.05, topY: 0.48, targetX: 3.05 },
    ].forEach(stem => {
      buildSyncedConduit(
        stem.id,
        [
          new THREE.Vector3(stem.x, stem.topY, 0.02),
          new THREE.Vector3(stem.x, (stem.topY + manifoldY) * 0.5, 0.08),
          new THREE.Vector3(stem.targetX, manifoldY, 0.12),
        ],
        0.038,
        3,
        true
      );
    });

    buildSyncedConduit(
      "manifold-bus",
      [
        new THREE.Vector3(-5.22, manifoldY, 0.12),
        new THREE.Vector3(-1.58, manifoldY, 0.16),
        new THREE.Vector3(3.05, manifoldY, 0.12),
      ],
      0.05,
      8,
      true
    );

    // Extended vertical drop-lines (down to y = -1.78) so they plug directly into the top of the 5 specialist cards
    NETWORK_SPECIALISTS.forEach((spec, idx) => {
      buildSyncedConduit(
        `drop-${idx}`,
        [
          new THREE.Vector3(spec.x, manifoldY, 0.12),
          new THREE.Vector3(spec.x, -1.12, 0.16),
          new THREE.Vector3(spec.x, -1.78, 0.2),
        ],
        0.036,
        4,
        true
      );
    });

    buildSyncedConduit(
      "to-outcome",
      [
        new THREE.Vector3(3.05, manifoldY, 0.12),
        new THREE.Vector3(5.35, manifoldY, 0.18),
        new THREE.Vector3(5.65, -1.55, 0.2),
        new THREE.Vector3(6.15, -1.55, 0.22),
      ],
      0.056,
      6,
      false
    );

    const updateConduitSync = (
      id: string,
      leadProgress: number | null,
      isEnergized: boolean,
      intensityBoost: number,
      rawElapsed: number,
      reducedMotion: boolean
    ) => {
      const c = syncedConduits[id];
      if (!c) return;

      const isWaveTraveling = leadProgress !== null && leadProgress > 0 && leadProgress < 1;

      c.baseMat.emissiveIntensity = isWaveTraveling
        ? 2.4
        : isEnergized
          ? 1.25 + intensityBoost * 0.65
          : 0.25;
      c.baseMat.opacity = isWaveTraveling || isEnergized ? 0.92 : 0.28;

      if (isWaveTraveling && !reducedMotion) {
        c.leadPacket.visible = true;
        c.leadPacket.position.copy(c.curve.getPoint(clamp01(leadProgress)));
        const pulseScale = 1.0 + 0.35 * Math.sin(leadProgress * Math.PI);
        c.leadPacket.scale.setScalar(pulseScale);
      } else {
        c.leadPacket.visible = false;
      }

      c.streamPackets.forEach(pkt => {
        pkt.mesh.visible = isEnergized && !reducedMotion;
        if (!pkt.mesh.visible) return;
        const tRaw = (rawElapsed * (0.95 + intensityBoost * 0.45) + pkt.offset) % 1;
        const t = pkt.reverse ? 1 - tRaw : tRaw;
        pkt.mesh.position.copy(c.curve.getPoint(t));
      });
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;
    let rawElapsed = 0;
    let previousFrame: number | null = null;
    let rafId = 0;

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.fov = width < 700 ? 36 : 28;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (reducedMotion) renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        visible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.15);
        previousFrame = null;
      },
      { threshold: 0.15 }
    );
    intersectionObserver.observe(sectionEl);

    const resetFrame = () => { previousFrame = null; };
    document.addEventListener("visibilitychange", resetFrame);

    const animate = (now: number) => {
      if (disposed) return;
      rafId = requestAnimationFrame(animate);
      if (!visible || document.hidden) {
        previousFrame = null;
        return;
      }

      if (previousFrame !== null && !reducedMotion) rawElapsed += (now - previousFrame) / 1000;
      previousFrame = now;

      if (timelineControlRef.current.manualSeekTime !== null) {
        timelineControlRef.current.elapsedOffset =
          timelineControlRef.current.manualSeekTime - rawElapsed;
        timelineControlRef.current.manualSeekTime = null;
      }

      const effectiveElapsed = reducedMotion
        ? timelineControlRef.current.elapsedOffset
        : rawElapsed + timelineControlRef.current.elapsedOffset;

      const { stage, stageProgress, overallProgress } = getStageFromElapsed(effectiveElapsed);

      if (stage !== timelineControlRef.current.currentStage) {
        timelineControlRef.current.currentStage = stage;
        setCurrentStage(stage);
      }
      timelineControlRef.current.stageProgress = stageProgress;

      let newArrivedCount = 0;
      if (stage === 0) {
        newArrivedCount = 0;
      } else if (stage === 1) {
        NETWORK_SPECIALISTS.forEach(spec => {
          if (stageProgress >= spec.arrivalThreshold) newArrivedCount++;
        });
      } else {
        newArrivedCount = 5;
      }

      if (newArrivedCount !== timelineControlRef.current.arrivedCount) {
        timelineControlRef.current.arrivedCount = newArrivedCount;
        setArrivedSpecialists(newArrivedCount);
      }

      sectionEl.style.setProperty("--wf-stage-progress", `${(stageProgress * 100).toFixed(1)}%`);
      sectionEl.style.setProperty("--wf-overall-progress", `${(overallProgress * 100).toFixed(1)}%`);

      const b01Lead = stage === 0 ? remapWindow(stageProgress, 0.55, 1.0) : null;
      updateConduitSync("bridge-0-1", b01Lead, stage >= 1, stage === 1 ? 0.6 : 0.2, rawElapsed, reducedMotion);

      const stem0Lead = stage === 0 ? remapWindow(stageProgress, 0.5, 0.95) : null;
      updateConduitSync("stem-0", stem0Lead, stage >= 1, 0.2, rawElapsed, reducedMotion);

      const stem1Lead = stage === 1 ? remapWindow(stageProgress, 0.08, 0.35) : null;
      updateConduitSync(
        "stem-1",
        stem1Lead,
        stage >= 1 && (stage > 1 || stageProgress >= 0.35),
        stage === 1 ? 0.8 : 0.4,
        rawElapsed,
        reducedMotion
      );

      const manifoldLead = stage === 1 ? remapWindow(stageProgress, 0.25, 0.8) : null;
      updateConduitSync(
        "manifold-bus",
        manifoldLead,
        (stage === 1 && stageProgress >= 0.45) || stage >= 2,
        stage === 2 ? 1.0 : 0.5,
        rawElapsed,
        reducedMotion
      );

      NETWORK_SPECIALISTS.forEach((spec, idx) => {
        const dropStart = spec.arrivalThreshold - 0.22;
        const dropEnd = spec.arrivalThreshold;
        const dropLead =
          stage === 1
            ? remapWindow(stageProgress, dropStart, dropEnd)
            : stage === 3
              ? 1 - remapWindow(stageProgress, 0.1 + idx * 0.06, 0.45 + idx * 0.06)
              : null;
        const dropEnergized =
          (stage === 1 && stageProgress >= dropEnd) || stage === 2 || stage === 3;
        updateConduitSync(
          `drop-${idx}`,
          dropLead,
          dropEnergized,
          stage === 2 ? 1.0 : 0.4,
          rawElapsed,
          reducedMotion
        );
      });

      const b12Lead = stage === 1 ? remapWindow(stageProgress, 0.62, 1.0) : null;
      updateConduitSync("bridge-1-2", b12Lead, stage >= 2, stage === 2 ? 0.9 : 0.3, rawElapsed, reducedMotion);

      const stem2Lead = stage === 2 ? 1 - remapWindow(stageProgress, 0.0, 0.32) : null;
      updateConduitSync("stem-2", stem2Lead, stage >= 2, stage === 2 ? 1.0 : 0.4, rawElapsed, reducedMotion);

      const b23Lead = stage === 2 ? remapWindow(stageProgress, 0.65, 1.0) : null;
      updateConduitSync("bridge-2-3", b23Lead, stage >= 3, stage === 3 ? 0.9 : 0.3, rawElapsed, reducedMotion);

      const stem3Lead = stage === 3 ? remapWindow(stageProgress, 0.15, 0.6) : null;
      updateConduitSync("stem-3", stem3Lead, stage >= 3, stage === 3 ? 0.9 : 0.4, rawElapsed, reducedMotion);

      const outLead = stage === 3 ? remapWindow(stageProgress, 0.55, 1.0) : null;
      updateConduitSync("to-outcome", outLead, stage === 4, stage === 4 ? 1.2 : 0.3, rawElapsed, reducedMotion);

      UPPER_STATION_PODS.forEach((station, idx) => {
        const isCurrent = stage === idx;
        const isCompleted = stage > idx;

        const arrivalFlash = isCurrent ? Math.max(0, 1 - stageProgress / 0.28) : 0;
        const activePulse = isCurrent ? 0.5 + 0.5 * Math.sin(rawElapsed * 6.0) : 0;

        stationRimMats[idx].emissiveIntensity = isCurrent
          ? 2.0 + arrivalFlash * 2.2 + activePulse * 0.8
          : isCompleted
            ? 1.25
            : 0.35;
        stationTopMats[idx].emissiveIntensity = isCurrent
          ? 1.0 + arrivalFlash * 1.4 + activePulse * 0.4
          : isCompleted
            ? 0.55
            : 0.18;
        stationLights[idx].intensity = isCurrent
          ? 5.5 + arrivalFlash * 5.0 + activePulse * 2.0
          : isCompleted
            ? 3.0
            : 1.0;

        const shockMat = stationShockwaves[idx].material as THREE.MeshBasicMaterial;
        if (isCurrent && stageProgress < 0.35 && !reducedMotion) {
          const sProg = stageProgress / 0.35;
          stationShockwaves[idx].scale.setScalar(0.8 + sProg * 0.65);
          shockMat.opacity = (1 - sProg) * 0.75;
        } else {
          shockMat.opacity = 0;
        }

        const targetY =
          station.pos.y +
          (isCurrent ? Math.sin(rawElapsed * 4.0) * 0.055 + 0.05 : Math.sin(rawElapsed * 1.5 + idx) * 0.015);
        stationGroups[idx].position.y = THREE.MathUtils.lerp(stationGroups[idx].position.y, targetY, 0.12);
      });

      const outcomeActive = stage === 4;
      const outcomeArrivalFlash = outcomeActive ? Math.max(0, 1 - stageProgress / 0.3) : 0;
      const outcomePulse = outcomeActive ? 0.5 + 0.5 * Math.sin(rawElapsed * 5.5) : 0;

      outcomeRimMat.emissiveIntensity = outcomeActive
        ? 2.4 + outcomeArrivalFlash * 2.5 + outcomePulse * 1.0
        : 0.65;
      outcomeCorePoolMat.emissiveIntensity = outcomeActive
        ? 1.8 + outcomeArrivalFlash * 2.0 + outcomePulse * 0.8
        : 0.4;
      outcomeLight.intensity = outcomeActive ? 8.5 + outcomeArrivalFlash * 6.0 + outcomePulse * 3.0 : 2.2;

      renderer.render(scene, camera);
    };

    resize();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", resetFrame);
      disposables.forEach(d => d.dispose());
      envTex.dispose();
      envGen.dispose();
      renderer.dispose();
    };
  }, []);

  const activeStageMeta = WORKFLOW_STAGES[currentStage];

  return (
    <section
      ref={sectionRef}
      className="au-approach au-reveal awf-section"
      aria-label="Our Approach: Synchronized AI Workforce Workflow"
    >
      <div className="au-shell awf-grid">
        <div className="awf-left">
          <span className="au-eyebrow">
            <i />
            OUR APPROACH
          </span>
          <h2>
            Build your AI team.
            <br />
            <em>Give it work.</em>
            <br />
            Watch it execute.
          </h2>
          <p>
            Specialized AI employees work together with your tools and data to turn intent into reviewed
            outcomes.
          </p>

          <ol className="awf-checklist" role="list">
            {WORKFLOW_STAGES.map(step => {
              const isActive = currentStage === step.index;
              const isCompleted = currentStage > step.index;
              return (
                <li
                  key={step.checklistLabel}
                  className={`awf-check-item ${isActive ? "is-active" : ""} ${
                    isCompleted ? "is-completed" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="awf-check-btn"
                    onClick={() => jumpToStage(step.index)}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span className="awf-check-icon" aria-hidden="true">
                      <Check size={13} strokeWidth={2.6} />
                    </span>
                    <span className="awf-check-text">{step.checklistLabel}</span>
                    <span className="awf-check-status">
                      {isActive ? step.statusLabel : isCompleted ? "Done" : `0${step.index + 1}`}
                    </span>
                    {isActive && <i className="awf-check-progress" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="awf-cta-row">
            <Link href="/onboarding" className="au-button au-button-green awf-primary-cta">
              Build your AI team <ArrowRight size={17} />
            </Link>
            <button
              type="button"
              onClick={() => jumpToStage(0, true)}
              className={`awf-secondary-cta ${isReplaying ? "is-replaying" : ""}`}
              aria-label="Replay the five-stage workflow demonstration from Stage 1"
            >
              <CirclePlay size={18} />
              <span>See how it works</span>
            </button>
          </div>
        </div>

        <div className="awf-stage-wrap" ref={canvasHostRef}>
          <div className="awf-telemetry-bar" aria-live="polite">
            <span className="awf-telemetry-dot" />
            <span className="awf-telemetry-stage">
              STAGE 0{currentStage + 1} · {activeStageMeta.statusLabel.toUpperCase()}
            </span>
            <button
              type="button"
              className="awf-replay-mini"
              onClick={() => jumpToStage(0, true)}
              title="Restart workflow cycle"
            >
              <RotateCcw size={12} /> Replay
            </button>
          </div>

          <div className="awf-stations-layer">
            <article
              className={`awf-station-card awf-station-0 ${
                currentStage === 0 ? "is-active" : currentStage > 0 ? "is-completed" : ""
              }`}
              onClick={() => jumpToStage(0)}
            >
              <header className="awf-station-head">
                <span className="awf-badge-num">1</span>
                <div>
                  <h3>Plan</h3>
                  <p>Define goals and break it into tasks</p>
                </div>
              </header>
              <div className="awf-station-holo">
                <div className="awf-holo-chip">
                  <Sparkles size={11} />
                  <span>Objective → 3 Tasks</span>
                </div>
                <div className="awf-task-nodes">
                  <span>Scope</span>
                  <span>Model</span>
                  <span>Brief</span>
                </div>
              </div>
            </article>

            <article
              className={`awf-station-card awf-station-1 ${
                currentStage === 1 ? "is-active" : currentStage > 1 ? "is-completed" : ""
              }`}
              onClick={() => jumpToStage(1)}
            >
              <header className="awf-station-head">
                <span className="awf-badge-num">2</span>
                <div>
                  <h3>Assign</h3>
                  <p>AI specialists join based on your needs</p>
                </div>
              </header>
              <div className="awf-assign-pills">
                <span className={arrivedSpecialists >= 1 ? "is-lit" : ""}>Research</span>
                <span className={arrivedSpecialists >= 2 ? "is-lit" : ""}>Marketing</span>
                <span className={arrivedSpecialists >= 3 ? "is-lit" : ""}>Analysis</span>
                <span className={arrivedSpecialists >= 5 ? "is-lit" : ""}>+2 more</span>
              </div>
            </article>

            <article
              className={`awf-station-card awf-station-2 ${
                currentStage === 2 ? "is-active" : currentStage > 2 ? "is-completed" : ""
              }`}
              onClick={() => jumpToStage(2)}
            >
              <header className="awf-station-head">
                <span className="awf-badge-num">3</span>
                <div>
                  <h3>Execute</h3>
                  <p>Agents work together using your tools</p>
                </div>
              </header>
              <div className="awf-tool-badges" aria-label="Connected tools active during execution">
                <span className="awf-tool-chip" title="Slack">
                  <ToolLogo name="Slack" size={15} />
                </span>
                <span className="awf-tool-chip" title="Google Drive">
                  <ToolLogo name="Google Drive" size={15} />
                </span>
                <span className="awf-tool-chip" title="GitHub">
                  <ToolLogo name="GitHub" size={15} />
                </span>
                <span className="awf-tool-chip" title="Database & APIs">
                  <Database size={13} />
                </span>
              </div>
            </article>

            <article
              className={`awf-station-card awf-station-3 ${
                currentStage === 3 ? "is-active" : currentStage > 3 ? "is-completed" : ""
              }`}
              onClick={() => jumpToStage(3)}
            >
              <header className="awf-station-head">
                <span className="awf-badge-num">4</span>
                <div>
                  <h3>Review</h3>
                  <p>Check results, make refinements</p>
                </div>
              </header>
              <div className="awf-review-status">
                <span className="awf-checkpoint-tag">
                  <GitBranch size={11} />
                  {currentStage >= 3 ? "Ready for review" : "Waiting"}
                </span>
                {currentStage >= 3 && (
                  <span className="awf-checkpoint-ok">
                    <Check size={11} /> Verified
                  </span>
                )}
              </div>
            </article>

            <article
              className={`awf-station-card awf-station-4 ${currentStage === 4 ? "is-active" : ""}`}
              onClick={() => jumpToStage(4)}
            >
              <header className="awf-station-head">
                <span className="awf-badge-num">5</span>
                <div>
                  <h3>Outcome</h3>
                  <p>Reviewed, actionable results</p>
                </div>
              </header>

              <div className="awf-outcome-stack">
                <div className="awf-outcome-doc awf-doc-back" aria-hidden="true" />
                <div className="awf-outcome-doc awf-doc-mid" aria-hidden="true" />
                <div className="awf-outcome-doc awf-doc-front">
                  <div className="awf-doc-head">
                    <FileCheck2 size={13} />
                    <span>Executive_Report.pdf</span>
                  </div>
                  <div className="awf-doc-lines">
                    <i style={{ width: "88%" }} />
                    <i style={{ width: "72%" }} />
                    <i style={{ width: "94%" }} />
                  </div>
                  <div className="awf-doc-bars">
                    <span style={{ height: "45%" }} />
                    <span style={{ height: "72%" }} />
                    <span style={{ height: "64%" }} />
                    <span style={{ height: "95%" }} />
                  </div>
                </div>
                <div className="awf-outcome-verified" title="Outcome Reviewed & Approved">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </article>
          </div>

          <canvas
            ref={canvasRef}
            className="awf-canvas"
            aria-label="Synchronized 3D AI workforce orchestration stage showing tasks flowing from Plan to Assign, Execute, Review, and Outcome"
          />

          {/* LOWER DOCK WRAPPER: Raised so 3D drop-lines plug directly into each specialist card */}
          <div className="awf-network-wrapper" aria-label="A network of specialized AI employees">
            <div className="awf-network-dock">
              <div className="awf-network-bay">
                {NETWORK_SPECIALISTS.map((spec, idx) => {
                  const isSpecLit = idx < arrivedSpecialists;
                  const isExecuting = currentStage === 2;

                  return (
                    <div
                      key={spec.id}
                      className={`awf-net-pod ${isSpecLit ? "is-active" : ""} ${
                        isExecuting ? "is-executing" : ""
                      }`}
                    >
                      {/* Top Socket Port where the 3D vertical drop-line connects */}
                      <span className="awf-net-port" aria-hidden="true" />
                      <div className="awf-net-card">
                        <img src={spec.avatar} alt={`${spec.label} AI specialist`} loading="lazy" />
                      </div>
                      <div className="awf-net-label">
                        <i />
                        <span>{spec.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="awf-network-caption">
              <Cpu size={13} />
              <span>A NETWORK OF SPECIALIZED AI EMPLOYEES</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   MAIN PAGE COMPONENT: AboutRedesign
   ============================================================================ */
export function AboutRedesign({ content }: { content: AboutContent }) {
  const missionMatch = content.mission.match(/^(.*?)(AI workforce\.?$)/i);
  const milestones = content.milestones.filter(item => item.published).slice(0, 4);
  const values = content.values.filter(item => item.published).slice(0, 6);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".au-reveal").forEach(node => observer.observe(node));
    document.querySelector(".au-page")?.classList.add("au-motion-ready");
    return () => observer.disconnect();
  }, []);

  return (
    <div className="au-page" id="top">
      <main>
        <section className="au-hero">
          <div className="au-shell au-hero-grid">
            <div className="au-hero-copy">
              <Eyebrow>ABOUT THEAIPODS</Eyebrow>
              <h1>
                {missionMatch ? (
                  <>
                    {missionMatch[1]}
                    <em>{missionMatch[2]}</em>
                  </>
                ) : (
                  content.mission
                )}
              </h1>
              <p>{content.missionSupporting}</p>
              <div className="au-actions">
                <Link href="/product" className="au-button au-button-green">
                  Explore AI Pods <ArrowRight size={17} />
                </Link>
              </div>
              <div className="au-hero-proof">
                <span>
                  <i>
                    <Check size={16} />
                  </i>
                  <b>
                    Specialized
                    <br />
                    AI employees
                  </b>
                </span>
                <span>
                  <i>
                    <Workflow size={16} />
                  </i>
                  <b>
                    Works with
                    <br />
                    your tools
                  </b>
                </span>
                <span>
                  <i>
                    <ShieldCheck size={16} />
                  </i>
                  <b>
                    Secure, reliable
                    <br />
                    and scalable
                  </b>
                </span>
              </div>
            </div>
            <div className="au-hero-visual">
              <AboutWorkforceScene />
            </div>
            <div
              className="au-hero-stats"
              aria-label="Illustrative workforce details and platform principles"
            >
              <div>
                <UsersRound />
                <span>
                  <b>28 employee roles</b>
                  <small>In the current registry</small>
                </span>
              </div>
              <div>
                <Network />
                <span>
                  <b>6 specialists</b>
                  <small>Shown in this illustration</small>
                </span>
              </div>
              <div>
                <ArrowRight />
                <span>
                  <b>Human guided</b>
                  <small>People stay in control</small>
                </span>
              </div>
              <div>
                <ShieldCheck />
                <span>
                  <b>Governed</b>
                  <small>Security by design</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="au-belief au-reveal" id="belief">
          <div className="au-shell au-belief-grid">
            <div className="au-belief-left">
              <Eyebrow>OUR BELIEF</Eyebrow>
              <h2>Beyond the prompt.</h2>
              <p>
                AI can answer questions. Real impact comes when AI employees have the right skills,
                tools and context to get work done.
              </p>
              <div className="au-belief-scene">
                <WorkerScene role="security" />
                <span className="au-belief-tool tool-a">
                  <ToolLogo name="Slack" size={31} />
                </span>
                <span className="au-belief-tool tool-b">
                  <ToolLogo name="Google Drive" size={31} />
                </span>
                <span className="au-belief-tool tool-c">
                  <ToolLogo name="GitHub" size={31} />
                </span>
                <span className="au-belief-tool tool-d">
                  <ToolLogo name="Notion" size={31} />
                </span>
              </div>
            </div>
            <div className="au-belief-right">
              <h2>
                {content.story.includes("get work done") ? (
                  <>
                    {content.story.split("get work done")[0]}
                    <em>get work done.</em>
                  </>
                ) : (
                  content.story
                )}
              </h2>
              <p>{content.storySupporting}</p>
            </div>
          </div>
        </section>

        <ApproachWorkflowSection />

        {milestones.length > 0 && (
          <section className="au-process au-reveal" id="how-it-works">
            <div className="au-shell">
              <div className="au-section-head">
                <div>
                  <Eyebrow>HOW IT WORKS</Eyebrow>
                  <h2>
                    From capability
                    <br />
                    to coordinated work.
                  </h2>
                </div>
                <p>
                  The architecture is taking shape around a simple premise: one objective should become
                  visible, accountable work.
                </p>
              </div>
              <div className="au-timeline">
                {milestones.map((step, index) => (
                  <article key={step.title}>
                    <span className="au-timeline-number">0{index + 1}</span>
                    <div className="au-timeline-icon">
                      {index === 0 ? (
                        <Target />
                      ) : index === 1 ? (
                        <UsersRound />
                      ) : index === 2 ? (
                        <Link2 />
                      ) : (
                        <ChartNoAxesCombined />
                      )}
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <ProductsInActionSection />

        {values.length > 0 && (
          <section className="au-values au-reveal">
            <div className="au-shell">
              <div className="au-section-head">
                <div>
                  <Eyebrow>WHAT GUIDES US</Eyebrow>
                  <h2>
                    The principles behind
                    <br />
                    the workforce we&apos;re building.
                  </h2>
                </div>
                <p>
                  Principles that shape every decision we make, from product to partnerships to how we
                  show up.
                </p>
              </div>
              <div className="au-values-grid">
                {values.map((value, index) => {
                  const Icon = valueIcons[value.icon];
                  return (
                    <article key={value.title} className={`au-value-card card-${index}`}>
                      <Icon size={33} strokeWidth={1.6} />
                      <div>
                        <h3>{value.title}</h3>
                        <p>{value.description}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
