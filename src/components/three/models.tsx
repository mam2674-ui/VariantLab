"use client";

import { useMemo, useState, type FC } from "react";
import * as THREE from "three";
import type { ComponentType, DiagramSpec } from "@/lib/schema";
import {
  blobSpike,
  bumpySphere,
  coilCurve,
  fibonacciSphere,
  geodesicPoints,
  helixCurve,
  icosaFaceCentres,
  icosaVertices,
  lumpySphere,
  ringMatrices,
  seeded,
  wanderCurve,
  type BlobKind,
} from "./geom";
import { Instances, Mat, Part3D, Strand } from "./parts";

/**
 * Procedural, schematic 3D models drawn in a molecular-graphics style:
 * capsids as lattices of subunit "blobs", spikes as lobed protein-like
 * shapes. Component ids match the 2D diagram specs. Where the cited
 * architecture fixes a count (162 HSV-1 capsomers, 240 + 12 adenovirus
 * capsomers, 72 papillomavirus pentamers) the lattice uses it; other counts,
 * shapes and positions are illustrative.
 */
export interface Model3D {
  parts: readonly string[];
  distance: number;
  Model: FC;
}

/** Build once per mount (lazy state initialiser). */
const useOnce = <T,>(f: () => T) => useState(f)[0];
const FIBRE_CYLINDER = new THREE.CylinderGeometry(1,1,1,5);
const SPHERE = new THREE.SphereGeometry(1, 16, 12);

function Spheres({ matrices, type, opacity = 1 }: { matrices: THREE.Matrix4[]; type: ComponentType; opacity?: number }) {
  return <Instances geometry={SPHERE} matrices={matrices} type={type} opacity={opacity} />;
}

function Membrane({ r = 1 }: { r?: number }) {
  const outer = useOnce(() => bumpySphere(r, 0.012));
  const inner = useOnce(() => bumpySphere(r * 0.955, 0.012, 7));
  return (
    <>
      <mesh geometry={outer}>
        <Mat type="envelope" />
      </mesh>
      <mesh geometry={inner}>
        <Mat type="envelope" opacity={0.9} />
      </mesh>
    </>
  );
}

function Blobs({ n, r, kind, length, head, seed = 1, type = "surface-protein" as ComponentType }: { n: number; r: number; kind: BlobKind; length: number; head: number; seed?: number; type?: ComponentType }) {
  const mats = useMemo(() => {
    const rand = seeded(seed);
    return fibonacciSphere(n, r).flatMap((p) => blobSpike(p.applyAxisAngle(new THREE.Vector3(0, 1, 0), rand() * 0.25), kind, length, head));
  }, [n, r, kind, length, head, seed]);
  return <Spheres matrices={mats} type={type} />;
}

/** Geodesic capsid: rings of subunits on the lattice, pentamers at the 12 vertices, over a filler shell. */
function CapsomerShell({ detail, r, k = 6, type = "capsid" as ComponentType, five = true }: { detail: number; r: number; k?: number; type?: ComponentType; five?: boolean }) {
  const mats = useOnce(() => {
    const { five: f, rest } = geodesicPoints(detail, r);
    const edge = (r * 1.1) / (detail + 1);
    const ringR = edge * 0.27, sR = edge * 0.24;
    const m = rest.flatMap((p) => ringMatrices(p, k, ringR, sR, 0, 0));
    if (five) m.push(...f.flatMap((p) => ringMatrices(p, 5, ringR * 0.9, sR, 0, 0)));
    return m;
  });
  return (
    <>
      <Spheres matrices={mats} type={type} />
      <mesh>
        <icosahedronGeometry args={[r * 0.97, 3]} />
        <Mat type={type} />
      </mesh>
    </>
  );
}

const PR8 = [2341, 2341, 2233, 1778, 1565, 1413, 1027, 890];

const influenza: Model3D = {
  parts: ["envelope", "ha", "na", "m2", "matrix", "rnp"],
  distance: 4.3,
  Model() {
    const rnps = useOnce(() => {
      const rand = seeded(9);
      return PR8.map((nt, i) => {
        const a = (i / 7) * Math.PI * 2;
        const pos: [number, number, number] = i === 0 ? [0, 0, 0] : [Math.cos(a) * 0.28, (rand() - 0.5) * 0.1, Math.sin(a) * 0.28];
        const len = 0.35 + (nt / 2341) * 0.6;
        return { pos, curve: new THREE.CatmullRomCurve3(helixCurve(len, 0.03, 0.05).points.map((p) => new THREE.Vector3(p.y, p.x, p.z))) };
      });
    });
    const m2 = useOnce(() => fibonacciSphere(8, 1.0).flatMap((p) => ringMatrices(p, 4, 0.018, 0.022, 0, 0.005)));
    const matrix = useOnce(() => fibonacciSphere(700, 0.915).map((p) => new THREE.Matrix4().compose(p, new THREE.Quaternion(), new THREE.Vector3(0.04, 0.04, 0.04))));
    return (
      <>
        <Part3D id="envelope" rank={3} shell>
          <Membrane />
        </Part3D>
        <Part3D id="ha" rank={3.4}>
          <Blobs n={80} r={1} kind="trimer" length={0.1} head={0.05} />
        </Part3D>
        <Part3D id="na" rank={3.4}>
          <Blobs n={14} r={1.002} kind="tetramer" length={0.08} head={0.045} seed={4} />
        </Part3D>
        <Part3D id="m2" rank={3}>
          <Spheres matrices={m2} type="surface-protein" />
        </Part3D>
        <Part3D id="matrix" rank={2} shell>
          <Spheres matrices={matrix} type="matrix" />
        </Part3D>
        <Part3D id="rnp" rank={0}>
          {rnps.map((r, i) => (
            <group key={i} position={r.pos}>
              <Strand curve={r.curve} radius={0.024} segments={120} type="nucleocapsid" />
            </group>
          ))}
        </Part3D>
      </>
    );
  },
};

