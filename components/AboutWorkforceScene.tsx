"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const specialists = [
  { name: "Research", image: "data-research-agent", icon: "book" },
  { name: "Finance", image: "finance-finance-agent", icon: "chart" },
  { name: "HR", image: "hr-hr-agent", icon: "users" },
  { name: "Sales", image: "sales-sales-agent", icon: "trend" },
  { name: "Engineering", image: "product-frontend-developer", icon: "code" },
  { name: "Operations", image: "ops-project-manager", icon: "calendar" },
] as const;

const desktopPositions = [
  new THREE.Vector3(-4.25, 4.75, -1.2),
  new THREE.Vector3(4.25, 4.75, -1.2),
  new THREE.Vector3(-5.85, 2.25, 0.2),
  new THREE.Vector3(5.85, 2.25, 0.2),
  new THREE.Vector3(-4.15, -0.15, 1.75),
  new THREE.Vector3(4.15, -0.15, 1.75),
];

const mobilePositions = [
  new THREE.Vector3(-2.7, 4.4, -0.4),
  new THREE.Vector3(2.7, 4.4, -0.4),
  new THREE.Vector3(-4.2, 2.05, 0.35),
  new THREE.Vector3(4.2, 2.05, 0.35),
  new THREE.Vector3(-2.85, -0.1, 1.45),
  new THREE.Vector3(2.85, -0.1, 1.45),
];

const hub = new THREE.Vector3(0, 2.2, 0.1);

