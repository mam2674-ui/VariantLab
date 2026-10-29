"use client";

import { createContext, useContext, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { ComponentType } from "@/lib/schema";

export type View3D = "exterior" | "cutaway";
export type Palette = Record<ComponentType | "canvas", string>;

export interface SceneCtx {
  view: View3D;
  hidden: Set<string>;
  interior: readonly string[];
  selected: string | null;
  onSelect: (id: string) => void;
  explode: { current: number };
  clipPlane: THREE.Plane;
  palette: Palette;
  interactive: boolean;
}

export const Scene = createContext<SceneCtx | null>(null);
const PartCtx = createContext<{ id: string; dim: boolean; selected: boolean; shell: boolean }>({ id: "", dim: false, selected: false, shell: false });

export function useScene() {
  const s = useContext(Scene);
  if (!s) throw new Error("Scene context missing");
  return s;
}

/**
 * One structural component in 3D. `rank` sets how far it moves in the
 * exploded view (outer layers move most); `axis` switches from radial
 * scaling to sliding along a direction for elongated models.
 */
export function Part3D({ id, rank = 0, axis, shell = false, children }: { id: string; rank?: number; axis?: [number, number, number]; shell?: boolean; children: ReactNode }) {
  const s = useScene();
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const e = s.explode.current;
    if (axis) g.position.set(axis[0] * e, axis[1] * e, axis[2] * e);
    else g.scale.setScalar(1 + e * 0.32 * rank);
  });
  if (s.hidden.has(id)) return null;
  if (s.view === "exterior" && s.interior.includes(id)) return null;
  const selected = s.selected === id;
  const dim = Boolean(s.selected) && !selected;
  // Exterior parts are always cut in cutaway (so surface proteins don't float); interior shells opt in.
  const clipped = shell || !s.interior.includes(id);
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!s.interactive) return;
    e.stopPropagation();
    s.onSelect(id);
  };
  return (
    <PartCtx.Provider value={{ id, dim, selected, shell: clipped }}>
      <group
        ref={ref}
        onClick={onClick}
        onPointerOver={(e) => {
          if (!s.interactive) return;
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        {children}
      </group>
    </PartCtx.Provider>
  );
}

/**
 * Material keyed to the semantic structural palette. Shells are clipped in
 * cutaway so the inside shows; dimmed parts fade when something is selected.
 */
export function Mat({ type, opacity = 1, flat = false, side = THREE.FrontSide }: { type: ComponentType; opacity?: number; flat?: boolean; side?: THREE.Side }) {
  const s = useScene();
  const p = useContext(PartCtx);
  const color = s.palette[type];
  const o = p.dim ? Math.min(opacity, 0.12) : opacity;
  const clip = p.shell && s.view === "cutaway" ? [s.clipPlane] : [];
  return (
    <meshStandardMaterial
      color={color}
      emissive={p.selected ? color : "black"}
      emissiveIntensity={p.selected ? 0.35 : 0}
      roughness={0.82}
      metalness={0}
      transparent={o < 1}
      opacity={o}
      depthWrite={o >= 1}
      flatShading={flat}
      clippingPlanes={clip}
      clipShadows
      side={clip.length ? THREE.DoubleSide : side}
    />
  );
}

/** Many copies of one geometry, placed by matrices (spikes, capsomers, beads). */
export function Instances({ geometry, matrices, type, opacity = 1, flat = false }: { geometry: THREE.BufferGeometry; matrices: THREE.Matrix4[]; type: ComponentType; opacity?: number; flat?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [matrices]);
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, matrices.length]}>
      <Mat type={type} opacity={opacity} flat={flat} />
    </instancedMesh>
  );
}

/** Tube along a curve; `double` draws two parallel strands for double-stranded nucleic acid. */
export function Strand({ curve, radius = 0.018, segments = 200, double = false, type = "genome" as ComponentType }: { curve: THREE.Curve<THREE.Vector3>; radius?: number; segments?: number; double?: boolean; type?: ComponentType }) {
  const geos = useMemo(() => {
    const a = new THREE.TubeGeometry(curve, segments, radius, 6, false);
    if (!double) return [a];
    const b = a.clone();
    b.translate(radius * 2.2, 0, 0);
    return [a, b];
  }, [curve, radius, segments, double]);
  return (
    <>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <Mat type={type} />
        </mesh>
      ))}
    </>
  );
}