const coronavirus: Model3D = {
  parts: ["envelope", "spike", "m-protein", "e-protein", "nucleocapsid"],
  distance: 4.3,
  Model() {
    const beads = useOnce(() => {
      const mats: THREE.Matrix4[] = [];
      for (let u = 0; u < 9; u++) {
        const c = wanderCurve(0.7, 4, 20 + u);
        for (let k = 0; k < 12; k++) mats.push(new THREE.Matrix4().compose(c.getPoint(k / 11), new THREE.Quaternion(), new THREE.Vector3(0.04, 0.04, 0.04)));
      }
      return mats;
    });
    const rna = useOnce(() => wanderCurve(0.75, 14, 77));
    const m = useOnce(() => fibonacciSphere(220, 1.0).flatMap((p) => ringMatrices(p, 2, 0.012, 0.018, 0, 0.004)));
    const e = useOnce(() => fibonacciSphere(6, 1.003).flatMap((p) => ringMatrices(p, 5, 0.018, 0.016, 0, 0.006)));
    return (
      <>
        <Part3D id="envelope" rank={2} shell>
          <Membrane />
        </Part3D>
        <Part3D id="spike" rank={2.4}>
          <Blobs n={24} r={1} kind="club" length={0.12} head={0.085} seed={7} />
        </Part3D>
        <Part3D id="m-protein" rank={2}>
          <Spheres matrices={m} type="surface-protein" />
        </Part3D>
        <Part3D id="e-protein" rank={2}>
          <Spheres matrices={e} type="surface-protein" />
        </Part3D>
        <Part3D id="nucleocapsid" rank={0}>
          <Spheres matrices={beads} type="nucleocapsid" />
          <Strand curve={rna} radius={0.01} />
        </Part3D>
      </>
    );
  },
};

const herpesvirus: Model3D = {
  parts: ["envelope", "glycoproteins", "tegument", "capsid", "genome"],
  distance: 4.3,
  Model() {
    const teg = useOnce(() => lumpySphere(0.8, 0.16, 11, new THREE.Vector3(0.05, 0.04, 0)));
    const coil = useOnce(() => coilCurve(0.42, 9, 4));
    return (
      <>
        <Part3D id="envelope" rank={3} shell>
          <Membrane />
        </Part3D>
        <Part3D id="glycoproteins" rank={3.3}>
          <Blobs n={110} r={1} kind="trimer" length={0.06} head={0.035} seed={3} />
        </Part3D>
        <Part3D id="tegument" rank={2} shell>
          <mesh geometry={teg}>
            <Mat type="tegument" />
          </mesh>
        </Part3D>
        <Part3D id="capsid" rank={1} shell>
          {/* detail 3 → 162 capsomer positions (150 hexons + 12 vertex positions incl. the portal) */}
          <CapsomerShell detail={3} r={0.64} />
        </Part3D>
        <Part3D id="genome" rank={0}>
          <Strand curve={coil} radius={0.014} segments={500} double />
        </Part3D>
      </>
    );
  },
};

const adenovirus: Model3D = {
  parts: ["hexon", "penton", "fibre", "genome"],
  distance: 4.9,
  Model() {
    const verts = useOnce(() => icosaVertices(1));
    const pentons = useOnce(() => verts.flatMap((v) => ringMatrices(v, 5, 0.06, 0.055, 0, 0.02)));
    const fibres = useOnce(() =>
      verts.flatMap((v) => {
        const n = v.clone().normalize();
        const out: THREE.Matrix4[] = [];
        for (let i = 0; i < 14; i++) out.push(new THREE.Matrix4().compose(v.clone().add(n.clone().multiplyScalar(0.06 + i * 0.04)), new THREE.Quaternion(), new THREE.Vector3(0.02, 0.02, 0.02)));
        out.push(...ringMatrices(v.clone().add(n.clone().multiplyScalar(0.65)), 3, 0.035, 0.045, 0, 0));
        return out;
      }),
    );
    const coil = useOnce(() => coilCurve(0.55, 7, 8));
    return (
      <>
        <Part3D id="hexon" rank={1} shell>
          {/* detail 4 → 252 positions: 240 hexon positions; the 12 vertices are left for pentons */}
          <CapsomerShell detail={4} r={1} k={6} five={false} />
        </Part3D>
        <Part3D id="penton" rank={1.2}>
          <Spheres matrices={pentons} type="capsid" />
        </Part3D>
        <Part3D id="fibre" rank={1.6}>
          <Spheres matrices={fibres} type="fibre" />
        </Part3D>
        <Part3D id="genome" rank={0}>
          <Strand curve={coil} radius={0.016} segments={400} double />
        </Part3D>
      </>
    );
  },
};

