/** Parsing and geometry for the bundled Cα/P traces (public/structures/<PDB>.json). */

export interface ChainTrace {
  id: string;
  entity: string;
  kind: "protein" | "nucleic";
  seq: string;
  ss: string; // H helix, E strand, C other (empty for nucleic acids)
  xyz: number[]; // flat x,y,z per residue, Å, centred on the selection
}
export interface StructureFile {
  pdbId: string;
  chains: ChainTrace[];
}

export type Vec3 = [number, number, number];

export function points(c: ChainTrace): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 0; i < c.xyz.length; i += 3) out.push([c.xyz[i], c.xyz[i + 1], c.xyz[i + 2]]);
  return out;
}

/** Split a trace where consecutive atoms are too far apart to be bonded neighbours (unmodelled loops). */
export function segmentsByGap(pts: Vec3[], maxGap: number): { start: number; end: number }[] {
  const segs: { start: number; end: number }[] = [];
  let s = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
    if (d > maxGap) {
      segs.push({ start: s, end: i - 1 });
      s = i;
    }
  }
  if (pts.length) segs.push({ start: s, end: pts.length - 1 });
  return segs;
}

/** Runs of identical secondary-structure codes: [{code, start, end}]. */
export function ssRuns(ss: string): { code: string; start: number; end: number }[] {
  const runs: { code: string; start: number; end: number }[] = [];
  for (let i = 0; i < ss.length; i++) {
    const last = runs[runs.length - 1];
    if (last && last.code === ss[i]) last.end = i;
    else runs.push({ code: ss[i], start: i, end: i });
  }
  return runs;
}

/**
 * Orthographic 2D projection onto the plane of greatest spread (first two
 * principal axes), found by power iteration on the covariance matrix.
 */
export function principalProjection(all: Vec3[]): (p: Vec3) => [number, number] {
  const n = all.length || 1;
  const m = [0, 1, 2].map((k) => all.reduce((a, p) => a + p[k], 0) / n);
  const cov = [0, 1, 2].map((i) => [0, 1, 2].map((j) => all.reduce((a, p) => a + (p[i] - m[i]) * (p[j] - m[j]), 0) / n));
  const mul = (M: number[][], v: number[]) => M.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
  const norm = (v: number[]) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return v.map((x) => x / l);
  };
  const power = (M: number[][], seed: number[]) => {
    let v = norm(seed);
    for (let i = 0; i < 60; i++) v = norm(mul(M, v));
    return v;
  };
  const a = power(cov, [1, 0.3, 0.2]);
  const la = mul(cov, a).reduce((s, x, i) => s + x * a[i], 0);
  const deflated = cov.map((r, i) => r.map((x, j) => x - la * a[i] * a[j]));
  let b = power(deflated, [0.2, 1, 0.3]);
  const dot = b[0] * a[0] + b[1] * a[1] + b[2] * a[2];
  b = norm(b.map((x, i) => x - dot * a[i]));
  return (p) => {
    const d = [p[0] - m[0], p[1] - m[1], p[2] - m[2]];
    return [d[0] * a[0] + d[1] * a[1] + d[2] * a[2], d[0] * b[0] + d[1] * b[1] + d[2] * b[2]];
  };
}

/** Largest distance from the origin, for framing. */
export function extent(all: Vec3[]): number {
  return Math.max(1, ...all.map((p) => Math.hypot(p[0], p[1], p[2])));
}

export function parseStructure(json: unknown): StructureFile {
  const s = json as StructureFile;
  if (!s || typeof s.pdbId !== "string" || !Array.isArray(s.chains)) throw new Error("Malformed structure file");
  for (const c of s.chains) {
    if (c.xyz.length !== c.seq.length * 3) throw new Error(`Chain ${c.id}: coordinate count does not match sequence length`);
    if (c.kind === "protein" && c.ss.length !== c.seq.length) throw new Error(`Chain ${c.id}: secondary structure length mismatch`);
  }
  return s;
}
