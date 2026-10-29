"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { extent, points, segmentsByGap, ssRuns, type StructureFile, type Vec3 } from "@/lib/structure";
import { ChimeraLook } from "../three/look";

export type ProteinStyle = "cartoon" | "surface" | "trace";

/** Flat ribbon swept along a curve: a thin rectangle extruded along the path. */
function ribbon(curve: THREE.Curve<THREE.Vector3>, steps: number, width: number, thick: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -thick / 2);
  shape.lineTo(width / 2, -thick / 2);
  shape.lineTo(width / 2, thick / 2);
  shape.lineTo(-width / 2, thick / 2);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { steps, bevelEnabled: false, extrudePath: curve });
}

function Mesh({ g, color, dim }: { g: THREE.BufferGeometry; color: string; dim: boolean }) {
  return (
    <mesh geometry={g}>
      <meshStandardMaterial color={color} roughness={0.8} metalness={0} transparent={dim} opacity={dim ? 0.12 : 1} depthWrite={!dim} />
    </mesh>
  );
}

/** Cartoon: helices and strands as flat ribbons along the Cα spline, everything else as a thin tube. */
function Cartoon({ pts, ss, color, nucleic, scale, dim }: { pts: Vec3[]; ss: string; color: string; nucleic: boolean; scale: number; dim: boolean }) {
  const geos = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    for (const seg of segmentsByGap(pts, nucleic ? 8 : 4.6)) {
      const v = pts.slice(seg.start, seg.end + 1).map((p) => new THREE.Vector3(p[0] * scale, p[1] * scale, p[2] * scale));
      if (v.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(v, false, "centripetal");
      out.push(new THREE.TubeGeometry(curve, v.length * 4, (nucleic ? 1.6 : 0.45) * scale, 8, false));
      if (nucleic || !ss) continue;
      for (const run of ssRuns(ss.slice(seg.start, seg.end + 1))) {
        if (run.code === "C" || run.end - run.start < 2) continue;
        const pv = v.slice(Math.max(0, run.start - 1), Math.min(v.length, run.end + 2));
        const c = new THREE.CatmullRomCurve3(pv, false, "centripetal");
        out.push(run.code === "H" ? ribbon(c, pv.length * 5, 2.4 * scale, 0.55 * scale) : ribbon(c, pv.length * 5, 2.0 * scale, 0.5 * scale));
      }
    }
    return out;
  }, [pts, ss, nucleic, scale]);
  return (
    <>
      {geos.map((g, i) => (
        <Mesh key={i} g={g} color={color} dim={dim} />
      ))}
    </>
  );
}

/** Coarse surface: one 3.4 Å sphere per Cα (or P). An approximation, not a computed molecular surface. */
function Surface({ pts, color, scale, dim }: { pts: Vec3[]; color: string; scale: number; dim: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.SphereGeometry(1, 14, 10), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const s = 3.4 * scale;
    pts.forEach((p, i) => m.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(p[0] * scale, p[1] * scale, p[2] * scale), new THREE.Quaternion(), new THREE.Vector3(s, s, s))));
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [pts, scale]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, pts.length]}>
      <meshStandardMaterial color={color} roughness={0.85} metalness={0} transparent={dim} opacity={dim ? 0.12 : 1} depthWrite={!dim} />
    </instancedMesh>
  );
}

function Trace({ pts, color, nucleic, scale, dim }: { pts: Vec3[]; color: string; nucleic: boolean; scale: number; dim: boolean }) {
  const geos = useMemo(
    () =>
      segmentsByGap(pts, nucleic ? 8 : 4.6)
        .map((seg) => pts.slice(seg.start, seg.end + 1).map((p) => new THREE.Vector3(p[0] * scale, p[1] * scale, p[2] * scale)))
        .filter((v) => v.length > 1)
        .map((v) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v), v.length * 3, (nucleic ? 1.4 : 0.6) * scale, 6, false)),
    [pts, nucleic, scale],
  );
  return (
    <>
      {geos.map((g, i) => (
        <Mesh key={i} g={g} color={color} dim={dim} />
      ))}
    </>
  );
}

export default function Protein3D({ data, colors, focus, reduced, label, style, background }: { data: StructureFile; colors: Record<string, string>; focus: string | null; reduced: boolean; label: string; style: ProteinStyle; background: string }) {
  const all = useMemo(() => data.chains.flatMap(points), [data]);
  const scale = 1 / extent(all);
  return (
    <div className="w-full aspect-square max-h-[600px] touch-none" role="img" aria-label={label}>
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <ChimeraLook background={background} aoRadius={0.12} quality="medium" />
        {data.chains.map((c) => {
          const pts = points(c);
          const dim = Boolean(focus) && focus !== c.id;
          const color = colors[c.id] ?? "gray";
          const nucleic = c.kind === "nucleic";
          if (style === "surface") return <Surface key={c.id} pts={pts} color={color} scale={scale} dim={dim} />;
          if (style === "trace") return <Trace key={c.id} pts={pts} color={color} nucleic={nucleic} scale={scale} dim={dim} />;
          return <Cartoon key={c.id} pts={pts} ss={c.ss} color={color} nucleic={nucleic} scale={scale} dim={dim} />;
        })}
        <OrbitControls enablePan={false} autoRotate={!reduced} autoRotateSpeed={0.5} minDistance={1.2} maxDistance={8} />
      </Canvas>
    </div>
  );
}
