import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { proteins } from "@/data/proteins";
import { diagrams, sources, viruses } from "@/lib/data";
import { parseStructure, points, principalProjection, segmentsByGap, ssRuns } from "@/lib/structure";
import { ANNOTATION_SOURCE, cdsLength, codingFraction, genomeMaps, packRows } from "@/lib/genomes";

const load = (id: string) => parseStructure(JSON.parse(readFileSync(join(process.cwd(), "public/structures", `${id}.json`), "utf8")));

describe("protein structures", () => {
  it("every entry has a coordinate file whose chains match the curated chain list", () => {
    for (const p of proteins) {
      const s = load(p.pdbId);
      expect(s.pdbId).toBe(p.pdbId);
      expect(s.chains.map((c) => c.id).sort(), p.pdbId).toEqual(p.chains.map((c) => c.id).sort());
      for (const c of p.chains) expect(s.chains.find((x) => x.id === c.id)!.kind === "nucleic", `${p.pdbId}/${c.id}`).toBe(Boolean(c.nucleic));
    }
  });
  it("links to real viruses, diagram components and sources", () => {
    const ids = new Set(sources.map((s) => s.id));
    for (const p of proteins) {
      const v = viruses.find((x) => x.id === p.virusId);
      expect(v, p.pdbId).toBeDefined();
      const spec = diagrams.find((d) => d.id === v!.diagramId)!;
      for (const c of p.componentIds) expect(spec.components.map((x) => x.id), `${p.pdbId}/${c}`).toContain(c);
      expect(ids, p.pdbId).toContain(`pdb-${p.pdbId.toLowerCase()}`);
      for (const s of p.roleSourceIds) expect(ids, `${p.pdbId}/${s}`).toContain(s);
      expect(p.caveats.length).toBeGreaterThan(0);
    }
  });
  it("every virus has at least one structure", () => {
    for (const v of viruses) expect(proteins.some((p) => p.virusId === v.id), v.id).toBe(true);
  });
  it("Cα neighbours are ~3.8 Å apart within modelled stretches", () => {
    const s = load("2LZM");
    const pts = points(s.chains[0]);
    const segs = segmentsByGap(pts, 4.6);
    expect(segs).toHaveLength(1);
    const d = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2]);
    expect(d).toBeGreaterThan(3.6);
    expect(d).toBeLessThan(4.0);
  });
  it("splits secondary structure into runs and projects in 2D", () => {
    expect(ssRuns("CCHHHEEC").map((r) => r.code)).toEqual(["C", "H", "E", "C"]);
    const proj = principalProjection([[0, 0, 0], [10, 0, 0], [0, 1, 0]]);
    expect(Math.abs(proj([10, 0, 0])[0] - proj([0, 0, 0])[0])).toBeCloseTo(10, 0);
  });
  it("rejects malformed structure files", () => {
    expect(() => parseStructure({ pdbId: "X", chains: [{ id: "A", entity: "1", kind: "protein", seq: "AA", ss: "C", xyz: [0, 0, 0, 1, 1, 1] }] })).toThrow();
  });
});

describe("genome annotations", () => {
  it("cover every virus and come from a registered source", () => {
    const ids = new Set(sources.map((s) => s.id));
    for (const v of viruses) {
      expect(genomeMaps[v.id]?.length, v.id).toBeGreaterThan(0);
      expect(ids).toContain(ANNOTATION_SOURCE[v.id]);
    }
  });
  it("molecule lengths add up to the recorded reference length", () => {
    for (const v of viruses) {
      const total = genomeMaps[v.id].reduce((a, m) => a + m.length, 0);
      expect(total, v.id).toBe(v.genome.referenceLengthNt.value);
    }
  });
  it("segment counts match the genome record", () => {
    for (const v of viruses) expect(genomeMaps[v.id].length, v.id).toBe(v.genome.segmentCount.value);
  });
  it("every CDS lies inside its molecule", () => {
    for (const mols of Object.values(genomeMaps))
      for (const m of mols)
        for (const c of m.cds)
          for (const [s, e] of c.segs) {
            expect(s).toBeGreaterThanOrEqual(1);
            expect(e).toBeLessThanOrEqual(m.length);
            expect(s).toBeLessThanOrEqual(e);
          }
  });
  it("packs overlapping genes onto separate rows", () => {
    const rows = packRows([
      { name: "a", product: "", strand: 1, segs: [[1, 100]] },
      { name: "b", product: "", strand: 1, segs: [[50, 150]] },
      { name: "c", product: "", strand: 1, segs: [[200, 300]] },
    ]);
    expect(rows).toEqual([0, 1, 0]);
  });
  it("computes coding length and coverage", () => {
    expect(cdsLength({ name: "x", product: "", strand: 1, segs: [[1, 10], [21, 30]] })).toBe(20);
    expect(codingFraction({ accession: "x", length: 100, topology: "linear", label: "", title: "", cds: [{ name: "a", product: "", strand: 1, segs: [[1, 50]] }] })).toBe(0.5);
  });
});