const papillomavirus: Model3D = {
  parts: ["l1", "l2", "genome"],
  distance: 4.1,
  Model() {
    // 72 pentameric capsomers × 5 = 360 L1 copies (ICTV); positions illustrative, not a true T=7 lattice.
    const caps = useOnce(() => fibonacciSphere(72, 1).flatMap((p) => ringMatrices(p, 5, 0.075, 0.07, 0, 0.02)));
    const ring = useOnce(
      () =>
        new THREE.CatmullRomCurve3(
          Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return new THREE.Vector3(Math.cos(a) * 0.55, Math.sin(a * 3) * 0.12, Math.sin(a) * 0.5);
          }),
          true,
        ),
    );
    const l2 = useOnce(() => fibonacciSphere(12, 0.82).map((p) => new THREE.Matrix4().compose(p, new THREE.Quaternion(), new THREE.Vector3(0.05, 0.05, 0.05))));
    return (
      <>
        <Part3D id="l1" rank={1.5} shell>
          <Spheres matrices={caps} type="capsid" />
          <mesh>
            <icosahedronGeometry args={[0.93, 3]} />
            <Mat type="capsid" />
          </mesh>
        </Part3D>
        <Part3D id="l2" rank={0.8}>
          <Spheres matrices={l2} type="capsid" />
        </Part3D>
        <Part3D id="genome" rank={0}>
          <Strand curve={ring} radius={0.018} double />
        </Part3D>
      </>
    );
  },
};

const phageT4: Model3D = {
  // Units: 1 = 100 nm. Head 1.2 × 0.86, tail ~1.4 (Fokine 2004; Rao 2023).
  parts: ["head", "dna", "portal", "sheath", "tube", "baseplate", "fibres"],
  distance: 5.2,
  Model() {
    const W = 0.86 / 2;
    const head = useOnce(() => {
      const out: THREE.Matrix4[] = [];
      for (let f = 0; f < 5; f++) {
        const a0 = (f / 5) * Math.PI * 2, a1 = ((f + 1) / 5) * Math.PI * 2;
        for (let u = 0; u <= 4; u++)
          for (let y = -0.28; y <= 0.281; y += 0.093) {
            const t = u / 4;
            const p = new THREE.Vector3(Math.cos(a0) * (1 - t) + Math.cos(a1) * t, 0, Math.sin(a0) * (1 - t) + Math.sin(a1) * t).multiplyScalar(W * 0.96);
            p.y = y + 0.6;
            out.push(...ringMatrices(p, 6, 0.035, 0.032, 0, 0));
          }
      }
      return out;
    });
    const fibres = useOnce(() =>
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const d = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
        return new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.72, 0), d.clone().multiplyScalar(0.7).setY(-0.35), d.clone().multiplyScalar(0.95).setY(-1.25)], false, "catmullrom", 0);
      }),
    );
    const sheath = useOnce(() => {
      const out: THREE.Matrix4[] = [];
      for (let i = 0; i < 22; i++)
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2 + (i % 2) * 0.5;
          out.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * 0.09, -0.12 - i * 0.055, Math.sin(a) * 0.09), new THREE.Quaternion(), new THREE.Vector3(0.04, 0.032, 0.04)));
        }
      return out;
    });
    const coil = useOnce(() => coilCurve(0.32, 10, 2));
    return (
      <group position={[0, 0.55, 0]}>
        <Part3D id="head" axis={[0, 0.5, 0]} shell>
          <Spheres matrices={head} type="capsid" />
          <group position={[0, 0.6, 0]}>
            <mesh>
              <cylinderGeometry args={[W * 0.95, W * 0.95, 0.62, 5]} />
              <Mat type="capsid" flat />
            </mesh>
            <mesh position={[0, 0.31 + 0.145, 0]}>
              <coneGeometry args={[W * 0.95, 0.29, 5]} />
              <Mat type="capsid" flat />
            </mesh>
            <mesh position={[0, -0.31 - 0.145, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[W * 0.95, 0.29, 5]} />
              <Mat type="capsid" flat />
            </mesh>
          </group>
        </Part3D>
        <Part3D id="dna" axis={[0, 0.5, 0]}>
          <group position={[0, 0.6, 0]}>
            <Strand curve={coil} radius={0.012} segments={500} double />
          </group>
        </Part3D>
        <Part3D id="portal" axis={[0, 0.2, 0]}>
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.1, 12]} />
            <Mat type="portal" />
          </mesh>
        </Part3D>
        <Part3D id="sheath" axis={[0.5, 0, 0]} shell>
          <Spheres matrices={sheath} type="tail" />
        </Part3D>
        <Part3D id="tube" axis={[-0.3, 0, 0]}>
          <mesh position={[0, -0.7, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 1.25, 12]} />
            <Mat type="portal" />
          </mesh>
        </Part3D>
        <Part3D id="baseplate" axis={[0, -0.3, 0]}>
          <mesh position={[0, -1.33, 0]}>
            <cylinderGeometry args={[0.26, 0.2, 0.08, 6]} />
            <Mat type="tail" flat />
          </mesh>
        </Part3D>
        <Part3D id="fibres" axis={[0, -0.5, 0]}>
          <group position={[0, -0.62, 0]}>
            {fibres.map((c, i) => (
              <Strand key={i} curve={c} radius={0.016} segments={40} type="fibre" />
            ))}
          </group>
        </Part3D>
      </group>
    );
  },
};

