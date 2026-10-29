import * as THREE from "three";

/** Evenly spread points on a sphere (Fibonacci lattice): deterministic, no randomness. */
export function fibonacciSphere(n: number, r = 1): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const t = golden * i;
    pts.push(new THREE.Vector3(Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r));
  }
  return pts;
}

/** The 12 vertices of an icosahedron of circumradius r. */
export function icosaVertices(r = 1): THREE.Vector3[] {
  const g = new THREE.IcosahedronGeometry(r, 0);
  const pos = g.getAttribute("position");
  const seen = new Map<string, THREE.Vector3>();
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    seen.set(v.toArray().map((x) => x.toFixed(4)).join(","), v);
  }
  g.dispose();
  return [...seen.values()];
}

/** Matrix that places a unit object at `p`, pointing outward from the origin, scaled. */
export function outwardMatrix(p: THREE.Vector3, scale: THREE.Vector3 | number = 1, outset = 0): THREE.Matrix4 {
  const dir = p.clone().normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const s = typeof scale === "number" ? new THREE.Vector3(scale, scale, scale) : scale;
  return new THREE.Matrix4().compose(p.clone().add(dir.multiplyScalar(outset)), q, s);
}

/** Deterministic pseudo-random generator for reproducible shapes. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Archimedean-ish 3D coil inside a sphere, for packed genomes. */
export function coilCurve(radius: number, turns: number, seed = 1): THREE.CatmullRomCurve3 {
  const rand = seeded(seed);
  const pts: THREE.Vector3[] = [];
  const n = turns * 16;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const phi = t * Math.PI;
    const theta = t * turns * Math.PI * 2;
    const r = radius * (0.55 + 0.45 * Math.sin(phi)) * (0.9 + rand() * 0.1);
    pts.push(new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi) * 0.9, r * Math.sin(phi) * Math.sin(theta)));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/** A wandering loop through a sphere's interior. */
export function wanderCurve(radius: number, points: number, seed = 3, closed = false): THREE.CatmullRomCurve3 {
  const rand = seeded(seed);
  const pts = Array.from({ length: points }, () => {
    const v = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    return v.multiplyScalar(radius * (0.35 + rand() * 0.6));
  });
  return new THREE.CatmullRomCurve3(pts, closed);
}

/** Helix along the x axis. */
export function helixCurve(length: number, radius: number, pitch: number, start = -length / 2): THREE.CatmullRomCurve3 {
  const turns = length / pitch;
  const n = Math.max(8, Math.round(turns * 12));
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const a = t * turns * Math.PI * 2;
    return new THREE.Vector3(start + t * length, Math.cos(a) * radius, Math.sin(a) * radius);
  });
  return new THREE.CatmullRomCurve3(pts);
}

/** Lumpy sphere for amorphous layers (e.g. herpesvirus tegument). */
export function lumpySphere(radius: number, amount: number, seed = 5, offset = new THREE.Vector3()): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(radius, 3);
  const pos = g.getAttribute("position");
  const rand = seeded(seed);
  const bumps = Array.from({ length: 6 }, () => new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize());
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = v.clone().normalize();
    const k = bumps.reduce((acc, b) => acc + Math.max(0, n.dot(b)) ** 3, 0);
    v.multiplyScalar(1 + amount * k).add(offset);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/**
 * Vertices of a geodesic icosphere: three.js detail d splits each edge into
 * d+1 segments, giving 10(d+1)^2 + 2 points. Detail 3 → 162 and detail 4 → 252,
 * the capsomer counts of herpesvirus (T=16) and adenovirus (240 + 12) capsids.
 * The first 12 returned are the icosahedral (fivefold) vertices.
 */
export function geodesicPoints(detail: number, r = 1): { five: THREE.Vector3[]; rest: THREE.Vector3[] } {
  const five = icosaVertices(r);
  const g = new THREE.IcosahedronGeometry(r, detail);
  const pos = g.getAttribute("position");
  const seen = new Map<string, THREE.Vector3>();
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    seen.set(v.toArray().map((x) => x.toFixed(3)).join(","), v);
  }
  g.dispose();
  const rest = [...seen.values()].filter((v) => !five.some((f) => f.distanceTo(v) < 1e-3 * r));
  return { five, rest };
}

