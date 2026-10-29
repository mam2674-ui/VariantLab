"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { Molecule } from "@/lib/genomes";
import { useReducedMotion } from "@/lib/clientEnv";
import { ChimeraLook } from "../three/look";
import type { Selected } from "./GenomeViewer";

/**
 * Each molecule is laid along a path (a loop for circular genomes, a gentle
 * arc for linear ones) and wound as one helix (single-stranded) or two
 * (double-stranded). Turns are schematic, not 10.5 bp per turn.
 */
const TURNS_PER_KB = 6;

function pathFor(m: Molecule, i: number, n: number): THREE.Curve<THREE.Vector3> {
  if (m.topology === "circular") {
    return new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, false, 0) as unknown as THREE.Curve<THREE.Vector3>;
  }
  const y = n > 1 ? 1 - (2 * i) / Math.max(1, n - 1) : 0;
  const len = 2.4 * Math.sqrt(m.length / 30000 + 0.15);
  return new THREE.CatmullRomCurve3([new THREE.Vector3(-len / 2, y, 0), new THREE.Vector3(0, y + 0.08, 0.15), new THREE.Vector3(len / 2, y, 0)]);
}

function helixPoints(m: Molecule, i: number, n: number, phase: number, radius: number, from: number, to: number): THREE.Vector3[] {
  const base = pathFor(m, i, n);
  const circular = m.topology === "circular";
  const turns = Math.min(260, Math.max(6, (m.length / 1000) * TURNS_PER_KB));
  const steps = Math.max(8, Math.round(((to - from) / m.length) * turns * 16));
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= steps; k++) {
    const t = (from + ((to - from) * k) / steps) / m.length;
    const p = circular ? (() => { const e = (base as unknown as THREE.EllipseCurve).getPoint(t); return new THREE.Vector3(e.x, e.y, 0); })() : (base as THREE.CatmullRomCurve3).getPoint(t);
    const tan = circular ? new THREE.Vector3(-Math.sin(t * Math.PI * 2), Math.cos(t * Math.PI * 2), 0) : (base as THREE.CatmullRomCurve3).getTangent(t);
    const nrm = new THREE.Vector3(0, 0, 1).cross(tan).normalize();
    if (nrm.lengthSq() < 1e-6) nrm.set(0, 1, 0);
    const bin = tan.clone().cross(nrm).normalize();
    const a = t * turns * Math.PI * 2 + phase;
    pts.push(p.clone().add(nrm.multiplyScalar(Math.cos(a) * radius)).add(bin.multiplyScalar(Math.sin(a) * radius)));
  }
  return pts;
}

/** Split a molecule into coloured (CDS) and neutral pieces along its length. */
function pieces(m: Molecule): { from: number; to: number; cds: number | null }[] {
  const owner = new Int32Array(m.length + 2).fill(-1);
  m.cds.forEach((c, ci) => c.segs.forEach(([s, e]) => { for (let b = s; b <= Math.min(e, m.length); b++) if (owner[b] === -1) owner[b] = ci; }));
  const out: { from: number; to: number; cds: number | null }[] = [];
  let start = 1;
  for (let b = 2; b <= m.length + 1; b++) {
    if (b === m.length + 1 || owner[b] !== owner[start]) {
      out.push({ from: start - 1, to: b - 1, cds: owner[start] === -1 ? null : owner[start] });
      start = b;
    }
  }
  return out;
}

export default function Genome3D({ mols, colors, neutral, background, doubleStranded, selected, onSelect, label }: { mols: Molecule[]; colors: string[]; neutral: string; background: string; doubleStranded: boolean; selected: Selected | null; onSelect: (s: Selected) => void; label: string }) {
  const reduced = useReducedMotion();
  const meshes = useMemo(() => {
    const out: { g: THREE.BufferGeometry; mol: number; cds: number | null }[] = [];
    mols.forEach((m, mi) => {
      const strands = doubleStranded ? [0, Math.PI * 0.8] : [0];
      for (const piece of pieces(m)) {
        if (piece.to - piece.from < 2) continue;
        for (const ph of strands) {
          const pts = helixPoints(m, mi, mols.length, ph, 0.05, piece.from, piece.to);
          if (pts.length < 2) continue;
          out.push({ g: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, 0.014, 6, false), mol: mi, cds: piece.cds });
        }
      }
    });
    return out;
  }, [mols, doubleStranded]);

  return (
    <div className="w-full aspect-[4/3] max-h-[560px] touch-none" role="img" aria-label={label}>
      <Canvas camera={{ position: [0, 0, mols.length > 1 ? 4.2 : 3.4], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: false }}>
        <ChimeraLook background={background} aoRadius={0.06} quality="medium" />
        {meshes.map((m, i) => {
          const sel = selected && selected.mol === m.mol && selected.cds === m.cds;
          const dim = Boolean(selected) && !sel;
          const color = m.cds === null ? neutral : colors[m.cds % colors.length];
          return (
            <mesh
              key={i}
              geometry={m.g}
              onClick={(e) => {
                if (m.cds === null) return;
                e.stopPropagation();
                onSelect({ mol: m.mol, cds: m.cds });
              }}
            >
              <meshStandardMaterial color={color} roughness={0.8} transparent={dim} opacity={dim ? 0.25 : 1} depthWrite={!dim} />
            </mesh>
          );
        })}
        <OrbitControls enablePan={false} autoRotate={!reduced} autoRotateSpeed={0.4} minDistance={1.2} maxDistance={9} />
      </Canvas>
    </div>
  );
}