const retrovirus: Model3D = {
  parts: ["envelope", "env", "core", "genome"],
  distance: 4.3,
  Model() {
    const strands = useOnce(() =>
      [0, 1].map((k) => new THREE.CatmullRomCurve3(Array.from({ length: 8 }, (_, i) => new THREE.Vector3(Math.sin(i * 1.3 + k * 2) * (0.06 + i * 0.03), -0.45 + i * 0.13, Math.cos(i * 1.1 + k) * (0.05 + i * 0.02))))),
    );
    // Cone core studded with capsid-protein subunits (lattice illustrative).
    const core = useOnce(() => {
      const out: THREE.Matrix4[] = [];
      for (let row = 0; row < 14; row++) {
        const y = -0.55 + row * 0.085;
        const rad = 0.34 - (row / 13) * 0.22;
        const count = Math.max(5, Math.round(rad * 34));
        for (let k = 0; k < count; k++) {
          const a = (k / count) * Math.PI * 2 + (row % 2) * 0.3;
          out.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad), new THREE.Quaternion(), new THREE.Vector3(0.045, 0.045, 0.045)));
        }
      }
      return out;
    });
    return (
      <>
        <Part3D id="envelope" rank={2} shell>
          <Membrane />
        </Part3D>
        <Part3D id="env" rank={2.4}>
          <Blobs n={14} r={1} kind="trimer" length={0.08} head={0.06} seed={13} />
        </Part3D>
        <Part3D id="core" rank={0.6} shell>
          <group rotation={[0, 0, -0.5]}>
            <Spheres matrices={core} type="capsid" />
          </group>
        </Part3D>
        <Part3D id="genome" rank={0}>
          <group rotation={[0, 0, -0.5]}>
            {strands.map((c, i) => (
              <Strand key={i} curve={c} radius={0.018} segments={60} />
            ))}
          </group>
        </Part3D>
      </>
    );
  },
};

const hepadnavirus: Model3D = {
  parts: ["envelope", "surface", "capsid", "genome"],
  distance: 4.1,
  Model() {
    return (
      <>
        <Part3D id="envelope" rank={2} shell>
          <Membrane />
        </Part3D>
        <Part3D id="surface" rank={2.3}>
          <Blobs n={140} r={1} kind="dimer" length={0.03} head={0.035} />
        </Part3D>
        <Part3D id="capsid" rank={1} shell>
          <CapsomerShell detail={3} r={0.76} k={3} />
        </Part3D>
        <Part3D id="genome" rank={0}>
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[0.4, 0.02, 10, 90]} />
            <Mat type="genome" />
          </mesh>
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[0.35, 0.02, 10, 90, Math.PI * 1.6]} />
            <Mat type="genome" />
          </mesh>
        </Part3D>
      </>
    );
  },
};

const RVA = [3302, 2693, 2591, 2362, 1614, 1356, 1105, 1059, 1062, 751, 667];

const rotavirus: Model3D = {
  parts: ["vp4", "vp7", "vp6", "vp2", "genome"],
  distance: 4.3,
  Model() {
    const segs = useOnce(() => RVA.map((bp, i) => wanderCurve(0.42, 3 + Math.round((bp / 3302) * 4), 40 + i)));
    return (
      <>
        <Part3D id="vp4" rank={3.4}>
          <Blobs n={60} r={1.02} kind="dimer" length={0.1} head={0.05} seed={21} />
        </Part3D>
        <Part3D id="vp7" rank={3} shell>
          <CapsomerShell detail={4} r={1} k={3} five={false} />
        </Part3D>
        <Part3D id="vp6" rank={2} shell>
          <CapsomerShell detail={4} r={0.86} k={3} five={false} />
        </Part3D>
        <Part3D id="vp2" rank={1} shell>
          <mesh>
            <icosahedronGeometry args={[0.7, 2]} />
            <Mat type="capsid" flat />
          </mesh>
        </Part3D>
        <Part3D id="genome" rank={0}>
          {segs.map((c, i) => (
            <Strand key={i} curve={c} radius={0.014} segments={60} double />
          ))}
        </Part3D>
      </>
    );
  },
};

const picornavirus: Model3D = {
  parts: ["capsid", "genome"],
  distance: 3.9,
  Model() {
    // 60 protomers: three subunit lobes per icosahedral face (20 × 3), plus fivefold bumps.
    const shell = useOnce(() => [
      ...icosaFaceCentres(1).flatMap((c) => ringMatrices(c, 3, 0.2, 0.17, 0, 0)),
      ...icosaVertices(1).map((v) => new THREE.Matrix4().compose(v.clone().multiplyScalar(0.98), new THREE.Quaternion(), new THREE.Vector3(0.17, 0.17, 0.17))),
    ]);
    const rna = useOnce(() => wanderCurve(0.6, 16, 61));
    return (
      <>
        <Part3D id="capsid" rank={1.5} shell>
          <Spheres matrices={shell} type="capsid" />
          <mesh>
            <icosahedronGeometry args={[0.9, 2]} />
            <Mat type="capsid" />
          </mesh>
        </Part3D>
        <Part3D id="genome" rank={0}>
          <Strand curve={rna} radius={0.022} segments={300} />
        </Part3D>
      </>
    );
  },
};