/** Face centres of an icosahedron (20), each pushed to radius r. */
export function icosaFaceCentres(r = 1): THREE.Vector3[] {
  const g = new THREE.IcosahedronGeometry(1, 0).toNonIndexed();
  const pos = g.getAttribute("position");
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < pos.count; i += 3) {
    const c = new THREE.Vector3();
    for (let k = 0; k < 3; k++) c.add(new THREE.Vector3().fromBufferAttribute(pos, i + k));
    out.push(c.normalize().multiplyScalar(r));
  }
  g.dispose();
  return out;
}

/**
 * A ring of `k` sub-spheres lying on the tangent plane at `p` (a capsomer made
 * of k subunits), returned as instance matrices for a unit sphere.
 */
export function ringMatrices(p: THREE.Vector3, k: number, ringR: number, sphereR: number, twist = 0, lift = 0): THREE.Matrix4[] {
  const n = p.clone().normalize();
  const t = new THREE.Vector3(0, 1, 0).cross(n);
  if (t.lengthSq() < 1e-6) t.set(1, 0, 0);
  t.normalize();
  const b = n.clone().cross(t).normalize();
  const out: THREE.Matrix4[] = [];
  for (let i = 0; i < k; i++) {
    const a = twist + (i / k) * Math.PI * 2;
    const c = p
      .clone()
      .add(n.clone().multiplyScalar(lift))
      .add(t.clone().multiplyScalar(Math.cos(a) * ringR))
      .add(b.clone().multiplyScalar(Math.sin(a) * ringR));
    out.push(new THREE.Matrix4().compose(c, new THREE.Quaternion(), new THREE.Vector3(sphereR, sphereR, sphereR)));
  }
  return out;
}

export type BlobKind = "trimer" | "club" | "tetramer" | "dimer" | "knob";

/**
 * A protein-like "blob" spike: a short stem of overlapping spheres topped by a
 * head of 2–4 lobes, pointing outward from the surface at `p`.
 */
export function blobSpike(p: THREE.Vector3, kind: BlobKind, length: number, head: number): THREE.Matrix4[] {
  const n = p.clone().normalize();
  const out: THREE.Matrix4[] = [];
  const stemN = Math.max(2, Math.round(length / (head * 0.55)));
  for (let i = 0; i < stemN; i++) {
    const c = p.clone().add(n.clone().multiplyScalar((i / stemN) * length));
    const s = head * (kind === "club" ? 0.42 : 0.36);
    out.push(new THREE.Matrix4().compose(c, new THREE.Quaternion(), new THREE.Vector3(s, s, s)));
  }
  const top = p.clone().add(n.clone().multiplyScalar(length + head * 0.4));
  const lobes = kind === "tetramer" ? 4 : kind === "dimer" ? 2 : kind === "knob" ? 1 : 3;
  const spread = kind === "club" ? head * 0.55 : head * 0.5;
  const scale = kind === "club" ? head * 0.75 : head * 0.62;
  if (lobes === 1) out.push(new THREE.Matrix4().compose(top, new THREE.Quaternion(), new THREE.Vector3(scale, scale, scale)));
  else out.push(...ringMatrices(top, lobes, spread, scale, 0.4));
  if (kind === "club") out.push(new THREE.Matrix4().compose(top.clone().add(n.clone().multiplyScalar(head * 0.55)), new THREE.Quaternion(), new THREE.Vector3(scale * 0.8, scale * 0.8, scale * 0.8)));
  return out;
}

/** Gently bumpy sphere (lipid-membrane look). */
export function bumpySphere(r: number, amp: number, freq = 9): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(r, 96, 72);
  const pos = g.getAttribute("position");
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = v.clone().normalize();
    const k = Math.sin(n.x * freq) * Math.sin(n.y * freq * 1.3) * Math.sin(n.z * freq * 0.9);
    v.copy(n.multiplyScalar(r * (1 + amp * k)));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}
