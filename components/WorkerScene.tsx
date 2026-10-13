"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { characterAssetForEmployee, characterAssetForRole } from "@/lib/employee-presentation";

export type WorkerRole =
  | "research" | "finance" | "sales" | "engineering" | "operations" | "security"
  | "marketing" | "data" | "legal" | "support" | "people" | "product"
  | "quality" | "orchestrator";

function asset(role: WorkerRole, characterId?: string) {
  if (!characterId) return characterAssetForRole(role);
  return characterAssetForEmployee({
    id: characterId, name: characterId, role, category: role,
  });
}

function ModelView({ role, characterId }: { role: WorkerRole; characterId?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const selected = asset(role, characterId);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    element.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, .25, 6.0);
    scene.add(new THREE.HemisphereLight(0xfff9f2, 0x7187aa, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(-3, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbdd5ff, 1.0);
    rim.position.set(3, 4, -4);
    scene.add(rim);
    const pivot = new THREE.Group();
    scene.add(pivot);
    let cancelled = false;

    new GLTFLoader().load(selected.modelPath, gltf => {
      if (cancelled) return;
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const targetSpan = size.x > size.y * 1.2 ? 4.0 : 3.3;
      const factor = targetSpan / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(factor);
      model.position.copy(center).multiplyScalar(-factor);
      pivot.add(model);
      resize();
    }, undefined, () => setFailed(true));

    function resize() {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
      camera.aspect = rect.width / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animation = 0;
    const started = performance.now();
    function draw(time: number) {
      if (!reduced) pivot.rotation.y = Math.sin((time - started) * .00032) * .16;
      renderer.render(scene, camera);
      animation = requestAnimationFrame(draw);
    }
    draw(started);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animation);
      observer.disconnect();
      if (renderer.domElement.parentElement === element) element.removeChild(renderer.domElement);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const mats = Array.isArray(object.material) ? object.material : [object.material];
          mats.forEach(material => material.dispose());
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [selected.modelPath]);

  return <div className="worker-model" ref={host}>
    {failed && <Image unoptimized src={selected.thumbnailPath} alt="" width={1024} height={1024} className="worker-character-image" />}
  </div>;
}

export function WorkerScene({
  role = "operations", ensemble = false, ensembleRoles, className = "", characterId, assetModel = false, eager = false,
}: {
  role?: WorkerRole;
  ensemble?: boolean;
  ensembleRoles?: WorkerRole[];
  className?: string;
  characterId?: string;
  assetModel?: boolean;
  eager?: boolean;
}) {
  const roles: WorkerRole[] = ensemble ? (ensembleRoles?.length ? ensembleRoles : ["research", "finance", "operations", "engineering", "sales"]) : [role];
  if (assetModel && !ensemble) {
    const selected = asset(role, characterId);
    return <div className={"worker-scene " + className} role="img" aria-label={selected.species + " 3D model representing " + (characterId || role)}>
      <ModelView role={role} characterId={characterId} />
    </div>;
  }
  return <div className={"worker-scene worker-scene-art " + className} role="img"
    aria-label={ensemble ? "AI Pod creature workforce" : asset(role, characterId).species + " character"}>
    {roles.map((item, index) => {
      const selected = asset(item, !ensemble ? characterId : undefined);
      const spread = roles.length > 1 ? index / (roles.length - 1) : .5;
      return <Image unoptimized key={item + index} src={selected.thumbnailPath} alt="" width={1024} height={1024}
        className={ensemble ? "worker-ensemble-image" : "worker-character-image"}
        style={ensemble ? {
          left: (5 + spread * 72) + "%",
          zIndex: Math.round(10 - Math.abs(spread - .5) * 10),
          transform: "translateX(-50%) scale(" + (1.08 - Math.abs(spread - .5) * .27) + ")",
        } : undefined}
        loading={eager ? "eager" : "lazy"} sizes={ensemble ? "(max-width: 700px) 38vw, 18vw" : "(max-width: 700px) 70vw, 28vw"} />;
    })}
  </div>;
}
