import { describe, expect, it } from "vitest";
import { viruses } from "@/lib/data";
import { initialTraits, matchTraits, observedClasses } from "@/lib/traits";
import { models3d } from "@/components/three/models";
import { diagrams } from "@/lib/data";
import { silhouette } from "@/lib/silhouette";

describe("trait explorer", () => {
  it("matches all entries until narrowed and handles the HDV exception", () => {
    expect(matchTraits(viruses, initialTraits)).toHaveLength(24);
    const matches = matchTraits(viruses, { genome: "-ssRNA", envelope: "yes", host: "vertebrates" });
    expect(matches.map(v=>v.id)).toContain("hdv");
    expect(observedClasses(viruses,"-ssRNA")).toEqual(["V"]);
    expect(viruses.find(v=>v.id==="hdv")!.baltimore.note).toBeTruthy();
  });
  it("does not invent matches for an absent combination", () => {
    expect(matchTraits(viruses,{genome:"dsDNA-RT",envelope:"no",host:"archaea"})).toEqual([]);
  });
  it("keeps reverse-transcribing genomes separate", () => {
    expect(observedClasses(viruses,"ssRNA-RT")).toEqual(["VI"]);
    expect(observedClasses(viruses,"dsDNA-RT")).toEqual(["VII"]);
  });
});
describe("expanded atlas coverage", () => {
  it("matches every 3D model's parts to the cited diagram", () => {
    for(const d of diagrams) expect([...models3d[d.renderer].parts].sort(),d.id).toEqual(d.components.map(c=>c.id).sort());
  });
  it("has a dimension-based silhouette for every added shape", () => {
    for(const id of ["ssv1","mimivirus","tylcv","m13","hdv","scv-la"]) {
      const s=silhouette(viruses.find(v=>v.id===id)!);
      expect(s,id).not.toBeNull();
      expect(s!.width).toBeGreaterThan(0);
      expect(s!.height).toBeGreaterThan(0);
    }
  });
});