function createRoleBadgeTexture(label: string, iconType: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 144;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const r = 24;
  ctx.fillStyle = "rgba(5, 24, 31, 0.96)";
  ctx.strokeStyle = "rgba(45, 235, 175, 0.7)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(12, 12, canvas.width - 24, canvas.height - 24, r);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#38ffc2";
  ctx.fillStyle = "#38ffc2";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const ix = 92;
  const iy = 72;

  if (iconType === "book") {
    ctx.strokeRect(ix - 22, iy - 18, 20, 36);
    ctx.strokeRect(ix - 2, iy - 18, 20, 36);
  } else if (iconType === "chart" || iconType === "trend") {
    ctx.fillRect(ix - 20, iy + 2, 8, 16);
    ctx.fillRect(ix - 6, iy - 8, 8, 26);
    ctx.fillRect(ix + 8, iy - 18, 8, 36);
  } else if (iconType === "users") {
    ctx.beginPath();
    ctx.arc(ix - 8, iy - 9, 8, 0, Math.PI * 2);
    ctx.arc(ix + 10, iy - 9, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ix - 8, iy + 18, 15, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else if (iconType === "code") {
    ctx.font = "bold 36px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("</>", ix, iy + 2);
  } else if (iconType === "calendar") {
    ctx.strokeRect(ix - 20, iy - 16, 40, 34);
    ctx.beginPath();
    ctx.moveTo(ix - 20, iy - 5);
    ctx.lineTo(ix + 20, iy - 5);
    ctx.stroke();
  }

  ctx.fillStyle = "#eafff8";
  ctx.font = "600 42px Inter, system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 140, iy + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createOrchestratorPlaqueTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 220;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "rgba(6, 18, 24, 0.98)";
  ctx.strokeStyle = "rgba(56, 235, 185, 0.55)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(14, 14, canvas.width - 28, canvas.height - 28, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#e8fff9";
  ctx.shadowColor = "rgba(56, 255, 194, 0.5)";
  ctx.shadowBlur = 10;
  ctx.font = "700 44px Inter, system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "3px";
  ctx.fillText("AI POD", canvas.width / 2, 82);
  ctx.fillText("ORCHESTRATOR", canvas.width / 2, 142);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createHoloScreenTexture(index: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 176;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "rgba(6, 36, 52, 0.65)";
  ctx.strokeStyle = "rgba(65, 225, 255, 0.85)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(6, 6, 244, 164, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(65, 225, 255, 0.25)";
  ctx.fillRect(16, 16, 224, 16);

  ctx.fillStyle = "#47e8ff";
  for (let i = 0; i < 5; i++) {
    const barH = 22 + ((i * 29 + index * 17) % 62);
    ctx.fillRect(26 + i * 22, 145 - barH, 13, barH);
  }

  ctx.fillStyle = "rgba(120, 255, 220, 0.8)";
  ctx.fillRect(144, 48, 82, 8);
  ctx.fillRect(144, 66, 64, 8);
  ctx.fillRect(144, 84, 74, 8);
  ctx.fillRect(144, 102, 52, 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function AboutWorkforceScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedRef = useRef<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  selectedRef.current = selected;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      host.classList.add("au3d-unavailable");
      return;
    }

    const scene = new THREE.Scene();
    const isMobile = window.innerWidth < 720;
    const scenePositions = isMobile ? mobilePositions : desktopPositions;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 90);
    camera.position.set(0, 4.85, 19.2);
    camera.lookAt(0, 2.2, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const environmentGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvironment = new RoomEnvironment();
    const environmentMap = environmentGenerator.fromScene(roomEnvironment, 0.04).texture;
    scene.environment = environmentMap;

    const ambient = new THREE.HemisphereLight(0xc8f4ea, 0x040d14, 0.65);
    scene.add(ambient);

    const frontFill = new THREE.DirectionalLight(0xeefcf8, 1.35);
    frontFill.position.set(0, 6, 14);
    scene.add(frontFill);

    const coreGlowLight = new THREE.PointLight(0x28f0b8, 9, 14, 1.8);
    coreGlowLight.position.set(0, 2.9, 1.6);
    scene.add(coreGlowLight);

    const leftRimLight = new THREE.PointLight(0x2288ff, 8, 18, 2);
    leftRimLight.position.set(-7.5, 4.0, 2);
    scene.add(leftRimLight);

    const rightRimLight = new THREE.PointLight(0x00d89c, 8, 18, 2);
    rightRimLight.position.set(7.5, 4.0, 1.5);
    scene.add(rightRimLight);

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    const mat = (color: number, opts: THREE.MeshStandardMaterialParameters = {}) =>
      track(new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.82, ...opts }));
    const geom = <T extends THREE.BufferGeometry>(g: T) => track(g);

    const gunmetalDarkMat = mat(0x121d24, { roughness: 0.32, metalness: 0.88 });
    const brushedTitaniumMat = mat(0x263742, { roughness: 0.26, metalness: 0.9 });
    const steelAccentMat = mat(0x4a6370, { roughness: 0.2, metalness: 0.92 });
    const chromeMat = mat(0x7c99a6, { roughness: 0.16, metalness: 0.95 });
    const neonMintMat = mat(0x2df5b6, { emissive: 0x0fa876, emissiveIntensity: 1.35, roughness: 0.2, metalness: 0.3 });
    const neonCyanMat = mat(0x38d6ff, { emissive: 0x0b84bd, emissiveIntensity: 1.3, roughness: 0.2, metalness: 0.3 });

    const orchestrator = new THREE.Group();
    orchestrator.position.set(hub.x, 0.15, hub.z);
    scene.add(orchestrator);

    const floorLightRing = new THREE.Mesh(
      geom(new THREE.RingGeometry(2.6, 2.72, 96)),
      track(new THREE.MeshBasicMaterial({ color: 0x4effc8, side: THREE.DoubleSide, transparent: true, opacity: 0.72 }))
    );
    floorLightRing.rotation.x = -Math.PI / 2;
    floorLightRing.position.y = -0.28;
    orchestrator.add(floorLightRing);

    const baseStep = new THREE.Mesh(geom(new THREE.CylinderGeometry(2.58, 2.72, 0.24, 96)), gunmetalDarkMat);
    baseStep.position.y = -0.14;
    orchestrator.add(baseStep);

    const baseThinGlow = new THREE.Mesh(geom(new THREE.TorusGeometry(2.59, 0.025, 14, 96)), neonMintMat);
    baseThinGlow.rotation.x = Math.PI / 2;
    baseThinGlow.position.y = -0.02;
    orchestrator.add(baseThinGlow);

    const mainDrum = new THREE.Mesh(geom(new THREE.CylinderGeometry(2.3, 2.38, 0.86, 96)), brushedTitaniumMat);
    mainDrum.position.y = 0.44;
    orchestrator.add(mainDrum);

    const drumBottomLip = new THREE.Mesh(geom(new THREE.CylinderGeometry(2.44, 2.48, 0.12, 96)), gunmetalDarkMat);
    drumBottomLip.position.y = 0.06;
    orchestrator.add(drumBottomLip);

    const plaqueTex = track(createOrchestratorPlaqueTexture());
    const plaqueArc = 0.84;
    const plaqueFrame = new THREE.Mesh(
      geom(new THREE.CylinderGeometry(2.39, 2.39, 0.64, 48, 1, true, -plaqueArc / 2, plaqueArc)),
      gunmetalDarkMat
    );
    plaqueFrame.position.y = 0.44;
    orchestrator.add(plaqueFrame);

    const plaqueFace = new THREE.Mesh(
      geom(new THREE.CylinderGeometry(2.405, 2.405, 0.58, 48, 1, true, -plaqueArc / 2, plaqueArc)),
      track(new THREE.MeshBasicMaterial({ map: plaqueTex, transparent: true }))
    );
    plaqueFace.position.y = 0.44;
    orchestrator.add(plaqueFace);

    const drumPortAngles = [-1.85, -0.78, 0.78, 1.85];
    drumPortAngles.forEach(ang => {
      const portGroup = new THREE.Group();
      portGroup.position.set(Math.sin(ang) * 2.32, 0.42, Math.cos(ang) * 2.32);
      portGroup.rotation.y = ang;

      const outerCollar = new THREE.Mesh(geom(new THREE.CylinderGeometry(0.24, 0.26, 0.28, 28)), gunmetalDarkMat);
      outerCollar.rotation.x = Math.PI / 2;
      portGroup.add(outerCollar);

      const innerSleeve = new THREE.Mesh(geom(new THREE.CylinderGeometry(0.18, 0.2, 0.36, 28)), steelAccentMat);
      innerSleeve.rotation.x = Math.PI / 2;
      portGroup.add(innerSleeve);

      const portGlowRing = new THREE.Mesh(geom(new THREE.TorusGeometry(0.19, 0.026, 12, 28)), neonMintMat);
      portGlowRing.position.z = 0.16;
      portGroup.add(portGlowRing);

      orchestrator.add(portGroup);
    });

    const upperDeckCollar = new THREE.Mesh(geom(new THREE.CylinderGeometry(2.26, 2.42, 0.18, 96)), gunmetalDarkMat);
    upperDeckCollar.position.y = 0.94;
    orchestrator.add(upperDeckCollar);

    const upperDeckRimGlow = new THREE.Mesh(geom(new THREE.TorusGeometry(2.33, 0.028, 14, 96)), neonMintMat);
    upperDeckRimGlow.rotation.x = Math.PI / 2;
    upperDeckRimGlow.position.y = 0.94;
    orchestrator.add(upperDeckRimGlow);

    const upperSteelDeck = new THREE.Mesh(geom(new THREE.CylinderGeometry(1.88, 2.2, 0.16, 96)), steelAccentMat);
    upperSteelDeck.position.y = 1.08;
    orchestrator.add(upperSteelDeck);

    const coreBaseCollar = new THREE.Mesh(geom(new THREE.TorusGeometry(1.36, 0.09, 16, 96)), gunmetalDarkMat);
    coreBaseCollar.rotation.x = Math.PI / 2;
    coreBaseCollar.position.y = 1.18;
    orchestrator.add(coreBaseCollar);

    const coreEmitterDisc = new THREE.Mesh(
      geom(new THREE.CircleGeometry(1.3, 64)),
      mat(0x29f2b8, { emissive: 0x0ea878, emissiveIntensity: 0.95, roughness: 0.25 })
    );
    coreEmitterDisc.rotation.x = -Math.PI / 2;
    coreEmitterDisc.position.y = 1.17;
    orchestrator.add(coreEmitterDisc);

    const sphereCenterY = 2.52;
    const sphereRadius = 1.48;

    const outerGlassMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x98fff0,
        roughness: 0.05,
        metalness: 0.05,
        transmission: 0.78,
        thickness: 0.4,
        ior: 1.45,
        transparent: true,
        opacity: 0.36,
        envMapIntensity: 1.5,
        depthWrite: false,
      })
    );
    const glassSphere = new THREE.Mesh(geom(new THREE.SphereGeometry(sphereRadius, 72, 56)), outerGlassMat);
    glassSphere.position.y = sphereCenterY;
    orchestrator.add(glassSphere);

    const glassInnerHalo = new THREE.Mesh(
      geom(new THREE.SphereGeometry(sphereRadius - 0.03, 48, 36)),
      track(new THREE.MeshBasicMaterial({ color: 0x42ffd0, transparent: true, opacity: 0.12, side: THREE.BackSide, depthWrite: false }))
    );
    glassInnerHalo.position.y = sphereCenterY;
    orchestrator.add(glassInnerHalo);

    const cageStrutAngles = [-2.25, -0.82, 0.82, 2.25];
    cageStrutAngles.forEach(angle => {
      const arcPoints: THREE.Vector3[] = [];
      const arcRadius = 1.58;
      for (let step = 0; step <= 24; step++) {
        const phi = -0.88 + (step / 24) * 1.76;
        const r = Math.cos(phi) * arcRadius;
        const y = sphereCenterY + Math.sin(phi) * arcRadius;
        arcPoints.push(new THREE.Vector3(Math.sin(angle) * r, y, Math.cos(angle) * r));
      }
      const arcCurve = new THREE.CatmullRomCurve3(arcPoints);
      const strutMesh = new THREE.Mesh(geom(new THREE.TubeGeometry(arcCurve, 40, 0.048, 12, false)), brushedTitaniumMat);
      orchestrator.add(strutMesh);

      const innerArcPoints = arcPoints.map(p => new THREE.Vector3(p.x * 0.97, p.y, p.z * 0.97));
      const innerArcCurve = new THREE.CatmullRomCurve3(innerArcPoints);
      const strutGlow = new THREE.Mesh(geom(new THREE.TubeGeometry(innerArcCurve, 32, 0.014, 8, false)), neonCyanMat);
      orchestrator.add(strutGlow);
    });

    const topCrownY = sphereCenterY + 1.26;
    const crownCollar = new THREE.Mesh(geom(new THREE.CylinderGeometry(0.95, 1.12, 0.24, 64)), brushedTitaniumMat);
    crownCollar.position.y = topCrownY;
    orchestrator.add(crownCollar);

    const crownDarkBand = new THREE.Mesh(geom(new THREE.TorusGeometry(1.04, 0.055, 14, 64)), gunmetalDarkMat);
    crownDarkBand.rotation.x = Math.PI / 2;
    crownDarkBand.position.y = topCrownY - 0.04;
    orchestrator.add(crownDarkBand);

    const crownRimGlow = new THREE.Mesh(geom(new THREE.TorusGeometry(0.96, 0.024, 12, 64)), neonMintMat);
    crownRimGlow.rotation.x = Math.PI / 2;
    crownRimGlow.position.y = topCrownY + 0.1;
    orchestrator.add(crownRimGlow);

    const topEmitterCore = new THREE.Mesh(
      geom(new THREE.CylinderGeometry(0.26, 0.32, 0.55, 32)),
      mat(0x80ffe0, { emissive: 0x22e8b0, emissiveIntensity: 1.8, roughness: 0.15 })
    );
    topEmitterCore.position.y = topCrownY + 0.38;
    orchestrator.add(topEmitterCore);

    const topCapRing = new THREE.Mesh(geom(new THREE.CylinderGeometry(0.85, 0.72, 0.14, 48)), gunmetalDarkMat);
    topCapRing.position.y = topCrownY + 0.68;
    orchestrator.add(topCapRing);

    [-2.25, -0.82, 0.82, 2.25].forEach(angle => {
      const rod = new THREE.Mesh(geom(new THREE.CylinderGeometry(0.022, 0.022, 0.65, 12)), chromeMat);
      rod.position.set(Math.sin(angle) * 0.78, topCrownY + 0.38, Math.cos(angle) * 0.78);
      orchestrator.add(rod);
    });

    const coreTriGroup = new THREE.Group();
    coreTriGroup.position.set(hub.x, 0.15 + sphereCenterY, hub.z);
    scene.add(coreTriGroup);

    const triOrbSpecs = [
      { color: 0x0ea5e9, emissive: 0x0284c7, pos: new THREE.Vector3(0, 0.38, 0.12) },
      { color: 0x10b981, emissive: 0x059669, pos: new THREE.Vector3(-0.38, -0.24, 0.16) },
      { color: 0x9333ea, emissive: 0x7e22ce, pos: new THREE.Vector3(0.38, -0.24, 0.16) },
    ];

    triOrbSpecs.forEach(({ color, emissive, pos }) => {
      const orbGroup = new THREE.Group();
      orbGroup.position.copy(pos);

      const coreOrb = new THREE.Mesh(
        geom(new THREE.SphereGeometry(0.35, 48, 36)),
        mat(color, { emissive, emissiveIntensity: 0.75, roughness: 0.14, metalness: 0.1 })
      );
      orbGroup.add(coreOrb);

      const orbGlass = new THREE.Mesh(
        geom(new THREE.SphereGeometry(0.38, 32, 24)),
        track(
          new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.05,
            transmission: 0.6,
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
          })
        )
      );
      orbGroup.add(orbGlass);

      const orbAura = new THREE.Mesh(
        geom(new THREE.SphereGeometry(0.48, 24, 20)),
        track(
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.24,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        )
      );
      orbGroup.add(orbAura);
      coreTriGroup.add(orbGroup);
    });

    const innerSwirl1 = new THREE.Mesh(geom(new THREE.TorusGeometry(1.05, 0.016, 12, 80)), neonCyanMat);
    innerSwirl1.rotation.set(0.85, 0.3, 0);
    coreTriGroup.add(innerSwirl1);

    const innerSwirl2 = new THREE.Mesh(geom(new THREE.TorusGeometry(0.96, 0.014, 12, 80)), neonMintMat);
    innerSwirl2.rotation.set(-0.7, 0.6, 0.4);
    coreTriGroup.add(innerSwirl2);

    const platforms: THREE.Group[] = [];
    const agents: THREE.Mesh[] = [];
    const holoScreens: THREE.Group[] = [];
    const curves: THREE.CatmullRomCurve3[] = [];
    const routeMaterials: THREE.MeshStandardMaterial[] = [];
    const routeParticles: Array<Array<{ mesh: THREE.Mesh; phase: number; direction: number }>> = [];
    const endpointLights: THREE.PointLight[] = [];
    const avatarLoader = new THREE.TextureLoader();
    let disposed = false;

    specialists.forEach((worker, index) => {
      const p = scenePositions[index];
      const platform = new THREE.Group();
      platform.position.set(p.x, p.y - 0.68, p.z);
      scene.add(platform);
      platforms.push(platform);

      const podLowerBase = new THREE.Mesh(geom(new THREE.CylinderGeometry(1.26, 1.34, 0.14, 64)), gunmetalDarkMat);
      podLowerBase.position.y = -0.22;
      platform.add(podLowerBase);

      const podLowerNeon = new THREE.Mesh(geom(new THREE.TorusGeometry(1.29, 0.022, 12, 64)), neonMintMat);
      podLowerNeon.rotation.x = Math.PI / 2;
      podLowerNeon.position.y = -0.15;
      platform.add(podLowerNeon);

      const podBody = new THREE.Mesh(geom(new THREE.CylinderGeometry(1.2, 1.24, 0.46, 64)), brushedTitaniumMat);
      podBody.position.y = 0.08;
      platform.add(podBody);

      for (let v = 0; v < 16; v++) {
        const va = (v / 16) * Math.PI * 2;
        if (Math.abs(Math.atan2(Math.sin(va), Math.cos(va))) < 0.74) continue;
        const podRib = new THREE.Mesh(geom(new THREE.BoxGeometry(0.055, 0.36, 0.08)), gunmetalDarkMat);
        podRib.position.set(Math.sin(va) * 1.22, 0.08, Math.cos(va) * 1.22);
        podRib.rotation.y = va;
        platform.add(podRib);
      }

      const podUpperCollar = new THREE.Mesh(geom(new THREE.CylinderGeometry(1.24, 1.2, 0.1, 64)), gunmetalDarkMat);
      podUpperCollar.position.y = 0.32;
      platform.add(podUpperCollar);

      const podTopRim = new THREE.Mesh(geom(new THREE.TorusGeometry(1.16, 0.036, 16, 72)), neonMintMat);
      podTopRim.rotation.x = Math.PI / 2;
      podTopRim.position.y = 0.37;
      platform.add(podTopRim);

      const podInnerRing = new THREE.Mesh(geom(new THREE.TorusGeometry(0.9, 0.022, 12, 64)), neonCyanMat);
      podInnerRing.rotation.x = Math.PI / 2;
      podInnerRing.position.y = 0.38;
      platform.add(podInnerRing);

      const podTopSurface = new THREE.Mesh(
        geom(new THREE.CircleGeometry(1.12, 64)),
        mat(0x0d2b36, { emissive: 0x083e4a, emissiveIntensity: 0.65, roughness: 0.25, metalness: 0.6 })
      );
      podTopSurface.rotation.x = -Math.PI / 2;
      podTopSurface.position.y = 0.372;
      platform.add(podTopSurface);

      const badgeTex = track(createRoleBadgeTexture(worker.name, worker.icon));
      const badgeArc = 1.1;
      const badgePlate = new THREE.Mesh(
        geom(new THREE.CylinderGeometry(1.255, 1.255, 0.38, 36, 1, true, -badgeArc / 2, badgeArc)),
        gunmetalDarkMat
      );
      badgePlate.position.y = 0.08;
      platform.add(badgePlate);

      const badgeLabel = new THREE.Mesh(
        geom(new THREE.CylinderGeometry(1.27, 1.27, 0.35, 36, 1, true, -badgeArc / 2, badgeArc)),
        track(new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true }))
      );
      badgeLabel.position.y = 0.08;
      platform.add(badgeLabel);

      const holoGroup = new THREE.Group();
      holoGroup.position.set(0, 1.02, -0.2);
      platform.add(holoGroup);
      holoScreens.push(holoGroup);

      const screenTex = track(createHoloScreenTexture(index));
      const screenMat = track(
        new THREE.MeshBasicMaterial({
          map: screenTex,
          transparent: true,
          opacity: 0.82,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );

      const isLeftPod = p.x < 0;
      const mainScreen = new THREE.Mesh(geom(new THREE.PlaneGeometry(1.15, 0.78)), screenMat);
      mainScreen.position.set(isLeftPod ? 0.46 : -0.46, 0.04, 0.08);
      mainScreen.rotation.y = isLeftPod ? -0.25 : 0.25;
      holoGroup.add(mainScreen);

      const secondaryScreen = new THREE.Mesh(geom(new THREE.PlaneGeometry(0.85, 0.6)), screenMat);
      secondaryScreen.position.set(isLeftPod ? -0.42 : 0.42, 0.14, -0.18);
      secondaryScreen.rotation.y = isLeftPod ? 0.22 : -0.22;
      holoGroup.add(secondaryScreen);

      const podLight = new THREE.PointLight(0x2af2aa, 4.5, 3.2, 2);
      podLight.position.y = 0.55;
      platform.add(podLight);
      endpointLights.push(podLight);

      const characterScale = isMobile ? 1.04 : 1;
      const depthScale = index >= 4 ? 1.05 : index >= 2 ? 1.02 : 1;
      const avatarHeight = 2.04 * characterScale * depthScale;

      avatarLoader.load(`/ai-workforce/avatars-hd/${worker.image}.png`, texture => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const aspect = Math.min(texture.image.width / texture.image.height, 1.22);
        const figure = new THREE.Mesh(
          geom(new THREE.PlaneGeometry(avatarHeight * aspect, avatarHeight)),
          track(
            new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              alphaTest: 0.025,
              side: THREE.DoubleSide,
              toneMapped: false,
            })
          )
        );
        figure.position.set(p.x, platform.position.y + 0.36 + avatarHeight / 2, p.z + 0.32);
        figure.quaternion.copy(camera.quaternion);
        figure.renderOrder = 4;
        figure.userData.employeeIndex = index;
        scene.add(figure);
        agents[index] = figure;
      });

      const sideSign = p.x < 0 ? -1 : 1;
      const isTopRow = index < 2;
      const isMidRow = index >= 2 && index < 4;

      const hubAnchor = isTopRow
        ? new THREE.Vector3(sideSign * 1.48, 2.7, -0.1)
        : isMidRow
          ? new THREE.Vector3(sideSign * 1.62, 1.85, 0.15)
          : new THREE.Vector3(sideSign * 2.22, 0.58, 0.72);

      const podAnchor = new THREE.Vector3(p.x - sideSign * 1.18, platform.position.y + 0.1, p.z);

      const hubSocket = new THREE.Mesh(geom(new THREE.CylinderGeometry(0.15, 0.19, 0.26, 24)), brushedTitaniumMat);
      hubSocket.position.copy(hubAnchor);
      hubSocket.lookAt(podAnchor);
      hubSocket.rotateX(Math.PI / 2);
      scene.add(hubSocket);

      const hubSocketGlow = new THREE.Mesh(geom(new THREE.TorusGeometry(0.14, 0.026, 12, 24)), neonMintMat);
      hubSocketGlow.position.copy(hubAnchor);
      hubSocketGlow.lookAt(podAnchor);
      scene.add(hubSocketGlow);

      const podSocket = new THREE.Mesh(geom(new THREE.CylinderGeometry(0.14, 0.18, 0.24, 24)), brushedTitaniumMat);
      podSocket.position.copy(podAnchor);
      podSocket.lookAt(hubAnchor);
      podSocket.rotateX(Math.PI / 2);
      scene.add(podSocket);

      const podSocketGlow = new THREE.Mesh(geom(new THREE.TorusGeometry(0.13, 0.024, 12, 24)), neonMintMat);
      podSocketGlow.position.copy(podAnchor);
      podSocketGlow.lookAt(hubAnchor);
      scene.add(podSocketGlow);

      const mid1 = hubAnchor.clone().lerp(podAnchor, 0.34);
      mid1.y -= isTopRow ? 0.38 : 0.24;
      mid1.z += 0.22;

      const mid2 = hubAnchor.clone().lerp(podAnchor, 0.68);
      mid2.y += isTopRow ? 0.24 : -0.14;
      mid2.z += 0.12;

      const curve = new THREE.CatmullRomCurve3([hubAnchor, mid1, mid2, podAnchor]);
      curves.push(curve);

      const coreRouteMat = mat(0x52ffcb, {
        emissive: 0x10d498,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.92,
        roughness: 0.15,
        metalness: 0.2,
      });
      routeMaterials.push(coreRouteMat);

      const innerTube = new THREE.Mesh(geom(new THREE.TubeGeometry(curve, 64, 0.042, 14, false)), coreRouteMat);
      scene.add(innerTube);

      const outerJacketMat = mat(0x28a8ff, {
        emissive: 0x084c7d,
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0.26,
        roughness: 0.12,
        metalness: 0.3,
        depthWrite: false,
      });
      const outerTube = new THREE.Mesh(geom(new THREE.TubeGeometry(curve, 64, 0.082, 16, false)), outerJacketMat);
      scene.add(outerTube);

      [0.2, 0.4, 0.6, 0.8].forEach(tPos => {
        const pt = curve.getPoint(tPos);
        const tangent = curve.getTangent(tPos);
        const collar = new THREE.Mesh(geom(new THREE.TorusGeometry(0.088, 0.02, 10, 24)), gunmetalDarkMat);
        collar.position.copy(pt);
        collar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent.normalize());
        scene.add(collar);
      });

      const particles: Array<{ mesh: THREE.Mesh; phase: number; direction: number }> = [];
      for (let j = 0; j < 6; j++) {
        const packet = new THREE.Mesh(
          geom(new THREE.SphereGeometry(0.062, 14, 12)),
          mat(0xd8fff4, { emissive: 0x38ffc2, emissiveIntensity: 2.2, roughness: 0.1 })
        );
        scene.add(packet);
        particles.push({ mesh: packet, phase: j / 6, direction: j % 2 ? -1 : 1 });
      }
      routeParticles.push(particles);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = new THREE.Timer();
    timer.connect(document);
    let visible = true;
    let frame = 0;

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.fov = window.innerWidth < 720 ? 48 : 34;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (reducedMotion) renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const visibilityObserver = new IntersectionObserver(
      entries => {
        visible = Boolean(entries[0]?.isIntersecting);
        if (visible && reducedMotion) renderer.render(scene, camera);
      },
      { threshold: 0.01 }
    );
    visibilityObserver.observe(host);

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      if (event.pointerType !== "touch") {
        raycaster.setFromCamera(pointerTarget, camera);
        const hit = raycaster.intersectObjects(agents.filter(Boolean), true)[0]?.object as
          | (THREE.Mesh & { userData: { employeeIndex: number } })
          | undefined;
        setSelected(hit ? hit.userData.employeeIndex : null);
      }
    };
    const onPointerLeave = () => setSelected(null);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const render = () => {
      if (disposed) return;
      frame = requestAnimationFrame(render);
      if (!visible || reducedMotion) return;

      timer.update();
      const elapsed = timer.getElapsed();

      pointer.lerp(pointerTarget, 0.035);
      camera.position.x = pointer.x * 0.25;
      camera.position.y = 4.85 + pointer.y * 0.12;
      camera.lookAt(pointer.x * 0.08, 2.2, 0);

      coreTriGroup.rotation.y = elapsed * 0.55;
      coreTriGroup.position.y = 0.15 + sphereCenterY + Math.sin(elapsed * 2.1) * 0.045;
      innerSwirl1.rotation.z = elapsed * 1.1;
      innerSwirl2.rotation.x = -elapsed * 0.85;

      const pulse = 1 + Math.sin(elapsed * 3.0) * 0.03;
      coreTriGroup.scale.setScalar(pulse);
      coreGlowLight.intensity = 8.5 + Math.sin(elapsed * 3.5) * 2.0;

      specialists.forEach((_, index) => {
        const hovered = selectedRef.current === index;
        const flow = 0.5 + 0.5 * Math.sin(elapsed * 3.8 + index * 1.1);

        routeMaterials[index].emissiveIntensity = 1.25 + flow * 0.65 + (hovered ? 0.6 : 0);
        platforms[index].scale.setScalar(hovered ? 1.04 : 1);
        endpointLights[index].intensity = 4.2 + flow * 2.2 + (hovered ? 2.0 : 0);

        if (holoScreens[index]) {
          holoScreens[index].position.y = 1.02 + Math.sin(elapsed * 2.2 + index) * 0.03;
        }

        if (agents[index]) {
          agents[index].quaternion.copy(camera.quaternion);
        }

        routeParticles[index].forEach(({ mesh, phase, direction }) => {
          const t = (elapsed * 0.42 + phase) % 1;
          const posT = direction > 0 ? t : 1 - t;
          mesh.position.copy(curves[index].getPoint(posT));
        });
      });

      renderer.render(scene, camera);
    };

    resize();
    renderer.render(scene, camera);
    if (!reducedMotion) render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      disposables.forEach(item => item.dispose());
      environmentMap.dispose();
      environmentGenerator.dispose();
      timer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="au3d-scene"
      ref={hostRef}
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
        WebkitMaskComposite: "source-in",
        maskImage:
          "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
        maskComposite: "intersect",
      }}
    >
      <canvas
        ref={canvasRef}
        className="au3d-canvas"
        aria-label="Three-dimensional AI Pod Orchestrator machine routing energy through six physical specialist platforms: Research, Finance, HR, Engineering, Operations and Sales."
      />
      <div className="au3d-accessible-controls" aria-label="Illustrative AI specialists">
        {specialists.map((worker, index) => (
          <button
            key={worker.name}
            type="button"
            onFocus={() => setSelected(index)}
            onBlur={() => setSelected(null)}
            onClick={() => setSelected(index)}
            aria-label={`${worker.name} specialist platform`}
            aria-pressed={selected === index}
          >
            {worker.name}
          </button>
        ))}
      </div>
    </div>
  );
}