"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState, type RefObject } from "react";
import { useCssTokens, useReducedMotion } from "@/lib/clientEnv";
import * as THREE from "three";
import type { DiagramSpec } from "@/lib/schema";
import { models3d } from "./models";
import { ChimeraLook } from "./look";
import { Scene, useScene, type Palette, type SceneCtx, type View3D } from "./parts";

const PAGE = { bg: "--canvas" } as const;
const TOKENS: Record<keyof Palette, string> = {
  envelope: "--c-envelope",
  "surface-protein": "--c-surface",
  matrix: "--c-matrix",
  tegument: "--c-tegument",
  capsid: "--c-capsid",
  nucleocapsid: "--c-nucleocapsid",
  genome: "--c-genome",
  portal: "--c-portal",
  tail: "--c-tail",
  fibre: "--c-fibre",
  canvas: "--canvas-elevated",
};

/** Keeps the cutaway plane facing the camera, so the near half is always the one removed. */
function ClipFollower() {
  const { camera } = useThree();
  // Held in a ref: the plane is a shared three.js object updated every frame, not React state.
  const plane = useRef(useScene().clipPlane);
  useFrame(() => {
    plane.current.normal.copy(camera.position).normalize().negate();
    plane.current.constant = 0;
  });
  return null;
}

/** Eases the explode value toward its target; jumps when motion is reduced. */
function ExplodeDriver({ target, explodeRef, reduced }: { target: number; explodeRef: RefObject<number>; reduced: boolean }) {
  useFrame((_, dt) => {
    explodeRef.current = reduced ? target : THREE.MathUtils.damp(explodeRef.current, target, 5, dt);
  });
  return null;
}

export interface Virus3DProps {
  spec: DiagramSpec;
  view?: View3D;
  hidden?: Set<string>;
  selected?: string | null;
  onSelect?: (id: string) => void;
  exploded?: boolean;
  autoRotate?: boolean;
  interactive?: boolean;
  className?: string;
  label: string;
  /** Match the page background instead of a panel (used by the hero). */
  onPage?: boolean;
}

export default function Virus3D({ spec, view = "cutaway", hidden = new Set(), selected = null, onSelect = () => {}, exploded = false, autoRotate = true, interactive = true, className, label, onPage = false }: Virus3DProps) {
  const model = models3d[spec.renderer];
  const palette = useCssTokens(TOKENS) as Palette | null;
  const pageBg = useCssTokens(PAGE)?.bg;
  const reduced = useReducedMotion();
  const explode = useRef(0);
  const [clipPlane] = useState(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0));

  const interior = useMemo(() => spec.components.filter((c) => c.layer === "interior").map((c) => c.id), [spec]);

  if (!palette) return <div className={className} aria-hidden="true" />;

  const ctx: SceneCtx = { view, hidden, interior, selected, onSelect, explode, clipPlane, palette, interactive };

  return (
    <div className={className} role="img" aria-label={label}>
      <Canvas
        camera={{ position: [0, 0.2, model.distance], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: false, localClippingEnabled: true, powerPreference: "high-performance" } as THREE.WebGLRendererParameters}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
        onPointerMissed={() => interactive && selected && onSelect(selected)}
      >
        <ChimeraLook background={onPage ? pageBg ?? palette.canvas : palette.canvas} aoRadius={0.18} quality="medium" />
        <Scene.Provider value={ctx}>
          <model.Model />
        </Scene.Provider>
        <Scene.Provider value={ctx}>
          <ClipFollower />
        </Scene.Provider>
        <ExplodeDriver target={exploded ? 1 : 0} explodeRef={explode} reduced={reduced} />
        <OrbitControls enablePan={false} enableZoom={interactive} enableRotate={interactive} autoRotate={autoRotate && !reduced} autoRotateSpeed={0.6} minDistance={1.5} maxDistance={9} />
      </Canvas>
    </div>
  );
}