const tobamovirus: Model3D = {
  // Rod ratio 300:18 (ICTV). Units: 1 = 100 nm → length 3.0, radius 0.09. Subunits per turn illustrative.
  parts: ["coat", "genome"],
  distance: 3.4,
  Model() {
    const L = 3.0, R = 0.09, pitch = 0.024, per = 16;
    const mats = useOnce(() => {
      const out: THREE.Matrix4[] = [];
      const turns = Math.floor(L / pitch);
      for (let i = 0; i < turns * per; i++) {
        const a = (i / per) * Math.PI * 2;
        const p = new THREE.Vector3(-L / 2 + (i / per) * pitch, Math.cos(a) * R * 0.7, Math.sin(a) * R * 0.7);
        out.push(new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a), new THREE.Vector3(0.012, 0.03, 0.016)));
      }
      return out;
    });
    const rna = useOnce(() => helixCurve(L, R * 0.45, pitch * 4));
    return (
      <group rotation={[0, 0, 0.35]}>
        <Part3D id="coat" axis={[0, 0.25, 0]} shell>
          <Spheres matrices={mats} type="capsid" />
        </Part3D>
        <Part3D id="genome" axis={[0, -0.15, 0]}>
          <Strand curve={rna} radius={0.007} segments={1600} />
        </Part3D>
      </group>
    );
  },
};

const microvirus: Model3D = {
  parts: ["capsid", "spikes", "genome"],
  distance: 4.3,
  Model() {
    const verts = useOnce(() => icosaVertices(1));
    const shell = useOnce(() => icosaFaceCentres(1).flatMap((c) => ringMatrices(c, 3, 0.22, 0.2, 0.5, 0)));
    const spikes = useOnce(() => verts.flatMap((v) => ringMatrices(v.clone().multiplyScalar(1.05), 5, 0.1, 0.085, 0, 0)));
    const loop = useOnce(() => wanderCurve(0.6, 10, 5, true));
    return (
      <>
        <Part3D id="capsid" rank={1} shell>
          <Spheres matrices={shell} type="capsid" />
          <mesh>
            <icosahedronGeometry args={[0.92, 1]} />
            <Mat type="capsid" flat />
          </mesh>
        </Part3D>
        <Part3D id="spikes" rank={1.6}>
          <Spheres matrices={spikes} type="surface-protein" />
        </Part3D>
        <Part3D id="genome" rank={0}>
          <Strand curve={loop} radius={0.02} segments={200} />
        </Part3D>
      </>
    );
  },
};

/** Points along a U-bent filament (legs along -y, joined by a half-circle), with tangents. */
function uFilament(legs: number, r: number, n: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const total = 2 * legs + Math.PI * r;
    const d = (i / n) * total;
    if (d < legs) pts.push(new THREE.Vector3(-r, legs / 2 - d, 0));
    else if (d < legs + Math.PI * r) {
      const a = Math.PI + (d - legs) / r;
      pts.push(new THREE.Vector3(Math.cos(a) * r, -legs / 2 + Math.sin(a) * r, 0));
    } else pts.push(new THREE.Vector3(r, -legs / 2 + (d - legs - Math.PI * r), 0));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/** Instance matrices for spheres placed on a tube of radius `rad` around a curve. */
function onTube(curve: THREE.Curve<THREE.Vector3>, rad: number, along: number, around: number, size: number, lift = 0) {
  const out: THREE.Matrix4[] = [];
  const frames = curve.computeFrenetFrames(along, false);
  for (let i = 0; i <= along; i++) {
    const p = curve.getPointAt(i / along);
    const nI = frames.normals[Math.min(i, along - 1)], bI = frames.binormals[Math.min(i, along - 1)];
    for (let k = 0; k < around; k++) {
      const a = (k / around) * Math.PI * 2 + (i % 2) * (Math.PI / around);
      const off = nI.clone().multiplyScalar(Math.cos(a) * (rad + lift)).add(bI.clone().multiplyScalar(Math.sin(a) * (rad + lift)));
      out.push(new THREE.Matrix4().compose(p.clone().add(off), new THREE.Quaternion(), new THREE.Vector3(size, size, size)));
    }
  }
  return out;
}

const filovirus: Model3D = {
  // Units: 1 = 100 nm. Diameter ~0.97; a ~8 nm-long U-bent stretch is drawn (real filaments vary, beyond 20 µm).
  parts: ["envelope", "gp", "rnp"],
  distance: 6.2,
  Model() {
    const curve = useOnce(() => uFilament(2.2, 0.9, 200));
    const env = useOnce(() => new THREE.TubeGeometry(curve, 300, 0.485, 36, false));
    const gp = useOnce(() => onTube(curve, 0.485, 260, 26, 0.035, 0.03));
    const rnp = useOnce(() => onTube(curve, 0.13, 420, 10, 0.05));
    return (
      <>
        <Part3D id="envelope" rank={2} shell>
          <mesh geometry={env}>
            <Mat type="envelope" />
          </mesh>
        </Part3D>
        <Part3D id="gp" rank={2.4}>
          <Spheres matrices={gp} type="surface-protein" />
        </Part3D>
        <Part3D id="rnp" rank={0}>
          <Spheres matrices={rnp} type="nucleocapsid" />
        </Part3D>
      </>
    );
  },
};

/** Bullet: cylinder along x with a hemispherical dome at +x. */
function bulletPoints(len: number, r: number, nAlong: number, nAround: number, size: number, lift = 0) {
  const out: THREE.Matrix4[] = [];
  const body = len - r;
  for (let i = 0; i <= nAlong; i++) {
    const x = -len / 2 + (i / nAlong) * body;
    for (let k = 0; k < nAround; k++) {
      const a = (k / nAround) * Math.PI * 2 + (i % 2) * (Math.PI / nAround);
      out.push(new THREE.Matrix4().compose(new THREE.Vector3(x, Math.cos(a) * (r + lift), Math.sin(a) * (r + lift)), new THREE.Quaternion(), new THREE.Vector3(size, size, size)));
    }
  }
  fibonacciSphere(160, r + lift).forEach((p) => {
    if (p.x > 0) out.push(new THREE.Matrix4().compose(p.clone().add(new THREE.Vector3(-len / 2 + body, 0, 0)), new THREE.Quaternion(), new THREE.Vector3(size, size, size)));
  });
  return out;
}

const rhabdovirus: Model3D = {
  // Bullet ~180 × 75 nm drawn within the 130–250 × 60–110 nm lyssavirus range.
  parts: ["envelope", "g", "matrix", "nucleocapsid"],
  distance: 4.4,
  Model() {
    const L = 1.8, R = 0.38;
    const shape = useOnce(() => {
      const g = new THREE.CapsuleGeometry(R, L - 2 * R, 12, 40).rotateZ(Math.PI / 2);
      // flatten the -x end into a flat base
      const pos = g.getAttribute("position");
      for (let i = 0; i < pos.count; i++) if (pos.getX(i) < -L / 2 + R) pos.setX(i, Math.max(pos.getX(i), -L / 2 + R * 0.92));
      g.computeVertexNormals();
      return g;
    });
    const g = useOnce(() => bulletPoints(L, R, 26, 22, 0.03, 0.05));
    const coil = useOnce(() => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 900; i++) {
        const t = i / 900, a = t * Math.PI * 2 * 30;
        const x = -L / 2 + 0.1 + t * (L - R - 0.1);
        pts.push(new THREE.Vector3(x, Math.cos(a) * 0.24, Math.sin(a) * 0.24));
      }
      return new THREE.CatmullRomCurve3(pts);
    });
    return (
      <>
        <Part3D id="envelope" rank={2} shell>
          <mesh geometry={shape}>
            <Mat type="envelope" />
          </mesh>
        </Part3D>
        <Part3D id="g" rank={2.4}>
          <Spheres matrices={g} type="surface-protein" />
        </Part3D>
        <Part3D id="matrix" rank={1.2} shell>
          <mesh geometry={shape} scale={0.9}>
            <Mat type="matrix" />
          </mesh>
        </Part3D>
        <Part3D id="nucleocapsid" rank={0}>
          <Strand curve={coil} radius={0.03} segments={1800} type="nucleocapsid" />
        </Part3D>
      </>
    );
  },
};

