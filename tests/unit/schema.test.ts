import { describe, expect, it } from "vitest";
import { collectSourceIds, loadDataset, rawViruses } from "@/lib/data";
import { fact, Virus } from "@/lib/schema";
import { z } from "zod";
import sourcesJson from "@/data/sources.json";
import { diagramSpecs } from "@/data/diagrams";

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

describe("scientific schema", () => {
  it("parses every virus record and cross-checks references", () => {
    const ds = loadDataset();
    expect(ds.viruses).toHaveLength(18);
    expect(new Set(ds.viruses.map((v) => v.id)).size).toBe(18);
  });

  it("every cited source id exists in the registry", () => {
    const ids = new Set(sourcesJson.sources.map((s) => s.id));
    for (const v of rawViruses) for (const id of collectSourceIds(v)) expect(ids, id).toContain(id);
    for (const d of diagramSpecs) for (const c of d.components) for (const id of c.sourceIds) expect(ids, id).toContain(id);
  });

  it("rejects a dangling source reference", () => {
    const bad = clone(rawViruses);
    (bad[0] as Virus).envelope.sourceIds = ["does-not-exist"];
    expect(() => loadDataset(bad)).toThrow(/unknown source/);
  });

  it("requires a source for verified, simplified and variable facts", () => {
    const F = fact(z.string());
    expect(F.safeParse({ value: "x", status: "verified", scope: "species", sourceIds: [] }).success).toBe(false);
    expect(F.safeParse({ value: "x", status: "simplified", scope: "species", sourceIds: [] }).success).toBe(false);
    expect(F.safeParse({ value: "x", status: "verified", scope: "species", sourceIds: ["a"] }).success).toBe(true);
  });

  it("handles missing and inapplicable fields explicitly", () => {
    const F = fact(z.string());
    // not_applicable must be null and explained
    expect(F.safeParse({ value: null, status: "not_applicable", scope: "virus", sourceIds: [], note: "dsDNA" }).success).toBe(true);
    expect(F.safeParse({ value: "x", status: "not_applicable", scope: "virus", sourceIds: [], note: "n" }).success).toBe(false);
    expect(F.safeParse({ value: null, status: "not_applicable", scope: "virus", sourceIds: [] }).success).toBe(false);
    // not_verified needs a note but no source
    expect(F.safeParse({ value: "nucleus", status: "not_verified", scope: "family", sourceIds: [], note: "why" }).success).toBe(true);
    // a verified fact may not be null
    expect(F.safeParse({ value: null, status: "verified", scope: "family", sourceIds: ["a"] }).success).toBe(false);
  });

  it("marks sense as not applicable for every double or partially double-stranded genome", () => {
    const { viruses } = loadDataset();
    for (const v of viruses.filter((x) => x.genome.strandedness.value !== "single")) expect(v.genome.sense.status, v.id).toBe("not_applicable");
    for (const v of viruses.filter((x) => x.genome.nucleicAcid.value === "RNA" && x.genome.strandedness.value === "single")) expect(v.genome.sense.value).not.toBeNull();
  });

  it("keeps Baltimore class consistent with the ICTV genome label", () => {
    const expected: Record<string, string> = {
      dsDNA: "I",
      "ssDNA(+)": "II",
      dsRNA: "III",
      "ssRNA(+)": "IV",
      "ssRNA(-)": "V",
      "ssRNA-RT": "VI",
      "dsDNA-RT": "VII",
    };
    for (const v of loadDataset().viruses) expect(v.baltimore.value, v.id).toBe(expected[v.genome.ictvLabel.value!]);
  });

  it("covers all seven Baltimore classes", () => {
    expect(new Set(loadDataset().viruses.map((v) => v.baltimore.value)).size).toBe(7);
  });

  it("never places a bacterial virus step in a nucleus", () => {
    for (const v of loadDataset().viruses.filter((x) => x.hostCategory.value === "bacteria"))
      for (const s of v.replication.steps) expect(s.location, `${v.id}/${s.id}`).not.toBe("nucleus");
  });

  it("segment count agrees with segmentation", () => {
    for (const v of loadDataset().viruses) {
      if (v.genome.segmented.value) expect(v.genome.segmentCount.value).toBeGreaterThan(1);
      else expect(v.genome.segmentCount.value).toBe(1);
    }
  });

  it("records taxonomy from MSL41", () => {
    for (const v of loadDataset().viruses) {
      expect(v.taxonomy.msl).toMatch(/MSL41/);
      expect(v.taxonomy.sourceIds).toContain("ictv-vmr-msl41");
    }
  });
});