const poxvirus: Model3D = {
  // Brick ~360 × 240 × 200 nm, inside the 220–450 × 140–260 × 140–260 nm family range.
  parts: ["membrane", "tubules", "lateral", "core", "genome"],
  distance: 6.4,
  Model() {
    const tub = useOnce(() => {
      const out: THREE.Matrix4[] = [];
      const rand = seeded(31);
      for (let i = 0; i < 520; i++) {
        const face = i % 6;
        const u = rand() - 0.5, v = rand() - 0.5;
        const p = face < 2 ? new THREE.Vector3(u * 3.4, v * 2.2, face ? 1.02 : -1.02) : face < 4 ? new THREE.Vector3(u * 3.4, face === 2 ? 1.22 : -1.22, v * 1.8) : new THREE.Vector3(face === 4 ? 1.82 : -1.82, u * 2.2, v * 1.8);
        out.push(new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 3, rand() * 3, rand() * 3)), new THREE.Vector3(0.05, 0.05, 0.16)));
      }
      return out;
    });
    const coil = useOnce(() => coilCurve(0.55, 10, 12));
    return (
      <>
        <Part3D id="membrane" rank={2} shell>
          <mesh>
            <boxGeometry args={[3.6, 2.4, 2.0, 8, 8, 8]} />
            <Mat type="envelope" />
          </mesh>
        </Part3D>
        <Part3D id="tubules" rank={2.3}>
          <Spheres matrices={tub} type="surface-protein" />
        </Part3D>
        <Part3D id="lateral" rank={1}>
          {[1, -1].map((s) => (
            <mesh key={s} position={[0, s * 0.82, 0]} scale={[1.1, 0.28, 0.6]}>
              <sphereGeometry args={[1, 24, 16]} />
              <Mat type="matrix" />
            </mesh>
          ))}
        </Part3D>
        <Part3D id="core" rank={0.6} shell>
          <mesh scale={[1.25, 0.62, 0.62]}>
            <sphereGeometry args={[1, 32, 24]} />
            <Mat type="capsid" />
          </mesh>
        </Part3D>
        <Part3D id="genome" rank={0}>
          <group scale={[1.8, 0.8, 0.8]}>
            <Strand curve={coil} radius={0.012} segments={500} double />
          </group>
        </Part3D>
      </>
    );
  },
};

const flavivirus: Model3D = {
  parts: ["envelope", "eprot", "capsid", "genome"],
  distance: 4.1,
  Model() {
    // Envelope proteins drawn as flat paired rods lying on the surface (illustrative).
    const e = useOnce(() =>
      fibonacciSphere(90, 1.02).flatMap((p, i) => {
        const n = p.clone().normalize();
        const t = new THREE.Vector3(0, 1, 0).cross(n).normalize().applyAxisAngle(n, i * 0.7);
        return [-1, 0, 1].map((k) => new THREE.Matrix4().compose(p.clone().add(t.clone().multiplyScalar(k * 0.055)), new THREE.Quaternion(), new THREE.Vector3(0.045, 0.045, 0.045)));
      }),
    );
    const rna = useOnce(() => wanderCurve(0.45, 12, 19));
    return (
      <>
        <Part3D id="envelope" rank={2} shell>
          <Membrane />
        </Part3D>
        <Part3D id="eprot" rank={2.3}>
          <Spheres matrices={e} type="surface-protein" />
        </Part3D>
        <Part3D id="capsid" rank={1} shell>
          <mesh>
            <icosahedronGeometry args={[0.55, 3]} />
            <Mat type="nucleocapsid" opacity={0.85} />
          </mesh>
        </Part3D>
        <Part3D id="genome" rank={0}>
          <Strand curve={rna} radius={0.018} segments={300} />
        </Part3D>
      </>
    );
  },
};

const calicivirus: Model3D = {
  parts: ["vp1", "vp2", "genome"],
  distance: 3.9,
  Model() {
    // 90 VP1 dimers drawn as paired lobes on a detail-2 geodesic lattice (92 points: illustrative), cups visible between them.
    const shell = useOnce(() => {
      const { five, rest } = geodesicPoints(2, 1);
      return [...five, ...rest].slice(0, 90).flatMap((p) => ringMatrices(p, 2, 0.07, 0.085, 0.4, 0.05));
    });
    const rna = useOnce(() => wanderCurve(0.6, 14, 81));
    return (
      <>
        <Part3D id="vp1" rank={1.5} shell>
          <Spheres matrices={shell} type="capsid" />
          <mesh>
            <icosahedronGeometry args={[0.92, 3]} />
            <Mat type="capsid" />
          </mesh>
        </Part3D>
        <Part3D id="vp2" rank={0.8}>
          <mesh position={[0.3, 0.4, 0]}>
            <octahedronGeometry args={[0.07]} />
            <Mat type="capsid" />
          </mesh>
        </Part3D>
        <Part3D id="genome" rank={0}>
          <Strand curve={rna} radius={0.02} segments={300} />
        </Part3D>
      </>
    );
  },
};

const levivirus: Model3D = {
  parts: ["coat", "aprotein", "genome"],
  distance: 3.9,
  Model() {
    // 180 coat proteins: 60 trimer-like triplets on a detail-1 lattice (42 points) + face centres (illustrative packing).
    const shell = useOnce(() => [...icosaFaceCentres(1), ...geodesicPoints(1, 1).rest].flatMap((p) => ringMatrices(p, 3, 0.11, 0.1, 0.2, 0)));
    const rna = useOnce(() => wanderCurve(0.6, 14, 55));
    return (
      <>
        <Part3D id="coat" rank={1.5} shell>
          <Spheres matrices={shell} type="capsid" />
          <mesh>
            <icosahedronGeometry args={[0.92, 2]} />
            <Mat type="capsid" />
          </mesh>
        </Part3D>
        <Part3D id="aprotein" rank={2}>
          <mesh position={new THREE.Vector3(-0.6, 0.6, 0.55).normalize().multiplyScalar(1.08)}>
            <sphereGeometry args={[0.13, 16, 12]} />
            <Mat type="surface-protein" />
          </mesh>
        </Part3D>
        <Part3D id="genome" rank={0}>
          <Strand curve={rna} radius={0.022} segments={300} />
        </Part3D>
      </>
    );
  },
};

// New atlas entries use schematic geometry; subunit positions are illustrative.
const fusellovirus: Model3D = {
  parts: ["shell", "fibres", "genome"], distance: 4.3,
  Model() {
    const profile = useOnce(() => Array.from({length: 41}, (_,i) => {
      const t = i / 40;
      return new THREE.Vector2(Math.sin(Math.PI*t)*0.62, (t-0.5)*2.2);
    }));
    const dna = useOnce(() => wanderCurve(0.42, 9, 91, true));
    return <group rotation={[0,0,-0.65]}>
      <Part3D id="shell" rank={1} shell><mesh><latheGeometry args={[profile,40]}/><Mat type="capsid"/></mesh></Part3D>
      <Part3D id="fibres" rank={1.3}>{[-1,0,1].map(i=><mesh key={i} position={[i*0.1,1.22,0]} rotation={[0,0,-i*0.35]}><cylinderGeometry args={[0.017,0.025,0.35,8]}/><Mat type="fibre"/></mesh>)}</Part3D>
      <Part3D id="genome" rank={0}><Strand curve={dna} radius={0.017} double/></Part3D>
    </group>;
  },
};
const mimivirus: Model3D = {
  parts: ["fibres","capsid","stargate","core","genome"], distance: 4.8,
  Model() {
    const fibres = useOnce(() => fibonacciSphere(360,1).map(p => new THREE.Matrix4().compose(p.clone().multiplyScalar(1.1),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),p.clone().normalize()),new THREE.Vector3(0.009,0.25,0.009))));
    const dna = useOnce(() => coilCurve(0.4,12,12));
    return <>
      <Part3D id="fibres" rank={2}><Instances geometry={FIBRE_CYLINDER} matrices={fibres} type="fibre"/></Part3D>
      <Part3D id="capsid" rank={1.5} shell><CapsomerShell detail={4} r={0.95}/></Part3D>
      <Part3D id="stargate" rank={2}>{Array.from({length:5},(_,i)=><mesh key={i} position={[Math.sin(i*Math.PI*2/5)*0.12,0.94,Math.cos(i*Math.PI*2/5)*0.12]} rotation={[0,i*Math.PI*2/5,0]}><boxGeometry args={[0.035,0.04,0.28]}/><Mat type="portal"/></mesh>)}</Part3D>
      <Part3D id="core" rank={0.8} shell><mesh><sphereGeometry args={[0.65,32,24]}/><Mat type="nucleocapsid"/></mesh><mesh><sphereGeometry args={[0.69,32,24]}/><Mat type="envelope" opacity={0.22}/></mesh><mesh><sphereGeometry args={[0.73,32,24]}/><Mat type="envelope" opacity={0.22}/></mesh></Part3D>
      <Part3D id="genome" rank={0}><Strand curve={dna} radius={0.012} double/></Part3D>
    </>;
  },
};
const geminivirus: Model3D = {
  parts:["coat","genome"], distance:4.8,
  Model() {
    // Clip both icosahedra at their shared waist rather than draw two whole overlapping shells.
    const half = useOnce(() => {
      const g = new THREE.IcosahedronGeometry(0.78,0);
      const a = g.getAttribute("position");
      const out:number[]=[];
      for(let i=0;i<a.count;i+=3) {
        let poly=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,i+k));
        const clipped:THREE.Vector3[]=[];
        for(let k=0;k<poly.length;k++) {
          const u=poly[k],v=poly[(k+1)%poly.length];
          if(u.y>=-0.35) clipped.push(u);
          if((u.y>=-0.35)!==(v.y>=-0.35)) clipped.push(u.clone().lerp(v,(-0.35-u.y)/(v.y-u.y)));
        }
        poly=clipped;
        for(let k=1;k<poly.length-1;k++) for(const v of [poly[0],poly[k],poly[k+1]]) out.push(v.x,v.y+0.35,v.z);
      }
      g.dispose();
      const result=new THREE.BufferGeometry(); result.setAttribute("position",new THREE.Float32BufferAttribute(out,3)); result.computeVertexNormals(); return result;
    });
    const dna=useOnce(()=>wanderCurve(0.46,10,8,true));
    return <><Part3D id="coat" rank={1.5} shell>{[0,Math.PI].map(a=><mesh key={a} geometry={half} rotation={[0,0,a]}><Mat type="capsid" flat/></mesh>)}</Part3D><Part3D id="genome" rank={0}><Strand curve={dna} radius={0.018}/></Part3D></>;
  },
};
const inovirus: Model3D = {
  parts:["coat","p3","genome"], distance:4,
  Model() {
    const coat=useOnce(()=>new THREE.CatmullRomCurve3(helixCurve(2.7,0.13,0.055).points.map(p=>new THREE.Vector3(p.y,p.x,p.z))));
    const dna=useOnce(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(-0.03,-1.3,0),new THREE.Vector3(-0.03,1.3,0),new THREE.Vector3(0.03,1.3,0),new THREE.Vector3(0.03,-1.3,0)],true));
    return <group rotation={[0,0,-0.4]}><Part3D id="coat" rank={1} shell><Strand curve={coat} radius={0.028} type="capsid" segments={1000}/></Part3D><Part3D id="p3" rank={1.3}>{[-1,0,1].map(i=><mesh key={i} position={[i*0.08,1.5,0]}><capsuleGeometry args={[0.035,0.2,4,8]}/><Mat type="surface-protein"/></mesh>)}</Part3D><Part3D id="genome" rank={0}><Strand curve={dna} radius={0.012}/></Part3D></group>;
  },
};
const deltavirus: Model3D = {
  parts:["envelope","dag","genome"],distance:4.3,
  Model() {
    const rna=useOnce(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(-0.035,-0.6,0),new THREE.Vector3(-0.035,0.6,0),new THREE.Vector3(0.035,0.6,0),new THREE.Vector3(0.035,-0.6,0)],true));
    const beads=useOnce(()=>Array.from({length:20},(_,i)=>new THREE.Matrix4().compose(new THREE.Vector3(i%2?0.12:-0.12,-0.5+Math.floor(i/2)*0.11,0),new THREE.Quaternion(),new THREE.Vector3(0.07,0.07,0.07))));
    return <><Part3D id="envelope" rank={2} shell><Membrane/><Blobs n={40} r={1} kind="trimer" length={0.045} head={0.035}/></Part3D><Part3D id="dag" rank={0.8}><Spheres matrices={beads} type="nucleocapsid"/></Part3D><Part3D id="genome" rank={0}><Strand curve={rna} radius={0.015}/></Part3D></>;
  },
};
const totivirus: Model3D = {
  parts:["capsid","genome"],distance:4.1,
  Model() {
    const rna=useOnce(()=>wanderCurve(0.6,14,51));
    return <><Part3D id="capsid" rank={1.5} shell><CapsomerShell detail={1} r={1}/></Part3D><Part3D id="genome" rank={0}><Strand curve={rna} radius={0.018} double/></Part3D></>;
  },
};

export const models3d: Record<DiagramSpec["renderer"], Model3D> = {
  influenza,
  coronavirus,
  herpesvirus,
  adenovirus,
  papillomavirus,
  "phage-t4": phageT4,
  retrovirus,
  hepadnavirus,
  rotavirus,
  picornavirus,
  tobamovirus,
  microvirus,
  filovirus,
  rhabdovirus,
  poxvirus,
  flavivirus,
  calicivirus,
  levivirus,
  fusellovirus, mimivirus, geminivirus, inovirus, deltavirus, totivirus,
};
